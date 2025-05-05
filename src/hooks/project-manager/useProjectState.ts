
import { useState, useCallback } from 'react';
import { Project } from '@/types/project';

/**
 * Hook for managing the state of the project manager
 */
export const useProjectState = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProcessingProject, setIsProcessingProject] = useState(false);

  // Create a callback to prevent unnecessary re-renders
  const updateProjects = useCallback((newProjects: Project[] | ((prevProjects: Project[]) => Project[])) => {
    setProjects(newProjects);
  }, []);

  // Safe error setting - ensure we always get a string
  const setErrorSafe = useCallback((err: unknown) => {
    if (err === null) {
      setProjectError(null);
    } else if (typeof err === 'string') {
      setProjectError(err);
    } else if (err instanceof Error) {
      setProjectError(err.message);
    } else {
      setProjectError('An unknown error occurred');
    }
  }, []);

  return {
    // Project state
    projects,
    setProjects: updateProjects,
    activeProject,
    setActiveProject,
    
    // UI state
    isLoadingProjects,
    setIsLoadingProjects,
    projectError,
    setProjectError: setErrorSafe,
    isProcessingProject,
    setIsProcessingProject,
    
    // Project dialog state
    projectDialogOpen,
    setProjectDialogOpen,
    editingProject,
    setEditingProject,
  };
};

export default useProjectState;
