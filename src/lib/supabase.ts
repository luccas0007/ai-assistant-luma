
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Supabase configuration
const supabaseUrl = 'https://kksxzbcvosofafpkstow.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3h6YmN2b3NvZmFmcGtzdG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NzU3MzcsImV4cCI6MjA2MjA1MTczN30.vFyv-n7xymV41xu7qyBskGKeMP8I8psg7vV0q1bta-w';

// Get Supabase configuration (with environment variable fallback)
export const getSupabaseConfig = () => {
  return {
    url: import.meta.env.VITE_SUPABASE_URL || supabaseUrl,
    key: import.meta.env.VITE_SUPABASE_ANON_KEY || supabaseAnonKey
  };
};

// Create and export the Supabase client
export const supabase = createClient<Database>(
  getSupabaseConfig().url,
  getSupabaseConfig().key,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);

// Helper function to check if Supabase is connected
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('Supabase connection check - Session:', data);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};

// Create database schema on app initialization
export const initializeDatabase = async () => {
  try {
    console.log('Initializing database schema...');
    
    // Create the tasks table if it doesn't exist
    const { error } = await supabase.rpc('create_tasks_table');
    
    if (error) {
      // If RPC function doesn't exist, use a fallback approach with SQL
      console.log('RPC not available, using fallback method to create schema');
      
      // Create the tasks table using SQL
      const { error: sqlError } = await supabase.from('tasks').insert({
        id: '00000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000000',
        title: '_schema_initialization_',
        description: 'This is a temporary record to ensure the table exists',
        status: 'todo',
        priority: 'medium',
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).select();
      
      if (sqlError && !sqlError.message.includes('already exists')) {
        console.error('Error creating schema:', sqlError);
        return { success: false, error: sqlError };
      }
      
      // Clean up the initialization record
      await supabase
        .from('tasks')
        .delete()
        .eq('title', '_schema_initialization_');
    }
    
    console.log('Database schema initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('Error initializing database schema:', error);
    return { success: false, error };
  }
};
