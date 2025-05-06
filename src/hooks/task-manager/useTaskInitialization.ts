
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { initializeTaskSystem, fetchUserTasks } from '@/utils/taskDatabaseUtils';
import { fetchProjectColumns } from '@/utils/columnOperations';
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
        const { success, errorMessage } = await initializeTaskSystem();
        
        if (!success && errorMessage) {
          console.error('Task system initialization failed:', errorMessage);
          setError(errorMessage);
          toast({
            title: 'System initialization error',
            description: errorMessage,
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
        // Step 1: Load columns first
        console.log('Fetching columns for project:', activeProject.id);
        const { data: columnsData, error: columnsError, errorMessage: columnsErrorMessage } = await fetchProjectColumns(activeProject.id);
        
        if (columnsError) {
          console.error('Error fetching columns:', columnsErrorMessage || columnsError.message);
          // Continue loading tasks even if columns fail
        } else {
          console.log(`Successfully loaded ${columnsData?.length || 0} columns`);
          setColumns(columnsData || []);
        }
        
        // Step 2: Load tasks
        console.log('Fetching tasks for project:', activeProject.id);
        const { data: tasksData, error: tasksError, errorMessage: tasksErrorMessage } = await fetchUserTasks(user.id, activeProject.id);
        
        if (tasksError) {
          console.error('Error fetching tasks:', tasksErrorMessage || tasksError.message);
          setError(tasksErrorMessage || 'Failed to fetch tasks');
          toast({
            title: 'Error fetching tasks',
            description: tasksErrorMessage || 'There was a problem loading your tasks. Please try again.',
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
