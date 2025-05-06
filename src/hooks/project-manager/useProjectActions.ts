
import { Project } from '@/types/project';
import { useProjectCreate } from './actions/useProjectCreate';
import { useProjectUpdate } from './actions/useProjectUpdate';
import { useProjectDelete } from './actions/useProjectDelete';
import { useProjectLoad } from './actions/useProjectLoad';

/**
 * Main hook for project-related actions that combines
 * all the specialized hooks
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
  // Use the specialized hooks
  const { loadProjects } = useProjectLoad(
    setProjects,
    setProjectError,
    setIsProcessingProject
  );
  
  const { handleCreateProject } = useProjectCreate(
    setProjects,
    setActiveProject,
    setProjectError,
    setIsProcessingProject
  );
  
  const { handleUpdateProject } = useProjectUpdate(
    setProjects,
    setActiveProject,
    setProjectError,
    setIsProcessingProject
  );
  
  const { handleDeleteProject } = useProjectDelete(
    setProjects,
    setActiveProject,
    setProjectError,
    setIsProcessingProject
  );
  
  return {
    isProcessing: false, // Not used directly in this hook, but included for backward compatibility
    loadProjects,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject
  };
};

export default useProjectActions;
