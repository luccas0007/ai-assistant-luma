
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnRecord } from '@/types/task';
import { ColumnOperationResponse, SupabaseQueryResult } from './types';
import { createDefaultColumns } from './defaultColumns';

/**
 * Fetches columns for a specific project
 */
export const fetchProjectColumns = async (projectId: string): Promise<ColumnOperationResponse<Column[]>> => {
  try {
    if (!projectId) {
      console.error('No project ID provided when fetching columns');
      return { 
        success: false, 
        error: new Error('No project ID provided'), 
        errorMessage: 'A project ID is required to fetch columns',
        data: null
      };
    }
    
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
    
    // Check if columns were found
    if (!data || data.length === 0) {
      console.log(`No columns found for project ${projectId}, should create defaults`);
      
      // The caller should handle creating default columns
      return { 
        success: true, 
        error: null, 
        errorMessage: null, 
        data: [] 
      };
    }
    
    // Map to Column type and ensure project_id is explicitly set
    const columns: Column[] = data.map((col) => ({
      id: col.id,
      title: col.title,
      project_id: col.project_id || projectId, // Ensure project_id is set
      user_id: col.user_id,
      position: col.position
    }));
    
    console.log(`Fetched ${columns.length} columns for project ${projectId}`);
    
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
