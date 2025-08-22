import { useState, useEffect, useCallback } from 'react';
import { Notification, NotificationType } from '@/types/notifications';
import { apiService, handleApiError, checkApiConnection } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Demo user for POC
const DEMO_USER_ID = 'demo-user-1';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const { toast } = useToast();

  // Check API connection status
  const checkConnection = useCallback(async () => {
    const online = await checkApiConnection();
    setIsOnline(online);
    
    if (!online && notifications.length === 0) {
      // Fallback to mock data if API is unavailable
      setError('Backend not available - using demo mode');
      loadMockData();
    }
  }, [notifications.length]);

  // Load notifications from API
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Ensure demo user exists
      await apiService.getUser(DEMO_USER_ID);
      
      const response = await apiService.getNotifications(DEMO_USER_ID, {
        limit: 50,
        page: 1
      });

      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
      setIsOnline(true);
    } catch (err: any) {
      const apiError = handleApiError(err);
      console.error('Failed to load notifications:', apiError);
      
      setError(apiError.message);
      setIsOnline(false);
      
      // Fallback to mock data
      if (notifications.length === 0) {
        loadMockData();
      }
    } finally {
      setLoading(false);
    }
  }, [notifications.length]);

  // Load mock data as fallback
  const loadMockData = useCallback(() => {
    const mockNotifications: Notification[] = [
      {
        id: 'mock-1',
        type: 'like',
        title: 'New Like',
        message: 'liked your post "Sustainable Housing Project"',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        isRead: false,
        sourceUser: {
          id: 'user-1',
          name: 'Sarah Chen',
          avatar: '👩‍💼'
        },
        targetContent: {
          id: 'p1',
          title: 'Sustainable Housing Project',
          type: 'post'
        }
      },
      {
        id: 'mock-2',
        type: 'follow',
        title: 'New Follower',
        message: 'started following you',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        isRead: false,
        sourceUser: {
          id: 'user-2',
          name: 'Marcus Johnson',
          avatar: '👨‍💼'
        }
      },
      {
        id: 'mock-3',
        type: 'comment',
        title: 'New Comment',
        message: 'commented on your project "Modern Office Design"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        isRead: true,
        sourceUser: {
          id: 'user-3',
          name: 'Priya Sharma',
          avatar: '👩‍🎨'
        },
        targetContent: {
          id: 'p2',
          title: 'Modern Office Design',
          type: 'project'
        }
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    
    toast({
      title: "Demo Mode",
      description: "Using mock data - backend not available",
      duration: 3000,
    });
  }, [toast]);

  // Initialize notifications
  useEffect(() => {
    const init = async () => {
      await checkConnection();
      await loadNotifications();
    };
    
    init();
  }, [checkConnection, loadNotifications]);

  // Set up polling for real-time updates
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(async () => {
      try {
        const response = await apiService.getNotifications(DEMO_USER_ID, {
          limit: 50,
          page: 1
        });
        
        const newNotifications = response.notifications || [];
        const newUnreadCount = response.unreadCount || 0;
        
        // Check for new notifications
        const currentIds = new Set(notifications.map(n => n.id));
        const hasNewNotifications = newNotifications.some((n: Notification) => !currentIds.has(n.id));
        
        if (hasNewNotifications) {
          setNotifications(newNotifications);
          
          // Show toast for new notifications
          const latestNew = newNotifications.find((n: Notification) => !currentIds.has(n.id));
          if (latestNew && !latestNew.isRead) {
            toast({
              title: latestNew.title,
              description: `${latestNew.sourceUser.name} ${latestNew.message}`,
              duration: 4000,
            });
          }
        }
        
        setUnreadCount(newUnreadCount);
      } catch (err) {
        // Silently handle polling errors
        console.warn('Polling error:', err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [isOnline, notifications, toast]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      if (isOnline) {
        await apiService.markNotificationAsRead(notificationId);
      }
      
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      const error = handleApiError(err);
      toast({
        title: "Error",
        description: `Failed to mark notification as read: ${error.message}`,
        variant: "destructive"
      });
    }
  }, [isOnline, toast]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      if (isOnline) {
        await apiService.markAllNotificationsAsRead(DEMO_USER_ID);
      }
      
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (err) {
      const error = handleApiError(err);
      toast({
        title: "Error",
        description: `Failed to mark all as read: ${error.message}`,
        variant: "destructive"
      });
    }
  }, [isOnline, toast]);

  // Trigger an event
  const triggerEvent = useCallback(async (type: NotificationType) => {
    try {
      if (!isOnline) {
        // Mock event in demo mode
        const mockNotification: Notification = {
          id: `mock-${Date.now()}`,
          type,
          title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          message: `Demo ${type} event triggered`,
          timestamp: new Date(),
          isRead: false,
          sourceUser: {
            id: 'demo-user',
            name: 'Demo User',
            avatar: '🎭'
          }
        };
        
        setNotifications(prev => [mockNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        toast({
          title: "Event Triggered (Demo)",
          description: `Simulated ${type} event`,
          duration: 2000,
        });
        return;
      }

      // Get random target user for non-post events
      let targetUserId = '';
      if (type !== 'post') {
        const users = await apiService.getAllUsers(5);
        const availableUsers = users.users.filter((u: any) => u.userId !== DEMO_USER_ID);
        if (availableUsers.length > 0) {
          targetUserId = availableUsers[Math.floor(Math.random() * availableUsers.length)].userId;
        } else {
          targetUserId = 'user-1'; // Fallback
        }
      }

      await apiService.createEvent({
        type,
        sourceUserId: DEMO_USER_ID,
        targetUserId: type === 'post' ? undefined : targetUserId,
        data: {
          timestamp: new Date().toISOString(),
          platform: 'insyd-poc'
        }
      });

      // Reload notifications to see the new one
      setTimeout(() => {
        loadNotifications();
      }, 500);

      toast({
        title: "Event Triggered",
        description: `Successfully created ${type} event`,
        duration: 2000,
      });
    } catch (err) {
      const error = handleApiError(err);
      toast({
        title: "Error",
        description: `Failed to trigger event: ${error.message}`,
        variant: "destructive"
      });
    }
  }, [isOnline, loadNotifications, toast]);

  // Clear all notifications
  const clearNotifications = useCallback(async () => {
    try {
      if (isOnline) {
        await apiService.clearAllNotifications(DEMO_USER_ID);
      }
      
      setNotifications([]);
      setUnreadCount(0);
      
      toast({
        title: "Cleared",
        description: "All notifications cleared",
      });
    } catch (err) {
      const error = handleApiError(err);
      toast({
        title: "Error",
        description: `Failed to clear notifications: ${error.message}`,
        variant: "destructive"
      });
    }
  }, [isOnline, toast]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    isOnline,
    markAsRead,
    markAllAsRead,
    triggerEvent,
    clearNotifications,
    refreshNotifications: loadNotifications,
  };
};