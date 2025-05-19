
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
      
      // Show a notification for tasks with due dates
      if (updatedTask.due_date) {
        const dueDate = new Date(updatedTask.due_date);
        const now = new Date();
        // If due date is less than 24 hours away, show different message
        const hoursUntilDue = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        
        if (hoursUntilDue <= 24 && hoursUntilDue > 0) {
          toast({
            title: "Task Due Soon",
            description: `"${updatedTask.title}" is due in ${hoursUntilDue} hours`,
            variant: "default"
          });
        } else {
          toast({
            title: "Task Updated",
            description: "Task updated successfully."
          });
        }
      } else {
        toast({
          title: "Task Updated",
          description: "Task updated successfully."
        });
      }
      
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
