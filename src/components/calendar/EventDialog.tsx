
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarEvent } from '@/types/calendar';
import { Switch } from '@/components/ui/switch';
import TimePicker from './TimePicker';

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
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event title"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                      id="startDate"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        if (!endDate) setEndDate(date);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <TimePicker 
                  value={startTime} 
                  onChange={setStartTime} 
                  id="startTime" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                      id="endDate"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => date < (startDate || new Date())}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <TimePicker 
                  value={endTime} 
                  onChange={setEndTime} 
                  id="endTime"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Event location (optional)"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Event description (optional)"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="isReminder" 
                checked={isReminder}
                onCheckedChange={setIsReminder}
              />
              <Label htmlFor="isReminder">Set Reminder</Label>
            </div>
            
            {isReminder && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="reminderTime">Reminder Time</Label>
                  <TimePicker 
                    value={reminderTimeString} 
                    onChange={setReminderTimeString} 
                    id="reminderTime"
                  />
                </div>
              </div>
            )}
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
