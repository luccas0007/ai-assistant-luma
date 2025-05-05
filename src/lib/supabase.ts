
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Since we're connected through Lovable's Supabase integration,
// we can use these hardcoded values directly in the code
// These are public values that are safe to include in client-side code
const supabaseUrl = 'https://your-supabase-project.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

// For local development and testing, we can use a fallback
// If you're seeing this error, you need to replace the values above with your actual Supabase URL and anon key
if (!supabaseUrl.includes('your-supabase-project') && !supabaseAnonKey.includes('your-supabase-anon-key')) {
  export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
} else {
  // This is a temporary solution for debugging - replace with your actual Supabase URL and anon key
  console.error('⚠️ Please replace the placeholder Supabase URL and anon key in src/lib/supabase.ts with your actual values');
  
  // Creating a client with dummy values for type checking, but it won't work for actual API calls
  export const supabase = createClient<Database>(
    'https://placeholder-url.supabase.co',
    'placeholder-anon-key'
  );
}
