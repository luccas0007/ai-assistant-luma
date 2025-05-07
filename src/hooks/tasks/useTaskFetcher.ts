
import { useState, useEffect, useCallback, useRef } from 'react';
import { Task } from '@/types/task';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTaskFetcher = (projectId?: string | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const hasInitializedRef = useRef(false);

  const fetchTasks = useCallback(async () => {
    if (!user) {
      console.log("No user, skipping fetch");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Fetching tasks for user:", user.id, projectId ? `and project: ${projectId}` : '');
      setIsLoading(true);
      setError(null);

      // Build query based on whether a project is specified
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      } else {
        query = query.is('project_id', null);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      console.log("Tasks fetched:", data?.length || 0);
      setTasks(data as Task[] || []);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, projectId, toast]);

  // Load tasks on component mount or when dependencies change
  useEffect(() => {
    // Only fetch tasks if we haven't initialized yet or the user/project changes
    if (!hasInitializedRef.current || !isLoading) {
      console.log("Fetching tasks, user:", user?.id, "initialized:", hasInitializedRef.current);
      fetchTasks();
      hasInitializedRef.current = true;
    }
  }, [fetchTasks]);

  return {
    tasks,
    setTasks,
    isLoading,
    error,
    setError,
    refreshTasks: fetchTasks
  };
};
