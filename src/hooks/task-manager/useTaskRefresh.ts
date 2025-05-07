
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { fetchUserTasks } from '@/utils/tasks/queries';
import { fetchProjectColumns } from '@/utils/columns';
import { Project } from '@/types/project';
import { Task } from '@/types/task';

/**
 * Hook for refreshing task and column data
 */
export const useTaskRefresh = (
  activeProject: Project | null,
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setColumns: React.Dispatch<React.SetStateAction<any[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Function to refresh tasks and columns
  const refreshTasks = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your tasks",
        variant: "destructive"
      });
      return;
    }
    
    if (!activeProject) {
      console.warn("Attempting to refresh tasks with no active project");
      toast({
        title: "No project selected",
        description: "Please select a project first",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Refreshing tasks for project: ${activeProject.id}`);
      
      // Refresh columns first
      const { success: colSuccess, data: colData } = await fetchProjectColumns(activeProject.id);
      if (colSuccess && colData) {
        console.log(`Refreshed columns for project: ${activeProject.id}, found: ${colData.length} columns`);
        setColumns(colData);
      }
      
      // Then refresh tasks
      const { data, error, message } = await fetchUserTasks(user.id, activeProject.id);
      
      if (error) {
        setError(message || "Failed to refresh tasks");
        toast({
          title: "Refresh failed",
          description: message || "Could not load your tasks. Please try again.",
          variant: "destructive"
        });
      } else {
        // Normalize tasks to ensure column_id and status are consistent
        const normalizedTasks = data.map(task => ({
          ...task,
          column_id: task.column_id || task.status,
          status: task.column_id || task.status
        }));
        
        setTasks(normalizedTasks);
        setError(null);
        console.log(`Refreshed tasks for project: ${activeProject.id}, found: ${normalizedTasks.length} tasks`);
      }
    } catch (error: any) {
      console.error('Error refreshing data:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(`Error refreshing: ${errorMessage}`);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { refreshTasks };
};

export default useTaskRefresh;
