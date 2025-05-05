
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/types/task';
import { useAuth } from '@/context/AuthContext';
import { 
  createTask as apiCreateTask, 
  updateTask as apiUpdateTask, 
  deleteTask as apiDeleteTask, 
  updateTaskStatus as apiUpdateTaskStatus,
  uploadTaskAttachment as apiUploadTaskAttachment,
} from '@/utils/taskOperations';

/**
 * Hook for task action handlers
 */
export const useTaskActions = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setTaskDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setEditingTask: React.Dispatch<React.SetStateAction<Task | null>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCreateTask = async (newTask: Partial<Task>) => {
    if (!user) {
      const errorMessage = 'Authentication required to create tasks';
      setError(errorMessage);
      
      toast({
        title: 'Authentication required',
        description: 'Please log in to create tasks',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log("Creating task with data:", newTask);
      setError(null);
      setIsProcessing(true);
      
      // Create the task
      const { data, error, errorMessage } = await apiCreateTask(user.id, newTask);
      
      if (error) {
        console.error('Task creation error details:', error);
        setError(errorMessage || 'Error creating task');
        
        toast({
          title: 'Error creating task',
          description: errorMessage || 'Failed to create task',
          variant: 'destructive'
        });
        return;
      }

      if (!data || data.length === 0) {
        const msg = 'Task was created but no data was returned';
        setError(msg);
        
        toast({
          title: 'Task creation issue',
          description: msg + '. Refreshing may be needed.',
          variant: 'destructive'
        });
        return;
      }

      console.log("Task created successfully:", data);
      setTasks(prev => [...data, ...prev]);
      toast({
        title: 'Task created',
        description: 'Your task has been created successfully.'
      });
      setTaskDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating task:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      
      toast({
        title: 'Error creating task',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      setError(null);
      setIsProcessing(true);
      const { error, errorMessage } = await apiUpdateTask(updatedTask);

      if (error) {
        setError(errorMessage || 'Error updating task');
        toast({
          title: 'Error updating task',
          description: errorMessage || 'Failed to update task',
          variant: 'destructive'
        });
        return;
      }

      setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
      toast({
        title: 'Task updated',
        description: 'Your task has been updated successfully.'
      });
      setEditingTask(null);
      setTaskDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating task:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      
      toast({
        title: 'Error updating task',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      setError(null);
      setIsProcessing(true);
      const { error, errorMessage } = await apiDeleteTask(id);

      if (error) {
        setError(errorMessage || 'Error deleting task');
        toast({
          title: 'Error deleting task',
          description: errorMessage || 'Failed to delete task',
          variant: 'destructive'
        });
        return;
      }

      setTasks(tasks.filter(task => task.id !== id));
      toast({
        title: 'Task deleted',
        description: 'Your task has been deleted successfully.'
      });
    } catch (error: any) {
      console.error('Error deleting task:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      
      toast({
        title: 'Error deleting task',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      setError(null);
      setIsProcessing(true);
      const { error, errorMessage } = await apiUpdateTaskStatus(taskId, newStatus);

      if (error) {
        setError(errorMessage || 'Error updating task status');
        return { success: false, error, errorMessage };
      }
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating task status:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error, errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadAttachment = async (file: File) => {
    if (!user) {
      const errorMessage = 'Authentication required to upload files';
      setError(errorMessage);
      
      toast({
        title: 'Authentication required',
        description: 'Please log in to upload files',
        variant: 'destructive'
      });
      return { success: false, url: null, errorMessage };
    }

    try {
      setError(null);
      setIsProcessing(true);
      const { data, error, errorMessage } = await apiUploadTaskAttachment(user.id, file);

      if (error) {
        setError(errorMessage || 'Error uploading file');
        toast({
          title: 'Upload failed',
          description: errorMessage || 'Failed to upload file',
          variant: 'destructive'
        });
        return { success: false, url: null, errorMessage };
      }

      toast({
        title: 'File uploaded',
        description: 'Attachment has been uploaded successfully.'
      });
      
      return { 
        success: true, 
        url: data?.url || null,
        path: data?.path || null,
        errorMessage: null 
      };
    } catch (error: any) {
      console.error('Error uploading file:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      
      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive'
      });
      
      return { success: false, url: null, errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleUpdateTaskStatus,
    handleUploadAttachment
  };
};

export default useTaskActions;
