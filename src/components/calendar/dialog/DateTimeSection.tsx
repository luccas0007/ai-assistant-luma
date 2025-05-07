
import React from 'react';
import DateSelector from './DateSelector';
import TimeSelector from './TimeSelector';

interface DateTimeSectionProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  startTime: string;
  endTime: string;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

const DateTimeSection: React.FC<DateTimeSectionProps> = ({
  startDate,
  endDate,
  startTime,
  endTime,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <DateSelector
          id="startDate"
          label="Start Date"
          date={startDate}
          onSelect={onStartDateChange}
        />
        
        <TimeSelector
          id="startTime"
          label="Start Time"
          value={startTime}
          onChange={onStartTimeChange}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <DateSelector
          id="endDate"
          label="End Date"
          date={endDate}
          onSelect={onEndDateChange}
          disabled={(date) => date < (startDate || new Date())}
        />
        
        <TimeSelector
          id="endTime"
          label="End Time"
          value={endTime}
          onChange={onEndTimeChange}
        />
      </div>
    </>
  );
};

export default DateTimeSection;
