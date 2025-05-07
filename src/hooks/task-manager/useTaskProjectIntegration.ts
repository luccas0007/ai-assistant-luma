
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { fetchProjectColumns } from '@/utils/columns';
import { Project } from '@/types/project';

/**
 * Hook for managing project-related task operations
 */
export const useTaskProjectIntegration = (
  activeProject: Project | null,
  setColumns: React.Dispatch<React.SetStateAction<any[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Load columns when active project changes
  useEffect(() => {
    const loadColumns = async () => {
      if (!activeProject) {
        console.log('No active project, clearing columns');
        setColumns([]);
        return;
      }
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to view your project columns",
          variant: "destructive"
        });
        return;
      }
      
      setIsLoading(true);
      
      try {
        console.log(`Loading columns for project: ${activeProject.id}`);
        const { success, data, errorMessage } = await fetchProjectColumns(activeProject.id);
        
        if (!success || !data) {
          throw new Error(errorMessage || 'Failed to load columns');
        }
        
        // Ensure each column has the project_id properly set
        const columnsWithProject = data.map(column => ({
          ...column,
          project_id: activeProject.id // Ensure project_id is consistently set
        }));
        
        console.log(`Loaded ${columnsWithProject.length} columns for project ${activeProject.id}:`, 
          columnsWithProject.map(c => ({id: c.id, title: c.title, project_id: c.project_id})));
        
        setColumns(columnsWithProject);
      } catch (error: any) {
        console.error('Error loading columns:', error);
        setError(`Error loading columns: ${error.message}`);
        
        toast({
          title: 'Error loading board columns',
          description: error.message || 'Failed to load columns for this project',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadColumns();
  }, [activeProject?.id, user]); // Only reload when project ID or user changes

  return {}; // This hook primarily handles side effects
};

export default useTaskProjectIntegration;
