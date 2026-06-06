const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getAnalytics,
  getActivityLogs,
} = require('../controllers/Dashboardcontroller');
const { protect, authorize } = require('../middleware/auth.middleware');

// @route   GET /api/v1/dashboard/summary
// @desc    Get dashboard summary (pending approvals, active RFQs, stats)
// @access  Private (admin, manager, procurement_officer)
router.get(
  '/summary',
  protect,
  authorize('admin', 'manager', 'procurement_officer'),
  getDashboardSummary
);

// @route   GET /api/v1/dashboard/analytics
// @desc    Get detailed analytics (spending trends, vendor performance)
// @access  Private (admin, manager, procurement_officer)
router.get(
  '/analytics',
  protect,
  authorize('admin', 'manager', 'procurement_officer'),
  getAnalytics
);

// @route   GET /api/v1/dashboard/activity-logs
// @desc    Get activity logs for audit trail
// @access  Private (admin)
router.get(
  '/activity-logs',
  protect,
  authorize('admin'),
  getActivityLogs
);

module.exports = router;
