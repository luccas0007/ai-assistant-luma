
import { useEffect } from 'react';
import { loadColumns } from '@/utils/columnUtils';
import { useTaskState } from './useTaskState';
import { useTaskActions } from './useTaskActions';
import { useColumnActions } from './useColumnActions';
import { useDragAndDrop } from './useDragAndDrop';
import { useTaskInitialization } from './useTaskInitialization';

/**
 * Main hook for the task manager functionality
 */
export const useTaskManager = () => {
  // Get all state from the state hook
  const state = useTaskState();
  
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
  
  return {
    ...state,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleDragEnd,
    handleAddColumn,
    handleUploadAttachment
  };
};

export default useTaskManager;
