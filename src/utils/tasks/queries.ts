
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';
import { setupTaskDatabase } from './setup';

/**
 * Fetches tasks for the current user with proper error handling
 */
export const fetchUserTasks = async (userId: string, projectId?: string, columnId?: string) => {
  try {
    console.log('Fetching tasks for user:', userId, 
      projectId ? `and project: ${projectId}` : '',
      columnId ? `and column: ${columnId}` : '');
    
    // First check if we need to initialize
    const setupResult = await setupTaskDatabase();
    
    // Even if setup fails, we should still try to fetch existing tasks
    // as the setup might have failed for reasons other than table non-existence
    
    // Start building the query
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);
    
    // Add project filter if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    // Add column filter if provided
    if (columnId) {
      query = query.eq('column_id', columnId);
    }
    
    // Execute the query
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      
      // Check if this is a permissions issue
      if (error.message && error.message.includes('permission denied')) {
        return { 
          data: [] as Task[], 
          error,
          message: 'Database access denied. Please check your permissions or sign in again.' 
        };
      }
      
      return { 
        data: [] as Task[], 
        error,
        message: `Failed to fetch tasks: ${error.message}` 
      };
    }
    
    console.log(`Successfully fetched ${data?.length || 0} tasks for user`);
    return { 
      data: data as Task[] || [], 
      error: null, 
      message: null 
    };
  } catch (error: any) {
    console.error('Error in fetchUserTasks:', error);
    return { 
      data: [] as Task[], 
      error,
      message: `Unexpected error fetching tasks: ${error.message}` 
    };
  }
};
