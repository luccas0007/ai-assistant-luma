
import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types/project';
import { updateProject } from '@/utils/projectOperations';

/**
 * Hook for project update functionality
 */
export const useProjectUpdate = (
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  setActiveProject: React.Dispatch<React.SetStateAction<Project | null>>,
  setProjectError: React.Dispatch<React.SetStateAction<string | null>>,
  setIsProcessingProject: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
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
  
  return { handleUpdateProject };
};
