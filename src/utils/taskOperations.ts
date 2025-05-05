
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
    // Try to create the task directly
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: newTask.title,
        description: newTask.description,
        due_date: newTask.due_date,
        status: newTask.status || 'todo',
        priority: newTask.priority,
        completed: newTask.completed || false,
        attachment_url: newTask.attachment_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      // If table doesn't exist, create it first and then retry
      if (error.message.includes('does not exist')) {
        await setupTaskDatabase();
        // Retry inserting the task
        const { data: retryData, error: retryError } = await supabase
          .from('tasks')
          .insert({
            user_id: userId,
            title: newTask.title,
            description: newTask.description,
            due_date: newTask.due_date,
            status: newTask.status || 'todo',
            priority: newTask.priority,
            completed: newTask.completed || false,
            attachment_url: newTask.attachment_url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
          
        if (retryError) {
          throw retryError;
        }
        return { data: retryData, error: null };
      }
      throw error;
    }

    return { data, error: null };
  } catch (error) {
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
