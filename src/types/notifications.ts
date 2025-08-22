export type NotificationType = 'like' | 'comment' | 'follow' | 'post';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  sourceUser: {
    id: string;
    name: string;
    avatar: string;
  };
  targetContent?: {
    id: string;
    title: string;
    type: 'post' | 'project' | 'profile';
  };
}

export interface EventTrigger {
  type: NotificationType;
  sourceUserId: string;
  targetUserId: string;
  data?: any;
}

export interface MockUser {
  id: string;
  name: string;
  avatar: string;
  profession: string;
}