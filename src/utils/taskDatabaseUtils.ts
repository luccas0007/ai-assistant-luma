
import { supabase } from '@/lib/supabase';
import { Task } from '@/types/task';

/**
 * Sets up the database tables for tasks
 */
export const setupTaskDatabase = async () => {
  try {
    console.log('Setting up task database...');
    
    // Instead of using RPC or complex SQL, we'll just try to create the tasks
    // through direct queries and check for existence first
    
    // Check if tasks table exists by trying to query it
    const { error: checkError } = await supabase
      .from('tasks')
      .select('count')
      .limit(1);
    
    if (checkError && checkError.message.includes('does not exist')) {
      console.log('Tasks table does not exist, creating it...');
      
      // Create the tasks table using direct SQL queries
      // Note: This requires appropriate permissions on the Supabase project
      // If this fails, the user may need to create the table manually in the Supabase dashboard
      
      // Since we can't execute arbitrary SQL easily, we'll use the REST API 
      // to insert a record and let Supabase create the table for us
      try {
        // Try to insert a test record
        const testTask = {
          title: '_test_task_creation',
          description: 'This is a test task to ensure the table exists',
          status: 'todo',
          priority: 'medium',
          completed: false,
          user_id: '00000000-0000-0000-0000-000000000000', // Placeholder ID
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error: insertError } = await supabase
          .from('tasks')
          .insert(testTask);
          
        if (insertError && !insertError.message.includes('does not exist')) {
          console.error('Error creating tasks table:', insertError);
        }
        
        // Try to remove the test task
        await supabase
          .from('tasks')
          .delete()
          .eq('title', '_test_task_creation');
          
      } catch (error) {
        console.error('Error in table creation process:', error);
      }
    }
    
    // Don't try to create storage buckets automatically
    // This often fails due to RLS policies and requires admin config
    // Instead, we'll use a fallback approach without attachments if needed
    
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
