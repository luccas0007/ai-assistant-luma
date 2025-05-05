
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Supabase configuration with actual values
const supabaseUrl = 'https://kksxzbcvosofafpkstow.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3h6YmN2b3NvZmFmcGtzdG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NzU3MzcsImV4cCI6MjA2MjA1MTczN30.vFyv-n7xymV41xu7qyBskGKeMP8I8psg7vV0q1bta-w';

// Create and export the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
