
import React from 'react';
import { Input } from '@/components/ui/input';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, id, className }) => {
  return (
    <Input 
      type="time"
      id={id}
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default TimePicker;
