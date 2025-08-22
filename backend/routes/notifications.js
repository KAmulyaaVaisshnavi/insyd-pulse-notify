import express from 'express';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { validateUserId, handleAsyncError } from '../utils/helpers.js';

const router = express.Router();

// Get notifications for a user
router.get('/:userId', handleAsyncError(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20, unreadOnly = false } = req.query;
  
  if (!validateUserId(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const query = { userId };
  if (unreadOnly === 'true') {
    query.isRead = false;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .lean();

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.getUnreadCount(userId);

  res.json({
    notifications: notifications.map(notif => ({
      ...notif,
      id: notif.notificationId,
      timestamp: notif.createdAt
    })),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    },
    unreadCount
  });
}));

// Mark notification as read
router.patch('/:notificationId/read', handleAsyncError(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOne({ notificationId });
  
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  await notification.markAsRead();
  
  res.json({ 
    message: 'Notification marked as read',
    notification: {
      ...notification.toObject(),
      id: notification.notificationId,
      timestamp: notification.createdAt
    }
  });
}));

// Mark all notifications as read for a user
router.patch('/users/:userId/read-all', handleAsyncError(async (req, res) => {
  const { userId } = req.params;

  if (!validateUserId(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const result = await Notification.markAllAsRead(userId);
  
  res.json({ 
    message: 'All notifications marked as read',
    modifiedCount: result.modifiedCount
  });
}));

// Delete notification
router.delete('/:notificationId', handleAsyncError(async (req, res) => {
  const { notificationId } = req.params;

  const result = await Notification.deleteOne({ notificationId });
  
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  res.json({ message: 'Notification deleted successfully' });
}));

// Clear all notifications for a user
router.delete('/users/:userId/clear', handleAsyncError(async (req, res) => {
  const { userId } = req.params;

  if (!validateUserId(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const result = await Notification.deleteMany({ userId });
  
  res.json({ 
    message: 'All notifications cleared',
    deletedCount: result.deletedCount
  });
}));

// Get notification statistics
router.get('/users/:userId/stats', handleAsyncError(async (req, res) => {
  const { userId } = req.params;

  if (!validateUserId(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const stats = await Notification.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        unread: { 
          $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
        }
      }
    }
  ]);

  const totalCount = await Notification.countDocuments({ userId });
  const unreadCount = await Notification.getUnreadCount(userId);

  res.json({
    total: totalCount,
    unread: unreadCount,
    byType: stats.reduce((acc, stat) => {
      acc[stat._id] = {
        total: stat.count,
        unread: stat.unread
      };
      return acc;
    }, {})
  });
}));

export default router;