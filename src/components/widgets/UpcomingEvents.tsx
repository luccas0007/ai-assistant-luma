
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';

const UpcomingEvents: React.FC = () => {
  const { getUpcomingEvents, isLoading } = useCalendarEvents();
  const events = getUpcomingEvents(3);
  
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

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Upcoming Events</CardTitle>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">Loading events...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-4">
            {events.map(event => (
              <div key={event.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <div className="w-12 h-12 flex flex-col items-center justify-center bg-primary/10 rounded-md text-primary">
                  <span className="text-xs font-medium">{format(event.start, 'MMM')}</span>
                  <span className="text-lg font-bold">{format(event.start, 'dd')}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{event.title}</h4>
                  <p className="text-xs text-muted-foreground">{formatDate(event.start)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{event.location}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">No upcoming events</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;
