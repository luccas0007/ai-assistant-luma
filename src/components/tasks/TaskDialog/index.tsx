
import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Task, Column } from '@/types/task';
import { Project } from '@/types/project';
import TaskFormFields from './TaskFormFields';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  onUploadAttachment: (file: File) => Promise<{ success: boolean; url: string | null }>;
  task: Task | null;
  columns: Column[];
  projects: Project[];
  activeProject: Project | null;
}

const TaskDialog: React.FC<TaskDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onUploadAttachment,
  task,
  columns,
  projects,
  activeProject
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [attachmentURL, setAttachmentURL] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [projectId, setProjectId] = useState<string | null>(null);

  // Reset form when dialog opens/closes or task changes
  useEffect(() => {
    if (isOpen) {
      setTitle(task?.title || '');
      setDescription(task?.description || '');
      setStatus(task?.status || (columns.length > 0 ? columns[0].id : ''));
      setPriority(task?.priority || 'medium');
      setDueDate(task?.due_date ? new Date(task.due_date) : undefined);
      setProjectId(task?.project_id || activeProject?.id || null);
      setAttachmentURL(task?.attachment_url || null);
    }
  }, [isOpen, task, columns, activeProject]);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await onUploadAttachment(file);
      if (result.success && result.url) {
        setAttachmentURL(result.url);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = () => {
    onSave({
      ...task,
      title,
      description,
      status,
      priority,
      due_date: dueDate ? dueDate.toISOString() : null,
      attachment_url: attachmentURL,
      project_id: projectId,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {task ? 'Update your task details below.' : 'Fill in the details to create a new task.'}
          </DialogDescription>
        </DialogHeader>

        <TaskFormFields
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          dueDate={dueDate}
          setDueDate={setDueDate}
          status={status}
          setStatus={setStatus}
          priority={priority}
          setPriority={setPriority}
          attachmentURL={attachmentURL}
          setAttachmentURL={setAttachmentURL}
          onFileUpload={handleFileUpload}
          columns={columns}
          projects={projects}
          projectId={projectId}
          setProjectId={setProjectId}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isUploading || !title.trim()}>
            {isUploading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
