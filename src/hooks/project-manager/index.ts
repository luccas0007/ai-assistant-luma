import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTaskState } from '../task-manager/useTaskState';
import { useTaskActions } from '../task-manager/useTaskActions';
import { useColumnActions } from '../task-manager/useColumnActions';
import { useDragAndDrop } from '../task-manager/useDragAndDrop';
import { useProjectState } from './useProjectState';
import { useProjectActions } from './useProjectActions';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { loadColumns } from '@/utils/columnUtils';
import { fetchUserTasks } from '@/utils/taskDatabaseUtils';
import { fetchUserProjects } from '@/utils/projectOperations';
import { Project } from '@/types/project';
import { Task } from '@/types/task';

/**
 * Main hook for the project manager functionality with multiple boards
 */
export const useProjectManager = () => {
  // URL parameters to track active project
  const [searchParams, setSearchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get('project');
  
  // Get project state from the project state hook
  const projectState = useProjectState();
  
  // Get task state from the task state hook
  const taskState = useTaskState();
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Track if we've finished initial loading
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Initialize columns from local storage on component mount
  useEffect(() => {
    const loadedColumns = loadColumns();
    if (loadedColumns.length > 0) {
      taskState.setColumns(loadedColumns);
    }
  }, [taskState.setColumns]);
  
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
    taskState.setError
  );
  
  // Drag and drop functionality
  const { handleDragEnd } = useDragAndDrop(
    taskState.tasks, 
    taskState.setTasks, 
    taskState.columns,
    handleUpdateTaskStatus
  );
  
  // Load projects
  useEffect(() => {
    if (!user) return;
    
    const loadProjects = async () => {
      projectState.setIsLoadingProjects(true);
      projectState.setProjectError(null);
      
      try {
        const { data, error, errorMessage } = await fetchUserProjects(user.id);
        
        if (error) {
          projectState.setProjectError(errorMessage || 'Failed to load projects');
          toast({
            title: 'Error loading projects',
            description: errorMessage || 'Failed to load your projects',
            variant: 'destructive'
          });
          return;
        }
        
        if (data.length === 0) {
          // Create a default project if none exists
          const defaultProject = await handleCreateProject('Default Project', 'Your default project board');
          
          if (defaultProject) {
            projectState.setProjects([defaultProject]);
            projectState.setActiveProject(defaultProject);
            
            // Update URL
            setSearchParams({ project: defaultProject.id });
          }
        } else {
          projectState.setProjects(data);
          
          // Set active project from URL or use first project
          if (projectIdFromUrl) {
            const projectFromUrl = data.find(p => p.id === projectIdFromUrl);
            if (projectFromUrl) {
              projectState.setActiveProject(projectFromUrl);
            } else {
              // Invalid project ID in URL, set first project as active
              projectState.setActiveProject(data[0]);
              setSearchParams({ project: data[0].id });
            }
          } else {
            // No project ID in URL, set first project as active
            projectState.setActiveProject(data[0]);
            setSearchParams({ project: data[0].id });
          }
        }
      } catch (error: any) {
        projectState.setProjectError(`Error loading projects: ${error.message}`);
        toast({
          title: 'Error',
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive'
        });
      } finally {
        projectState.setIsLoadingProjects(false);
        setInitialLoadComplete(true);
      }
    };
    
    loadProjects();
  }, [user]);
  
  // Load tasks for active project
  useEffect(() => {
    if (!user || !projectState.activeProject || !initialLoadComplete) return;
    
    const loadTasks = async () => {
      taskState.setIsLoading(true);
      taskState.setError(null);
      
      try {
        const { data, error, errorMessage } = await fetchUserTasks(user.id, projectState.activeProject.id);
        
        if (error) {
          taskState.setError(errorMessage || 'Failed to load tasks');
          toast({
            title: 'Error loading tasks',
            description: errorMessage || 'Failed to load tasks for this project',
            variant: 'destructive'
          });
          return;
        }
        
        taskState.setTasks(data);
      } catch (error: any) {
        taskState.setError(`Error loading tasks: ${error.message}`);
        toast({
          title: 'Error',
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive'
        });
      } finally {
        taskState.setIsLoading(false);
      }
    };
    
    loadTasks();
  }, [user, projectState.activeProject, initialLoadComplete]);
  
  // Function to change the active project
  const setActiveProject = (project: Project) => {
    projectState.setActiveProject(project);
    setSearchParams({ project: project.id });
  };
  
  // Function to refresh tasks
  const refreshTasks = async () => {
    if (!user || !projectState.activeProject) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your tasks",
        variant: "destructive"
      });
      return;
    }
    
    taskState.setIsLoading(true);
    taskState.setError(null);
    
    try {
      const { data, error, errorMessage } = await fetchUserTasks(user.id, projectState.activeProject.id);
      
      if (error) {
        taskState.setError(errorMessage || "Failed to refresh tasks");
        toast({
          title: "Refresh failed",
          description: errorMessage || "Could not load your projects. Please try again.",
          variant: "destructive"
        });
      } else {
        // Cast the returned data to Task[] to ensure type compatibility
        taskState.setTasks(data as Task[] || []);
        taskState.setError(null);
        toast({
          title: "Refreshed",
          description: `Loaded ${data.length} tasks successfully`
        });
      }
    } catch (error: any) {
      taskState.setError(`Error refreshing: ${error.message}`);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      taskState.setIsLoading(false);
    }
  };
  
  // Function to load all tasks for the task sync view
  const loadAllTasks = async () => {
    if (!user) return { tasks: [], error: 'Authentication required' };
    
    try {
      const { data, error, errorMessage } = await fetchUserTasks(user.id);
      
      if (error) {
        return { 
          tasks: [], 
          error: errorMessage || 'Failed to load all tasks'
        };
      }
      
      return {
        tasks: data as Task[],
        error: null
      };
    } catch (error: any) {
      return {
        tasks: [],
        error: error.message || 'An unexpected error occurred'
      };
    }
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
