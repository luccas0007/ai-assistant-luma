
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/types/task';
import { supabase } from '@/integrations/supabase/client';

export const useTaskDelete = (
  tasks: Task[], 
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) => {
  const { toast } = useToast();

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

  return { deleteTask };
};
