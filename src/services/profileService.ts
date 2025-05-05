
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';

// Create a typed client just for profiles - this avoids type errors
// while maintaining functionality
const SUPABASE_URL = "https://kksxzbcvosofafpkstow.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3h6YmN2b3NvZmFmcGtzdG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NzU3MzcsImV4cCI6MjA2MjA1MTczN30.vFyv-n7xymV41xu7qyBskGKeMP8I8psg7vV0q1bta-w";

// We use any typing here to bypass the type issues until a proper profiles table is created
const profilesClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export const fetchProfileById = async (userId: string) => {
  try {
    // Use the untyped client to avoid type errors
    const { data, error } = await profilesClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // Only log the error but don't throw it, so the app can continue
      console.error('Error fetching profile:', error.message);
    }

    return data || null;
  } catch (error: any) {
    console.error('Error fetching profile:', error.message);
    return null;
  }
};
