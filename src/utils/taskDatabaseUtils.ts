
import { supabase } from '@/lib/supabase';
import { Task } from '@/types/task';

/**
 * Sets up the database tables for tasks
 */
export const setupTaskDatabase = async () => {
  try {
    console.log('Setting up task database...');
    
    // Check if tasks table exists by trying to query it
    const { error: queryError } = await supabase
      .from('tasks')
      .select('id')
      .limit(1);
    
    if (queryError && queryError.message.includes('does not exist')) {
      console.log('Tasks table does not exist, creating it...');
      
      // Execute SQL to create the tasks table directly
      // First enable the uuid-ossp extension if needed
      await supabase.rpc('extensions');
      
      // Create the tasks table with proper schema
      const { error: createError } = await supabase.schema('public').rpc('create_table', {
        table_name: 'tasks',
        definition: `
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
        `
      });
      
      if (createError) {
        console.log('Error using RPC to create table, trying direct SQL insertion...');
        
        // Fallback: try creating a task directly which will create the table
        // with default structure if the user has necessary permissions
        const { error: insertError } = await supabase
          .from('tasks')
          .insert({
            user_id: '00000000-0000-0000-0000-000000000000',
            title: 'Table Initialization',
            description: 'This record was created to initialize the tasks table',
            status: 'todo',
            priority: 'medium',
            completed: false
          });
        
        if (insertError && !insertError.message.includes('already exists')) {
          console.error('Failed to create tasks table:', insertError);
          return { success: false, error: insertError };
        } else {
          // Delete the initialization record
          await supabase
            .from('tasks')
            .delete()
            .eq('user_id', '00000000-0000-0000-0000-000000000000');
          
          console.log('Tasks table created through direct insertion');
        }
      } else {
        console.log('Tasks table created through RPC');
      }
    } else if (queryError) {
      // Some other error occurred during the check
      console.error('Error checking tasks table:', queryError);
      return { success: false, error: queryError };
    } else {
      console.log('Tasks table already exists');
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error setting up task database:', error);
    return { success: false, error };
  }
};

/**
 * Creates a storage bucket for task attachments if it doesn't exist
 */
export const setupTaskStorage = async () => {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    const taskBucketName = 'task-attachments';
    const bucketExists = buckets?.some(bucket => bucket.name === taskBucketName);
    
    if (!bucketExists) {
      console.log('Creating task attachments bucket...');
      const { error: createError } = await supabase.storage.createBucket(taskBucketName, {
        public: true
      });
      
      if (createError) {
        console.error('Error creating storage bucket:', createError);
        return { success: false, error: createError };
      }
      
      console.log('Task attachments bucket created');
    } else {
      console.log('Task attachments bucket already exists');
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error setting up task storage:', error);
    return { success: false, error };
  }
};

/**
 * Fetches tasks for the current user with proper error handling
 */
export const fetchUserTasks = async (userId: string) => {
  try {
    console.log('Fetching tasks for user:', userId);
    
    // Ensure the database is set up
    const setupResult = await setupTaskDatabase();
    if (!setupResult.success) {
      return { data: [], error: setupResult.error };
    }
    
    // Query tasks with robust error handling
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return { data: [], error };
    }
    
    console.log(`Successfully fetched ${data.length} tasks for user`);
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in fetchUserTasks:', error);
    return { data: [], error };
  }
};

/**
 * Initialize the entire task system (database and storage)
 */
export const initializeTaskSystem = async () => {
  try {
    // Set up database tables
    const dbResult = await setupTaskDatabase();
    if (!dbResult.success) {
      console.error('Failed to set up task database:', dbResult.error);
      return { success: false, error: dbResult.error };
    }
    
    // Set up storage buckets
    const storageResult = await setupTaskStorage();
    if (!storageResult.success) {
      console.error('Failed to set up task storage:', storageResult.error);
      return { success: false, error: storageResult.error };
    }
    
    console.log('Task system initialized successfully');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error initializing task system:', error);
    return { success: false, error };
  }
};
