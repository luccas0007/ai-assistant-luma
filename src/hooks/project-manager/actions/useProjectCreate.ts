
import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types/project';
import { createProject } from '@/utils/projectOperations';
import { createDefaultColumns } from '@/utils/columns';

/**
 * Hook for project creation functionality
 */
export const useProjectCreate = (
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  setActiveProject: React.Dispatch<React.SetStateAction<Project | null>>,
  setProjectError: React.Dispatch<React.SetStateAction<string | null>>,
  setIsProcessingProject: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Create a new project
  const handleCreateProject = useCallback(async (name: string, description?: string) => {
    // Validation first, before setting processing state
    if (!name.trim()) {
      toast({
        title: 'Project name required',
        description: 'Please enter a name for the project',
        variant: 'destructive'
      });
      return null;
    }
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to create a project',
        variant: 'destructive'
      });
      return null;
    }
    
    // Now set processing state
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
      
      // First update local state immediately for better UX
      // Update projects list
      setProjects(prevProjects => [...prevProjects, newProject]);
      
      // Set as active project
      setActiveProject(newProject);
      
      toast({
        title: 'Project created',
        description: `"${name}" has been created successfully`
      });
      
      // Create default columns for the new project as a background operation
      try {
        const { success, error: columnsError, errorMessage: columnsErrorMessage } = await createDefaultColumns(newProject.id);
        
        if (columnsError) {
          console.error('Error creating default columns:', columnsErrorMessage);
          toast({
            title: 'Warning',
            description: 'Project created, but default columns could not be added.',
            variant: 'destructive'
          });
        } else {
          console.log('Default columns created successfully for project:', newProject.id);
        }
      } catch (columnsErr) {
        console.error('Error in default column creation:', columnsErr);
      }
      
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
  
  return { handleCreateProject };
};

export default useProjectCreate;
