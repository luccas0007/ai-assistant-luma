
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { fetchUserTasks } from '@/utils/taskDatabaseUtils';
import { Task } from '@/types/task';
import { Project } from '@/types/project';

/**
 * Hook for task synchronization and loading all tasks
 */
export const useTaskSync = (
  activeProject: Project | null,
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Function to refresh tasks
  const refreshTasks = useCallback(async () => {
    if (!user || !activeProject) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your tasks",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error, message } = await fetchUserTasks(user.id, activeProject.id);
      
      if (error) {
        setError(message || "Failed to refresh tasks");
        toast({
          title: "Refresh failed",
          description: message || "Could not load your projects. Please try again.",
          variant: "destructive"
        });
      } else {
        // Cast the returned data to Task[] to ensure type compatibility
        setTasks(data as Task[] || []);
        setError(null);
        toast({
          title: "Refreshed",
          description: `Loaded ${data.length} tasks successfully`
        });
      }
    } catch (error: any) {
      setError(`Error refreshing: ${error.message}`);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, activeProject, setTasks, setIsLoading, setError, toast]);
  
  // Function to load all tasks for the task sync view
  const loadAllTasks = useCallback(async () => {
    if (!user) return { tasks: [], error: 'Authentication required' };
    
    try {
      const { data, error, message } = await fetchUserTasks(user.id);
      
      if (error) {
        return { 
          tasks: [], 
          error: message || 'Failed to load all tasks'
        };
      }
      
      return {
        tasks: data as Task[],
        error: null
      };
    } catch (error: any) {
      return {
        tasks: [],
        error: error.message || 'An unexpected error occurred'
      };
    }
  }, [user]);
  
  return {
    refreshTasks,
    loadAllTasks
  };
};

export default useTaskSync;
