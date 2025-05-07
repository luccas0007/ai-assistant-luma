
import { useEffect } from 'react';
import { useTaskState } from './useTaskState';
import { useTaskActions } from './useTaskActions';
import { useColumnActions } from './useColumnActions';
import { useDragAndDrop } from './useDragAndDrop';
import { useTaskInitialization } from './useTaskInitialization';
import { useTaskProjectIntegration } from './useTaskProjectIntegration';
import { useTaskRefresh } from './useTaskRefresh';
import { useProjectChangeEffect } from './useProjectChangeEffect';
import { initializeTaskSystem } from '@/utils/tasks';
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
  
  // Project integration
  useTaskProjectIntegration(
    state.activeProject,
    state.setColumns,
    state.setIsLoading,
    state.setError
  );
  
  // Task refresh functionality
  const { refreshTasks } = useTaskRefresh(
    state.activeProject,
    state.setTasks,
    state.setColumns,
    state.setIsLoading,
    state.setError
  );
  
  // Handle project change effects
  useProjectChangeEffect(state.activeProject, refreshTasks);
  
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
