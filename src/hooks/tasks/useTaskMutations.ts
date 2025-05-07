
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/types/task';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useTaskMutations = (
  tasks: Task[], 
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>, 
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  projectId?: string | null
) => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Add a new task
  const addTask = async (newTask: Partial<Task>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add tasks.",
        variant: "destructive"
      });
      return;
    }
    
    // Ensure the title is provided since it's required by database
    if (!newTask.title) {
      toast({
        title: "Error",
        description: "Task title is required.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a properly typed task object for insertion
      const taskData = {
        title: newTask.title,
        user_id: user.id,
        description: newTask.description || null,
        status: newTask.status || 'todo',
        priority: newTask.priority || 'medium',
        due_date: newTask.due_date || null,
        completed: newTask.completed || false,
        attachment_url: newTask.attachment_url || null,
        attachment_path: newTask.attachment_path || null,
        project_id: projectId || null,
        column_id: null, // IMPORTANT: Set to null to avoid UUID type errors
      };

      console.log("Creating task with data:", taskData);

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select();

      if (error) {
        console.error('Error adding task:', error);
        throw error;
      }

      if (data && data.length > 0) {
        setTasks((prev) => [data[0] as Task, ...prev]);
        toast({
          title: "Success",
          description: "Task added successfully."
        });
      }
    } catch (error: any) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: `Failed to add task: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Update a task
  const updateTask = async (updatedTask: Task) => {
    try {
      console.log("Updating task:", updatedTask);
      
      // Fix: Ensure column_id is not set to a status string
      const taskToUpdate = {
        ...updatedTask,
        column_id: null, // Always set to null to avoid UUID type errors
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('tasks')
        .update(taskToUpdate)
        .eq('id', updatedTask.id);

      if (error) {
        console.error("Error during update:", error);
        throw error;
      }

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      
      toast({
        title: "Success",
        description: "Task updated successfully."
      });
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
      
      toast({
        title: "Success",
        description: "Task deleted successfully."
      });
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Change task status
  const changeTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const taskToUpdate = tasks.find(task => task.id === taskId);
      
      if (!taskToUpdate) {
        throw new Error("Task not found");
      }
      
      // Fix: Do not set column_id to the status string
      const updatedTask = {
        ...taskToUpdate,
        status: newStatus,
        column_id: null, // Set to null to avoid UUID type errors
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('tasks')
        .update(updatedTask)
        .eq('id', taskId);
        
      if (error) {
        throw error;
      }
      
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus, column_id: null } : task))
      );
    } catch (error: any) {
      console.error("Error changing task status:", error);
      toast({
        title: "Error",
        description: `Failed to update task status: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  return {
    addTask,
    updateTask,
    deleteTask,
    changeTaskStatus
  };
};
