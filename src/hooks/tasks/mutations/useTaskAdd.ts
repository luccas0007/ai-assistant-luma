
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/types/task';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useTaskAdd = (
  tasks: Task[], 
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>, 
  projectId?: string | null
) => {
  const { toast } = useToast();
  const { user } = useAuth();

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

  return { addTask };
};
