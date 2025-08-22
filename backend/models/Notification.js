import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['like', 'comment', 'follow', 'post'],
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  sourceUser: {
    id: { type: String, required: true, ref: 'User' },
    name: { type: String, required: true },
    avatar: { type: String, required: true }
  },
  targetContent: {
    id: String,
    title: String,
    type: {
      type: String,
      enum: ['post', 'project', 'profile']
    }
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  }
}, {
  timestamps: true,
  collection: 'notifications'
});

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// Methods
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Statics
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, isRead: false });
};

notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { userId, isRead: false },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

export default mongoose.model('Notification', notificationSchema);