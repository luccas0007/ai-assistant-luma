
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import DueDateField from './DueDateField';
import TaskStatusPriorityFields from './TaskStatusPriorityFields';
import AttachmentField from './AttachmentField';
import ProjectField from './ProjectField';
import { Column } from '@/types/task';
import { Project } from '@/types/project';

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
  onFileUpload?: (file: File) => Promise<{ success: boolean; url: string | null; }>;
  columns: Column[];
  projects?: Project[];
  projectId?: string | null;
  setProjectId?: (id: string | null) => void;
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
  columns,
  projects = [],
  projectId = null,
  setProjectId = () => {}
}) => {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
        <Input
          id="title"
          value={title}
          onChange={handleTitleChange}
          placeholder="Task title"
          required
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={handleDescriptionChange}
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
      
      <div className="grid grid-cols-2 gap-4">
        <DueDateField 
          dueDate={dueDate}
          setDueDate={setDueDate}
        />
        
        {projects.length > 0 && (
          <ProjectField
            projects={projects}
            projectId={projectId}
            setProjectId={setProjectId}
          />
        )}
      </div>
      
      <AttachmentField 
        attachmentURL={attachmentURL}
        setAttachmentURL={setAttachmentURL}
        onFileUpload={onFileUpload}
      />
    </div>
  );
};

export default TaskFormFields;
