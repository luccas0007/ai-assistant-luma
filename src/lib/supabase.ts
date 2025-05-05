
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
