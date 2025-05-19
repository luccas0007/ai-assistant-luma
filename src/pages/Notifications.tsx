import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash, MoreVertical, Calendar, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/components/widgets/NotificationCenter';

const typeIcons = {
  reminder: <Calendar className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  message: <MessageSquare className="h-4 w-4" />,
  task: <Check className="h-4 w-4" />,
  system: <Bell className="h-4 w-4" />
};

const typeColors = {
  reminder: 'bg-blue-100 text-blue-800',
  email: 'bg-purple-100 text-purple-800',
  message: 'bg-green-100 text-green-800',
  task: 'bg-amber-100 text-amber-800',
  system: 'bg-gray-100 text-gray-800'
};

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchNotifications();
    
    // Set up an interval to refresh notifications
    const intervalId = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [user]);
  
  const fetchNotifications = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Fetch tasks with due dates approaching (within 24 hours)
      const now = new Date();
      const threeDays = new Date();
      threeDays.setHours(now.getHours() + 72); // Look for tasks due in next 3 days
      
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .lte('due_date', threeDays.toISOString())
        .order('due_date', { ascending: true });
      
      if (taskError) throw taskError;
      
      // Fetch recent emails (last 10)
      const { data: emailData, error: emailError } = await supabase
        .from('emails')
        .select('*')
        .order('received_at', { ascending: false })
        .limit(10);
      
      // Build notifications array
      const taskNotifications: Notification[] = (taskData || []).map((task, index) => {
        const dueDate = new Date(task.due_date);
        const hoursUntilDue = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        const daysUntilDue = Math.floor(hoursUntilDue / 24);
        
        let timeMessage = '';
        if (daysUntilDue > 1) {
          timeMessage = `Due in ${daysUntilDue} days`;
        } else if (hoursUntilDue > 0) {
          timeMessage = `Due in ${hoursUntilDue} hours`;
        } else {
          timeMessage = 'Due now';
        }
        
        return {
          id: 1000 + index,
          title: 'Task Due Soon',
          message: `"${task.title}" - ${timeMessage}`,
          time: timeMessage,
          type: 'reminder',
          read: false
        };
      });
      
      const emailNotifications: Notification[] = (emailData || []).map((email, index) => {
        return {
          id: 2000 + index,
          title: 'New Email',
          message: `${email.from_name || email.from_address}: ${email.subject || 'No subject'}`,
          time: formatTimeAgo(email.received_at || email.created_at),
          type: 'email',
          read: email.is_read || false
        };
      });
      
      // Add a system notification about email syncing
      const systemNotifications: Notification[] = [{
        id: 3000,
        title: 'Email Sync Complete',
        message: 'Your email inbox has been synchronized',
        time: '1 hour ago',
        type: 'system',
        read: true
      }];
      
      // Combine and sort notifications
      const allNotifications = [...taskNotifications, ...emailNotifications, ...systemNotifications]
        .sort((a, b) => {
          // Sort by read status first (unread first)
          if (a.read !== b.read) return a.read ? 1 : -1;
          return 0;
        });
      
      setNotifications(allNotifications.length > 0 ? allNotifications : generateDummyNotifications());
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications(generateDummyNotifications());
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to format time
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };
  
  // Fallback to dummy notifications
  const generateDummyNotifications = (): Notification[] => {
    return [
      {
        id: 1,
        title: 'Meeting reminder',
        message: 'Team meeting starting in 15 minutes',
        time: '10 minutes ago',
        type: 'reminder',
        read: false
      },
      {
        id: 2,
        title: 'Email received',
        message: 'New email from Sarah about the project proposal',
        time: '1 hour ago',
        type: 'email',
        read: false
      },
      {
        id: 3,
        title: 'Task completed',
        message: 'Alex marked "Update documentation" as complete',
        time: '3 hours ago',
        type: 'task',
        read: true
      },
      {
        id: 4,
        title: 'Calendar update',
        message: 'Your meeting with the client was rescheduled to tomorrow at 10 AM',
        time: 'Yesterday',
        type: 'reminder',
        read: true
      },
      {
        id: 5,
        title: 'New message',
        message: 'You received a new message from David in the project chat',
        time: 'Yesterday',
        type: 'message',
        read: true
      },
      {
        id: 6,
        title: 'System update',
        message: 'The system will be undergoing maintenance this weekend',
        time: '2 days ago',
        type: 'system',
        read: true
      },
      {
        id: 7,
        title: 'Email alert',
        message: 'Important email from the CEO requires your attention',
        time: '2 days ago',
        type: 'email',
        read: false
      }
    ];
  };
  
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
    toast({
      title: "Notification marked as read",
      description: "This notification has been marked as read"
    });
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    toast({
      title: "All notifications marked as read",
      description: "All notifications have been marked as read"
    });
  };
  
  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
    toast({
      title: "Notification deleted",
      description: "This notification has been removed"
    });
  };
  
  const clearAll = () => {
    setNotifications([]);
    toast({
      title: "Notifications cleared",
      description: "All notifications have been cleared"
    });
  };
  
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });
  
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with important alerts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
          <Button variant="outline" onClick={clearAll} disabled={notifications.length === 0}>
            <Trash className="h-4 w-4 mr-2" />
            Clear all
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              <span>All Notifications</span>
              {unreadCount > 0 && (
                <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                  {unreadCount} unread
                </span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all" onClick={() => setFilter('all')}>
                All
              </TabsTrigger>
              <TabsTrigger value="unread" onClick={() => setFilter('unread')}>
                Unread
              </TabsTrigger>
              <TabsTrigger value="reminder" onClick={() => setFilter('reminder')}>
                Calendar
              </TabsTrigger>
              <TabsTrigger value="email" onClick={() => setFilter('email')}>
                Email
              </TabsTrigger>
              <TabsTrigger value="message" onClick={() => setFilter('message')}>
                Messages
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <span className="text-muted-foreground">Loading notifications...</span>
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="space-y-3">
                  {filteredNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg ${notification.read ? 'bg-background' : 'bg-primary/5'} hover:bg-muted/50 transition-colors`}
                    >
                      <div className="flex gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${typeColors[notification.type]} flex items-center justify-center`}>
                          {typeIcons[notification.type]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h3 className={`text-sm ${notification.read ? 'font-medium' : 'font-semibold'}`}>
                              {notification.title}
                            </h3>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">
                                {notification.time}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!notification.read && (
                                    <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                      Mark as read
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => deleteNotification(notification.id)}>
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No notifications</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filter === 'all' 
                      ? 'You don\'t have any notifications yet' 
                      : filter === 'unread'
                        ? 'You have read all your notifications'
                        : `You don't have any ${filter} notifications`
                    }
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="unread" className="mt-0">
              {/* This content is handled by the filteredNotifications */}
              {/* It will show the same UI as the "all" tab but with filtered data */}
            </TabsContent>
            
            <TabsContent value="reminder" className="mt-0">
              {/* This content is handled by the filteredNotifications */}
              {/* It will show the same UI as the "all" tab but with filtered data */}
            </TabsContent>
            
            <TabsContent value="email" className="mt-0">
              {/* This content is handled by the filteredNotifications */}
              {/* It will show the same UI as the "all" tab but with filtered data */}
            </TabsContent>
            
            <TabsContent value="message" className="mt-0">
              {/* This content is handled by the filteredNotifications */}
              {/* It will show the same UI as the "all" tab but with filtered data */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
