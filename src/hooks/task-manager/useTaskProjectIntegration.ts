
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { fetchProjectColumns, createDefaultColumns } from '@/utils/columns';
import { Project } from '@/types/project';
import { Column } from '@/types/task';

/**
 * Hook for managing project-related task operations
 */
export const useTaskProjectIntegration = (
  activeProject: Project | null,
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Load columns when active project changes
  useEffect(() => {
    let isMounted = true;
    
    const loadColumns = async () => {
      if (!activeProject) {
        console.log('No active project, clearing columns');
        if (isMounted) setColumns([]);
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
      
      if (isMounted) setIsLoading(true);
      
      try {
        console.log(`Loading columns for project: ${activeProject.id}`);
        let { success, data, errorMessage } = await fetchProjectColumns(activeProject.id);
        
        // Handle unmounted component
        if (!isMounted) return;
        
        if (!success || !data || data.length === 0) {
          console.log(`No columns found for project ${activeProject.id}, creating default columns`);
          // If no columns exist, create default ones
          const defaultResult = await createDefaultColumns(activeProject.id);
          
          // Handle unmounted component
          if (!isMounted) return;
          
          if (defaultResult.success && defaultResult.data) {
            data = defaultResult.data;
            success = true;
          } else {
            throw new Error(errorMessage || defaultResult.errorMessage || 'Failed to load columns');
          }
        }
        
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
        
        if (isMounted) setColumns(columnsWithProject);
      } catch (error: any) {
        console.error('Error loading columns:', error);
        if (isMounted) {
          setError(`Error loading columns: ${error.message}`);
          
          toast({
            title: 'Error loading board columns',
            description: error.message || 'Failed to load columns for this project',
            variant: 'destructive'
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    loadColumns();
    
    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
    };
  }, [activeProject?.id, user]); // Only reload when project ID or user changes

  return {}; // This hook primarily handles side effects
};

export default useTaskProjectIntegration;
