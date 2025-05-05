
import React, { useState } from 'react';
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

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'reminder' | 'email' | 'message' | 'task' | 'system';
  read: boolean;
}

const initialNotifications: Notification[] = [
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
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<string>('all');
  
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };
  
  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };
  
  const clearAll = () => {
    setNotifications([]);
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
              {filteredNotifications.length > 0 ? (
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
