import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  avatar: {
    type: String,
    default: '👤'
  },
  profession: {
    type: String,
    default: 'Architect'
  },
  preferences: {
    notifications: {
      likes: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      follows: { type: Boolean, default: true },
      posts: { type: Boolean, default: true }
    },
    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: false }
    }
  },
  followers: [{
    type: String,
    ref: 'User'
  }],
  following: [{
    type: String,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ userId: 1 });
userSchema.index({ createdAt: -1 });

// Methods
userSchema.methods.toPublicJSON = function() {
  return {
    userId: this.userId,
    name: this.name,
    avatar: this.avatar,
    profession: this.profession,
    isActive: this.isActive
  };
};

export default mongoose.model('User', userSchema);