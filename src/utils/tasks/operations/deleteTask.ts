
import { supabase } from '@/integrations/supabase/client';

/**
 * Deletes a task from the database
 */
export const deleteTask = async (id: string) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      return { 
        success: false, 
        error, 
        errorMessage: `Failed to delete task: ${error.message}` 
      };
    }

    return { success: true, error: null, errorMessage: null };
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return { 
      success: false, 
      error, 
      errorMessage: `Unexpected error deleting task: ${error.message}` 
    };
  }
};
