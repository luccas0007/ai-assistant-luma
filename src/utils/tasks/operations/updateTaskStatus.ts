
import { supabase } from '@/integrations/supabase/client';

/**
 * Updates the column of a task (used for drag-and-drop)
 */
export const updateTaskStatus = async (taskId: string, newColumnId: string) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({
        column_id: newColumnId,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task column:', error);
      return { 
        success: false, 
        error, 
        errorMessage: `Failed to update task column: ${error.message}` 
      };
    }

    return { success: true, error: null, errorMessage: null };
  } catch (error: any) {
    console.error('Error updating task column:', error);
    return { 
      success: false, 
      error, 
      errorMessage: `Unexpected error updating task column: ${error.message}` 
    };
  }
};
