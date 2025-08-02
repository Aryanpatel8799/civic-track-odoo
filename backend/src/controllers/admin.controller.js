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
}

module.exports = new AdminController();
