
import React, { useState } from 'react';
import { isSameDay } from 'date-fns';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import EventDialog from '@/components/calendar/EventDialog';
import { CalendarEvent } from '@/types/calendar';
import CalendarSidebar from '@/components/calendar/CalendarSidebar';
import DailyEventsList from '@/components/calendar/DailyEventsList';

const CalendarPage: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const { events, isLoading, saveEvent, deleteEvent } = useCalendarEvents();
  
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
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Calendar</h1>
          <p className="text-muted-foreground">Manage your schedule and events</p>
        </div>
        <Button className="gap-1 w-full sm:w-auto" onClick={handleAddEvent}>
          <Plus className="h-4 w-4" />
          <span>Add Event</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <CalendarSidebar 
          date={date} 
          events={events} 
          onDateSelect={setDate} 
        />
        
        <div className="md:col-span-8 space-y-4">
          <Card>
            <DailyEventsList
              date={date}
              events={eventsForSelectedDate}
              onAddEvent={handleAddEvent}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
            />
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
