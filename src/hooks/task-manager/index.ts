
import { useEffect } from 'react';
import { useTaskState } from './useTaskState';
import { useTaskActions } from './useTaskActions';
import { useColumnActions } from './useColumnActions';
import { useDragAndDrop } from './useDragAndDrop';
import { useTaskInitialization } from './useTaskInitialization';
import { fetchUserTasks } from '@/utils/tasks/queries';
import { fetchProjectColumns } from '@/utils/columns';
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
  const { handleAddColumn, handleDeleteColumn } = useColumnActions(
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
        console.log('No active project, clearing columns');
        state.setColumns([]);
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
      
      state.setIsLoading(true);
      
      try {
        console.log(`Loading columns for project: ${state.activeProject.id}`);
        const { success, data, errorMessage } = await fetchProjectColumns(state.activeProject.id);
        
        if (!success || !data) {
          throw new Error(errorMessage || 'Failed to load columns');
        }
        
        console.log(`Loaded ${data.length} columns for project ${state.activeProject.id}`);
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
  }, [state.activeProject?.id, user]); // Only reload when project ID or user changes
  
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
      console.warn("Attempting to refresh tasks with no active project");
      toast({
        title: "No project selected",
        description: "Please select a project first",
        variant: "destructive"
      });
      return;
    }
    
    state.setIsLoading(true);
    state.setError(null);
    
    try {
      console.log(`Refreshing tasks for project: ${state.activeProject.id}`);
      
      // Refresh columns first
      const { success: colSuccess, data: colData } = await fetchProjectColumns(state.activeProject.id);
      if (colSuccess && colData) {
        console.log(`Refreshed columns for project: ${state.activeProject.id}, found: ${colData.length} columns`);
        state.setColumns(colData);
      }
      
      // Then refresh tasks
      const { data, error, message } = await fetchUserTasks(user.id, state.activeProject.id);
      
      if (error) {
        state.setError(message || "Failed to refresh tasks");
        toast({
          title: "Refresh failed",
          description: message || "Could not load your tasks. Please try again.",
          variant: "destructive"
        });
      } else {
        // Normalize tasks to ensure column_id and status are consistent
        const normalizedTasks = data.map(task => ({
          ...task,
          column_id: task.column_id || task.status,
          status: task.column_id || task.status
        }));
        
        state.setTasks(normalizedTasks);
        state.setError(null);
        console.log(`Refreshed tasks for project: ${state.activeProject.id}, found: ${normalizedTasks.length} tasks`);
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
  
  // Set up a project change effect to refresh tasks when project changes
  useEffect(() => {
    if (state.activeProject) {
      console.log(`Active project changed to: ${state.activeProject.id}. Refreshing tasks.`);
      // Refresh tasks and columns when project changes
      refreshTasks();
    }
  }, [state.activeProject?.id]); // Only trigger when project ID changes
  
  return {
    ...state,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleDragEnd,
    handleAddColumn,
    handleDeleteColumn,
    handleUploadAttachment,
    refreshTasks
  };
};

export default useTaskManager;
