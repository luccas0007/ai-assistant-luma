
import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types/project';
import { fetchUserProjects } from '@/utils/projectOperations';

/**
 * Hook for loading projects
 */
export const useProjectLoad = (
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
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
  
  return { loadProjects };
};
