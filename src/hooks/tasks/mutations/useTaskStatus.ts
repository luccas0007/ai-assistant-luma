
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/types/task';
import { supabase } from '@/integrations/supabase/client';

export const useTaskStatus = (
  tasks: Task[], 
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) => {
  const { toast } = useToast();

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

  return { changeTaskStatus };
};
