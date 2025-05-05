
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

const dummyNotifications = [
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
    message: 'Your meeting with the client was rescheduled',
    time: 'Yesterday',
    type: 'calendar',
    read: true
  }
];

const typeIcons = {
  reminder: '⏰',
  email: '✉️',
  task: '✓',
  calendar: '📅'
};

const NotificationCenter: React.FC = () => {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Notifications</CardTitle>
        <Bell className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3 overflow-auto max-h-[300px]">
        {dummyNotifications.map(notification => (
          <div 
            key={notification.id} 
            className={`p-3 rounded-md cursor-pointer transition-colors
            ${notification.read ? 'bg-transparent' : 'bg-primary/5'}
            hover:bg-muted/80`}
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                {typeIcons[notification.type as keyof typeof typeIcons]}
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
        ))}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
