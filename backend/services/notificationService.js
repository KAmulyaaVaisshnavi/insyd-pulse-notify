import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { generateId } from '../utils/helpers.js';

// Mock content database for POC
const mockContent = [
  { id: 'p1', title: 'Sustainable Housing Project in Mumbai', type: 'post' },
  { id: 'p2', title: 'Modern Office Complex Design', type: 'project' },
  { id: 'p3', title: 'Green Building Certification Process', type: 'post' },
  { id: 'p4', title: 'Urban Planning Best Practices', type: 'project' },
  { id: 'p5', title: 'Smart City Infrastructure Design', type: 'post' },
  { id: 'p6', title: 'Eco-Friendly Materials in Architecture', type: 'project' },
];

/**
 * Process an event and generate appropriate notifications
 */
export async function processEvent(event) {
  try {
    console.log(`📨 Processing event: ${event.type} from ${event.sourceUserId}`);

    switch (event.type) {
      case 'like':
        return await processLikeEvent(event);
      case 'comment':
        return await processCommentEvent(event);
      case 'follow':
        return await processFollowEvent(event);
      case 'post':
        return await processPostEvent(event);
      default:
        throw new Error(`Unknown event type: ${event.type}`);
    }
  } catch (error) {
    console.error('❌ Error processing event:', error);
    throw error;
  }
}

/**
 * Process a like event
 */
async function processLikeEvent(event) {
  const sourceUser = await getUser(event.sourceUserId);
  const targetUser = await getUser(event.targetUserId);
  
  if (!sourceUser || !targetUser) {
    throw new Error('User not found');
  }

  // Check user preferences
  if (!targetUser.preferences?.notifications?.likes) {
    console.log('👤 User has disabled like notifications');
    return;
  }

  const content = getRandomContent();
  
  const notification = new Notification({
    notificationId: generateId('notification'),
    userId: event.targetUserId,
    type: 'like',
    title: 'New Like',
    message: `liked your ${content.type} "${content.title}"`,
    sourceUser: {
      id: sourceUser.userId,
      name: sourceUser.name,
      avatar: sourceUser.avatar
    },
    targetContent: content
  });

  await notification.save();
  console.log(`✅ Like notification created for user ${event.targetUserId}`);
  return notification;
}

/**
 * Process a comment event
 */
async function processCommentEvent(event) {
  const sourceUser = await getUser(event.sourceUserId);
  const targetUser = await getUser(event.targetUserId);
  
  if (!sourceUser || !targetUser) {
    throw new Error('User not found');
  }

  if (!targetUser.preferences?.notifications?.comments) {
    console.log('👤 User has disabled comment notifications');
    return;
  }

  const content = getRandomContent();
  
  const notification = new Notification({
    notificationId: generateId('notification'),
    userId: event.targetUserId,
    type: 'comment',
    title: 'New Comment',
    message: `commented on your ${content.type} "${content.title}"`,
    sourceUser: {
      id: sourceUser.userId,
      name: sourceUser.name,
      avatar: sourceUser.avatar
    },
    targetContent: content
  });

  await notification.save();
  console.log(`✅ Comment notification created for user ${event.targetUserId}`);
  return notification;
}

/**
 * Process a follow event
 */
async function processFollowEvent(event) {
  const sourceUser = await getUser(event.sourceUserId);
  const targetUser = await getUser(event.targetUserId);
  
  if (!sourceUser || !targetUser) {
    throw new Error('User not found');
  }

  if (!targetUser.preferences?.notifications?.follows) {
    console.log('👤 User has disabled follow notifications');
    return;
  }

  const notification = new Notification({
    notificationId: generateId('notification'),
    userId: event.targetUserId,
    type: 'follow',
    title: 'New Follower',
    message: 'started following you',
    sourceUser: {
      id: sourceUser.userId,
      name: sourceUser.name,
      avatar: sourceUser.avatar
    }
  });

  await notification.save();
  
  // Update follower/following relationships (simplified for POC)
  try {
    await User.updateOne(
      { userId: event.targetUserId },
      { $addToSet: { followers: event.sourceUserId } }
    );
    await User.updateOne(
      { userId: event.sourceUserId },
      { $addToSet: { following: event.targetUserId } }
    );
  } catch (error) {
    console.warn('⚠️ Could not update user relationships:', error.message);
  }

  console.log(`✅ Follow notification created for user ${event.targetUserId}`);
  return notification;
}

/**
 * Process a post event (broadcast to followers)
 */
async function processPostEvent(event) {
  const sourceUser = await getUser(event.sourceUserId);
  
  if (!sourceUser) {
    throw new Error('Source user not found');
  }

  // Get user's followers (for POC, we'll notify a few random users)
  const allUsers = await User.find({ 
    userId: { $ne: event.sourceUserId }, 
    isActive: true 
  }).limit(3);

  if (!allUsers.length) {
    console.log('📭 No followers to notify');
    return [];
  }

  const content = getRandomContent();
  const notifications = [];

  for (const follower of allUsers) {
    if (!follower.preferences?.notifications?.posts) {
      continue;
    }

    const notification = new Notification({
      notificationId: generateId('notification'),
      userId: follower.userId,
      type: 'post',
      title: 'New Post',
      message: `shared a new ${content.type} "${content.title}"`,
      sourceUser: {
        id: sourceUser.userId,
        name: sourceUser.name,
        avatar: sourceUser.avatar
      },
      targetContent: content
    });

    await notification.save();
    notifications.push(notification);
  }

  console.log(`✅ Post notifications created for ${notifications.length} followers`);
  return notifications;
}

/**
 * Get user by ID (with caching for production)
 */
async function getUser(userId) {
  try {
    let user = await User.findOne({ userId });
    
    // If user doesn't exist, create a demo user
    if (!user) {
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
      console.log(`👤 Created demo user: ${user.name}`);
    }
    
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Get random content for notifications
 */
function getRandomContent() {
  return mockContent[Math.floor(Math.random() * mockContent.length)];
}

/**
 * Clean up old notifications (run periodically)
 */
export async function cleanupOldNotifications(daysToKeep = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  try {
    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true
    });
    
    console.log(`🧹 Cleaned up ${result.deletedCount} old notifications`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    throw error;
  }
}