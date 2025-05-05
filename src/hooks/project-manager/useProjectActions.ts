
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types/project';
import { useAuth } from '@/context/AuthContext';
import { 
  createProject as apiCreateProject, 
  updateProject as apiUpdateProject, 
  deleteProject as apiDeleteProject, 
} from '@/utils/projectOperations';

/**
 * Hook for project action handlers
 */
export const useProjectActions = (
  projects: Project[],
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  setActiveProject: React.Dispatch<React.SetStateAction<Project | null>>,
  setProjectDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setEditingProject: React.Dispatch<React.SetStateAction<Project | null>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCreateProject = async (name: string, description?: string) => {
    if (!user) {
      const errorMessage = 'Authentication required to create projects';
      setError(errorMessage);
      
      toast({
        title: 'Authentication required',
        description: 'Please log in to create projects',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log("Creating project with data:", { name, description });
      setError(null);
      setIsProcessing(true);
      
      // Create the project
      const { data, error, errorMessage } = await apiCreateProject(user.id, name, description);
      
      if (error) {
        console.error('Project creation error details:', error);
        setError(errorMessage || 'Error creating project');
        
        toast({
          title: 'Error creating project',
          description: errorMessage || 'Failed to create project',
          variant: 'destructive'
        });
        return null;
      }

      if (!data || data.length === 0) {
        const msg = 'Project was created but no data was returned';
        setError(msg);
        
        toast({
          title: 'Project creation issue',
          description: msg + '. Refreshing may be needed.',
          variant: 'destructive'
        });
        return null;
      }

      console.log("Project created successfully:", data);
      setProjects(prev => [...prev, ...data]);
      toast({
        title: 'Project created',
        description: 'Your project has been created successfully.'
      });
      setProjectDialogOpen(false);
      
      // Return the newly created project
      return data[0] as Project;
    } catch (error: any) {
      console.error('Error creating project:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      
      toast({
        title: 'Error creating project',
        description: errorMessage,
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      setError(null);
      setIsProcessing(true);
      const { error, errorMessage } = await apiUpdateProject(updatedProject);

      if (error) {
        setError(errorMessage || 'Error updating project');
        toast({
          title: 'Error updating project',
          description: errorMessage || 'Failed to update project',
          variant: 'destructive'
        });
        return false;
      }

      setProjects(projects.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      ));
      
      // If this was the active project, update it
      setActiveProject(current => 
        current?.id === updatedProject.id ? updatedProject : current
      );
      
      toast({
        title: 'Project updated',
        description: 'Your project has been updated successfully.'
      });
      setEditingProject(null);
      setProjectDialogOpen(false);
      return true;
    } catch (error: any) {
      console.error('Error updating project:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      
      toast({
        title: 'Error updating project',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      setError(null);
      setIsProcessing(true);
      const { error, errorMessage } = await apiDeleteProject(id);

      if (error) {
        setError(errorMessage || 'Error deleting project');
        toast({
          title: 'Error deleting project',
          description: errorMessage || 'Failed to delete project',
          variant: 'destructive'
        });
        return false;
      }

      setProjects(projects.filter(project => project.id !== id));
      
      // If this was the active project, set active to null or the first available project
      setActiveProject(current => {
        if (current?.id === id) {
          // Find another project to set as active
          const remainingProjects = projects.filter(p => p.id !== id);
          return remainingProjects.length > 0 ? remainingProjects[0] : null;
        }
        return current;
      });
      
      toast({
        title: 'Project deleted',
        description: 'Your project has been deleted successfully.'
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting project:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      
      toast({
        title: 'Error deleting project',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject
  };
};

export default useProjectActions;
