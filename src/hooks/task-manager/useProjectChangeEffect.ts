
import { useEffect } from 'react';
import { Project } from '@/types/project';

/**
 * Hook to handle effects when the active project changes
 */
export const useProjectChangeEffect = (
  activeProject: Project | null,
  refreshTasks: () => Promise<void>
) => {
  // Set up a project change effect to refresh tasks when project changes
  useEffect(() => {
    if (activeProject) {
      console.log(`Active project changed to: ${activeProject.id}. Refreshing tasks.`);
      // Refresh tasks and columns when project changes
      refreshTasks();
    }
  }, [activeProject?.id]); // Only trigger when project ID changes

  return {}; // This hook primarily handles side effects
};

export default useProjectChangeEffect;
