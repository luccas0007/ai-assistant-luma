
import { supabase } from '@/lib/supabase';
import { Task } from '@/types/task';
import { useToast } from '@/hooks/use-toast';

/**
 * Sets up the database tables and storage for tasks
 */
export const setupTaskDatabase = async () => {
  try {
    console.log('Setting up task database...');
    
    // Create tasks table directly with SQL
    const { error: createTableError } = await supabase.from('_tables').select('*');
    
    // Regardless of the previous result, try to create the table
    // This approach is more direct than trying to check if it exists first
    try {
      const { error } = await supabase
        .rpc('exec', { 
          query: `
            CREATE TABLE IF NOT EXISTS public.tasks (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
      
      if (error) {
        console.error('Error creating tasks table:', error);
        // Try an alternative method
        await supabase.rpc('exec', {
          query: `
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
            
            CREATE TABLE IF NOT EXISTS public.tasks (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID NOT NULL,
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
            
            ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Users can CRUD their own tasks" ON public.tasks
              USING (auth.uid() = user_id)
              WITH CHECK (auth.uid() = user_id);
          `
        });
      }
    } catch (error) {
      console.error('SQL execution error:', error);
      // If SQL execution fails, try the CREATE TABLE directly
      try {
        // This is the last resort - create the table directly
        // Instead of accessing protected properties, use the fetch API with environment variables
        const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env;
        const supabaseUrl = VITE_SUPABASE_URL || 'https://kksxzbcvosofafpkstow.supabase.co';
        const supabaseKey = VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3h6YmN2b3NvZmFmcGtzdG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NzU3MzcsImV4cCI6MjA2MjA1MTczN30.vFyv-n7xymV41xu7qyBskGKeMP8I8psg7vV0q1bta-w';
        
        const result = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            query: `
              CREATE TABLE IF NOT EXISTS public.tasks (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL,
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
          })
        });
        console.log('Direct SQL creation result:', result);
      } catch (directError) {
        console.error('Direct SQL execution error:', directError);
      }
    }
    
    // Create storage bucket for attachments
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'task-attachments');
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket('task-attachments', { 
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/*', 'application/pdf']
        });
        
        if (error) {
          console.error('Error creating storage bucket:', error);
        }
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
