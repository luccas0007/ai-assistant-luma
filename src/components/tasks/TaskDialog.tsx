
import React, { useState, useEffect, useRef } from 'react';
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
import { Task } from '@/types/task';
import TaskFormFields from './TaskDialog/TaskFormFields';
import { useTaskContext } from '@/context/TaskContext';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUploadAttachment: (file: File) => Promise<{ success: boolean; url: string | null }>;
}

const TaskDialog: React.FC<TaskDialogProps> = ({
  isOpen,
  onClose,
  task,
  onUploadAttachment,
}) => {
  const { state, createTask, updateTask } = useTaskContext();
  const { columns, projects, activeProject } = state;

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
  const formInitialized = useRef(false);

  // Effect to initialize form values when dialog opens or task changes
  useEffect(() => {
    if (isOpen) {
      console.log("Dialog opened with task:", task);
      
      if (task) {
        // Editing an existing task
        setTitle(task.title || '');
        setDescription(task.description || '');
        setStatus(task.column_id || (columns.length > 0 ? columns[0].id : ''));
        setPriority(task.priority || 'medium');
        setDueDate(task.due_date ? new Date(task.due_date) : undefined);
        setProjectId(task.project_id || activeProject?.id || null);
        setAttachmentURL(task.attachment_url || null);
      } else {
        // Creating a new task
        setTitle('');
        setDescription('');
        setStatus(columns.length > 0 ? columns[0].id : '');
        setPriority('medium');
        setDueDate(undefined);
        setProjectId(activeProject?.id || null);
        setAttachmentURL(null);
      }
      
      setIsInitialized(true);
      formInitialized.current = true;
    } else {
      // Reset initialization flag when dialog closes
      formInitialized.current = false;
      setIsInitialized(false);
    }
  }, [isOpen, task, columns, activeProject]);

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
    
    if (!status && columns.length === 0) {
      // No columns available
      return;
    }
    
    setIsSubmitting(true);
    try {
      const taskData: Partial<Task> = {
        title,
        description,
        priority,
        due_date: dueDate ? dueDate.toISOString() : null,
        attachment_url: attachmentURL,
        project_id: projectId,
        column_id: status,
      };
      
      console.log("Submitting task data:", taskData);
      
      let success: boolean;
      
      if (task) {
        // Update existing task
        success = await updateTask({
          ...task,
          ...taskData,
        });
      } else {
        // Create new task
        const newTask = await createTask(taskData);
        success = !!newTask;
      }
      
      if (success) {
        onClose();
      }
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
            <Button 
              type="submit" 
              disabled={isUploading || isSubmitting || !title.trim() || !status}
            >
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
