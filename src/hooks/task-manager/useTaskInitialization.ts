
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { initializeTaskSystem, fetchUserTasks } from '@/utils/tasks';
import { fetchProjectColumns } from '@/utils/columns';
import { Task, Column } from '@/types/task';

/**
 * Hook for initializing tasks and columns
 */
export const useTaskInitialization = (
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  activeProject: any | null
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

  // Fetch tasks from Supabase when activeProject changes
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!activeProject) {
      // Clear tasks when no project is selected
      setTasks([]);
      setColumns([]);
      return;
    }

    const loadProjectData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Step 1: Load columns first - this is crucial for new projects
        console.log('Fetching columns for project:', activeProject.id);
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
          // Don't return early, try to fetch tasks anyway
        } else {
          console.log(`Successfully loaded ${columnsData?.length || 0} columns`);
          setColumns(columnsData || []);
        }
        
        // Step 2: Load tasks
        console.log('Fetching tasks for project:', activeProject.id);
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
        } else {
          console.log(`Successfully loaded ${tasksData.length} tasks`);
          setTasks(tasksData || []);
          // Clear any existing errors if the fetch was successful
          setError(null);
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
        
        // Set empty tasks array to prevent undefined errors
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectData();
  }, [user, navigate, toast, setTasks, setColumns, setIsLoading, setError, activeProject]);
};

export default useTaskInitialization;
