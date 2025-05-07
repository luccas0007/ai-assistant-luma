
import { isSameDay } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';

export function useCalendarDayClassNames(events: CalendarEvent[]) {
  const getDayClassNames = (day: Date) => {
    const hasEvents = events.some(event => 
      isSameDay(event.start, day) || isSameDay(event.end, day)
    );
    
    const hasReminders = events.some(event => 
      event.isReminder && isSameDay(event.start, day)
    );
    
    if (hasReminders) {
      return "bg-amber-100 text-amber-600 hover:bg-amber-200 focus:bg-amber-100";
    }
    
    if (hasEvents) {
      return "bg-blue-100 text-blue-600 hover:bg-blue-200 focus:bg-blue-100";
    }
    
    return "";
  };

  return { getDayClassNames };
}
