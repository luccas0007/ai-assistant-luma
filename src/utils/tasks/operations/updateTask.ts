
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';

/**
 * Updates an existing task in the database
 */
export const updateTask = async (updatedTask: Task) => {
  try {
    console.log("Updating task with data:", updatedTask);
    
    // Prepare data for update, using column_id as the primary field
    const dataToUpdate = {
      title: updatedTask.title,
      description: updatedTask.description,
      column_id: updatedTask.column_id,
      priority: updatedTask.priority,
      due_date: updatedTask.due_date,
      attachment_url: updatedTask.attachment_url,
      project_id: updatedTask.project_id,
      updated_at: new Date().toISOString(),
    };
    
    const { error } = await supabase
      .from('tasks')
      .update(dataToUpdate)
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
