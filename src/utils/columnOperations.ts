
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/task';

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
    
    const columnsToInsert = defaultColumns.map(column => ({
      project_id: projectId,
      title: column.title,
      position: column.position
    }));
    
    const { data, error } = await supabase
      .from('columns')
      .insert(columnsToInsert)
      .select();
    
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
    
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .eq('project_id', projectId)
      .order('position', { ascending: true });
    
    if (error) {
      console.error('Error fetching columns:', error);
      return { 
        success: false, 
        error, 
        errorMessage: `Failed to fetch columns: ${error.message}`,
        data: null
      };
    }
    
    // Transform to match Column type in the application
    const columns: Column[] = data.map(col => ({
      id: col.id,
      title: col.title
    }));
    
    console.log(`Fetched ${columns.length} columns for project`);
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
    
    // Get the highest position to add the new column at the end
    const { data: existingColumns, error: fetchError } = await supabase
      .from('columns')
      .select('position')
      .eq('project_id', projectId)
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
        position
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
