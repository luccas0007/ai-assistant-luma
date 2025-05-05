
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  location: string;
  description: string;
}

const dummyEvents: Event[] = [
  {
    id: 1,
    title: 'Team Meeting',
    start: new Date(2025, 4, 6, 14, 0),
    end: new Date(2025, 4, 6, 15, 0),
    location: 'Conference Room A',
    description: 'Weekly team sync-up'
  },
  {
    id: 2,
    title: 'Project Deadline',
    start: new Date(2025, 4, 8, 18, 0),
    end: new Date(2025, 4, 8, 18, 0),
    location: 'Remote',
    description: 'Submit final deliverables'
  },
  {
    id: 3,
    title: 'Client Presentation',
    start: new Date(2025, 4, 10, 9, 30),
    end: new Date(2025, 4, 10, 11, 0),
    location: 'Main Office',
    description: 'Present the new feature set'
  },
  {
    id: 4,
    title: 'Training Session',
    start: new Date(2025, 4, 12, 13, 0),
    end: new Date(2025, 4, 12, 16, 0),
    location: 'Training Room',
    description: 'New software training'
  }
];

const CalendarPage: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>(dummyEvents);
  
  const eventsForSelectedDate = events.filter(
    event => event.start.toDateString() === date.toDateString()
  );
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Calendar</h1>
          <p className="text-muted-foreground">Manage your schedule and events</p>
        </div>
        <Button className="gap-1">
          <Plus className="h-4 w-4" />
          <span>Add Event</span>
        </Button>
      </div>
      
      <div className="grid md:grid-cols-12 gap-6">
        <Card className="md:col-span-4">
          <CardContent className="p-4">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
        
        <div className="md:col-span-8 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                <span>
                  {date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsForSelectedDate.length > 0 ? (
                <div className="space-y-4">
                  {eventsForSelectedDate.map(event => (
                    <div key={event.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="w-12 flex-shrink-0 flex flex-col items-center">
                        <span className="text-sm font-medium">{formatTime(event.start)}</span>
                        <div className="mt-1 h-full w-0.5 bg-border"></div>
                        <span className="text-sm font-medium text-muted-foreground">{formatTime(event.end)}</span>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-base font-semibold">{event.title}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {formatTime(event.start)} - {formatTime(event.end)}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{event.location}</p>
                        <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No events scheduled for this date</p>
                  <Button className="mt-4" variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Event
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
