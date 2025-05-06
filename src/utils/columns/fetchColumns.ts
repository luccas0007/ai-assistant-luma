
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnRecord } from '@/types/task';
import { ColumnOperationResponse, SupabaseQueryResult } from './types';
import { createDefaultColumns } from './defaultColumns';

/**
 * Fetches columns for a specific project
 */
export const fetchProjectColumns = async (projectId: string): Promise<ColumnOperationResponse<Column[]>> => {
  try {
    console.log('Fetching columns for project:', projectId);
    
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    
    if (!userId) {
      console.error('No authenticated user found when fetching columns');
      return { 
        success: false, 
        error: new Error('No authenticated user found'), 
        errorMessage: 'Authentication required to fetch columns',
        data: null
      };
    }
    
    // Use explicit typing to avoid excessive type instantiation
    const result: SupabaseQueryResult<ColumnRecord> = await supabase
      .from('columns')
      .select('id, title, position, project_id, user_id, created_at')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('position', { ascending: true });
    
    const { data, error } = result;
    
    if (error) {
      console.error('Error fetching columns:', error);
      return { 
        success: false, 
        error, 
        errorMessage: `Failed to fetch columns: ${error.message}`,
        data: null
      };
    }
    
    // Map to Column type
    const columns: Column[] = (data || []).map((col) => ({
      id: col.id,
      title: col.title,
      project_id: col.project_id,
      user_id: col.user_id,
      position: col.position
    }));
    
    console.log(`Fetched ${columns.length} columns for project`);
    
    // If no columns found, create default columns automatically
    if (columns.length === 0) {
      console.log('No columns found, creating default columns');
      const { data: defaultColumnsData, success } = await createDefaultColumns(projectId);
      
      if (success && defaultColumnsData) {
        // Since we just created these columns, we know they match our expected structure
        return {
          success: true,
          error: null,
          errorMessage: null,
          data: defaultColumnsData.map((col) => ({
            id: col.id,
            title: col.title,
            project_id: col.project_id,
            user_id: col.user_id,
            position: col.position
          }))
        };
      }
    }
    
    return { 
      success: true, 
      error: null, 
      errorMessage: null, 
      data: columns 
    };
  } catch (error: any) {
    console.error('Error in fetchProjectColumns:', error);
    return { 
      success: false, 
      error, 
      errorMessage: `Unexpected error fetching columns: ${error.message}`,
      data: null
    };
  }
};
