
import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types/project';
import { deleteProject } from '@/utils/projectOperations';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for project deletion functionality
 */
export const useProjectDelete = (
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  setActiveProject: React.Dispatch<React.SetStateAction<Project | null>>,
  setProjectError: React.Dispatch<React.SetStateAction<string | null>>,
  setIsProcessingProject: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
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
  
  return { handleDeleteProject };
};
