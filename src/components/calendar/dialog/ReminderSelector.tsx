
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import TimePicker from '@/components/calendar/TimePicker';

interface ReminderSelectorProps {
  isReminder: boolean;
  reminderTimeString: string;
  onReminderChange: (checked: boolean) => void;
  onReminderTimeChange: (value: string) => void;
}

const ReminderSelector: React.FC<ReminderSelectorProps> = ({
  isReminder,
  reminderTimeString,
  onReminderChange,
  onReminderTimeChange
}) => {
  return (
    <>
      <div className="flex items-center space-x-2">
        <Switch 
          id="isReminder" 
          checked={isReminder}
          onCheckedChange={onReminderChange}
        />
        <Label htmlFor="isReminder">Set Reminder</Label>
      </div>
      
      {isReminder && (
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="reminderTime">Reminder Time</Label>
            <TimePicker 
              value={reminderTimeString} 
              onChange={onReminderTimeChange} 
              id="reminderTime"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ReminderSelector;
