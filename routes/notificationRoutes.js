const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
} = require('../controllers/Notificationcontroller');
const { protect } = require('../middleware/auth.middleware');

// @route   GET /api/v1/notifications
// @desc    Get all notifications for current user
// @access  Private
router.get('/', protect, getNotifications);

// @route   PATCH /api/v1/notifications/:id/read
// @desc    Mark single notification as read
// @access  Private
router.patch('/:id/read', protect, markAsRead);

// @route   PATCH /api/v1/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.patch('/mark-all-read', protect, markAllAsRead);

// @route   DELETE /api/v1/notifications/:id
// @desc    Delete single notification
// @access  Private
router.delete('/:id', protect, deleteNotification);

// @route   DELETE /api/v1/notifications/clear-read
// @desc    Delete all read notifications
// @access  Private
router.delete('/clear-read', protect, clearReadNotifications);

module.exports = router;
