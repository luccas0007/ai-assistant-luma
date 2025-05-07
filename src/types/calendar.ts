
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location: string;
  description: string;
  isReminder: boolean;
  reminderTime?: Date;
  color?: string;
}
