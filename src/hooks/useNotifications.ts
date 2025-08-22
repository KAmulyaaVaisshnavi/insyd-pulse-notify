import { useState, useEffect, useCallback } from 'react';
import { Notification, NotificationType, MockUser } from '@/types/notifications';

// Mock data for demonstration
const mockUsers: MockUser[] = [
  { id: '1', name: 'Sarah Chen', avatar: '👩‍💼', profession: 'Senior Architect' },
  { id: '2', name: 'Marcus Johnson', avatar: '👨‍💼', profession: 'Urban Designer' },
  { id: '3', name: 'Priya Sharma', avatar: '👩‍🎨', profession: 'Landscape Architect' },
  { id: '4', name: 'Alex Rodriguez', avatar: '👨‍🎨', profession: 'Interior Designer' },
  { id: '5', name: 'Emma Wilson', avatar: '👩‍💻', profession: 'Architecture Journalist' },
];

const mockContent = [
  { id: 'p1', title: 'Sustainable Housing Project in Mumbai', type: 'post' as const },
  { id: 'p2', title: 'Modern Office Complex Design', type: 'project' as const },
  { id: 'p3', title: 'Green Building Certification Process', type: 'post' as const },
  { id: 'p4', title: 'Urban Planning Best Practices', type: 'project' as const },
];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Generate random notification
  const generateNotification = useCallback((type?: NotificationType): Notification => {
    const types: NotificationType[] = ['like', 'comment', 'follow', 'post'];
    const selectedType = type || types[Math.floor(Math.random() * types.length)];
    const sourceUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const content = mockContent[Math.floor(Math.random() * mockContent.length)];

    const messageTemplates = {
      like: `liked your ${content.type} "${content.title}"`,
      comment: `commented on your ${content.type} "${content.title}"`,
      follow: `started following you`,
      post: `shared a new ${content.type} "${content.title}"`,
    };

    const titleTemplates = {
      like: 'New Like',
      comment: 'New Comment',
      follow: 'New Follower',
      post: 'New Post',
    };

    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: selectedType,
      title: titleTemplates[selectedType],
      message: messageTemplates[selectedType],
      timestamp: new Date(),
      isRead: false,
      sourceUser,
      targetContent: selectedType !== 'follow' ? content : undefined,
    };
  }, []);

  // Initialize with some mock notifications
  useEffect(() => {
    const initialNotifications = [
      generateNotification('like'),
      generateNotification('follow'),
      generateNotification('comment'),
    ];
    setNotifications(initialNotifications);
    setUnreadCount(initialNotifications.length);
  }, [generateNotification]);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Random chance to generate a new notification
      if (Math.random() > 0.7) {
        const newNotification = generateNotification();
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    }, 8000); // Every 8 seconds

    return () => clearInterval(interval);
  }, [generateNotification]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
  }, []);

  const triggerEvent = useCallback((type: NotificationType) => {
    const newNotification = generateNotification(type);
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, [generateNotification]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    triggerEvent,
    clearNotifications,
  };
};