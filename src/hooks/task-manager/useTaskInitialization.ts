
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { initializeTaskSystem, fetchUserTasks } from '@/utils/taskDatabaseUtils';
import { saveColumns } from '@/utils/columnUtils';
import { Task, Column } from '@/types/task';

/**
 * Hook for initializing tasks and columns
 */
export const useTaskInitialization = (
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  columns: Column[]
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

  // Initialize columns if needed
  useEffect(() => {
    if (columns && columns.length === 0) {
      // Initialize with default columns if none exist
      const defaultColumns = [
        { id: 'todo', title: 'To Do' },
        { id: 'in-progress', title: 'In Progress' },
        { id: 'done', title: 'Done' }
      ];
      setColumns(defaultColumns);
      saveColumns(defaultColumns);
    }
  }, [columns, setColumns]);

  // Fetch tasks from Supabase
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadTasks = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching tasks for user:', user.id);
        const { data, error, errorMessage } = await fetchUserTasks(user.id);
        
        if (error) {
          console.error('Error fetching tasks:', errorMessage || error.message);
          setError(errorMessage || 'Failed to fetch tasks');
          toast({
            title: 'Error fetching tasks',
            description: errorMessage || 'There was a problem loading your projects. Please try again.',
            variant: 'destructive'
          });
          
          // Set empty tasks array to prevent undefined errors
          setTasks([]);
        } else {
          console.log(`Successfully loaded ${data.length} tasks`);
          setTasks(data || []);
          // Clear any existing errors if the fetch was successful
          setError(null);
        }
      } catch (error: any) {
        console.error('Error in task loading process:', error);
        const errorMsg = error.message || 'Unknown error occurred';
        setError(`Loading error: ${errorMsg}`);
        toast({
          title: 'Error loading tasks',
          description: errorMsg,
          variant: 'destructive'
        });
        
        // Set empty tasks array to prevent undefined errors
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [user, navigate, toast, setTasks, setIsLoading, setError]);
};

export default useTaskInitialization;
