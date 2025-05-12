
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Column } from '@/types/task';

interface TaskStatusPriorityFieldsProps {
  status: string;
  setStatus: (status: string) => void;
  priority: string;
  setPriority: (priority: string) => void;
  columns: Column[];
}

const TaskStatusPriorityFields: React.FC<TaskStatusPriorityFieldsProps> = ({
  status,
  setStatus,
  priority,
  setPriority,
  columns
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            {columns.map((column) => (
              <SelectItem key={column.id} value={column.id}>
                {column.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="priority">Priority</Label>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TaskStatusPriorityFields;
