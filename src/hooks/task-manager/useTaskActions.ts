
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/types/task';
import { useAuth } from '@/context/AuthContext';
import { 
  createTask as apiCreateTask, 
  updateTask as apiUpdateTask, 
  deleteTask as apiDeleteTask, 
  updateTaskStatus as apiUpdateTaskStatus 
} from '@/utils/taskOperations';

/**
 * Hook for task action handlers
 */
export const useTaskActions = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setTaskDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setEditingTask: React.Dispatch<React.SetStateAction<Task | null>>,
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCreateTask = async (newTask: Partial<Task>) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to create tasks',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log("Creating task with data:", newTask);
      
      // Clear any previous errors
      const { data, error } = await apiCreateTask(user.id, newTask);
      
      if (error) {
        console.error('Task creation error details:', error);
        let errorMessage = 'An error occurred while creating the task';
        
        if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }
        
        toast({
          title: 'Error creating task',
          description: errorMessage,
          variant: 'destructive'
        });
        throw error;
      }

      if (!data || data.length === 0) {
        toast({
          title: 'Task creation issue',
          description: 'Task was created but no data was returned. Refreshing may be needed.',
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
      toast({
        title: 'Error creating task',
        description: error.message || 'An error occurred while creating the task',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      const { error } = await apiUpdateTask(updatedTask);

      if (error) {
        throw error;
      }

      setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
      toast({
        title: 'Task updated',
        description: 'Your task has been updated successfully.'
      });
      setEditingTask(null);
      setTaskDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating task:', error.message);
      toast({
        title: 'Error updating task',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const { error } = await apiDeleteTask(id);

      if (error) {
        throw error;
      }

      setTasks(tasks.filter(task => task.id !== id));
      toast({
        title: 'Task deleted',
        description: 'Your task has been deleted successfully.'
      });
    } catch (error: any) {
      console.error('Error deleting task:', error.message);
      toast({
        title: 'Error deleting task',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await apiUpdateTaskStatus(taskId, newStatus);

      if (error) {
        throw error;
      }
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating task status:', error.message);
      return { success: false, error };
    }
  };

  return {
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleUpdateTaskStatus
  };
};
