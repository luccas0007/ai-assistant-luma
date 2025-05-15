
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/types/task';
import { updateTask as apiUpdateTask } from '@/utils/tasks/operations/updateTask';

export const useTaskUpdate = (
  tasks: Task[], 
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) => {
  const { toast } = useToast();

  const updateTask = async (updatedTask: Task) => {
    try {
      console.log("Starting task update with data:", updatedTask);
      
      const { success, error } = await apiUpdateTask(updatedTask);

      if (!success) {
        console.error("Error during update:", error);
        throw error;
      }

      console.log("Task updated successfully in database, updating local state");

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
