
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
    // Validation first, before setting processing state
    if (!project.name.trim()) {
      toast({
        title: 'Project name required',
        description: 'Please enter a name for the project',
        variant: 'destructive'
      });
      return false;
    }
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to update a project',
        variant: 'destructive'
      });
      return false;
    }
    
    // Now set processing state
    setIsProcessingProject(true);
    
    try {
      // First update local state immediately for better UX
      // Update projects list
      setProjects(prevProjects => 
        prevProjects.map(p => p.id === project.id ? project : p)
      );
      
      // Update active project if needed
      setActiveProject(prevActive => 
        prevActive && prevActive.id === project.id ? project : prevActive
      );
      
      // Then perform the update in the background
      const { success, error, errorMessage } = await updateProject(project);
      
      if (!success) {
        console.error('Error updating project:', errorMessage);
        // Don't revert the UI state because it's confusing, but show a toast
        toast({
          title: 'Warning',
          description: `Project displayed as updated, but changes may not be saved: ${errorMessage || 'Unknown error'}`,
          variant: 'destructive'
        });
        return false;
      }
      
      toast({
        title: 'Project updated',
        description: `"${project.name}" has been updated successfully`
      });
      
      return true;
    } catch (error: any) {
      const errorMsg = error.message || 'An unexpected error occurred';
      
      console.error('Error updating project:', errorMsg);
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

export default useProjectUpdate;
