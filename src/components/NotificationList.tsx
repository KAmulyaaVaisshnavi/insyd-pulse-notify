import { Bell, CheckCheck, X, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationItem } from './NotificationItem';
import { useNotifications } from '@/hooks/useNotifications';

export const NotificationList = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error, 
    isOnline, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications,
    refreshNotifications 
  } = useNotifications();

  const LoadingSkeleton = () => (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-4">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto shadow-medium bg-gradient-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="relative">
              <Bell className="w-5 h-5 text-primary" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 w-5 h-5 text-xs flex items-center justify-center p-0 animate-pulse-glow"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </div>
            Notifications
            {!isOnline && (
              <div title="Offline mode">
                <WifiOff className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshNotifications}
              disabled={loading}
              className="text-xs hover:bg-primary/10"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs hover:bg-primary/10"
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearNotifications}
              className="text-xs hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            {isOnline ? '⚠️ ' : '📱 '}{error}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {loading ? (
            <LoadingSkeleton />
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Bell className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-muted-foreground mb-2">No notifications yet</h3>
              <p className="text-sm text-muted-foreground/75 text-center">
                When people interact with your content, you'll see notifications here.
              </p>
              {!isOnline && (
                <div className="mt-4 p-3 bg-muted/50 rounded-md text-center">
                  <p className="text-xs text-muted-foreground">
                    🔌 Connect to see live notifications
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};