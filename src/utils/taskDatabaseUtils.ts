
import { supabase } from '@/lib/supabase';
import { Task } from '@/types/task';

/**
 * Sets up the database tables for tasks
 */
export const setupTaskDatabase = async () => {
  try {
    console.log('Setting up task database...');
    
    // Check if the tasks table exists
    const { error: checkError } = await supabase
      .from('tasks')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.message.includes('does not exist')) {
      console.log('Tasks table does not exist, creating it...');
      
      // Create the tasks table using SQL
      const { error: createError } = await supabase.rpc('create_tasks_table');
      
      if (createError) {
        console.log('Error using RPC to create table, trying direct SQL...');
        
        // Try direct SQL as a fallback
        const { error: sqlError } = await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS public.tasks (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID NOT NULL,
              title TEXT NOT NULL,
              description TEXT,
              status TEXT NOT NULL DEFAULT 'todo',
              priority TEXT NOT NULL DEFAULT 'medium',
              due_date TIMESTAMP WITH TIME ZONE,
              completed BOOLEAN NOT NULL DEFAULT false,
              attachment_url TEXT,
              created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
              updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
            );
          `
        });
        
        if (sqlError) {
          console.error('Error creating tasks table with direct SQL:', sqlError);
          
          // Last resort - try inserting a dummy record to force table creation
          const { error: insertError } = await supabase
            .from('tasks')
            .insert({
              user_id: '00000000-0000-0000-0000-000000000000',
              title: '_schema_initialization_',
              status: 'todo',
              priority: 'medium',
              completed: false
            });
            
          if (insertError && !insertError.message.includes('already exists')) {
            console.error('All methods to create table failed:', insertError);
            return { success: false, error: insertError };
          }
          
          // If we got here, the table was created via insertion or already existed
          console.log('Tasks table created via insertion');
          
          // Clean up the initialization record
          await supabase
            .from('tasks')
            .delete()
            .eq('title', '_schema_initialization_');
        }
      }
    } else if (checkError) {
      // Some other error occurred
      console.error('Error checking tasks table:', checkError);
      return { success: false, error: checkError };
    } else {
      console.log('Tasks table already exists');
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
