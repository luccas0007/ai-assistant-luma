
import { useState } from 'react';
import { Notification } from '@/components/widgets/NotificationCenter';
import { useToast } from '@/hooks/use-toast';

export const useNotificationActions = (
  notifications: Notification[],
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
) => {
  const [filter, setFilter] = useState<string>('all');
  const { toast } = useToast();
  
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
  
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return {
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    unreadCount
  };
};
