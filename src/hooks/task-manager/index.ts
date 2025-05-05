
import { useEffect } from 'react';
import { loadColumns } from '@/utils/columnUtils';
import { useTaskState } from './useTaskState';
import { useTaskActions } from './useTaskActions';
import { useColumnActions } from './useColumnActions';
import { useDragAndDrop } from './useDragAndDrop';
import { useTaskInitialization } from './useTaskInitialization';
import { fetchUserTasks } from '@/utils/taskDatabaseUtils';
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
  
  // Initialize columns from local storage on component mount
  useEffect(() => {
    const loadedColumns = loadColumns();
    if (loadedColumns.length > 0) {
      state.setColumns(loadedColumns);
    }
  }, [state.setColumns]);
  
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
    state.setError
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
    state.columns
  );
  
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
    
    state.setIsLoading(true);
    state.setError(null);
    
    try {
      const { data, error, errorMessage } = await fetchUserTasks(user.id);
      
      if (error) {
        state.setError(errorMessage || "Failed to refresh tasks");
        toast({
          title: "Refresh failed",
          description: errorMessage || "Could not load your projects. Please try again.",
          variant: "destructive"
        });
      } else {
        state.setTasks(data || []);
        state.setError(null);
        toast({
          title: "Refreshed",
          description: `Loaded ${data.length} projects successfully`
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
