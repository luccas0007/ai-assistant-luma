
import { supabase } from '@/integrations/supabase/client';
import { initializeTaskSystem } from '../index';

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
    
    // Use the imported Supabase client for storage operations
    const { data, error } = await supabase.storage
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
    const { data: { publicUrl } } = supabase.storage
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
    
    // Use the imported Supabase client for storage operations
    const { error } = await supabase.storage
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
      errorMessage: `Unexpected error deleting task attachment: ${error.message}` 
    };
  }
};
