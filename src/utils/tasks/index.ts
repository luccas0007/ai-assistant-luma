
import { setupTaskDatabase } from './setup';
import { fetchUserTasks } from './queries';

/**
 * Initialize the entire task system (database and storage)
 */
export const initializeTaskSystem = async () => {
  try {
    // Set up database tables
    const dbResult = await setupTaskDatabase();
    
    // If database setup failed, return that error
    if (!dbResult.success) {
      return { 
        success: false, 
        error: dbResult.error, 
        message: dbResult.message 
      };
    }
    
    console.log('Task system initialized successfully');
    return { success: true, error: null, message: 'Task system initialized successfully' };
  } catch (error: any) {
    console.error('Error initializing task system:', error);
    return { 
      success: false, 
      error,
      message: `Failed to initialize task system: ${error.message}` 
    };
  }
};

// Re-export all task utility functions for convenient usage
export { setupTaskDatabase, fetchUserTasks };
