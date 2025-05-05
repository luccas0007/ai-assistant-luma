
import { supabase } from '@/lib/supabase';
import { Task } from '@/types/task';
import { useToast } from '@/hooks/use-toast';

/**
 * Sets up the database tables and storage for tasks
 */
export const setupTaskDatabase = async () => {
  try {
    console.log('Setting up task database...');
    // Try to query tasks table to check if it exists
    const { error: tasksExistError } = await supabase
      .from('tasks')
      .select('count')
      .limit(1);
      
    if (tasksExistError && tasksExistError.message && tasksExistError.message.includes('does not exist')) {
      console.log('Tasks table does not exist. Creating it now.');
      // Create tasks table
      const { error: createError } = await supabase.rpc('create_tasks_table');
      if (createError) {
        console.log('Creating tasks table via SQL query');
        // If RPC function doesn't exist, use raw SQL
        await supabase.rpc('exec', { 
          query: `
            CREATE TABLE IF NOT EXISTS public.tasks (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID NOT NULL REFERENCES auth.users(id),
              title TEXT NOT NULL,
              description TEXT,
              status TEXT NOT NULL DEFAULT 'todo',
              priority TEXT NOT NULL DEFAULT 'medium',
              due_date TIMESTAMPTZ,
              completed BOOLEAN NOT NULL DEFAULT false,
              attachment_url TEXT,
              created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
          `
        });
        
        // Configure RLS
        await supabase.rpc('exec', {
          query: `
            ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
            CREATE POLICY "Users can CRUD their own tasks" ON public.tasks
              USING (auth.uid() = user_id)
              WITH CHECK (auth.uid() = user_id);
          `
        });
      }
    }
    
    // Create storage bucket for attachments if it doesn't exist
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'task-attachments');
      
      if (!bucketExists) {
        await supabase.storage.createBucket('task-attachments', { public: true });
      }
    } catch (error) {
      console.error('Error checking/creating storage bucket:', error);
    }
    
    console.log('Task database setup complete');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
};

/**
 * Fetches tasks for the current user
 */
export const fetchUserTasks = async (userId: string) => {
  try {
    // Direct query to the tasks table
    // First check if table exists by trying to query it
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.message.includes('does not exist')) {
          // Table doesn't exist yet
          await setupTaskDatabase();
          return { data: [], error: null };
        }
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error: any) {
      if (error.message.includes('does not exist')) {
        // Table doesn't exist yet
        await setupTaskDatabase();
        return { data: [], error: null };
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error fetching tasks:', error.message);
    return { data: [], error };
  }
};
