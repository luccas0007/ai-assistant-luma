
import React, { useState, useEffect } from 'react';
import { Task, Column } from '@/types/task';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TaskFormFields from './TaskFormFields';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: any) => void;
  onUploadAttachment?: (file: File) => Promise<{ success: boolean, url: string | null, path?: string | null }>;
  task: Task | null;
  columns: Column[];
}

const TaskDialog: React.FC<TaskDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onUploadAttachment,
  task,
  columns
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [attachmentURL, setAttachmentURL] = useState<string | null>(null);
  const [attachmentPath, setAttachmentPath] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Reset form when dialog opens or task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status || 'todo');
      setPriority(task.priority || 'medium');
      setAttachmentURL(task.attachment_url);
      setAttachmentPath(null); // We don't store the path in the task object
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
    } else {
      setTitle('');
      setDescription('');
      // Find first column or default to todo
      const firstColumn = columns.length > 0 ? columns[0].id : 'todo';
      setStatus(firstColumn);
      setPriority('medium');
      setAttachmentURL(null);
      setAttachmentPath(null);
      setDueDate(undefined);
    }
    setError(null);
  }, [task, isOpen, columns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!title.trim()) {
        setError('Title is required');
        setIsSubmitting(false);
        return;
      }
      
      console.log("Preparing task data for submission");
      
      const taskData = {
        ...task,
        title,
        description: description || null,
        status,
        priority,
        due_date: dueDate ? dueDate.toISOString() : null,
        attachment_url: attachmentURL,
        // Don't include attachmentPath as it's not part of the Task type
      };
      
      console.log("Task data for save:", taskData);
      
      await onSave(taskData);
      setIsSubmitting(false);
    } catch (error: any) {
      console.error("Error saving task:", error);
      setError(error.message || "An unexpected error occurred");
      setIsSubmitting(false);
      toast({
        title: "Error saving task",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!onUploadAttachment) {
      setError("File upload is not available");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const result = await onUploadAttachment(file);
      
      if (!result.success || !result.url) {
        throw new Error(result.success ? "Upload succeeded but no URL was returned" : "Upload failed");
      }
      
      setAttachmentURL(result.url);
      if (result.path) {
        setAttachmentPath(result.path);
      }
      
      toast({
        title: "File uploaded",
        description: "The file was uploaded successfully"
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      setError(error.message || "Failed to upload file");
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
          <DialogDescription>
            Fill out the form below to {task ? 'update' : 'create'} a task.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
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
          />
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? 'Saving...' : task ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
