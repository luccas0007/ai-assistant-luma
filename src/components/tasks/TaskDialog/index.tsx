
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
import TaskFormFields from './TaskFormFields';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: any) => void;
  task: Task | null;
  columns: Column[];
}

const TaskDialog: React.FC<TaskDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
  columns
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [attachmentURL, setAttachmentURL] = useState<string | null>(null);
  const { toast } = useToast();

  // Reset form when dialog opens or task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status || 'todo');
      setPriority(task.priority || 'medium');
      setAttachmentURL(task.attachment_url);
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
    } else {
      setTitle('');
      setDescription('');
      // Find first column or default to todo
      const firstColumn = columns.length > 0 ? columns[0].id : 'todo';
      setStatus(firstColumn);
      setPriority('medium');
      setAttachmentURL(null);
      setDueDate(undefined);
    }
  }, [task, isOpen, columns]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log("Preparing task data for submission");
      
      const taskData = {
        ...task,
        title,
        description,
        status,
        priority,
        due_date: dueDate ? dueDate.toISOString() : null,
        attachment_url: attachmentURL
      };
      
      console.log("Task data for save:", taskData);
      
      onSave(taskData);
    } catch (error: any) {
      console.error("Error saving task:", error);
      toast({
        title: "Error saving task",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
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
            columns={columns}
          />
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {task ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
