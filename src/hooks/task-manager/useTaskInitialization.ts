
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { setupTaskDatabase, fetchUserTasks } from '@/utils/taskDatabaseUtils';
import { saveColumns } from '@/utils/columnUtils';
import { Task, Column } from '@/types/task';

/**
 * Hook for initializing tasks and columns
 */
export const useTaskInitialization = (
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  columns: Column[]
) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize database if needed
  useEffect(() => {
    if (!user) return;
    
    const initDb = async () => {
      try {
        await setupTaskDatabase();
      } catch (error: any) {
        console.error('Error setting up database:', error.message);
        toast({
          title: 'Database setup error',
          description: 'Could not initialize database. Please try again later.',
          variant: 'destructive'
        });
      }
    };
    
    initDb();
  }, [user, toast]);

  // Initialize columns if needed
  useEffect(() => {
    if (columns.length === 0) {
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
      try {
        // First make sure the database is set up
        await setupTaskDatabase();
        
        const { data, error } = await fetchUserTasks(user.id);
        
        if (error) {
          throw error;
        }
        
        setTasks(data);
      } catch (error: any) {
        console.error('Error fetching tasks:', error.message);
        toast({
          title: 'Error fetching tasks',
          description: error.message || 'Failed to load your tasks',
          variant: 'destructive'
        });
        // Set empty tasks array to prevent undefined errors
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [user, navigate, toast, setTasks, setIsLoading]);
};
