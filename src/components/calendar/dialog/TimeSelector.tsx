
import React from 'react';
import { Label } from '@/components/ui/label';
import TimePicker from '@/components/calendar/TimePicker';

interface TimeSelectorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  id,
  label,
  value,
  onChange
}) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <TimePicker 
        value={value} 
        onChange={onChange} 
        id={id} 
      />
    </div>
  );
};

export default TimeSelector;
