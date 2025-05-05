
import { supabase } from '@/lib/supabase';
import { Task } from '@/types/task';
import { setupTaskDatabase } from './taskDatabaseUtils';

/**
 * Creates a new task in the database
 */
export const createTask = async (
  userId: string,
  newTask: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>
) => {
  try {
    // First ensure the database is set up
    const setupResult = await setupTaskDatabase();
    
    // Prepare the task data
    const taskData = {
      user_id: userId,
      title: newTask.title,
      description: newTask.description,
      status: newTask.status || 'todo',
      priority: newTask.priority || 'medium',
      due_date: newTask.due_date,
      completed: newTask.completed || false,
      attachment_url: newTask.attachment_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert the task with proper error handling
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select();

    if (error) {
      console.error('Error in task creation:', error);
      
      if (error.message && error.message.includes('does not exist')) {
        // Try to create the table again and retry
        await setupTaskDatabase();
        
        // Retry the insert
        const retryResult = await supabase
          .from('tasks')
          .insert(taskData)
          .select();
          
        if (retryResult.error) {
          console.error('Error in retry task creation:', retryResult.error);
          return { data: null, error: retryResult.error };
        }
        
        return { data: retryResult.data, error: null };
      }
      
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Error creating task:', error);
    return { data: null, error };
  }
};

/**
 * Updates an existing task in the database
 */
export const updateTask = async (updatedTask: Task) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({
        ...updatedTask,
        updated_at: new Date().toISOString()
      })
      .eq('id', updatedTask.id);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating task:', error);
    return { success: false, error };
  }
};

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
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, error };
  }
};

/**
 * Updates the status of a task (used for drag-and-drop)
 */
export const updateTaskStatus = async (taskId: string, newStatus: string) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating task status:', error);
    return { success: false, error };
  }
};
