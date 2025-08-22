import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['like', 'comment', 'follow', 'post'],
    index: true
  },
  sourceUserId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  targetUserId: {
    type: String,
    ref: 'User',
    index: true
  },
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  processed: {
    type: Boolean,
    default: false,
    index: true
  },
  processedAt: {
    type: Date,
    default: null
  },
  retryCount: {
    type: Number,
    default: 0
  },
  errorMessage: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  collection: 'events'
});

// Indexes for event processing
eventSchema.index({ processed: 1, createdAt: 1 });
eventSchema.index({ type: 1, createdAt: -1 });
eventSchema.index({ sourceUserId: 1, targetUserId: 1 });

// Methods
eventSchema.methods.markAsProcessed = function() {
  this.processed = true;
  this.processedAt = new Date();
  return this.save();
};

eventSchema.methods.incrementRetry = function(errorMessage = null) {
  this.retryCount += 1;
  if (errorMessage) {
    this.errorMessage = errorMessage;
  }
  return this.save();
};

// Statics
eventSchema.statics.getPendingEvents = function(limit = 50) {
  return this.find({ processed: false })
    .sort({ createdAt: 1 })
    .limit(limit);
};

export default mongoose.model('Event', eventSchema);