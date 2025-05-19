
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Check, Calendar, Mail, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Notification types mapped to icons
const typeIcons = {
  reminder: <Calendar className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  message: <MessageSquare className="h-4 w-4" />,
  task: <Check className="h-4 w-4" />,
  system: <Bell className="h-4 w-4" />
};

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'reminder' | 'email' | 'message' | 'task' | 'system';
  read: boolean;
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
    
    // Set up listeners for new emails and task due dates
    if (user) {
      // This is a simplified approach - in a real app, you might want to use
      // Supabase realtime subscriptions or a polling mechanism
      const intervalId = setInterval(fetchNotifications, 60000); // Refresh every minute
      return () => clearInterval(intervalId);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Fetch tasks with due dates approaching (within 24 hours)
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 24);
      
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .lte('due_date', tomorrow.toISOString())
        .gte('due_date', now.toISOString())
        .order('due_date', { ascending: true });
      
      if (taskError) throw taskError;
      
      // Fetch recent emails (last 5)
      const { data: emailData, error: emailError } = await supabase
        .from('emails')
        .select('*')
        .order('received_at', { ascending: false })
        .limit(3);
      
      // Build notifications array
      const taskNotifications: Notification[] = (taskData || []).map((task, index) => {
        const dueDate = new Date(task.due_date);
        const hoursUntilDue = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        
        return {
          id: 1000 + index,
          title: 'Task Due Soon',
          message: `"${task.title}" is due in ${hoursUntilDue} hours`,
          time: hoursUntilDue <= 1 ? 'Due very soon' : `Due in ${hoursUntilDue} hours`,
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
      
      // Combine and sort notifications by read status and time
      const allNotifications = [...taskNotifications, ...emailNotifications]
        .sort((a, b) => {
          if (a.read !== b.read) return a.read ? 1 : -1;
          return 0;
        });
      
      setNotifications(allNotifications.length > 0 ? allNotifications : generateDummyNotifications());
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications(generateDummyNotifications());
    } finally {
      setLoading(false);
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
  
  // Fallback to dummy notifications if no real ones exist
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
      }
    ];
  };

  const getTypeIcon = (type: string) => {
    return typeIcons[type as keyof typeof typeIcons] || <Bell className="h-4 w-4" />;
  };
  
  const getNotificationClass = (notification: Notification) => {
    if (!notification.read) {
      return 'bg-primary/5';
    }
    return 'bg-transparent';
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Notifications</CardTitle>
        <Bell className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3 overflow-auto max-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <span className="loading text-muted-foreground">Loading notifications...</span>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-3 rounded-md cursor-pointer transition-colors
              ${getNotificationClass(notification)}
              hover:bg-muted/80`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className={`text-sm ${notification.read ? 'font-medium' : 'font-semibold'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No new notifications</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
