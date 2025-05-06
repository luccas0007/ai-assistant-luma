
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnRecord } from '@/types/task';
import { ColumnOperationResponse, SupabaseQueryResult } from './types';

/**
 * Creates a new column for a project
 */
export const createColumn = async (projectId: string, title: string): Promise<ColumnOperationResponse<Column>> => {
  try {
    console.log('Creating new column for project:', projectId, title);
    
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    
    if (!userId) {
      console.error('No authenticated user found when creating column');
      return { 
        success: false, 
        error: new Error('No authenticated user found'), 
        errorMessage: 'Authentication required to create column',
        data: null
      };
    }
    
    // Get the highest position to add the new column at the end
    const positionResult: SupabaseQueryResult<{ position: number }> = await supabase
      .from('columns')
      .select('position')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('position', { ascending: false })
      .limit(1);
    
    const { data: existingColumns, error: fetchError } = positionResult;
    
    if (fetchError) {
      console.error('Error fetching column positions:', fetchError);
      return { 
        success: false, 
        error: fetchError, 
        errorMessage: `Failed to fetch column positions: ${fetchError.message}`,
        data: null
      };
    }
    
    // Determine the position for the new column
    const position = existingColumns && existingColumns.length > 0 ? existingColumns[0].position + 1 : 0;
    
    // Insert the new column
    const insertResult: SupabaseQueryResult<ColumnRecord> = await supabase
      .from('columns')
      .insert({
        project_id: projectId,
        title,
        position,
        user_id: userId
      })
      .select('id, title, position, project_id, user_id, created_at');
    
    const { data, error } = insertResult;
    
    if (error) {
      console.error('Error creating column:', error);
      return { 
        success: false, 
        error, 
        errorMessage: `Failed to create column: ${error.message}`,
        data: null
      };
    }
    
    if (!data || data.length === 0) {
      return {
        success: false,
        error: new Error('No data returned after column creation'),
        errorMessage: 'Column created but no data returned',
        data: null
      };
    }
    
    const newColumn: Column = {
      id: data[0].id,
      title: data[0].title,
      project_id: data[0].project_id,
      user_id: data[0].user_id,
      position: data[0].position
    };
    
    console.log('Column created:', newColumn);
    return { 
      success: true, 
      error: null, 
      errorMessage: null, 
      data: newColumn 
    };
  } catch (error: any) {
    console.error('Error in createColumn:', error);
    return { 
      success: false, 
      error, 
      errorMessage: `Unexpected error creating column: ${error.message}`,
      data: null
    };
  }
};

/**
 * Deletes a column and its associated tasks
 */
export const deleteColumn = async (columnId: string): Promise<ColumnOperationResponse<null>> => {
  try {
    console.log('Deleting column:', columnId);
    
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    
    if (!userId) {
      console.error('No authenticated user found when deleting column');
      return { 
        success: false, 
        error: new Error('No authenticated user found'), 
        errorMessage: 'Authentication required to delete column',
        data: null
      };
    }
    
    // First, delete any tasks associated with this column
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .eq('column_id', columnId)
      .eq('user_id', userId);
    
    if (tasksError) {
      console.error('Error deleting column tasks:', tasksError);
      // Continue with column deletion despite error
    }
    
    // Now delete the column
    const { error } = await supabase
      .from('columns')
      .delete()
      .eq('id', columnId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting column:', error);
      return { 
        success: false, 
        error, 
        errorMessage: `Failed to delete column: ${error.message}`,
        data: null
      };
    }
    
    console.log('Column deleted successfully');
    return { 
      success: true, 
      error: null, 
      errorMessage: null, 
      data: null 
    };
  } catch (error: any) {
    console.error('Error in deleteColumn:', error);
    return { 
      success: false, 
      error, 
      errorMessage: `Unexpected error deleting column: ${error.message}`,
      data: null
    };
  }
};
