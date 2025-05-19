
import React from 'react';
import { Bell } from 'lucide-react';
import { Notification } from '@/components/widgets/NotificationCenter';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  filter: string;
  markAsRead: (id: number) => void;
  deleteNotification: (id: number) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isLoading,
  filter,
  markAsRead,
  deleteNotification,
}) => {
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <span className="text-muted-foreground">Loading notifications...</span>
      </div>
    );
  }

  if (filteredNotifications.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-3">
      {filteredNotifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          markAsRead={markAsRead}
          deleteNotification={deleteNotification}
        />
      ))}
    </div>
  );
};

export default NotificationList;
