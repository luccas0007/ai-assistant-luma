
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NotificationFiltersProps {
  setFilter: (filter: string) => void;
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({ setFilter }) => {
  return (
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
  );
};

export default NotificationFilters;
