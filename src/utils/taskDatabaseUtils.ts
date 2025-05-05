
import { supabase, initializeDatabase } from '@/lib/supabase';
import { Task } from '@/types/task';

/**
 * Sets up the database tables for tasks
 */
export const setupTaskDatabase = async () => {
  try {
    console.log('Setting up task database...');
    
    // Initialize the database schema
    const result = await initializeDatabase();
    
    if (!result.success) {
      console.error('Error initializing database:', result.error);
      return { success: false, error: result.error };
    }
    
    console.log('Task database setup complete');
    return { success: true };
  } catch (error) {
    console.error('Error setting up database:', error);
    return { success: false, error };
  }
};

/**
 * Fetches tasks for the current user
 */
export const fetchUserTasks = async (userId: string) => {
  try {
    console.log('Fetching tasks for user:', userId);
    
    // First try setting up the database to ensure it exists
    await setupTaskDatabase();
    
    // Then attempt to query tasks
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        return { data: [], error };
      }

      console.log('Tasks fetched successfully:', data?.length || 0, 'tasks found');
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Error in tasks query:', error);
      return { data: [], error };
    }
  } catch (error: any) {
    console.error('Error in fetchUserTasks:', error);
    return { data: [], error };
  }
};
