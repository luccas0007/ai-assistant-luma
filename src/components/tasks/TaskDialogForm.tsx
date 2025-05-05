
import React, { useState, useEffect } from 'react';
import { Calendar, Paperclip, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { supabase } from '@/lib/supabase';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface TaskDialogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: any) => void;
  task: Task | null;
  columns: Column[];
}

const TaskDialogForm: React.FC<TaskDialogFormProps> = ({
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
  const [fileUploading, setFileUploading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
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
      const taskData = {
        ...task,
        title,
        description,
        status,
        priority,
        due_date: dueDate ? dueDate.toISOString() : null,
        attachment_url: attachmentURL
      };
      
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Skip file uploads for simplicity
    // Just set a placeholder URL to indicate there was an attachment
    setAttachmentURL(`https://placeholder.com/${file.name}`);
    toast({
      title: 'File reference created',
      description: 'Attachment reference added (actual upload disabled)'
    });
  };
  
  const handleRemoveAttachment = () => {
    setAttachmentURL(null);
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      setDueDate(date);
                      setCalendarOpen(false);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="attachment">Attachment (Placeholder - No actual upload)</Label>
              {attachmentURL ? (
                <div className="flex items-center justify-between border rounded-md p-2">
                  <div className="flex items-center">
                    <Paperclip className="h-4 w-4 mr-2" />
                    <span className="text-sm truncate max-w-[250px]">
                      {attachmentURL.split('/').pop()}
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleRemoveAttachment}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center border border-dashed rounded-md p-4">
                  <label className="cursor-pointer text-center">
                    <Paperclip className="h-4 w-4 mx-auto mb-2" />
                    <span className="text-sm text-muted-foreground block">
                      {fileUploading ? 'Processing...' : 'Click to attach reference (not actual file)'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={fileUploading}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || fileUploading}>
              {task ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialogForm;
