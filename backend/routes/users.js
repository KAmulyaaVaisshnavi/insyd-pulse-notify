import express from 'express';
import User from '../models/User.js';
import { validateUserId, generateId, handleAsyncError } from '../utils/helpers.js';

const router = express.Router();

// Get or create user (simplified for POC)
router.get('/:userId', handleAsyncError(async (req, res) => {
  const { userId } = req.params;

  if (!validateUserId(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  let user = await User.findOne({ userId });
  
  if (!user) {
    // Create demo user if not exists
    const demoUsers = [
      { name: 'Sarah Chen', avatar: '👩‍💼', profession: 'Senior Architect' },
      { name: 'Marcus Johnson', avatar: '👨‍💼', profession: 'Urban Designer' },
      { name: 'Priya Sharma', avatar: '👩‍🎨', profession: 'Landscape Architect' },
      { name: 'Alex Rodriguez', avatar: '👨‍🎨', profession: 'Interior Designer' },
      { name: 'Emma Wilson', avatar: '👩‍💻', profession: 'Architecture Journalist' },
    ];
    
    const randomUser = demoUsers[Math.floor(Math.random() * demoUsers.length)];
    
    user = new User({
      userId,
      name: randomUser.name,
      email: `${userId}@insyd.com`,
      avatar: randomUser.avatar,
      profession: randomUser.profession
    });
    
    await user.save();
  }

  res.json({
    user: user.toPublicJSON()
  });
}));

// Get all demo users
router.get('/', handleAsyncError(async (req, res) => {
  const { limit = 10 } = req.query;
  
  const users = await User.find({ isActive: true })
    .limit(parseInt(limit))
    .select('userId name avatar profession')
    .lean();

  res.json({
    users: users.map(user => ({
      userId: user.userId,
      name: user.name,
      avatar: user.avatar,
      profession: user.profession
    }))
  });
}));

// Create demo users for testing
router.post('/demo/seed', handleAsyncError(async (req, res) => {
  const demoUsers = [
    {
      userId: 'user-1',
      name: 'Sarah Chen',
      email: 'sarah@insyd.com',
      avatar: '👩‍💼',
      profession: 'Senior Architect'
    },
    {
      userId: 'user-2',
      name: 'Marcus Johnson',
      email: 'marcus@insyd.com',
      avatar: '👨‍💼',
      profession: 'Urban Designer'
    },
    {
      userId: 'user-3',
      name: 'Priya Sharma',
      email: 'priya@insyd.com',
      avatar: '👩‍🎨',
      profession: 'Landscape Architect'
    },
    {
      userId: 'user-4',
      name: 'Alex Rodriguez',
      email: 'alex@insyd.com',
      avatar: '👨‍🎨',
      profession: 'Interior Designer'
    },
    {
      userId: 'user-5',
      name: 'Emma Wilson',
      email: 'emma@insyd.com',
      avatar: '👩‍💻',
      profession: 'Architecture Journalist'
    }
  ];

  const createdUsers = [];
  
  for (const userData of demoUsers) {
    const existingUser = await User.findOne({ userId: userData.userId });
    
    if (!existingUser) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user.toPublicJSON());
    } else {
      createdUsers.push(existingUser.toPublicJSON());
    }
  }

  res.json({
    message: 'Demo users created/verified successfully',
    users: createdUsers
  });
}));

// Update user preferences
router.patch('/:userId/preferences', handleAsyncError(async (req, res) => {
  const { userId } = req.params;
  const { preferences } = req.body;

  if (!validateUserId(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const user = await User.findOne({ userId });
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (preferences) {
    user.preferences = { ...user.preferences, ...preferences };
    await user.save();
  }

  res.json({
    message: 'User preferences updated successfully',
    user: user.toPublicJSON(),
    preferences: user.preferences
  });
}));

export default router;