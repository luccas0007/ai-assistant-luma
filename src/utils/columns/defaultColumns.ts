
import { supabase } from '@/integrations/supabase/client';
import { ColumnData, ColumnOperationResponse, SupabaseQueryResult } from './types';

/**
 * Creates default columns for a new project
 */
export const createDefaultColumns = async (projectId: string): Promise<ColumnOperationResponse<ColumnData[]>> => {
  try {
    console.log('Creating default columns for project:', projectId);
    
    const defaultColumns = [
      { title: 'To Do', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Done', position: 2 }
    ];
    
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    
    if (!userId) {
      console.error('No authenticated user found when creating default columns');
      return { 
        success: false, 
        error: new Error('No authenticated user found'), 
        errorMessage: 'Authentication required to create default columns',
        data: null
      };
    }
    
    const columnsToInsert = defaultColumns.map(column => ({
      project_id: projectId,
      title: column.title,
      position: column.position,
      user_id: userId
    }));
    
    // Use explicit typing for the response to avoid deep type instantiation
    const result: SupabaseQueryResult<ColumnData> = await supabase
      .from('columns')
      .insert(columnsToInsert)
      .select('id, title, position, project_id, user_id, created_at');
    
    const { data, error } = result;
    
    if (error) {
      console.error('Error creating default columns:', error);
      return { 
        success: false, 
        error, 
        errorMessage: `Failed to create default columns: ${error.message}`,
        data: null
      };
    }
    
    console.log('Default columns created:', data);
    return { 
      success: true, 
      error: null, 
      errorMessage: null, 
      data 
    };
  } catch (error: any) {
    console.error('Error in createDefaultColumns:', error);
    return { 
      success: false, 
      error, 
      errorMessage: `Unexpected error creating default columns: ${error.message}`,
      data: null
    };
  }
};
