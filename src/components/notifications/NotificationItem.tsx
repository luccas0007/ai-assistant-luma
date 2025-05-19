
import React from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Notification } from '@/components/widgets/NotificationCenter';
import { typeIcons, typeColors } from './notificationUtils';

interface NotificationItemProps {
  notification: Notification;
  markAsRead: (id: number) => void;
  deleteNotification: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  markAsRead,
  deleteNotification,
}) => {
  // Get the icon component for this notification type
  const IconComponent = typeIcons[notification.type];

  return (
    <div
      className={`p-4 rounded-lg ${notification.read ? 'bg-background' : 'bg-primary/5'} hover:bg-muted/50 transition-colors`}
    >
      <div className="flex gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${typeColors[notification.type]} flex items-center justify-center`}>
          {IconComponent && <IconComponent className="h-4 w-4" />}
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
  );
};

export default NotificationItem;
