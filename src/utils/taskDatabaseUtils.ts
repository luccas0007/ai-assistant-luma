
import { supabase } from '@/lib/supabase';
import { Task } from '@/types/task';

/**
 * Sets up the database tables for tasks using raw SQL
 * This is more reliable than using RPC which may not exist
 */
export const setupTaskDatabase = async () => {
  try {
    console.log('Setting up task database...');
    
    // First check if the table exists
    const { error: checkError } = await supabase.from('tasks').select('id').limit(1);
    
    // If the table doesn't exist, try to create it
    if (checkError && checkError.message && checkError.message.includes('does not exist')) {
      console.log('Tasks table does not exist, creating it...');
      
      // Try to create the table with raw SQL
      const { error: createError } = await supabase.rpc('create_tasks_table');
      
      if (createError) {
        // If the RPC doesn't exist, let's try to create a dummy task to generate the table
        console.log('Attempting to create tasks table through direct insertion');
        
        // We'll insert a placeholder record. The platform should create the table with 
        // default structure based on the payload we send
        const { error: insertError } = await supabase
          .from('tasks')
          .insert({
            user_id: '00000000-0000-0000-0000-000000000000',
            title: 'System Initialization',
            description: 'This is a temporary record to ensure the tasks table exists',
            status: 'todo',
            priority: 'medium',
            completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        // If we couldn't create through insertion either, return an error
        if (insertError) {
          console.error('Failed to create tasks table:', insertError);
          return { 
            success: false, 
            error: insertError,
            errorMessage: `Database initialization error: ${insertError.message}`
          };
        }
        
        // Clean up the initialization record
        await supabase
          .from('tasks')
          .delete()
          .eq('user_id', '00000000-0000-0000-0000-000000000000');
          
        console.log('Tasks table created successfully through insertion');
      } else {
        console.log('Tasks table created successfully through RPC');
      }
    } else {
      console.log('Tasks table already exists');
    }
    
    return { success: true, error: null, errorMessage: null };
  } catch (error: any) {
    console.error('Error setting up task database:', error);
    return { 
      success: false, 
      error,
      errorMessage: `Failed to set up task database: ${error.message}`
    };
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
        return { 
          success: false, 
          error: createError,
          errorMessage: `Failed to create storage bucket: ${createError.message}` 
        };
      }
      
      console.log('Task attachments bucket created');
    } else {
      console.log('Task attachments bucket already exists');
    }
    
    return { success: true, error: null, errorMessage: null };
  } catch (error: any) {
    console.error('Error setting up task storage:', error);
    return { 
      success: false, 
      error,
      errorMessage: `Failed to set up task storage: ${error.message}`
    };
  }
};

/**
 * Fetches tasks for the current user with proper error handling
 */
export const fetchUserTasks = async (userId: string) => {
  try {
    console.log('Fetching tasks for user:', userId);
    
    // First check if we need to initialize
    const setupResult = await setupTaskDatabase();
    
    // Even if setup fails, we should still try to fetch existing tasks
    // as the setup might have failed for reasons other than table non-existence
    
    // Query tasks with robust error handling
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      
      // Check if this is a permissions issue
      if (error.message.includes('permission denied')) {
        return { 
          data: [], 
          error,
          errorMessage: 'Database access denied. Please check your permissions or sign in again.' 
        };
      }
      
      return { 
        data: [], 
        error,
        errorMessage: `Failed to fetch tasks: ${error.message}` 
      };
    }
    
    console.log(`Successfully fetched ${data?.length || 0} tasks for user`);
    return { data: data || [], error: null, errorMessage: null };
  } catch (error: any) {
    console.error('Error in fetchUserTasks:', error);
    return { 
      data: [], 
      error,
      errorMessage: `Unexpected error fetching tasks: ${error.message}` 
    };
  }
};

/**
 * Initialize the entire task system (database and storage)
 */
export const initializeTaskSystem = async () => {
  try {
    // Set up database tables
    const dbResult = await setupTaskDatabase();
    
    // Set up storage buckets (even if DB setup failed - they're separate systems)
    const storageResult = await setupTaskStorage();
    
    // If both failed, return combined error
    if (!dbResult.success && !storageResult.success) {
      return { 
        success: false, 
        error: new Error('Multiple initialization failures'),
        errorMessage: 'Failed to initialize both database and storage. Please check your connection and permissions.' 
      };
    }
    
    // If only one failed, return that error
    if (!dbResult.success) {
      return { success: false, error: dbResult.error, errorMessage: dbResult.errorMessage };
    }
    
    if (!storageResult.success) {
      return { success: false, error: storageResult.error, errorMessage: storageResult.errorMessage };
    }
    
    console.log('Task system initialized successfully');
    return { success: true, error: null, errorMessage: null };
  } catch (error: any) {
    console.error('Error initializing task system:', error);
    return { 
      success: false, 
      error,
      errorMessage: `Failed to initialize task system: ${error.message}` 
    };
  }
};
