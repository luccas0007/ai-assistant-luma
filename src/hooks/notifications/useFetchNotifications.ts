
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/components/widgets/NotificationCenter';
import { formatTimeAgo, generateDummyNotifications } from '@/components/notifications/notificationUtils';

export const useFetchNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  const fetchNotifications = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Fetch tasks with due dates approaching (within next 3 days)
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

  useEffect(() => {
    fetchNotifications();
    
    // Set up an interval to refresh notifications
    const intervalId = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [user]);
  
  return { 
    notifications, 
    setNotifications, 
    isLoading,
    fetchNotifications
  };
};
