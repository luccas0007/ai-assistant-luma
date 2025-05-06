
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { fetchUserTasks } from '@/utils/taskDatabaseUtils';
import { Task } from '@/types/task';
import { Project } from '@/types/project';

/**
 * Hook for loading tasks for the active project
 */
export const useTaskInitialization = (
  activeProject: Project | null,
  initialLoadComplete: boolean,
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Load tasks for active project
  useEffect(() => {
    if (!user || !activeProject || !initialLoadComplete) return;
    
    const loadTasks = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error, message } = await fetchUserTasks(user.id, activeProject.id);
        
        if (error) {
          setError(message || 'Failed to load tasks');
          toast({
            title: 'Error loading tasks',
            description: message || 'Failed to load tasks for this project',
            variant: 'destructive'
          });
          return;
        }
        
        setTasks(data as Task[]);
      } catch (error: any) {
        setError(`Error loading tasks: ${error.message}`);
        toast({
          title: 'Error',
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTasks();
  }, [user, activeProject, initialLoadComplete, toast, setTasks, setIsLoading, setError]);
};

export default useTaskInitialization;
