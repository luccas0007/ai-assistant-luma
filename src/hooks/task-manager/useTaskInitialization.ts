
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { initializeTaskSystem, fetchUserTasks } from '@/utils/tasks';
import { fetchProjectColumns } from '@/utils/columns';
import { Task, Column } from '@/types/task';
import { Project } from '@/types/project';

/**
 * Hook for initializing tasks and columns
 */
export const useTaskInitialization = (
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  activeProject: Project | null
) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize the task system (database tables and storage)
  useEffect(() => {
    if (!user) return;
    
    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Initializing task system...');
        const { success, message } = await initializeTaskSystem();
        
        if (!success && message) {
          console.error('Task system initialization failed:', message);
          setError(message);
          toast({
            title: 'System initialization error',
            description: message,
            variant: 'destructive'
          });
        } else {
          console.log('Task system initialized successfully');
        }
      } catch (error: any) {
        console.error('Error initializing task system:', error);
        const errorMsg = error.message || 'Unknown error occurred';
        setError(`Initialization error: ${errorMsg}`);
        toast({
          title: 'System initialization error',
          description: errorMsg,
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, [user, toast, setIsLoading, setError]);

  // Fetch tasks and columns from Supabase when activeProject changes
  useEffect(() => {
    if (!user) {
      return;
    }

    if (!activeProject) {
      // Clear tasks and columns when no project is selected
      setTasks([]);
      setColumns([]);
      return;
    }

    const loadProjectData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Loading project data for project ID: ${activeProject.id}`);
        
        // Step 1: Load columns first - this is crucial for new projects
        const { data: columnsData, success: columnsSuccess, error: columnsError, errorMessage } = 
          await fetchProjectColumns(activeProject.id);
        
        if (columnsError) {
          console.error('Error fetching columns:', errorMessage || columnsError.message);
          setError(errorMessage || 'Failed to fetch columns');
          toast({
            title: 'Error fetching columns',
            description: errorMessage || 'There was a problem loading columns for this project.',
            variant: 'destructive'
          });
          // Still continue to fetch tasks
        } else if (columnsData) {
          console.log(`Successfully loaded ${columnsData.length} columns for project ${activeProject.id}`);
          setColumns(columnsData);
        } else {
          console.warn('No columns data returned for project:', activeProject.id);
          setColumns([]);
        }
        
        // Step 2: Load tasks
        const { data: tasksData, error: tasksError, message: tasksMessage } = 
          await fetchUserTasks(user.id, activeProject.id);
        
        if (tasksError) {
          console.error('Error fetching tasks:', tasksMessage || tasksError.message);
          setError(tasksMessage || 'Failed to fetch tasks');
          toast({
            title: 'Error fetching tasks',
            description: tasksMessage || 'There was a problem loading your tasks. Please try again.',
            variant: 'destructive'
          });
          
          // Set empty tasks array to prevent undefined errors
          setTasks([]);
        } else if (tasksData) {
          console.log(`Successfully loaded ${tasksData.length} tasks for project ${activeProject.id}`);
          setTasks(tasksData);
          // Clear any existing errors if the fetch was successful
          setError(null);
        } else {
          console.warn('No tasks data returned for project:', activeProject.id);
          setTasks([]);
        }
      } catch (error: any) {
        console.error('Error in project data loading process:', error);
        const errorMsg = error.message || 'Unknown error occurred';
        setError(`Loading error: ${errorMsg}`);
        toast({
          title: 'Error loading project data',
          description: errorMsg,
          variant: 'destructive'
        });
        
        // Set empty arrays to prevent undefined errors
        setTasks([]);
        setColumns([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectData();
  }, [user, navigate, toast, setTasks, setColumns, setIsLoading, setError, activeProject]);
};

export default useTaskInitialization;
