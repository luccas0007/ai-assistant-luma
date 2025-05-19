
import React from 'react';
import { Bell } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import NotificationHeader from './NotificationHeader';
import NotificationFilters from './NotificationFilters';
import NotificationList from './NotificationList';
import { useFetchNotifications } from '@/hooks/notifications/useFetchNotifications';
import { useNotificationActions } from '@/hooks/notifications/useNotificationActions';

const NotificationsContainer: React.FC = () => {
  const { notifications, setNotifications, isLoading } = useFetchNotifications();
  const {
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    unreadCount
  } = useNotificationActions(notifications, setNotifications);

  return (
    <div className="space-y-6">
      <NotificationHeader 
        unreadCount={unreadCount} 
        markAllAsRead={markAllAsRead} 
        clearAll={clearAll} 
        notificationsExist={notifications.length > 0}
      />
      
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
            <NotificationFilters setFilter={setFilter} />
            
            <TabsContent value="all" className="mt-0">
              <NotificationList 
                notifications={notifications}
                isLoading={isLoading}
                filter={filter}
                markAsRead={markAsRead}
                deleteNotification={deleteNotification}
              />
            </TabsContent>
            
            {/* These TabsContent components are actually not needed since the content is filtered in NotificationList */}
            {/* They are kept here for maintaining the same structure as the original code */}
            <TabsContent value="unread" className="mt-0" />
            <TabsContent value="reminder" className="mt-0" />
            <TabsContent value="email" className="mt-0" />
            <TabsContent value="message" className="mt-0" />
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsContainer;
