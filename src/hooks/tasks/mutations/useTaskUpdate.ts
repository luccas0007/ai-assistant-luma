
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/types/task';
import { supabase } from '@/integrations/supabase/client';

export const useTaskUpdate = (
  tasks: Task[], 
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) => {
  const { toast } = useToast();

  const updateTask = async (updatedTask: Task) => {
    try {
      console.log("Starting task update:", updatedTask);
      
      // Fix: Ensure column_id is not set to a status string
      const taskToUpdate = {
        ...updatedTask,
        column_id: null, // Always set to null to avoid UUID type errors
        updated_at: new Date().toISOString()
      };

      console.log("Sending to database:", taskToUpdate);

      const { error } = await supabase
        .from('tasks')
        .update(taskToUpdate)
        .eq('id', updatedTask.id);

      if (error) {
        console.error("Error during update:", error);
        throw error;
      }

      console.log("Task updated successfully in database");

      // Update the local state with the updated task
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      
      toast({
        title: "Success",
        description: "Task updated successfully."
      });
      
      return { success: true };
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}`,
        variant: "destructive"
      });
      
      return { success: false, error };
    }
  };

  return { updateTask };
};
