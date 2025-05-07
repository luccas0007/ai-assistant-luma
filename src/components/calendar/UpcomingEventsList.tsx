
import React from 'react';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';
import { CalendarEvent } from '@/types/calendar';

interface UpcomingEventsListProps {
  events: CalendarEvent[];
}

const UpcomingEventsList: React.FC<UpcomingEventsListProps> = ({ events }) => {
  const upcomingEvents = events
    .filter(event => event.start >= new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 3);

  return (
    <div className="space-y-3">
      {upcomingEvents.length > 0 ? (
        upcomingEvents.map(event => (
          <div key={event.id} className="flex items-center gap-3 pb-3 border-b last:border-0 last:pb-0">
            <div className="w-12 h-12 flex flex-col items-center justify-center bg-primary/10 rounded-md text-primary">
              <span className="text-xs font-medium">{format(event.start, 'MMM')}</span>
              <span className="text-lg font-bold">{format(event.start, 'd')}</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{event.title}</h4>
              <p className="text-xs text-muted-foreground">
                {format(event.start, 'h:mm a')}
                {event.isReminder && (
                  <span className="ml-1 inline-flex items-center">
                    <Bell className="h-3 w-3 mr-1" />
                    Reminder
                  </span>
                )}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No upcoming events
        </p>
      )}
    </div>
  );
};

export default UpcomingEventsList;
