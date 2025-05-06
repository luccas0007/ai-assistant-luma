
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/task';

// Define a proper type for the database column object
interface ColumnData {
  id: string;
  title: string;
  position: number;
  project_id: string;
  user_id: string;
  created_at?: string; // Make optional to match potential API response
}

/**
 * Creates default columns for a new project
 */
export const createDefaultColumns = async (projectId: string) => {
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
    
    // Use a specific type for the response to avoid deep type instantiation
    type ColumnInsertResponse = { data: ColumnData[] | null; error: any };
    const { data, error } = await supabase
      .from('columns')
      .insert(columnsToInsert)
      .select() as ColumnInsertResponse;
    
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

/**
 * Fetches columns for a specific project
 */
export const fetchProjectColumns = async (projectId: string) => {
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
    
    // Use a specific type for the response to avoid deep type instantiation
    type ColumnFetchResponse = { data: ColumnData[] | null; error: any };
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('position', { ascending: true }) as ColumnFetchResponse;
    
    if (error) {
      console.error('Error fetching columns:', error);
      return { 
        success: false, 
        error, 
        errorMessage: `Failed to fetch columns: ${error.message}`,
        data: null
      };
    }
    
    // Transform to match Column type in the application with type safety
    const columns: Column[] = (data || []).map((col: ColumnData) => ({
      id: col.id,
      title: col.title
    }));
    
    console.log(`Fetched ${columns.length} columns for project`);
    
    // If no columns found, create default columns automatically
    if (columns.length === 0) {
      console.log('No columns found, creating default columns');
      const { data: defaultColumnsData, success } = await createDefaultColumns(projectId);
      
      if (success && defaultColumnsData) {
        // Since we just created these columns, we know they have the proper ColumnData structure
        return {
          success: true,
          error: null,
          errorMessage: null,
          data: (defaultColumnsData as ColumnData[]).map((col: ColumnData) => ({
            id: col.id,
            title: col.title
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

/**
 * Creates a new column for a project
 */
export const createColumn = async (projectId: string, title: string) => {
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
    const { data: existingColumns, error: fetchError } = await supabase
      .from('columns')
      .select('position')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('position', { ascending: false })
      .limit(1);
    
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
    const position = existingColumns.length > 0 ? existingColumns[0].position + 1 : 0;
    
    // Insert the new column
    const { data, error } = await supabase
      .from('columns')
      .insert({
        project_id: projectId,
        title,
        position,
        user_id: userId
      })
      .select();
    
    if (error) {
      console.error('Error creating column:', error);
      return { 
        success: false, 
        error, 
        errorMessage: `Failed to create column: ${error.message}`,
        data: null
      };
    }
    
    const newColumn: Column = {
      id: data[0].id,
      title: data[0].title
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
export const deleteColumn = async (columnId: string) => {
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
