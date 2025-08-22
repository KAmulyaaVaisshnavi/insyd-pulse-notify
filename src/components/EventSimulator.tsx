import { Heart, MessageCircle, UserPlus, FileText, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationType } from '@/types/notifications';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

export const EventSimulator = () => {
  const { triggerEvent } = useNotifications();
  const { toast } = useToast();

  const handleTriggerEvent = (type: NotificationType, label: string) => {
    triggerEvent(type);
    toast({
      title: "Event Triggered",
      description: `Simulated a ${label.toLowerCase()} event`,
      duration: 2000,
    });
  };

  const events = [
    { 
      type: 'like' as NotificationType, 
      label: 'Like', 
      icon: Heart, 
      description: 'Someone liked your content',
      variant: 'outline' as const,
      className: 'hover:bg-notification-like/10 hover:border-notification-like hover:text-notification-like'
    },
    { 
      type: 'comment' as NotificationType, 
      label: 'Comment', 
      icon: MessageCircle, 
      description: 'Someone commented on your post',
      variant: 'outline' as const,
      className: 'hover:bg-notification-comment/10 hover:border-notification-comment hover:text-notification-comment'
    },
    { 
      type: 'follow' as NotificationType, 
      label: 'Follow', 
      icon: UserPlus, 
      description: 'Someone started following you',
      variant: 'outline' as const,
      className: 'hover:bg-notification-follow/10 hover:border-notification-follow hover:text-notification-follow'
    },
    { 
      type: 'post' as NotificationType, 
      label: 'New Post', 
      icon: FileText, 
      description: 'Someone shared new content',
      variant: 'outline' as const,
      className: 'hover:bg-notification-post/10 hover:border-notification-post hover:text-notification-post'
    },
  ];

  return (
    <Card className="w-full max-w-md mx-auto shadow-medium bg-gradient-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="w-5 h-5 text-accent" />
          Event Simulator
        </CardTitle>
        <CardDescription>
          Trigger different types of notifications to test the system
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {events.map(({ type, label, icon: Icon, description, variant, className }) => (
          <Button
            key={type}
            variant={variant}
            onClick={() => handleTriggerEvent(type, label)}
            className={`w-full justify-start h-auto p-4 transition-smooth ${className}`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">
                  {description}
                </div>
              </div>
            </div>
          </Button>
        ))}
        
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            💡 Notifications also appear automatically every few seconds
          </p>
        </div>
      </CardContent>
    </Card>
  );
};