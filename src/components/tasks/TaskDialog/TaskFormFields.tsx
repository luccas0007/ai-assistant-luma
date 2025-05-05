
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import DueDateField from './DueDateField';
import TaskStatusPriorityFields from './TaskStatusPriorityFields';
import AttachmentField from './AttachmentField';
import { Column } from '@/types/task';

interface TaskFormFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  dueDate: Date | undefined;
  setDueDate: (date: Date | undefined) => void;
  status: string;
  setStatus: (status: string) => void;
  priority: string;
  setPriority: (priority: string) => void;
  attachmentURL: string | null;
  setAttachmentURL: (url: string | null) => void;
  onFileUpload?: (file: File) => Promise<void>;
  columns: Column[];
}

const TaskFormFields: React.FC<TaskFormFieldsProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  dueDate,
  setDueDate,
  status,
  setStatus,
  priority,
  setPriority,
  attachmentURL,
  setAttachmentURL,
  onFileUpload,
  columns
}) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          required
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description (optional)"
          rows={3}
        />
      </div>
      
      <TaskStatusPriorityFields 
        status={status}
        setStatus={setStatus}
        priority={priority}
        setPriority={setPriority}
        columns={columns}
      />
      
      <DueDateField 
        dueDate={dueDate}
        setDueDate={setDueDate}
      />
      
      <AttachmentField 
        attachmentURL={attachmentURL}
        setAttachmentURL={setAttachmentURL}
        onFileUpload={onFileUpload}
      />
    </div>
  );
};

export default TaskFormFields;
