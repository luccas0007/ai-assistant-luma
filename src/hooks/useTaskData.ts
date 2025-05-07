
import { useState, useEffect, useCallback } from 'react';
import { Task, Column } from '@/types/task';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export const useTaskData = (projectId?: string | null) => {
  const [data, setData] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log(`Fetching tasks for user: ${user.id}${projectId ? ` and project: ${projectId}` : ''}`);
      
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      } else {
        query = query.is('project_id', null);
      }

      const { data: taskData, error: taskError } = await query;

      if (taskError) {
        throw taskError;
      }

      console.log(`Successfully fetched ${taskData?.length || 0} tasks`);
      setData(taskData as Task[]);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.message || 'Failed to load tasks');
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, projectId, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchTasks,
  };
};
