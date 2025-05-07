
import React from 'react';
import { useCalendarDayClassNames } from '@/hooks/useCalendarDayClassNames';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface CustomCalendarDayProps {
  day: Date;
  events: CalendarEvent[];
  displayMonth?: Date;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  disabled?: boolean;
  tabIndex?: number;
}

const CustomCalendarDay = (props: CustomCalendarDayProps) => {
  const { day, events, displayMonth } = props;
  const { getDayClassNames } = useCalendarDayClassNames(events);
  
  const dayClasses = getDayClassNames(day);
  
  return (
    <div 
      className={cn(dayClasses, "text-center w-full h-full flex items-center justify-center")}
      role="button"
    >
      {day.getDate()}
    </div>
  );
};

export default CustomCalendarDay;
