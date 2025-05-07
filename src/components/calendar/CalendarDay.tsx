
import React from 'react';
import { isSameDay } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface CalendarDayProps {
  date: Date;
  events: CalendarEvent[];
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  tabIndex?: number;
  children?: React.ReactNode;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  events,
  className,
  onClick,
  disabled,
  tabIndex,
  children,
}) => {
  // Check if there's a reminder for this day
  const hasReminder = events.some(event => 
    event.isReminder && isSameDay(event.start, date)
  );
  
  return (
    <div className="relative">
      <button 
        className={className}
        onClick={onClick}
        disabled={disabled}
        tabIndex={tabIndex}
      >
        {children}
      </button>
      {hasReminder && (
        <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-amber-500" />
      )}
    </div>
  );
};

export default CalendarDay;
