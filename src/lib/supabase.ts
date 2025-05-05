
// This file is deprecated and will be removed in a future update.
// Please use '@/integrations/supabase/client' instead.

import { supabase } from '@/integrations/supabase/client';

// Re-export the client for backwards compatibility
export { supabase };

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

// This function is also moved to taskDatabaseUtils.ts
// This version is kept for backward compatibility
export const initializeDatabase = async () => {
  try {
    console.log('Using deprecated initializeDatabase function. Please use initializeTaskSystem from taskDatabaseUtils.ts instead.');
    
    // Forward to the new implementation
    const { supabase } = await import('@/integrations/supabase/client');
    const { initializeTaskSystem } = await import('../utils/taskDatabaseUtils');
    
    return await initializeTaskSystem();
  } catch (error) {
    console.error('Error initializing database schema:', error);
    return { success: false, error };
  }
};
