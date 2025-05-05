
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const dummyEvents = [
  {
    id: 1,
    title: 'Team Meeting',
    date: new Date(2025, 4, 6, 14, 0),
    location: 'Conference Room A'
  },
  {
    id: 2,
    title: 'Project Deadline',
    date: new Date(2025, 4, 8, 18, 0),
    location: 'Remote'
  },
  {
    id: 3,
    title: 'Client Presentation',
    date: new Date(2025, 4, 10, 9, 30),
    location: 'Main Office'
  }
];

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const UpcomingEvents: React.FC = () => {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Upcoming Events</CardTitle>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dummyEvents.map(event => (
            <div key={event.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
              <div className="w-12 h-12 flex flex-col items-center justify-center bg-primary/10 rounded-md text-primary">
                <span className="text-xs font-medium">{event.date.toLocaleString('default', { month: 'short' })}</span>
                <span className="text-lg font-bold">{event.date.getDate()}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{event.title}</h4>
                <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
                <p className="text-xs text-muted-foreground mt-1">{event.location}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;
