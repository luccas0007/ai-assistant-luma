
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
import TaskFormFields from './TaskDialog/TaskFormFields';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => Promise<void>;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Effect to initialize form values when dialog opens or task changes
  useEffect(() => {
    if (isOpen && task) {
      console.log("Dialog opened with task:", task);
      
      setTitle(task?.title || '');
      setDescription(task?.description || '');
      setStatus(task?.status || (columns.length > 0 ? columns[0].id : ''));
      setPriority(task?.priority || 'medium');
      setDueDate(task?.due_date ? new Date(task.due_date) : undefined);
      setProjectId(task?.project_id || activeProject?.id || null);
      setAttachmentURL(task?.attachment_url || null);
      
      // Mark as initialized after setting all values
      setIsInitialized(true);
    } else if (!isOpen) {
      // Reset initialized state when dialog closes
      setIsInitialized(false);
    }
  }, [isOpen, task, columns, activeProject]);

  // Reset form when opening for a new task
  useEffect(() => {
    if (isOpen && !task && !isInitialized) {
      setTitle('');
      setDescription('');
      setStatus(columns.length > 0 ? columns[0].id : '');
      setPriority('medium');
      setDueDate(undefined);
      setProjectId(activeProject?.id || null);
      setAttachmentURL(null);
      
      // Mark as initialized
      setIsInitialized(true);
    }
  }, [isOpen, task, columns, activeProject, isInitialized]);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await onUploadAttachment(file);
      if (result.success && result.url) {
        setAttachmentURL(result.url);
      }
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      return { success: false, url: null };
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const updatedTask: Partial<Task> = {
        ...(task || {}),
        title,
        description,
        status,
        priority,
        due_date: dueDate ? dueDate.toISOString() : null,
        attachment_url: attachmentURL,
        project_id: projectId,
        column_id: status,
      };
      
      console.log("Submitting task update:", updatedTask);
      await onSave(updatedTask);
      
      // Don't call onClose here - it will be called by the parent component
      // after the save operation completes successfully
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogDescription>
              {task ? 'Update your task details below.' : 'Fill in the details to create a new task.'}
            </DialogDescription>
          </DialogHeader>

          {isInitialized && (
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
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || isSubmitting || !title.trim()}>
              {(isUploading || isSubmitting) ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
