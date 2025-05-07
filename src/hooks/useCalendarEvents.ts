
import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Sample default events
const defaultEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    start: new Date(2025, 4, 6, 14, 0),
    end: new Date(2025, 4, 6, 15, 0),
    location: 'Conference Room A',
    description: 'Weekly team sync-up',
    isReminder: false
  },
  {
    id: '2',
    title: 'Project Deadline',
    start: new Date(2025, 4, 8, 18, 0),
    end: new Date(2025, 4, 8, 18, 0),
    location: 'Remote',
    description: 'Submit final deliverables',
    isReminder: true,
    reminderTime: new Date(2025, 4, 8, 17, 0)
  },
  {
    id: '3',
    title: 'Client Presentation',
    start: new Date(2025, 4, 10, 9, 30),
    end: new Date(2025, 4, 10, 11, 0),
    location: 'Main Office',
    description: 'Present the new feature set',
    isReminder: false
  }
];

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
  }, [user]);

  const loadEvents = () => {
    setIsLoading(true);
    try {
      // In a real app, we'd fetch from an API
      // For now, load from localStorage or use defaults
      const storedEvents = localStorage.getItem('calendar_events');
      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents);
        // Convert string dates back to Date objects
        const eventsWithDates = parsedEvents.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          reminderTime: event.reminderTime ? new Date(event.reminderTime) : undefined
        }));
        setEvents(eventsWithDates);
      } else {
        // Use default events as sample data
        setEvents(defaultEvents);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: "Error loading events",
        description: "Could not load your calendar events.",
        variant: "destructive"
      });
      setEvents(defaultEvents);
    } finally {
      setIsLoading(false);
    }
  };

  const saveEvents = (updatedEvents: CalendarEvent[]) => {
    try {
      localStorage.setItem('calendar_events', JSON.stringify(updatedEvents));
    } catch (error) {
      console.error('Error saving events:', error);
      toast({
        title: "Error saving events",
        description: "Could not save your calendar events.",
        variant: "destructive"
      });
    }
  };

  const addEvent = (event: CalendarEvent) => {
    const updatedEvents = [...events, event];
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
    toast({
      title: "Event created",
      description: `"${event.title}" has been added to your calendar.`
    });
  };

  const updateEvent = (updatedEvent: CalendarEvent) => {
    const updatedEvents = events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    );
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
    toast({
      title: "Event updated",
      description: `"${updatedEvent.title}" has been updated.`
    });
  };

  const deleteEvent = (eventId: string) => {
    const eventToDelete = events.find(event => event.id === eventId);
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
    if (eventToDelete) {
      toast({
        title: "Event deleted",
        description: `"${eventToDelete.title}" has been removed from your calendar.`
      });
    }
  };

  const getEventsByDate = (date: Date) => {
    return events.filter(event => 
      event.start.toDateString() === date.toDateString() || 
      event.end.toDateString() === date.toDateString()
    );
  };

  const getUpcomingEvents = (limit = 5) => {
    const now = new Date();
    return events
      .filter(event => event.start > now)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, limit);
  };

  const getReminders = () => {
    return events.filter(event => event.isReminder);
  };

  const saveEvent = (event: CalendarEvent) => {
    const existingEvent = events.find(e => e.id === event.id);
    if (existingEvent) {
      updateEvent(event);
    } else {
      addEvent(event);
    }
  };

  return {
    events,
    isLoading,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsByDate,
    getUpcomingEvents,
    getReminders,
    saveEvent
  };
}
