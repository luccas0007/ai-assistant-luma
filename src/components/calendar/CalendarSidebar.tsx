
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isSameDay } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import CustomCalendarDay from './CustomCalendarDay';
import UpcomingEventsList from './UpcomingEventsList';
import { useCalendarDayClassNames } from '@/hooks/useCalendarDayClassNames';
import type { DayProps, DayContent } from 'react-day-picker';

interface CalendarSidebarProps {
  date: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({ date, events, onDateSelect }) => {
  const { getDayClassNames } = useCalendarDayClassNames(events);

  return (
    <Card className="md:col-span-4">
      <CardContent className="p-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => newDate && onDateSelect(newDate)}
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
            Day: ({ date: dayDate, ...otherProps }: DayProps) => {
              // This is for TypeScript compatibility
              if (!dayDate) return null;
              
              // Pass only the properties that CustomCalendarDay actually accepts
              return (
                <CustomCalendarDay 
                  day={dayDate} 
                  events={events}
                  displayMonth={otherProps.displayMonth}
                  // Use optional chaining to safely access possibly undefined props
                  onClick={otherProps.onClick}
                  disabled={otherProps.disabled}
                  tabIndex={otherProps.tabIndex}
                  className={otherProps.selected ? 'selected' : ''}
                />
              );
            }
          }}
        />
      </CardContent>
      
      <CardHeader className="pb-3 border-t">
        <CardTitle className="text-lg">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <UpcomingEventsList events={events} />
      </CardContent>
    </Card>
  );
};

export default CalendarSidebar;
