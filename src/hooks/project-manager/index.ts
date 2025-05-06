
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTaskState } from '../task-manager/useTaskState';
import { useTaskActions } from '../task-manager/useTaskActions';
import { useColumnActions } from '../task-manager/useColumnActions';
import { useDragAndDrop } from '../task-manager/useDragAndDrop';
import { useProjectState } from './useProjectState';
import { useProjectActions } from './useProjectActions';
import { useProjectInitialization } from './useProjectInitialization';
import { useTaskInitialization } from './useTaskInitialization';
import { useTaskSync } from './useTaskSync';
import { Project } from '@/types/project';

/**
 * Main hook for the project manager functionality with multiple boards
 */
export const useProjectManager = () => {
  // URL parameters for tracking active project
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get project state from the project state hook
  const projectState = useProjectState();
  
  // Get task state from the task state hook
  const taskState = useTaskState();
  
  // Track if we've finished initial loading
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Project-related actions
  const {
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject
  } = useProjectActions(
    projectState.projects,
    projectState.setProjects,
    projectState.setActiveProject,
    projectState.setProjectDialogOpen,
    projectState.setEditingProject,
    projectState.setProjectError,
    projectState.setIsProcessingProject
  );
  
  // Task-related actions
  const {
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleUpdateTaskStatus,
    handleUploadAttachment
  } = useTaskActions(
    taskState.tasks,
    taskState.setTasks,
    taskState.setTaskDialogOpen,
    taskState.setEditingTask,
    taskState.setError,
    taskState.setIsProcessing
  );
  
  // Column-related actions
  const { handleAddColumn } = useColumnActions(
    taskState.columns,
    taskState.setColumns,
    taskState.newColumnTitle,
    taskState.setNewColumnTitle,
    taskState.setColumnDialogOpen,
    taskState.setIsProcessing,
    taskState.setError,
    taskState.activeProject
  );
  
  // Drag and drop functionality
  const { handleDragEnd } = useDragAndDrop(
    taskState.tasks, 
    taskState.setTasks, 
    taskState.columns,
    handleUpdateTaskStatus
  );
  
  // Initialize projects
  useProjectInitialization(
    projectState.setProjects,
    projectState.setActiveProject,
    projectState.setProjectError, 
    projectState.setIsLoadingProjects,
    handleCreateProject,
    setInitialLoadComplete
  );
  
  // Initialize tasks
  useTaskInitialization(
    projectState.activeProject,
    initialLoadComplete,
    taskState.setTasks,
    taskState.setIsLoading,
    taskState.setError
  );
  
  // Task synchronization functions
  const { refreshTasks, loadAllTasks } = useTaskSync(
    projectState.activeProject,
    taskState.tasks,
    taskState.setTasks,
    taskState.setIsLoading,
    taskState.setError
  );
  
  // Function to change the active project
  const setActiveProject = (project: Project) => {
    projectState.setActiveProject(project);
    setSearchParams({ project: project.id });
  };
  
  return {
    // Task state
    ...taskState,
    
    // Project state
    ...projectState,
    
    // Project actions
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    setActiveProject,
    
    // Task actions
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleDragEnd,
    handleAddColumn,
    handleUploadAttachment,
    refreshTasks,
    loadAllTasks
  };
};

export default useProjectManager;
