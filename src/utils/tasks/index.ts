
import { setupTaskDatabase } from './setup';
import { fetchUserTasks } from './queries';

/**
 * Initialize the task system (database tables and storage)
 */
export const initializeTaskSystem = async () => {
  try {
    // Set up the database tables
    const dbResult = await setupTaskDatabase();
    
    if (!dbResult.success) {
      console.error('Error setting up task database:', dbResult.message);
      return { success: false, message: dbResult.message };
    }
    
    console.log('Task system initialized successfully');
    return { success: true, message: 'Task system initialized successfully' };
  } catch (error: any) {
    console.error('Unexpected error in initializeTaskSystem:', error);
    return { 
      success: false, 
      error, 
      message: `Failed to initialize task system: ${error.message}` 
    };
  }
};

export { fetchUserTasks, setupTaskDatabase };
