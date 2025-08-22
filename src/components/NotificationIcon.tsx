import { Bell, Heart, MessageCircle, UserPlus, FileText } from 'lucide-react';
import { NotificationType } from '@/types/notifications';

interface NotificationIconProps {
  type: NotificationType;
  className?: string;
}

export const NotificationIcon = ({ type, className = "w-4 h-4" }: NotificationIconProps) => {
  const iconMap = {
    like: Heart,
    comment: MessageCircle, 
    follow: UserPlus,
    post: FileText,
  };

  const colorMap = {
    like: "text-notification-like",
    comment: "text-notification-comment",
    follow: "text-notification-follow", 
    post: "text-notification-post",
  };

  const IconComponent = iconMap[type];
  
  return (
    <div className={`p-2 rounded-full bg-gradient-to-br ${getBackgroundGradient(type)}`}>
      <IconComponent className={`${className} ${colorMap[type]} fill-current`} />
    </div>
  );
};

const getBackgroundGradient = (type: NotificationType): string => {
  const gradientMap = {
    like: "from-notification-like/10 to-notification-like/5",
    comment: "from-notification-comment/10 to-notification-comment/5", 
    follow: "from-notification-follow/10 to-notification-follow/5",
    post: "from-notification-post/10 to-notification-post/5",
  };
  
  return gradientMap[type];
};