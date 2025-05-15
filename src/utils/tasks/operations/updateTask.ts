
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';

/**
 * Updates an existing task in the database
 */
export const updateTask = async (updatedTask: Task) => {
  try {
    console.log("Updating task with data:", updatedTask);
    
    // Ensure column_id is synced with status
    const taskData = {
      ...updatedTask,
      column_id: updatedTask.column_id || updatedTask.status,
      status: updatedTask.status || updatedTask.column_id,
      updated_at: new Date().toISOString()
    };
    
    // Only send fields that we want to update to avoid issues
    const dataToUpdate = {
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      column_id: taskData.column_id,
      priority: taskData.priority,
      due_date: taskData.due_date,
      attachment_url: taskData.attachment_url,
      project_id: taskData.project_id,
      updated_at: taskData.updated_at,
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
