
import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { CalendarEvent } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import EventCard from '@/components/calendar/EventCard';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DailyEventsListProps {
  date: Date;
  events: CalendarEvent[];
  onAddEvent: () => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (event: CalendarEvent) => void;
}

const DailyEventsList: React.FC<DailyEventsListProps> = ({ 
  date, 
  events, 
  onAddEvent, 
  onEditEvent, 
  onDeleteEvent 
}) => {
  return (
    <>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <span>
            {format(date, 'EEEE, MMMM d, yyyy')}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length > 0 ? (
          <div className="space-y-4">
            {events
              .sort((a, b) => a.start.getTime() - b.start.getTime())
              .map(event => (
                <EventCard 
                  key={event.id} 
                  event={event}
                  onEdit={onEditEvent}
                  onDelete={onDeleteEvent}
                />
              ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No events scheduled for this date</p>
            <Button className="mt-4" variant="outline" size="sm" onClick={onAddEvent}>
              <Plus className="h-4 w-4 mr-1" />
              Add Event
            </Button>
          </div>
        )}
      </CardContent>
    </>
  );
};

export default DailyEventsList;
