import { useEffect } from 'react';
import { Building2, Users, Briefcase, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NotificationList } from '@/components/NotificationList';
import { EventSimulator } from '@/components/EventSimulator';

const Index = () => {
  useEffect(() => {
    // Update document title and meta description for SEO
    document.title = 'Insyd - Architecture Industry Social Platform | Notification System POC';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Insyd notification system proof-of-concept showcasing real-time notifications for the architecture industry social platform. Experience seamless engagement tracking.');
    }
  }, []);

  const stats = [
    { icon: Users, label: 'Daily Active Users', value: '100+', trend: '+12%' },
    { icon: Building2, label: 'Architecture Firms', value: '45', trend: '+8%' },
    { icon: Briefcase, label: 'Projects Shared', value: '280', trend: '+24%' },
    { icon: TrendingUp, label: 'Engagement Rate', value: '94%', trend: '+6%' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-gradient-card shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Insyd</h1>
                <p className="text-sm text-muted-foreground">Architecture Industry Social Platform</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
              POC Demo
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4 bg-gradient-hero bg-clip-text text-transparent">
            Notification System POC
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Experience real-time notifications designed for architecture professionals. 
            This proof-of-concept demonstrates scalable notification delivery for social engagement.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            Live notification simulation running
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(({ icon: Icon, label, value, trend }) => (
              <Card key={label} className="shadow-soft bg-gradient-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{value}</span>
                        <Badge variant="outline" className="text-xs text-success border-success/20 bg-success/5">
                          {trend}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Notification Demo Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              Interactive Notification Demo
            </h3>
            <p className="text-muted-foreground">
              Test the notification system by triggering events or watch automatic notifications arrive
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Live Notifications
              </h4>
              <NotificationList />
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                Event Triggers
              </h4>
              <EventSimulator />
            </div>
          </div>
        </section>

        {/* Technical Info */}
        <section className="max-w-3xl mx-auto">
          <Card className="shadow-medium bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                System Architecture
              </CardTitle>
              <CardDescription>
                Designed for scalability from 100 to 1M+ daily active users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-foreground">Current Scale (100 DAUs)</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Real-time WebSocket connections</li>
                    <li>• In-memory event processing</li>
                    <li>• Single-server deployment</li>
                    <li>• MongoDB for persistence</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-foreground">Future Scale (1M DAUs)</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Message queue (Kafka/RabbitMQ)</li>
                    <li>• Horizontal scaling with load balancers</li>
                    <li>• Database sharding</li>
                    <li>• Push notification service</li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  This POC demonstrates core notification functionality with React frontend, 
                  simulating real backend events and WebSocket-like behavior for the architecture industry.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-gradient-card mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>&copy; 2024 Insyd - Architecture Industry Social Platform</p>
            <p>Notification System POC</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
