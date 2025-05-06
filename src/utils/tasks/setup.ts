
import { supabase } from '@/integrations/supabase/client';

/**
 * Define a lightweight error type for Supabase errors
 */
type SupabaseError = { message?: string; [key: string]: any };

/**
 * Sets up the task database tables
 */
export const setupTaskDatabase = async () => {
  try {
    console.log('Setting up task database tables');

    // Check if the tasks table already exists
    const { error: checkError } = await supabase
      .from('tasks')
      .select('id')
      .limit(1);

    const typedError = checkError as SupabaseError;

    // If we get a specific error about relation not existing, create the tables
    if (
      typedError &&
      typeof typedError.message === 'string' &&
      typedError.message.includes('relation "tasks" does not exist')
    ) {
      console.log('Tasks table does not exist, creating...');

      // Create tasks table with proper schema
      // Fix: Use explicit cast to avoid never type error
      const { error: createError } = await supabase.rpc('create_tasks_table', {});

      if (createError) {
        console.error('Error creating tasks table:', createError);
        return {
          success: false,
          error: createError,
          errorMessage: `Failed to create tasks table: ${createError.message}`,
        };
      }

      console.log('Tasks table created successfully');
    } else if (checkError) {
      console.error('Error checking for tasks table:', checkError);
      return {
        success: false,
        error: checkError,
        errorMessage: `Error checking for tasks table: ${(checkError as SupabaseError).message}`,
      };
    } else {
      console.log('Tasks table already exists');
    }

    return { success: true, error: null, errorMessage: null };
  } catch (error: any) {
    console.error('Error in setupTaskDatabase:', error);
    return {
      success: false,
      error,
      errorMessage: `Unexpected error setting up task database: ${error.message}`,
    };
  }
};

/**
 * Sets up storage buckets for task attachments
 */
export const setupTaskStorage = async () => {
  try {
    console.log('Setting up task storage buckets');

    // Check if the storage bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing storage buckets:', listError);
      return {
        success: false,
        error: listError,
        errorMessage: `Failed to list storage buckets: ${listError.message}`,
      };
    }

    const bucketExists = buckets.some((bucket: { name: string }) => bucket.name === 'task-attachments');

    if (!bucketExists) {
      console.log('Creating task-attachments bucket');

      const { error: createError } = await supabase.storage.createBucket('task-attachments', {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      });

      if (createError) {
        console.error('Error creating task-attachments bucket:', createError);
        return {
          success: false,
          error: createError,
          errorMessage: `Failed to create storage bucket: ${createError.message}`,
        };
      }

      console.log('task-attachments bucket created successfully');
    } else {
      console.log('task-attachments bucket already exists');
    }

    return { success: true, error: null, errorMessage: null };
  } catch (error: any) {
    console.error('Error in setupTaskStorage:', error);
    return {
      success: false,
      error,
      errorMessage: `Unexpected error setting up task storage: ${error.message}`,
    };
  }
};
