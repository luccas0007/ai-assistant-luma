
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';
import { initializeTaskSystem } from './taskDatabaseUtils';
import { createClient } from '@supabase/supabase-js';

// Create an untyped client for storage operations to avoid type issues
const SUPABASE_URL = "https://kksxzbcvosofafpkstow.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3h6YmN2b3NvZmFmcGtzdG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NzU3MzcsImV4cCI6MjA2MjA1MTczN30.vFyv-n7xymV41xu7qyBskGKeMP8I8psg7vV0q1bta-w";
// Use 'any' type to avoid TypeScript issues with storage operations
const storageClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) as any;

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
      column_id: newTask.column_id || null, // Include column_id
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

/**
 * Uploads a file to the task attachments bucket
 */
export const uploadTaskAttachment = async (userId: string, file: File) => {
  try {
    // Ensure the storage is set up
    const setupResult = await initializeTaskSystem();
    if (!setupResult.success) {
      return { 
        data: null, 
        error: setupResult.error, 
        errorMessage: 'Failed to initialize task system' 
      };
    }
    
    const bucketName = 'task-attachments';
    const filePath = `${userId}/${Date.now()}_${file.name}`;
    
    // Use the untyped client for storage operations
    const { data, error } = await storageClient.storage
      .from(bucketName)
      .upload(filePath, file);
    
    if (error) {
      console.error('Error uploading attachment:', error);
      return { 
        data: null, 
        error, 
        errorMessage: `Failed to upload attachment: ${error.message}` 
      };
    }
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = storageClient.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return { 
      data: { path: filePath, url: publicUrl }, 
      error: null, 
      errorMessage: null 
    };
  } catch (error: any) {
    console.error('Error uploading task attachment:', error);
    return { 
      data: null, 
      error, 
      errorMessage: `Unexpected error uploading attachment: ${error.message}` 
    };
  }
};

/**
 * Deletes a task attachment from storage
 */
export const deleteTaskAttachment = async (filePath: string) => {
  try {
    const bucketName = 'task-attachments';
    
    // Use the untyped client for storage operations
    const { error } = await storageClient.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting attachment:', error);
      return { 
        success: false, 
        error, 
        errorMessage: `Failed to delete attachment: ${error.message}` 
      };
    }
    
    return { success: true, error: null, errorMessage: null };
  } catch (error: any) {
    console.error('Error deleting task attachment:', error);
    return { 
      success: false, 
      error, 
      errorMessage: `Unexpected error deleting attachment: ${error.message}` 
    };
  }
};
