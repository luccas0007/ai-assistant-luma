
import { setupTaskDatabase, setupTaskStorage } from './setup';
import { fetchUserTasks } from './queries';

/**
 * Initialize the entire task system (database and storage)
 */
export const initializeTaskSystem = async () => {
  try {
    // Set up database tables
    const dbResult = await setupTaskDatabase();
    
    // Set up storage buckets (even if DB setup failed - they're separate systems)
    const storageResult = await setupTaskStorage();
    
    // If both failed, return combined error
    if (!dbResult.success && !storageResult.success) {
      return { 
        success: false, 
        error: new Error('Multiple initialization failures'),
        errorMessage: 'Failed to initialize both database and storage. Please check your connection and permissions.' 
      };
    }
    
    // If only one failed, return that error
    if (!dbResult.success) {
      return { success: false, error: dbResult.error, errorMessage: dbResult.errorMessage };
    }
    
    if (!storageResult.success) {
      return { success: false, error: storageResult.error, errorMessage: storageResult.errorMessage };
    }
    
    console.log('Task system initialized successfully');
    return { success: true, error: null, errorMessage: null };
  } catch (error: any) {
    console.error('Error initializing task system:', error);
    return { 
      success: false, 
      error,
      errorMessage: `Failed to initialize task system: ${error.message}` 
    };
  }
};

// Re-export all task utility functions for convenient usage
export { setupTaskDatabase, setupTaskStorage, fetchUserTasks };
