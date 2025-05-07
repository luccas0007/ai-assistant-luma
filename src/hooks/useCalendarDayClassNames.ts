
import { isSameDay } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';

export function useCalendarDayClassNames(events: CalendarEvent[]) {
  const getDayClassNames = (day: Date) => {
    const hasEvents = events.some(event => 
      isSameDay(event.start, day) || isSameDay(event.end, day)
    );
    
    const hasReminders = events.some(event => 
      event.isReminder && isSameDay(event.start, day)
    );
    
    let classNames = '';
    
    if (hasReminders) {
      classNames = "bg-amber-100 text-amber-600 hover:bg-amber-200 focus:bg-amber-100";
    } else if (hasEvents) {
      classNames = "bg-blue-100 text-blue-600 hover:bg-blue-200 focus:bg-blue-100";
    }
    
    return classNames;
  };

  return { getDayClassNames };
}
