
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
    
    // Execute query without complex type inference
    const response = await query;
    const { data, error } = response;
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return {
        data: [],
        error,
        message: `Failed to fetch tasks: ${error.message}`
      };
    }
    
    // Explicitly cast the data to the Task type
    const typedTasks: Task[] = (data || []).map((record) => ({
      id: record.id,
      title: record.title,
      description: record.description || null,
      status: record.status,
      priority: record.priority as any, // Cast to match Task type
      due_date: record.due_date ? new Date(record.due_date).toISOString() : null,
      completed: record.completed || false,
      user_id: record.user_id,
      project_id: record.project_id || null,
      attachment_url: record.attachment_url || null,
      column_id: record.column_id || null, // Include column_id
      created_at: record.created_at,
      updated_at: record.updated_at
    }));
    
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
