
import React from 'react';
import { Bell, Check, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationHeaderProps {
  unreadCount: number;
  markAllAsRead: () => void;
  clearAll: () => void;
  notificationsExist: boolean;
}

const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  unreadCount,
  markAllAsRead,
  clearAll,
  notificationsExist
}) => {
  return (
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
        <Button variant="outline" onClick={clearAll} disabled={!notificationsExist}>
          <Trash className="h-4 w-4 mr-2" />
          Clear all
        </Button>
      </div>
    </div>
  );
};

export default NotificationHeader;
