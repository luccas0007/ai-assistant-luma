
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';

/**
 * Updates an existing task in the database
 */
export const updateTask = async (updatedTask: Task) => {
  try {
    // Ensure column_id is synced with status
    const taskData = {
      ...updatedTask,
      column_id: updatedTask.column_id || updatedTask.status,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('tasks')
      .update(taskData)
      .eq('id', updatedTask.id);

    if (error) {
      console.error('Error updating task:', error);
      return { 
        success: false, 
        error, 
        errorMessage: `Failed to update task: ${error.message}` 
      };
    }

    return { success: true, error: null, errorMessage: null };
  } catch (error: any) {
    console.error('Error updating task:', error);
    return { 
      success: false, 
      error, 
      errorMessage: `Unexpected error updating task: ${error.message}` 
    };
  }
};
