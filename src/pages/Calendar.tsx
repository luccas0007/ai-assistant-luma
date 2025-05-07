
import React, { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Clock, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import EventDialog from '@/components/calendar/EventDialog';
import EventCard from '@/components/calendar/EventCard';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const CalendarPage: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const { events, isLoading, saveEvent, deleteEvent } = useCalendarEvents();
  const { toast } = useToast();
  
  const eventsForSelectedDate = events.filter(
    event => isSameDay(event.start, date) || isSameDay(event.end, date)
  );
  
  const handleAddEvent = () => {
    setSelectedEvent(null);
    setDialogOpen(true);
  };
  
  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };
  
  const handleDeleteEvent = (event: CalendarEvent) => {
    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
      deleteEvent(event.id);
    }
  };
  
  const handleSaveEvent = (event: CalendarEvent) => {
    saveEvent(event);
    setDialogOpen(false);
  };
  
  // Function to highlight dates with events
  const getDayClassNames = (day: Date) => {
    const hasEvents = events.some(event => 
      isSameDay(event.start, day) || isSameDay(event.end, day)
    );
    
    const hasReminders = events.some(event => 
      event.isReminder && isSameDay(event.start, day)
    );
    
    if (hasReminders) {
      return "bg-amber-100 text-amber-600 hover:bg-amber-200 focus:bg-amber-100";
    }
    
    if (hasEvents) {
      return "bg-blue-100 text-blue-600 hover:bg-blue-200 focus:bg-blue-100";
    }
    
    return "";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Calendar</h1>
          <p className="text-muted-foreground">Manage your schedule and events</p>
        </div>
        <Button className="gap-1" onClick={handleAddEvent}>
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
              className="rounded-md border pointer-events-auto"
              modifiers={{
                highlighted: (day) => events.some(event => 
                  isSameDay(event.start, day) || isSameDay(event.end, day)
                )
              }}
              modifiersStyles={{
                highlighted: {
                  fontWeight: "bold"
                }
              }}
              components={{
                Day: (props) => {
                  // Fix: Properly extract the date from props and handle className
                  const dayDate = props.date;
                  const customClass = getDayClassNames(dayDate);
                  // Check if there's a reminder for this day
                  const hasReminder = events.some(event => 
                    event.isReminder && isSameDay(event.start, dayDate)
                  );
                  
                  return (
                    <div className="relative">
                      <button 
                        onClick={props.onClick}
                        disabled={props.disabled}
                        className={cn(props.className || "", customClass)}
                        style={props.style}
                        tabIndex={props.tabIndex}
                      >
                        {props.children}
                      </button>
                      {hasReminder && (
                        <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-amber-500" />
                      )}
                    </div>
                  );
                }
              }}
            />
          </CardContent>
          
          <CardHeader className="pb-3 border-t">
            <CardTitle className="text-lg">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="space-y-3">
              {events
                .filter(event => event.start >= new Date())
                .sort((a, b) => a.start.getTime() - b.start.getTime())
                .slice(0, 3)
                .map(event => (
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
                ))}
              
              {events.filter(event => event.start >= new Date()).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming events
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-8 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                <span>
                  {format(date, 'EEEE, MMMM d, yyyy')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsForSelectedDate.length > 0 ? (
                <div className="space-y-4">
                  {eventsForSelectedDate
                    .sort((a, b) => a.start.getTime() - b.start.getTime())
                    .map(event => (
                      <EventCard 
                        key={event.id} 
                        event={event}
                        onEdit={handleEditEvent}
                        onDelete={handleDeleteEvent}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No events scheduled for this date</p>
                  <Button className="mt-4" variant="outline" size="sm" onClick={handleAddEvent}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Event
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <EventDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveEvent}
        selectedEvent={selectedEvent}
        selectedDate={date}
      />
    </div>
  );
};

export default CalendarPage;
