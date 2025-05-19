
import { Bell, Check, Calendar, Mail, MessageSquare } from 'lucide-react';
import React from 'react';
import { Notification } from '@/components/widgets/NotificationCenter';

export const typeIcons = {
  reminder: <Calendar className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  message: <MessageSquare className="h-4 w-4" />,
  task: <Check className="h-4 w-4" />,
  system: <Bell className="h-4 w-4" />
};

export const typeColors = {
  reminder: 'bg-blue-100 text-blue-800',
  email: 'bg-purple-100 text-purple-800',
  message: 'bg-green-100 text-green-800',
  task: 'bg-amber-100 text-amber-800',
  system: 'bg-gray-100 text-gray-800'
};

// Helper function to format time
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

// Generate fallback notifications
export const generateDummyNotifications = (): Notification[] => {
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
};
