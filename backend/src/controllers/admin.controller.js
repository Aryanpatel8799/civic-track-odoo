const User = require('../models/User');
const Issue = require('../models/Issue');
const SpamReport = require('../models/SpamReport');
const ActivityLog = require('../models/ActivityLog');
const issueService = require('../services/issue.service');
const adminService = require('../services/admin.service');

class AdminController {
  async getDashboardStats(req, res, next) {
    try {
      const dateRange = req.query.dateRange ? parseInt(req.query.dateRange) : 30;
      const analytics = await adminService.getDashboardAnalytics(dateRange);

      res.json({
        success: true,
        message: 'Dashboard analytics retrieved successfully',
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllIssues(req, res, next) {
    try {
      const filters = {
        category: req.query.category,
        status: req.query.status,
        search: req.query.search,
        isVisible: req.query.isVisible !== undefined ? req.query.isVisible === 'true' : undefined,
        spamVotes: req.query.spamVotes,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        priority: req.query.priority,
        page: req.query.page,
        limit: req.query.limit,
        sort: req.query.sort,
        order: req.query.order
      };

      const result = await adminService.getIssuesWithFilters(filters);

      res.json({
        success: true,
        message: 'Admin issues retrieved successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const search = req.query.search;
      const isBanned = req.query.isBanned;

      let query = {};
      
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      if (isBanned !== undefined) {
        query.isBanned = isBanned === 'true';
      }

      const skip = (page - 1) * limit;
      const totalUsers = await User.countDocuments(query);

      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      res.json({
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async banUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Ban reason is required'
        });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        {
          isBanned: true,
          banReason: reason,
          bannedAt: new Date(),
          bannedBy: req.user._id
        },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User banned successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async unbanUser(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await User.findByIdAndUpdate(
        userId,
        {
          isBanned: false,
          banReason: null,
          bannedAt: null,
          bannedBy: null
        },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User unbanned successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async getSpamReports(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const status = req.query.status;

      let query = {};
      if (status) {
        query.status = status;
      }

      const skip = (page - 1) * limit;
      const totalReports = await SpamReport.countDocuments(query);

      const reports = await SpamReport.find(query)
        .populate('issueId', 'title description category')
        .populate('reportedBy', 'username email')
        .populate('reviewedBy', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      res.json({
        success: true,
        message: 'Spam reports retrieved successfully',
        data: {
          reports,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalReports / limit),
            totalReports
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async reviewSpamReport(req, res, next) {
    try {
      const { reportId } = req.params;
      const { status, actionTaken } = req.body;

      if (!['Reviewed', 'Action Taken', 'Dismissed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const report = await SpamReport.findByIdAndUpdate(
        reportId,
        {
          status,
          actionTaken,
          reviewedBy: req.user._id,
          reviewedAt: new Date()
        },
        { new: true }
      ).populate('issueId', 'title');

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Spam report not found'
        });
      }

      res.json({
        success: true,
        message: 'Spam report reviewed successfully',
        data: { report }
      });
    } catch (error) {
      next(error);
    }
  }

  async hideIssue(req, res, next) {
    try {
      const { issueId } = req.params;

      const issue = await Issue.findByIdAndUpdate(
        issueId,
        { isVisible: false },
        { new: true }
      );

      if (!issue) {
        return res.status(404).json({
          success: false,
          message: 'Issue not found'
        });
      }

      res.json({
        success: true,
        message: 'Issue hidden successfully',
        data: { issue }
      });
    } catch (error) {
      next(error);
    }
  }

  async showIssue(req, res, next) {
    try {
      const { issueId } = req.params;

      const issue = await Issue.findByIdAndUpdate(
        issueId,
        { isVisible: true },
        { new: true }
      );

      if (!issue) {
        return res.status(404).json({
          success: false,
          message: 'Issue not found'
        });
      }

      res.json({
        success: true,
        message: 'Issue made visible successfully',
        data: { issue }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      // Issues by status
      const issuesByStatus = await Issue.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      // Issues by category
      const issuesByCategory = await Issue.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);

      // Monthly issue trends
      const monthlyTrends = await Issue.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ]);

      // Top reporters
      const topReporters = await Issue.aggregate([
        { $match: { user: { $ne: null } } },
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            username: '$user.username',
            count: 1
          }
        }
      ]);

      // Average resolution time
      const resolutionTimes = await Issue.aggregate([
        { $match: { status: 'Resolved', actualResolutionTime: { $exists: true } } },
        {
          $project: {
            resolutionTime: {
              $subtract: ['$actualResolutionTime', '$createdAt']
            }
          }
        },
        {
          $group: {
            _id: null,
            avgResolutionTime: { $avg: '$resolutionTime' },
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        success: true,
        message: 'Analytics retrieved successfully',
        data: {
          issuesByStatus,
          issuesByCategory,
          monthlyTrends,
          topReporters,
          resolutionTimes: resolutionTimes[0] || { avgResolutionTime: 0, count: 0 }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Restore hidden issue
  async restoreIssue(req, res, next) {
    try {
      const { id } = req.params;
      const result = await adminService.restoreIssue(id);

      res.json({
        success: true,
        message: result.message,
        data: { issue: result.issue }
      });
    } catch (error) {
      next(error);
    }
  }

  // Unban user
  async unbanUser(req, res, next) {
    try {
      const { userId } = req.params;
      const result = await adminService.unbanUser(userId);

      res.json({
        success: true,
        message: result.message,
        data: { user: result.user }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get spam reports summary
  async getSpamReportsSummary(req, res, next) {
    try {
      const summary = await adminService.getSpamReportsSummary();

      res.json({
        success: true,
        message: 'Spam reports summary retrieved successfully',
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  // Update admin notes for an issue
  async updateAdminNotes(req, res, next) {
    try {
      const { issueId } = req.params;
      const { adminNotes } = req.body;

      const issue = await Issue.findById(issueId);
      if (!issue) {
        return res.status(404).json({
          success: false,
          message: 'Issue not found'
        });
      }

      issue.adminNotes = adminNotes;
      await issue.save();

      // Log the activity
      await ActivityLog.create({
        issueId: issueId,
        status: issue.status, // Use current issue status
        note: 'Admin notes updated',
        updatedBy: req.user.userId,
        metadata: { adminNotes }
      });

      res.json({
        success: true,
        message: 'Admin notes updated successfully',
        data: { issue }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get system health status
  async getSystemHealth(req, res, next) {
    try {
      const startTime = Date.now();
      
      // Check database connection
      let dbStatus = 'Connected';
      try {
        await User.findOne().limit(1);
      } catch (dbError) {
        dbStatus = 'Disconnected';
      }

      // Get basic stats
      const [totalIssues, totalUsers] = await Promise.all([
        Issue.countDocuments(),
        User.countDocuments()
      ]);

      // Calculate response time
      const responseTime = Date.now() - startTime;

      // Get system uptime
      const uptime = process.uptime();

      // Get memory usage (simplified)
      const memoryUsage = process.memoryUsage();
      const memoryUsageFormatted = `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`;

      const healthData = {
        uptime,
        dbStatus,
        apiStatus: 'Running',
        responseTime,
        totalIssues,
        totalUsers,
        diskSpace: 'N/A', // Would need additional package to get disk space
        memoryUsage: memoryUsageFormatted
      };

      res.json({
        success: true,
        message: 'System health retrieved successfully',
        data: healthData
      });
    } catch (error) {
      next(error);
    }
  }

  // Export data
  async exportData(req, res, next) {
    try {
      const { type } = req.query;
      let data = [];
      let filename = '';

      switch (type) {
        case 'issues':
          const issues = await Issue.find()
            .populate('user', 'username email')
            .sort({ createdAt: -1 });
          
          data = issues.map(issue => ({
            ID: issue._id,
            Title: issue.title,
            Description: issue.description,
            Category: issue.category,
            Status: issue.status,
            Reporter: issue.isAnonymous ? 'Anonymous' : issue.user?.username || 'Unknown',
            'Reporter Email': issue.isAnonymous ? 'Anonymous' : issue.user?.email || 'Unknown',
            'Spam Votes': issue.spamVotes,
            Visible: issue.isVisible ? 'Yes' : 'No',
            Priority: issue.priority,
            Views: issue.views,
            Upvotes: issue.upvotes,
            Address: issue.address,
            'Created At': new Date(issue.createdAt).toISOString(),
            'Updated At': new Date(issue.updatedAt).toISOString()
          }));
          filename = 'issues-export';
          break;

        case 'users':
          const users = await User.find().sort({ createdAt: -1 });
          
          data = users.map(user => ({
            ID: user._id,
            Username: user.username,
            Email: user.email,
            Phone: user.phone,
            Role: user.role,
            'Issues Reported': user.issuesReported,
            'Spam Reports': user.spamReports,
            Banned: user.isBanned ? 'Yes' : 'No',
            'Ban Reason': user.banReason || 'N/A',
            'Created At': new Date(user.createdAt).toISOString(),
            'Updated At': new Date(user.updatedAt).toISOString()
          }));
          filename = 'users-export';
          break;

        case 'spam':
          const spamReports = await SpamReport.find()
            .populate('issueId', 'title')
            .populate('reportedBy', 'username email')
            .sort({ createdAt: -1 });
          
          data = spamReports.map(report => ({
            ID: report._id,
            'Issue Title': report.issueId?.title || 'Deleted Issue',
            Reason: report.reason,
            Description: report.description || 'N/A',
            'Reported By': report.reportedBy?.username || 'Unknown',
            'Reporter Email': report.reportedBy?.email || 'Unknown',
            Status: report.status,
            'Created At': new Date(report.createdAt).toISOString()
          }));
          filename = 'spam-reports-export';
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid export type. Use: issues, users, or spam'
          });
      }

      // Convert to CSV
      if (data.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No data found to export'
        });
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => 
            `"${String(row[header]).replace(/"/g, '""')}"`
          ).join(',')
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
