
import { supabase } from '@/integrations/supabase/client';

/**
 * Setup the database schema for tasks if it doesn't exist
 */
export const setupTaskDatabase = async () => {
  try {
    console.log('Checking if task database setup is needed...');
    
    // Check if the tasks table exists
    const { data: tableExists, error: checkError } = await supabase
      .from('tasks')
      .select('id')
      .limit(1);
    
    // If there's no error, the table exists
    if (!checkError) {
      console.log('Tasks table exists, no setup needed');
      return { success: true, message: 'Database already set up' };
    }
    
    console.log('Error checking tasks table, might need to create it:', checkError.message);
    
    // For safety, we'll check if the auth is working before trying to create tables
    const { data: userSession, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Authentication error:', authError);
      return { 
        success: false, 
        error: authError, 
        message: 'Auth check failed, cannot set up database' 
      };
    }
    
    console.log('Auth working, proceeding with database setup');
    
    // Instead of trying to create the database schema here,
    // which might not work due to permissions, just return an error
    // that instructs the user to run the SQL migration
    
    return {
      success: false,
      error: new Error('Database tables not found'),
      message: 'Database tables not found. Please run the SQL migration to create them.'
    };
  } catch (error: any) {
    console.error('Error in setupTaskDatabase:', error);
    return { 
      success: false, 
      error, 
      message: `Unexpected error in database setup: ${error.message}` 
    };
  }
};
