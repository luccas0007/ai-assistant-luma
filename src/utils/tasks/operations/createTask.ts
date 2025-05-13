
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';
import { initializeTaskSystem } from '../index';

/**
 * Creates a new task in the database
 */
export const createTask = async (
  userId: string,
  newTask: Partial<Task>
) => {
  try {
    console.log('Creating task for user:', userId);
    console.log('Task data:', newTask);

    // First ensure the database is set up
    const setupResult = await initializeTaskSystem();
    if (!setupResult.success) {
      console.error('Failed to initialize task system:', setupResult.error);
      return { data: null, error: setupResult.error, errorMessage: 'Failed to initialize task system' };
    }
    
    // Prepare the task data
    const taskData = {
      user_id: userId,
      title: newTask.title,
      description: newTask.description || null,
      status: newTask.status || 'todo',
      priority: newTask.priority || 'medium',
      due_date: newTask.due_date || null,
      completed: newTask.completed || false,
      attachment_url: newTask.attachment_url || null,
      project_id: newTask.project_id || null,
      column_id: newTask.column_id || newTask.status || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Submitting task data:', taskData);
    
    // Insert the task with proper error handling
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select();

    if (error) {
      console.error('Error in task creation:', error);
      return { 
        data: null, 
        error, 
        errorMessage: `Failed to create task: ${error.message}` 
      };
    }

    console.log('Task created successfully:', data);
    return { data, error: null, errorMessage: null };
  } catch (error: any) {
    console.error('Error creating task:', error);
    return { 
      data: null, 
      error, 
      errorMessage: `Unexpected error creating task: ${error.message}` 
    };
  }
};
