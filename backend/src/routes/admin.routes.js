const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { auth } = require('../middlewares/auth');
const { requireAdmin } = require('../middlewares/role');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', auth, requireAdmin, adminController.getDashboardStats);

// @route   GET /api/admin/issues
// @desc    Get all issues for admin
// @access  Private (Admin)
router.get('/issues', auth, requireAdmin, adminController.getAllIssues);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', auth, requireAdmin, adminController.getAllUsers);

// @route   PATCH /api/admin/users/:userId/ban
// @desc    Ban a user
// @access  Private (Admin)
router.patch('/users/:userId/ban', auth, requireAdmin, adminController.banUser);

// @route   PATCH /api/admin/users/:userId/unban
// @desc    Unban a user
// @access  Private (Admin)
router.patch('/users/:userId/unban', auth, requireAdmin, adminController.unbanUser);

// @route   GET /api/admin/spam-reports
// @desc    Get all spam reports
// @access  Private (Admin)
router.get('/spam-reports', auth, requireAdmin, adminController.getSpamReports);

// @route   PATCH /api/admin/spam-reports/:reportId/review
// @desc    Review a spam report
// @access  Private (Admin)
router.patch('/spam-reports/:reportId/review', auth, requireAdmin, adminController.reviewSpamReport);

// @route   PATCH /api/admin/issues/:issueId/hide
// @desc    Hide an issue
// @access  Private (Admin)
router.patch('/issues/:issueId/hide', auth, requireAdmin, adminController.hideIssue);

// @route   PATCH /api/admin/issues/:issueId/show
// @desc    Show a hidden issue
// @access  Private (Admin)
router.patch('/issues/:issueId/show', auth, requireAdmin, adminController.showIssue);

// @route   PATCH /api/admin/issues/:id/restore
// @desc    Restore a hidden issue
// @access  Private (Admin)
router.patch('/issues/:id/restore', auth, requireAdmin, adminController.restoreIssue);

// @route   GET /api/admin/spam-summary
// @desc    Get spam reports summary
// @access  Private (Admin)
router.get('/spam-summary', auth, requireAdmin, adminController.getSpamReportsSummary);

// @route   GET /api/admin/analytics
// @desc    Get analytics data
// @access  Private (Admin)
router.get('/analytics', auth, requireAdmin, adminController.getAnalytics);

// @route   PATCH /api/admin/issues/:issueId/admin-notes
// @desc    Update admin notes for an issue
// @access  Private (Admin)
router.patch('/issues/:issueId/admin-notes', auth, requireAdmin, adminController.updateAdminNotes);

// @route   GET /api/admin/health
// @desc    Get system health status
// @access  Private (Admin)
router.get('/health', auth, requireAdmin, adminController.getSystemHealth);

// @route   GET /api/admin/export
// @desc    Export data (issues, users, spam reports)
// @access  Private (Admin)
router.get('/export', auth, requireAdmin, adminController.exportData);

module.exports = router;
