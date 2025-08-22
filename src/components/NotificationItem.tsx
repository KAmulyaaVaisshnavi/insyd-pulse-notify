import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/types/notifications';
import { NotificationIcon } from './NotificationIcon';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "group flex items-start gap-4 p-4 border-b border-border hover:bg-muted/50 transition-smooth cursor-pointer animate-fade-in",
        !notification.isRead && "bg-gradient-to-r from-primary/5 to-transparent"
      )}
    >
      <NotificationIcon type={notification.type} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{notification.sourceUser.avatar}</span>
              <span className="font-medium text-foreground">
                {notification.sourceUser.name}
              </span>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
              )}
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {notification.message}
            </p>
            
            {notification.targetContent && (
              <div className="mt-2 p-2 bg-secondary/50 rounded-md border-l-2 border-primary/30">
                <span className="text-xs font-medium text-primary">
                  {notification.targetContent.type.toUpperCase()}
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  {notification.targetContent.title}
                </p>
              </div>
            )}
          </div>
          
          <time className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
          </time>
        </div>
      </div>
    </div>
  );
};