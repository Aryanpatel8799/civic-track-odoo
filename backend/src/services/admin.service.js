const Issue = require('../models/Issue');
const User = require('../models/User');
const SpamReport = require('../models/SpamReport');
const ActivityLog = require('../models/ActivityLog');

class AdminService {
  // Get issues with advanced admin filtering
  async getIssuesWithFilters(filters = {}) {
    try {
      const {
        category,
        status,
        page = 1,
        limit = 20,
        sort = 'createdAt',
        order = 'desc',
        search,
        spamVotes,
        dateFrom,
        dateTo,
        isVisible,
        priority
      } = filters;

      let query = {};

      // Apply filters
      if (category) query.category = category;
      if (status) query.status = status;
      if (isVisible !== undefined) query.isVisible = isVisible;
      if (priority) query.priority = priority;

      // Spam votes filter
      if (spamVotes !== undefined) {
        if (spamVotes === 'high') {
          query.spamVotes = { $gte: 3 };
        } else if (spamVotes === 'medium') {
          query.spamVotes = { $gte: 1, $lt: 3 };
        } else if (spamVotes === 'none') {
          query.spamVotes = { $lt: 1 };
        }
      }

      // Date range filter
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
      }

      // Search functionality
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } }
        ];
      }

      // Pagination setup
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const skip = (pageNum - 1) * limitNum;

      // Sort setup
      const sortOrder = order === 'asc' ? 1 : -1;
      const sortOptions = {};
      sortOptions[sort] = sortOrder;

      const issues = await Issue.find(query)
        .populate('user', 'username email')
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
    } catch (error) {
      throw new Error(`Failed to fetch admin issues: ${error.message}`);
    }
  }

  // Enhanced dashboard analytics
  async getDashboardAnalytics(dateRange = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (dateRange * 24 * 60 * 60 * 1000));

      // Basic counts
      const totalIssues = await Issue.countDocuments();
      const totalUsers = await User.countDocuments();
      const totalSpamReports = await SpamReport.countDocuments();
      const hiddenIssues = await Issue.countDocuments({ isVisible: false });

      // Status breakdown
      const statusBreakdown = await Issue.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Category breakdown
      const categoryBreakdown = await Issue.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ]);

      // Recent issues trend (last 30 days)
      const issuesTrend = await Issue.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      // Top reporters
      const topReporters = await Issue.aggregate([
        {
          $match: {
            user: { $ne: null },
            isAnonymous: false
          }
        },
        {
          $group: {
            _id: '$user',
            issueCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        {
          $unwind: '$userInfo'
        },
        {
          $project: {
            username: '$userInfo.username',
            email: '$userInfo.email',
            issueCount: 1
          }
        },
        { $sort: { issueCount: -1 } },
        { $limit: 10 }
      ]);

      // Geographic distribution
      const geographicDistribution = await Issue.aggregate([
        {
          $group: {
            _id: {
              lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 1] },
              lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 1] }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]);

      // Resolution metrics
      const resolvedIssues = await Issue.find({
        status: 'Resolved',
        createdAt: { $gte: startDate }
      }).select('createdAt updatedAt');

      const avgResolutionTime = resolvedIssues.length > 0 ?
        resolvedIssues.reduce((acc, issue) => {
          return acc + (new Date(issue.updatedAt) - new Date(issue.createdAt));
        }, 0) / resolvedIssues.length / (24 * 60 * 60 * 1000) : 0; // in days

      return {
        overview: {
          totalIssues,
          totalUsers,
          totalSpamReports,
          hiddenIssues,
          avgResolutionTime: Math.round(avgResolutionTime * 10) / 10
        },
        charts: {
          statusBreakdown: statusBreakdown.map(item => ({
            name: item._id,
            value: item.count
          })),
          categoryBreakdown: categoryBreakdown.map(item => ({
            name: item._id,
            value: item.count
          })),
          issuesTrend: issuesTrend.map(item => ({
            date: item._id,
            count: item.count
          })),
          geographicDistribution
        },
        topReporters
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard analytics: ${error.message}`);
    }
  }

  // Restore hidden issue
  async restoreIssue(issueId) {
    try {
      const issue = await Issue.findByIdAndUpdate(
        issueId,
        { 
          isVisible: true,
          spamVotes: 0 
        },
        { new: true }
      );

      if (!issue) {
        throw new Error('Issue not found');
      }

      // Clear spam reports for this issue
      await SpamReport.deleteMany({ issueId });

      // Log activity
      await ActivityLog.create({
        issueId: issueId,
        status: 'Reported', // Set status when restoring
        note: 'Issue manually restored by admin',
        updatedBy: null // Will be set by controller with admin ID
      });

      return { message: 'Issue restored successfully', issue };
    } catch (error) {
      throw new Error(`Failed to restore issue: ${error.message}`);
    }
  }

  // Unban user
  async unbanUser(userId) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { isBanned: false },
        { new: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return { message: 'User unbanned successfully', user };
    } catch (error) {
      throw new Error(`Failed to unban user: ${error.message}`);
    }
  }

  // Get spam reports summary
  async getSpamReportsSummary() {
    try {
      const reasonBreakdown = await SpamReport.aggregate([
        {
          $group: {
            _id: '$reason',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const recentReports = await SpamReport.find()
        .populate('issueId', 'title')
        .populate('reportedBy', 'username')
        .sort({ createdAt: -1 })
        .limit(10);

      return {
        reasonBreakdown: reasonBreakdown.map(item => ({
          reason: item._id,
          count: item.count
        })),
        recentReports
      };
    } catch (error) {
      throw new Error(`Failed to fetch spam reports summary: ${error.message}`);
    }
  }
}

module.exports = new AdminService();
