
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface DueDateFieldProps {
  dueDate: Date | undefined;
  setDueDate: (date: Date | undefined) => void;
}

const DueDateField: React.FC<DueDateFieldProps> = ({ dueDate, setDueDate }) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="grid gap-2">
      <Label htmlFor="dueDate">Due Date</Label>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start text-left font-normal"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={dueDate}
            onSelect={(date) => {
              setDueDate(date);
              setCalendarOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DueDateField;
