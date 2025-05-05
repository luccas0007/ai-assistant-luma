
import { useEffect } from 'react';
import { useTaskState } from './useTaskState';
import { useTaskActions } from './useTaskActions';
import { useColumnActions } from './useColumnActions';
import { useDragAndDrop } from './useDragAndDrop';
import { useTaskInitialization } from './useTaskInitialization';
import { fetchUserTasks } from '@/utils/taskDatabaseUtils';
import { fetchProjectColumns } from '@/utils/columnOperations';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Main hook for the task manager functionality
 */
export const useTaskManager = () => {
  // Get all state from the state hook
  const state = useTaskState();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Task-related actions
  const {
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleUpdateTaskStatus,
    handleUploadAttachment
  } = useTaskActions(
    state.tasks,
    state.setTasks,
    state.setTaskDialogOpen,
    state.setEditingTask,
    state.setError,
    state.setIsProcessing
  );
  
  // Column-related actions
  const { handleAddColumn } = useColumnActions(
    state.columns,
    state.setColumns,
    state.newColumnTitle,
    state.setNewColumnTitle,
    state.setColumnDialogOpen,
    state.setIsProcessing,
    state.setError,
    state.activeProject
  );
  
  // Drag and drop functionality
  const { handleDragEnd } = useDragAndDrop(
    state.tasks, 
    state.setTasks, 
    state.columns,
    handleUpdateTaskStatus
  );
  
  // Initialize tasks and columns
  useTaskInitialization(
    state.setTasks,
    state.setColumns,
    state.setIsLoading,
    state.setError,
    state.activeProject
  );
  
  // Load columns when active project changes
  useEffect(() => {
    const loadColumns = async () => {
      if (!state.activeProject) {
        state.setColumns([]);
        return;
      }
      
      state.setIsLoading(true);
      
      try {
        const { success, data, errorMessage } = await fetchProjectColumns(state.activeProject.id);
        
        if (!success || !data) {
          throw new Error(errorMessage || 'Failed to load columns');
        }
        
        state.setColumns(data);
      } catch (error: any) {
        console.error('Error loading columns:', error);
        state.setError(`Error loading columns: ${error.message}`);
        
        toast({
          title: 'Error loading board columns',
          description: error.message || 'Failed to load columns for this project',
          variant: 'destructive'
        });
      } finally {
        state.setIsLoading(false);
      }
    };
    
    loadColumns();
  }, [state.activeProject, state.setColumns, state.setError, state.setIsLoading, toast]);
  
  // Function to refresh tasks
  const refreshTasks = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your tasks",
        variant: "destructive"
      });
      return;
    }
    
    if (!state.activeProject) {
      toast({
        title: "No project selected",
        description: "Please select a project first",
        variant: "warning"
      });
      return;
    }
    
    state.setIsLoading(true);
    state.setError(null);
    
    try {
      const { data, error, errorMessage } = await fetchUserTasks(user.id, state.activeProject.id);
      
      if (error) {
        state.setError(errorMessage || "Failed to refresh tasks");
        toast({
          title: "Refresh failed",
          description: errorMessage || "Could not load your tasks. Please try again.",
          variant: "destructive"
        });
      } else {
        state.setTasks(data || []);
        state.setError(null);
        toast({
          title: "Refreshed",
          description: `Loaded ${data.length} tasks successfully`
        });
      }
    } catch (error: any) {
      state.setError(`Error refreshing: ${error.message}`);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      state.setIsLoading(false);
    }
  };
  
  return {
    ...state,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleDragEnd,
    handleAddColumn,
    handleUploadAttachment,
    refreshTasks
  };
};

export default useTaskManager;
