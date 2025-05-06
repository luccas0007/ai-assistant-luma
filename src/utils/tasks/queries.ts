
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
    
    // Define explicit types for the database records to prevent deep instantiation
    type TaskRecord = {
      id: string;
      user_id: string;
      project_id?: string;
      title: string;
      description?: string;
      status: string;
      priority: string;
      due_date?: string;
      completed?: boolean;
      attachment_url?: string;
      created_at: string;
      updated_at: string;
    };
    
    // Build query
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);
    
    // Add project filter if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    // Execute query with explicit type annotation
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return {
        data: [],
        error,
        message: `Failed to fetch tasks: ${error.message}`
      };
    }
    
    // Explicitly cast the data to the Task type
    const typedTasks: Task[] = (data || []).map((record: TaskRecord) => ({
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
