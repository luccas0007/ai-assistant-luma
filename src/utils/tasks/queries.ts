
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';

/**
 * Fetch tasks for a specific user and optionally for a specific project
 */
export const fetchUserTasks = async (
  userId: string, 
  projectId?: string
): Promise<{ data: Task[]; error: any; message: string }> => {
  if (!userId) {
    return {
      data: [],
      error: new Error('User ID is required'),
      message: 'User ID is required to fetch tasks'
    };
  }

  try {
    console.log('Fetching tasks for user:', userId, projectId ? `and project: ${projectId}` : '');
    
    // Build query
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);
    
    // Add project filter if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return {
        data: [],
        error,
        message: `Failed to fetch tasks: ${error.message}`
      };
    }
    
    // Need to explicitly type the result to avoid type issues
    const typedTasks: Task[] = data as Task[];
    
    console.log(`Successfully fetched ${typedTasks.length} tasks`);
    return {
      data: typedTasks,
      error: null,
      message: 'Successfully fetched tasks'
    };
  } catch (error: any) {
    console.error('Error in fetchUserTasks:', error);
    return {
      data: [],
      error,
      message: `Unexpected error fetching tasks: ${error.message}`
    };
  }
};
