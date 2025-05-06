
import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types/project';
import { fetchUserProjects, createProject, updateProject, deleteProject } from '@/utils/projectOperations';
import { createDefaultColumns } from '@/utils/columns';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for project-related actions
 */
export const useProjectActions = (
  projects: Project[],
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  setActiveProject: React.Dispatch<React.SetStateAction<Project | null>>,
  setProjectDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setEditingProject: React.Dispatch<React.SetStateAction<Project | null>>,
  setProjectError: React.Dispatch<React.SetStateAction<string | null>>,
  setIsProcessingProject: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Load all projects for the current user
  const loadProjects = useCallback(async () => {
    if (!user) return { success: false, error: new Error('User not authenticated') };
    
    setIsProcessingProject(true);
    setProjectError(null);
    
    try {
      const { data, error, errorMessage } = await fetchUserProjects(user.id);
      
      if (error) {
        setProjectError(errorMessage || 'Error loading projects');
        toast({
          title: 'Error',
          description: errorMessage || 'Could not load projects. Please try again.',
          variant: 'destructive'
        });
        return { success: false, error };
      }
      
      setProjects(data || []);
      return { success: true, projects: data };
    } catch (error: any) {
      const errorMsg = error.message || 'An unexpected error occurred';
      
      setProjectError(errorMsg);
      toast({
        title: 'Error loading projects',
        description: errorMsg,
        variant: 'destructive'
      });
      
      return { success: false, error };
    } finally {
      setIsProcessingProject(false);
    }
  }, [user, setProjects, setIsProcessingProject, setProjectError, toast]);
  
  // Create a new project
  const handleCreateProject = useCallback(async (name: string, description?: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to create a project',
        variant: 'destructive'
      });
      return null;
    }
    
    setIsProcessingProject(true);
    
    try {
      // Create the project
      const { data, error, errorMessage } = await createProject(user.id, name, description);
      
      if (error) {
        setProjectError(errorMessage || 'Error creating project');
        toast({
          title: 'Error',
          description: errorMessage || 'Could not create project. Please try again.',
          variant: 'destructive'
        });
        return null;
      }
      
      if (!data) {
        setProjectError('No project data returned');
        toast({
          title: 'Error',
          description: 'Could not create project. No data returned.',
          variant: 'destructive'
        });
        return null;
      }
      
      const newProject = data[0];
      
      // Create default columns for the new project
      const { success, error: columnsError, errorMessage: columnsErrorMessage } = await createDefaultColumns(newProject.id);
      
      if (columnsError) {
        console.error('Error creating default columns:', columnsErrorMessage);
        // Continue despite column error, just log it
      }
      
      // Update projects list
      setProjects(prevProjects => [...prevProjects, newProject]);
      
      // Set as active project
      setActiveProject(newProject);
      
      toast({
        title: 'Project created',
        description: `"${name}" has been created successfully`
      });
      
      return newProject;
    } catch (error: any) {
      const errorMsg = error.message || 'An unexpected error occurred';
      
      setProjectError(errorMsg);
      toast({
        title: 'Error creating project',
        description: errorMsg,
        variant: 'destructive'
      });
      
      return null;
    } finally {
      setIsProcessingProject(false);
    }
  }, [user, setProjects, setActiveProject, setProjectError, setIsProcessingProject, toast]);
  
  // Update an existing project
  const handleUpdateProject = useCallback(async (project: Project) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to update a project',
        variant: 'destructive'
      });
      return false;
    }
    
    setIsProcessingProject(true);
    
    try {
      const { success, error, errorMessage } = await updateProject(project);
      
      if (!success) {
        setProjectError(errorMessage || 'Error updating project');
        toast({
          title: 'Error',
          description: errorMessage || 'Could not update project. Please try again.',
          variant: 'destructive'
        });
        return false;
      }
      
      // Update projects list
      setProjects(prevProjects => 
        prevProjects.map(p => p.id === project.id ? project : p)
      );
      
      // Update active project if needed
      setActiveProject(prevActive => 
        prevActive && prevActive.id === project.id ? project : prevActive
      );
      
      toast({
        title: 'Project updated',
        description: `"${project.name}" has been updated successfully`
      });
      
      return true;
    } catch (error: any) {
      const errorMsg = error.message || 'An unexpected error occurred';
      
      setProjectError(errorMsg);
      toast({
        title: 'Error updating project',
        description: errorMsg,
        variant: 'destructive'
      });
      
      return false;
    } finally {
      setIsProcessingProject(false);
    }
  }, [user, setProjects, setActiveProject, setProjectError, setIsProcessingProject, toast]);
  
  // Delete a project
  const handleDeleteProject = useCallback(async (projectId: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to delete a project',
        variant: 'destructive'
      });
      return false;
    }
    
    setIsProcessingProject(true);
    
    try {
      // First, check if we need to manually clean up related data
      // This ensures we don't have orphaned columns or tasks
      try {
        // Delete related tasks
        const { error: tasksDeleteError } = await supabase
          .from('tasks')
          .delete()
          .eq('project_id', projectId);
          
        if (tasksDeleteError) {
          console.error('Error deleting project tasks:', tasksDeleteError);
          // Continue with deletion despite error
        }
        
        // Delete related columns
        const { error: columnsDeleteError } = await supabase
          .from('columns')
          .delete()
          .eq('project_id', projectId);
          
        if (columnsDeleteError) {
          console.error('Error deleting project columns:', columnsDeleteError);
          // Continue with deletion despite error
        }
      } catch (cleanupError: any) {
        console.error('Error cleaning up project data:', cleanupError);
        // Continue with project deletion despite cleanup errors
      }
      
      // Now delete the project itself
      const { success, error, errorMessage } = await deleteProject(projectId);
      
      if (!success) {
        setProjectError(errorMessage || 'Error deleting project');
        toast({
          title: 'Error',
          description: errorMessage || 'Could not delete project. Please try again.',
          variant: 'destructive'
        });
        return false;
      }
      
      // Update projects list
      setProjects(prevProjects => 
        prevProjects.filter(p => p.id !== projectId)
      );
      
      // Clear active project if it was deleted
      setActiveProject(prevActive => 
        prevActive && prevActive.id === projectId ? null : prevActive
      );
      
      toast({
        title: 'Project deleted',
        description: 'Project has been deleted successfully'
      });
      
      return true;
    } catch (error: any) {
      const errorMsg = error.message || 'An unexpected error occurred';
      
      setProjectError(errorMsg);
      toast({
        title: 'Error deleting project',
        description: errorMsg,
        variant: 'destructive'
      });
      
      return false;
    } finally {
      setIsProcessingProject(false);
    }
  }, [user, setProjects, setActiveProject, setProjectError, setIsProcessingProject, toast]);
  
  return {
    isProcessing: false, // Not used directly in this hook, but included for backward compatibility
    loadProjects,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject
  };
};

export default useProjectActions;
