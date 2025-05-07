
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CalendarEvent } from '@/types/calendar';
import DateTimeSection from './dialog/DateTimeSection';
import EventDetailsForm from './dialog/EventDetailsForm';
import ReminderSelector from './dialog/ReminderSelector';

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  selectedEvent: CalendarEvent | null;
  selectedDate?: Date;
}

const EventDialog: React.FC<EventDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedEvent,
  selectedDate
}) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isReminder, setIsReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState<Date | undefined>(undefined);
  const [reminderTimeString, setReminderTimeString] = useState('08:45');
  
  useEffect(() => {
    if (selectedEvent) {
      setTitle(selectedEvent.title);
      setLocation(selectedEvent.location);
      setDescription(selectedEvent.description);
      setStartDate(selectedEvent.start);
      setEndDate(selectedEvent.end);
      setStartTime(format(selectedEvent.start, 'HH:mm'));
      setEndTime(format(selectedEvent.end, 'HH:mm'));
      setIsReminder(selectedEvent.isReminder);
      if (selectedEvent.reminderTime) {
        setReminderTime(selectedEvent.reminderTime);
        setReminderTimeString(format(selectedEvent.reminderTime, 'HH:mm'));
      }
    } else if (selectedDate) {
      setStartDate(selectedDate);
      setEndDate(selectedDate);
    }
  }, [selectedEvent, selectedDate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate || !title.trim()) return;
    
    // Parse times and combine with dates
    const [startHour, startMinute] = startTime.split(':').map(n => parseInt(n));
    const [endHour, endMinute] = endTime.split(':').map(n => parseInt(n));
    
    const startDateTime = new Date(startDate);
    startDateTime.setHours(startHour, startMinute, 0);
    
    const endDateTime = new Date(endDate);
    endDateTime.setHours(endHour, endMinute, 0);
    
    let reminderDateTime: Date | undefined = undefined;
    if (isReminder && startDate) {
      const [reminderHour, reminderMinute] = reminderTimeString.split(':').map(n => parseInt(n));
      reminderDateTime = new Date(startDate);
      reminderDateTime.setHours(reminderHour, reminderMinute, 0);
    }
    
    const event: CalendarEvent = {
      id: selectedEvent?.id || crypto.randomUUID(),
      title,
      location,
      description,
      start: startDateTime,
      end: endDateTime,
      isReminder,
      reminderTime: reminderDateTime,
      color: selectedEvent?.color || '#3b82f6' // Default blue color
    };
    
    onSave(event);
    resetForm();
  };
  
  const resetForm = () => {
    setTitle('');
    setLocation('');
    setDescription('');
    setStartDate(undefined);
    setEndDate(undefined);
    setStartTime('09:00');
    setEndTime('10:00');
    setIsReminder(false);
    setReminderTime(undefined);
    setReminderTimeString('08:45');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{selectedEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
            <DialogDescription>
              {selectedEvent ? 'Update the event details below.' : 'Enter event details below to create a new event.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <EventDetailsForm
              title={title}
              location={location}
              description={description}
              onTitleChange={setTitle}
              onLocationChange={setLocation}
              onDescriptionChange={setDescription}
            />
            
            <DateTimeSection
              startDate={startDate}
              endDate={endDate}
              startTime={startTime}
              endTime={endTime}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
            />
            
            <ReminderSelector
              isReminder={isReminder}
              reminderTimeString={reminderTimeString}
              onReminderChange={setIsReminder}
              onReminderTimeChange={setReminderTimeString}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !startDate || !endDate}>
              {selectedEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;
