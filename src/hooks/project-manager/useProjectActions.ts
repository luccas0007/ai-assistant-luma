
import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types/project';
import { fetchUserProjects, createProject, updateProject, deleteProject } from '@/utils/projectOperations';
import { createDefaultColumns } from '@/utils/columnOperations';

/**
 * Hook for project-related actions
 */
export const useProjectActions = (
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  setActiveProject: React.Dispatch<React.SetStateAction<Project | null>>,
  setIsLoadingProjects: React.Dispatch<React.SetStateAction<boolean>>,
  setProjectError: React.Dispatch<React.SetStateAction<string | null>>,
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Load all projects for the current user
  const loadProjects = useCallback(async () => {
    if (!user) return { success: false, error: new Error('User not authenticated') };
    
    setIsLoadingProjects(true);
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
      setIsLoadingProjects(false);
    }
  }, [user, setProjects, setIsLoadingProjects, setProjectError, toast]);
  
  // Create a new project
  const handleCreateProject = useCallback(async (name: string, description?: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to create a project',
        variant: 'destructive'
      });
      return false;
    }
    
    setIsProcessing(true);
    
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
        return false;
      }
      
      if (!data) {
        setProjectError('No project data returned');
        toast({
          title: 'Error',
          description: 'Could not create project. No data returned.',
          variant: 'destructive'
        });
        return false;
      }
      
      const newProject = data[0];
      
      // Create default columns for the new project
      await createDefaultColumns(newProject.id);
      
      // Update projects list
      setProjects(prevProjects => [...prevProjects, newProject]);
      
      // Set as active project
      setActiveProject(newProject);
      
      toast({
        title: 'Project created',
        description: `"${name}" has been created successfully`
      });
      
      return true;
    } catch (error: any) {
      const errorMsg = error.message || 'An unexpected error occurred';
      
      setProjectError(errorMsg);
      toast({
        title: 'Error creating project',
        description: errorMsg,
        variant: 'destructive'
      });
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [user, setProjects, setActiveProject, setProjectError, toast]);
  
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
    
    setIsProcessing(true);
    
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
      setIsProcessing(false);
    }
  }, [user, setProjects, setActiveProject, setProjectError, toast]);
  
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
    
    setIsProcessing(true);
    
    try {
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
      setIsProcessing(false);
    }
  }, [user, setProjects, setActiveProject, setProjectError, toast]);
  
  return {
    isProcessing,
    loadProjects,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject
  };
};
