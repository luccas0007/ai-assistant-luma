
import { supabase } from '@/integrations/supabase/client';

/**
 * Updates the status of a task (used for drag-and-drop)
 */
export const updateTaskStatus = async (taskId: string, newStatus: string) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        column_id: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task status:', error);
      return { 
        success: false, 
        error, 
        errorMessage: `Failed to update task status: ${error.message}` 
      };
    }

    return { success: true, error: null, errorMessage: null };
  } catch (error: any) {
    console.error('Error updating task status:', error);
    return { 
      success: false, 
      error, 
      errorMessage: `Unexpected error updating task status: ${error.message}` 
    };
  }
};
