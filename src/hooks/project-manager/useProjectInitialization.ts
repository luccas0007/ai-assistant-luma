
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
        console.log('Loading projects for user:', user.id);
        const { data, error, errorMessage } = await fetchUserProjects(user.id);
        
        if (error) {
          // Fixed: Safely access error messages
          const errorMsg = errorMessage || (error.message ? error.message : 'Failed to load projects');
          setProjectError(errorMsg);
          toast({
            title: 'Error loading projects',
            description: errorMsg,
            variant: 'destructive'
          });
          return;
        }
        
        if (data.length === 0) {
          // Create a default project if none exists
          console.log('No projects found, creating default project');
          const defaultProject = await handleCreateProject('Default Project', 'Your default project board');
          
          if (defaultProject) {
            setProjects([defaultProject]);
            setActiveProject(defaultProject);
            
            // Update URL
            setSearchParams({ project: defaultProject.id });
            console.log('Default project created:', defaultProject.id);
          }
        } else {
          console.log(`Found ${data.length} projects`);
          setProjects(data);
          
          // Set active project from URL or use first project
          if (projectIdFromUrl) {
            const projectFromUrl = data.find(p => p.id === projectIdFromUrl);
            if (projectFromUrl) {
              console.log('Setting active project from URL:', projectIdFromUrl);
              setActiveProject(projectFromUrl);
            } else {
              // Invalid project ID in URL, set first project as active
              console.log('Project ID in URL not found, using first project:', data[0].id);
              setActiveProject(data[0]);
              setSearchParams({ project: data[0].id });
            }
          } else {
            // No project ID in URL, set first project as active and update URL
            console.log('No project ID in URL, using first project:', data[0].id);
            setActiveProject(data[0]);
            setSearchParams({ project: data[0].id });
          }
        }
      } catch (error: any) {
        console.error('Error in project initialization:', error);
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
      
  // Update URL when active project changes
  useEffect(() => {
    const updateUrlWhenProjectChanges = (project: Project | null) => {
      if (project && project.id !== projectIdFromUrl) {
        console.log('Updating URL with project ID:', project.id);
        setSearchParams({ project: project.id });
      }
    };
    
    // This sets up a listener on the setActiveProject function
    return () => {
      setActiveProject((prev) => {
        if (prev) {
          updateUrlWhenProjectChanges(prev);
        }
        return prev;
      });
    };
  }, [setSearchParams, projectIdFromUrl, setActiveProject]);
};

export default useProjectInitialization;
