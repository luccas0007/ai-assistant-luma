
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/project';

/**
 * Fetches all projects for the current user
 */
export const fetchUserProjects = async (userId: string) => {
  try {
    console.log('Fetching projects for user:', userId);
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching projects:', error);
      return { 
        data: [], 
        error,
        errorMessage: `Failed to fetch projects: ${error.message}` 
      };
    }
    
    console.log(`Successfully fetched ${data?.length || 0} projects for user`);
    return { data: data || [], error: null, errorMessage: null };
  } catch (error: any) {
    console.error('Error in fetchUserProjects:', error);
    return { 
      data: [], 
      error,
      errorMessage: `Unexpected error fetching projects: ${error.message}` 
    };
  }
};

/**
 * Creates a new project in the database
 */
export const createProject = async (userId: string, name: string, description?: string) => {
  try {
    console.log('Creating project for user:', userId);
    
    const projectData = {
      owner_id: userId,
      name,
      description: description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select();
    
    if (error) {
      console.error('Error creating project:', error);
      return { 
        data: null, 
        error, 
        errorMessage: `Failed to create project: ${error.message}` 
      };
    }
    
    console.log('Project created successfully:', data);
    return { data, error: null, errorMessage: null };
  } catch (error: any) {
    console.error('Error creating project:', error);
    return { 
      data: null, 
      error, 
      errorMessage: `Unexpected error creating project: ${error.message}` 
    };
  }
};

/**
 * Updates an existing project in the database
 */
export const updateProject = async (project: Project) => {
  try {
    const { error } = await supabase
      .from('projects')
      .update({
        ...project,
        updated_at: new Date().toISOString()
      })
      .eq('id', project.id);
    
    if (error) {
      console.error('Error updating project:', error);
      return { 
        success: false, 
        error, 
        errorMessage: `Failed to update project: ${error.message}` 
      };
    }
    
    return { success: true, error: null, errorMessage: null };
  } catch (error: any) {
    console.error('Error updating project:', error);
    return { 
      success: false, 
      error, 
      errorMessage: `Unexpected error updating project: ${error.message}` 
    };
  }
};

/**
 * Deletes a project from the database
 */
export const deleteProject = async (id: string) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting project:', error);
      return { 
        success: false, 
        error, 
        errorMessage: `Failed to delete project: ${error.message}` 
      };
    }
    
    return { success: true, error: null, errorMessage: null };
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return { 
      success: false, 
      error, 
      errorMessage: `Unexpected error deleting project: ${error.message}` 
    };
  }
};
