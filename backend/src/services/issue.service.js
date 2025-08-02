const Issue = require('../models/Issue');
const ActivityLog = require('../models/ActivityLog');
const SpamReport = require('../models/SpamReport');
const UserUpvote = require('../models/UserUpvote');
const User = require('../models/User');
const { buildGeoQuery, buildGeoAggregation, reverseGeocode } = require('../utils/geoUtils');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { deleteLocalFile, extractPublicId } = require('../utils/fileUtils');
const { PAGINATION, SPAM_THRESHOLD } = require('../config/constants');

class IssueService {
  async createIssue(issueData, files, userId) {
    const { title, description, category, coordinates, address, isAnonymous } = issueData;

    // Upload images to Cloudinary
    let imageUrls = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const imageUrl = await uploadToCloudinary(file.path, 'civictrack/issues');
          imageUrls.push(imageUrl);
          deleteLocalFile(file.path); // Clean up local file
        } catch (error) {
          // Clean up any uploaded images on failure
          for (const url of imageUrls) {
            const publicId = extractPublicId(url);
            if (publicId) await deleteFromCloudinary(publicId);
          }
          throw new Error(`Image upload failed: ${error.message}`);
        }
      }
    }

    // Create issue
    const issueDoc = {
      title,
      description,
      category,
      location: {
        type: 'Point',
        coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
      },
      address: address || await reverseGeocode(coordinates[1], coordinates[0]),
      images: imageUrls,
      isAnonymous: isAnonymous || false
    };

    // Only add user if not anonymous
    if (!isAnonymous && userId) {
      issueDoc.user = userId;
    }

    const issue = new Issue(issueDoc);
    await issue.save();

    // Update user's issue count
    if (!isAnonymous && userId) {
      await User.findByIdAndUpdate(userId, { $inc: { issuesReported: 1 } });
    }

    // Log initial activity
    await new ActivityLog({
      issue: issue._id,
      action: 'Issue created',
      updatedBy: isAnonymous ? null : userId,
      note: 'Issue reported'
    }).save();

    return await this.getIssueById(issue._id);
  }

  async getIssues(filters = {}) {
    try {
      const {
        category,
        status,
        lat,
        lng,
        distance = 5000,
        isAnonymous,
        page = 1,
        limit = 10,
        sort = 'createdAt',
        order = 'desc',
        search
      } = filters;

      let query = { isVisible: true };

      // Apply filters
      if (category) query.category = category;
      if (status) query.status = status;
      if (isAnonymous !== undefined) query.isAnonymous = isAnonymous;

      // Add search functionality
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } }
        ];
      }

      // Pagination setup
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 items per page
      const skip = (pageNum - 1) * limitNum;

      // Sort setup
      const sortOrder = order === 'asc' ? 1 : -1;
      const sortOptions = {};
      sortOptions[sort] = sortOrder;

      // Check if geo query is needed
      if (lat && lng) {
        const geoQuery = buildGeoQuery(parseFloat(lat), parseFloat(lng), distance);
        
        // Use aggregation for geo queries
        const aggregationPipeline = [
          { $match: { ...query, ...geoQuery } },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'userDetails'
            }
          },
          {
            $addFields: {
              userDetails: {
                $cond: {
                  if: '$isAnonymous',
                  then: null,
                  else: { $arrayElemAt: ['$userDetails', 0] }
                }
              }
            }
          },
          { $sort: sortOptions },
          { $skip: skip },
          { $limit: limitNum }
        ];

        const issues = await Issue.aggregate(aggregationPipeline);
        const total = await Issue.countDocuments({ ...query, ...geoQuery });

        return {
          issues,
          pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalItems: total,
            hasNext: pageNum < Math.ceil(total / limitNum),
            hasPrev: pageNum > 1
          }
        };
      } else {
        // Regular query without geo
        const issues = await Issue.find(query)
          .populate('user', 'username')
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean();

        const total = await Issue.countDocuments(query);

        return {
          issues,
          pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalItems: total,
            hasNext: pageNum < Math.ceil(total / limitNum),
            hasPrev: pageNum > 1
          }
        };
      }
    } catch (error) {
      throw new Error(`Failed to fetch issues: ${error.message}`);
    }
  }

  async getIssueById(issueId) {
    try {
      const issue = await Issue.findByIdAndUpdate(
        issueId,
        { $inc: { views: 1 } },
        { new: true }
      )
        .populate('user', 'username')
        .lean();

      if (!issue) {
        throw new Error('Issue not found');
      }

      return issue;
    } catch (error) {
      throw new Error(`Failed to fetch issue: ${error.message}`);
    }
  }

  async updateIssueStatus(issueId, statusData, adminId) {
    const { status, note, priority, estimatedResolutionTime, adminNotes } = statusData;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    // Validate status transition
    const validTransitions = {
      'Reported': ['In Progress', 'Resolved'],
      'In Progress': ['Resolved'],
      'Resolved': []
    };

    if (!validTransitions[issue.status].includes(status)) {
      throw new Error(`Invalid status transition from ${issue.status} to ${status}`);
    }

    const previousStatus = issue.status;
    
    // Update issue
    const updateData = { 
      status,
      lastStatusUpdate: new Date()
    };

    if (priority) updateData.priority = priority;
    if (estimatedResolutionTime) updateData.estimatedResolutionTime = estimatedResolutionTime;
    if (adminNotes) updateData.adminNotes = adminNotes;

    const updatedIssue = await Issue.findByIdAndUpdate(
      issueId,
      updateData,
      { new: true }
    ).populate('user', 'username email');

    // Log activity
    await new ActivityLog({
      issue: issueId,
      action: `Status changed to ${status}`,
      note,
      updatedBy: adminId,
      metadata: {
        previousStatus,
        priority,
        estimatedResolutionTime,
        adminNotes
      }
    }).save();

    return updatedIssue;
  }

  async reportSpam(issueId, userId, reason, description) {
    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        throw new Error('Issue not found');
      }

      // Check if user already reported this issue
      const existingReport = await SpamReport.findOne({
        issue: issueId,
        reportedBy: userId
      });

      if (existingReport) {
        throw new Error('You have already reported this issue as spam');
      }

      // Create spam report
      await SpamReport.create({
        issue: issueId,
        reportedBy: userId,
        reason,
        description
      });

      // Update spam vote count
      const spamCount = await SpamReport.countDocuments({ issue: issueId });
      
      // Auto-hide if spam count exceeds threshold
      const updateData = { spamVotes: spamCount };
      if (spamCount >= SPAM_THRESHOLD) {
        updateData.isVisible = false;
      }

      await Issue.findByIdAndUpdate(issueId, updateData);

      return { 
        message: 'Spam report submitted successfully',
        spamCount,
        isHidden: spamCount >= SPAM_THRESHOLD
      };
    } catch (error) {
      throw new Error(`Failed to report spam: ${error.message}`);
    }
  }

  async getIssueActivity(issueId) {
    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        throw new Error('Issue not found');
      }

      const activities = await ActivityLog.find({ issue: issueId })
        .populate('updatedBy', 'username')
        .sort({ createdAt: -1 })
        .lean();

      return activities;
    } catch (error) {
      throw new Error(`Failed to fetch issue activity: ${error.message}`);
    }
  }

  async deleteIssue(issueId, userId, isAdmin = false) {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new Error('Issue not found');
    }

    // Check permissions
    if (!isAdmin && (!issue.user || issue.user.toString() !== userId)) {
      throw new Error('Not authorized to delete this issue');
    }

    // Delete images from Cloudinary
    for (const imageUrl of issue.images) {
      const publicId = extractPublicId(imageUrl);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    // Delete related data
    await ActivityLog.deleteMany({ issueId });
    await SpamReport.deleteMany({ issueId });
    await Issue.findByIdAndDelete(issueId);

    // Update user's issue count
    if (issue.user) {
      await User.findByIdAndUpdate(issue.user, { $inc: { issuesReported: -1 } });
    }

    return { message: 'Issue deleted successfully' };
  }

  // Get issue by ID and increment views
  async getIssueById(issueId) {
    try {
      const issue = await Issue.findByIdAndUpdate(
        issueId,
        { $inc: { views: 1 } },
        { new: true }
      )
        .populate('user', 'username')
        .lean();

      if (!issue) {
        throw new Error('Issue not found');
      }

      return issue;
    } catch (error) {
      throw new Error(`Failed to fetch issue: ${error.message}`);
    }
  }

  // Toggle upvote for an issue
  async toggleUpvote(issueId, userId) {
    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        throw new Error('Issue not found');
      }

      // Check if user already upvoted
      const existingUpvote = await UserUpvote.findOne({
        user: userId,
        issue: issueId
      });

      if (existingUpvote) {
        // Remove upvote
        await UserUpvote.deleteOne({ _id: existingUpvote._id });
        await Issue.findByIdAndUpdate(issueId, { $inc: { upvotes: -1 } });
        return { message: 'Upvote removed', upvoted: false };
      } else {
        // Add upvote
        await UserUpvote.create({
          user: userId,
          issue: issueId
        });
        await Issue.findByIdAndUpdate(issueId, { $inc: { upvotes: 1 } });
        return { message: 'Issue upvoted', upvoted: true };
      }
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('You have already upvoted this issue');
      }
      throw new Error(`Failed to toggle upvote: ${error.message}`);
    }
  }

  // Get activity timeline for an issue
  async getIssueActivity(issueId) {
    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        throw new Error('Issue not found');
      }

      const activities = await ActivityLog.find({ issue: issueId })
        .populate('updatedBy', 'username')
        .sort({ createdAt: -1 })
        .lean();

      return activities;
    } catch (error) {
      throw new Error(`Failed to fetch issue activity: ${error.message}`);
    }
  }

  // Improve spam reporting with deduplication
  async reportSpam(issueId, userId, reason, description) {
    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        throw new Error('Issue not found');
      }

      // Check if user already reported this issue
      const existingReport = await SpamReport.findOne({
        issue: issueId,
        reportedBy: userId
      });

      if (existingReport) {
        throw new Error('You have already reported this issue as spam');
      }

      // Create spam report
      await SpamReport.create({
        issue: issueId,
        reportedBy: userId,
        reason,
        description
      });

      // Update spam vote count
      const spamCount = await SpamReport.countDocuments({ issue: issueId });
      
      // Auto-hide if spam count exceeds threshold
      const updateData = { spamVotes: spamCount };
      if (spamCount >= SPAM_THRESHOLD) {
        updateData.isVisible = false;
      }

      await Issue.findByIdAndUpdate(issueId, updateData);

      return { 
        message: 'Spam report submitted successfully',
        spamCount,
        isHidden: spamCount >= SPAM_THRESHOLD
      };
    } catch (error) {
      throw new Error(`Failed to report spam: ${error.message}`);
    }
  }
}

module.exports = new IssueService();
