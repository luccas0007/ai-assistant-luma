
import React from 'react';
import { formatDistance } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { Calendar, Clock, MapPin, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EventCardProps {
  event: CalendarEvent;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const isUpcoming = new Date() < event.start;
  const isPast = new Date() > event.end;
  const isOngoing = new Date() >= event.start && new Date() <= event.end;
  
  return (
    <div 
      className={cn(
        "flex flex-col gap-2 p-3 rounded-lg hover:bg-muted/50 border border-l-4 transition-colors",
        isOngoing ? "border-l-green-500" : 
        isUpcoming ? "border-l-blue-500" : 
        "border-l-gray-400"
      )}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-base font-medium">{event.title}</h3>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => onEdit(event)}
          >
            <span className="sr-only">Edit</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-destructive hover:text-destructive" 
            onClick={() => onDelete(event)}
          >
            <span className="sr-only">Delete</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span>
          {formatTime(event.start)} - {formatTime(event.end)}
        </span>
        {event.isReminder && (
          <span className="ml-2 flex items-center gap-1">
            <Bell className="h-3.5 w-3.5" />
            {formatTime(event.reminderTime!)}
          </span>
        )}
      </div>
      
      {event.location && (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{event.location}</span>
        </div>
      )}
      
      {event.description && (
        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
      )}
      
      {isUpcoming && (
        <p className="text-xs text-blue-500 mt-1">
          Starts {formatDistance(event.start, new Date(), { addSuffix: true })}
        </p>
      )}
    </div>
  );
};

export default EventCard;
