
import React from 'react';
import { useCalendarDayClassNames } from '@/hooks/useCalendarDayClassNames';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface CustomCalendarDayProps {
  day: Date;
  events: CalendarEvent[];
  displayMonth?: Date;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  tabIndex?: number;
}

const CustomCalendarDay = (props: CustomCalendarDayProps) => {
  const { day, events, displayMonth, className, onClick, disabled, tabIndex } = props;
  const { getDayClassNames } = useCalendarDayClassNames(events);
  
  const dayClasses = getDayClassNames(day);
  
  return (
    <div 
      className={cn(dayClasses, className)}
      onClick={onClick}
      role="button"
      tabIndex={tabIndex}
      aria-disabled={disabled}
    >
      {day.getDate()}
    </div>
  );
};

export default CustomCalendarDay;
