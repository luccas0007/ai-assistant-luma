
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Project } from '@/types/project';
import { fetchUserProjects } from '@/utils/projectOperations';

/**
 * Hook for initializing projects
 */
export const useProjectInitialization = (
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  setActiveProject: React.Dispatch<React.SetStateAction<Project | null>>,
  setProjectError: React.Dispatch<React.SetStateAction<string | null>>,
  setIsLoadingProjects: React.Dispatch<React.SetStateAction<boolean>>,
  handleCreateProject: (name: string, description?: string) => Promise<Project | null>,
  setInitialLoadComplete: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get('project');
  const { user } = useAuth();
  const { toast } = useToast();

  // Load projects on component mount
  useEffect(() => {
    if (!user) return;
    
    const loadProjects = async () => {
      setIsLoadingProjects(true);
      setProjectError(null);
      
      try {
        const { data, error, message } = await fetchUserProjects(user.id);
        
        if (error) {
          setProjectError(message || 'Failed to load projects');
          toast({
            title: 'Error loading projects',
            description: message || 'Failed to load your projects',
            variant: 'destructive'
          });
          return;
        }
        
        if (data.length === 0) {
          // Create a default project if none exists
          const defaultProject = await handleCreateProject('Default Project', 'Your default project board');
          
          if (defaultProject) {
            setProjects([defaultProject]);
            setActiveProject(defaultProject);
            
            // Update URL
            setSearchParams({ project: defaultProject.id });
          }
        } else {
          setProjects(data);
          
          // Set active project from URL or use first project
          if (projectIdFromUrl) {
            const projectFromUrl = data.find(p => p.id === projectIdFromUrl);
            if (projectFromUrl) {
              setActiveProject(projectFromUrl);
            } else {
              // Invalid project ID in URL, set first project as active
              setActiveProject(data[0]);
              setSearchParams({ project: data[0].id });
            }
          } else {
            // No project ID in URL, set first project as active
            setActiveProject(data[0]);
            setSearchParams({ project: data[0].id });
          }
        }
      } catch (error: any) {
        setProjectError(`Error loading projects: ${error.message}`);
        toast({
          title: 'Error',
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingProjects(false);
        setInitialLoadComplete(true);
      }
    };
    
    loadProjects();
  }, [user, handleCreateProject, setProjects, setActiveProject, setProjectError, 
      setIsLoadingProjects, setSearchParams, toast, projectIdFromUrl, setInitialLoadComplete]);
};

export default useProjectInitialization;
