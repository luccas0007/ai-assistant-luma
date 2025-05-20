
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { Task, Column } from '@/types/task';
import { Project } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fetchProjectColumns } from '@/utils/columns/fetchColumns';
import { createDefaultColumns } from '@/utils/columns/defaultColumns';
import { createColumn, deleteColumn } from '@/utils/columns/columnCrud';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Define the state structure
interface TaskState {
  tasks: Task[];
  columns: Column[];
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
}

// Define action types
type TaskAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'REMOVE_TASK'; payload: string }
  | { type: 'SET_COLUMNS'; payload: Column[] }
  | { type: 'ADD_COLUMN'; payload: Column }
  | { type: 'REMOVE_COLUMN'; payload: string }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'SET_ACTIVE_PROJECT'; payload: Project | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Create context interface
interface TaskContextProps {
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
  
  // Project actions
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<Project | null>;
  updateProject: (project: Project) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;
  setActiveProject: (project: Project | null) => void;
  
  // Column actions
  fetchColumns: (projectId: string) => Promise<void>;
  addColumn: (title: string) => Promise<Column | null>;
  removeColumn: (columnId: string) => Promise<boolean>;
  
  // Task actions
  fetchTasks: (projectId?: string) => Promise<void>;
  createTask: (taskData: Partial<Task>) => Promise<Task | null>;
  updateTask: (task: Task) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  moveTask: (taskId: string, newColumnId: string) => Promise<boolean>;
  
  // Dialog state
  confirmDialogOpen: boolean;
  confirmDialogTitle: string;
  confirmDialogMessage: string;
  confirmDialogAction: () => Promise<void>;
  showConfirmDialog: (title: string, message: string, action: () => Promise<void>) => void;
  hideConfirmDialog: () => void;
}

// Create the context
const TaskContext = createContext<TaskContextProps | null>(null);

// Initial state
const initialState: TaskState = {
  tasks: [],
  columns: [],
  projects: [],
  activeProject: null,
  isLoading: false,
  isProcessing: false,
  error: null,
};

// Create the reducer
function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'REMOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    case 'SET_COLUMNS':
      return { ...state, columns: action.payload };
    case 'ADD_COLUMN':
      return { ...state, columns: [...state.columns, action.payload] };
    case 'REMOVE_COLUMN':
      return {
        ...state,
        columns: state.columns.filter(column => column.id !== action.payload),
      };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'SET_ACTIVE_PROJECT':
      return { ...state, activeProject: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// Create the provider component
export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { user } = useAuth();
  const { toast } = useToast();

  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogTitle, setConfirmDialogTitle] = useState('');
  const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
  const [confirmDialogAction, setConfirmDialogAction] = useState<() => Promise<void>>(() => Promise.resolve());

  // Function to show confirmation dialog
  const showConfirmDialog = (title: string, message: string, action: () => Promise<void>) => {
    setConfirmDialogTitle(title);
    setConfirmDialogMessage(message);
    setConfirmDialogAction(() => action);
    setConfirmDialogOpen(true);
  };

  // Function to hide confirmation dialog
  const hideConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  // Fetch projects
  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      dispatch({ type: 'SET_PROJECTS', payload: data });
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Create a new project
  const createProject = async (name: string, description?: string): Promise<Project | null> => {
    if (!user) return null;
    
    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      
      const newProject = {
        name,
        description: description || null,
        owner_id: user.id,
      };
      
      const { data, error } = await supabase
        .from('projects')
        .insert(newProject)
        .select()
        .single();
      
      if (error) throw error;

      const project = data as Project;
      
      // Add the new project to state
      dispatch({ type: 'SET_PROJECTS', payload: [...state.projects, project] });
      
      // Set as active project
      dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project });
      
      // Create default columns for the new project
      await ensureDefaultColumns(project.id);
      
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
      
      return project;
    } catch (error: any) {
      console.error('Error creating project:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
      return null;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  // Update an existing project
  const updateProject = async (project: Project): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      
      const { error } = await supabase
        .from('projects')
        .update({
          name: project.name,
          description: project.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id);
      
      if (error) throw error;
      
      // Update the project in state
      dispatch({
        type: 'SET_PROJECTS',
        payload: state.projects.map(p => (p.id === project.id ? project : p)),
      });
      
      // Update active project if this is the active one
      if (state.activeProject?.id === project.id) {
        dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project });
      }
      
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating project:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive',
      });
      return false;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  // Delete a project
  const deleteProject = async (projectId: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
      
      // Remove the project from state
      dispatch({
        type: 'SET_PROJECTS',
        payload: state.projects.filter(p => p.id !== projectId),
      });
      
      // Clear active project if this was the active one
      if (state.activeProject?.id === projectId) {
        dispatch({ type: 'SET_ACTIVE_PROJECT', payload: null });
      }
      
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting project:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
      return false;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  // Set active project
  const setActiveProject = async (project: Project | null) => {
    if (project?.id === state.activeProject?.id) return;
    
    dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project });
    
    if (project) {
      // Clear tasks and columns when changing projects
      dispatch({ type: 'SET_TASKS', payload: [] });
      dispatch({ type: 'SET_COLUMNS', payload: [] });
      
      // Fetch columns and tasks for the new project
      await fetchColumns(project.id);
      await fetchTasks(project.id);
    } else {
      // Clear everything if no project is selected
      dispatch({ type: 'SET_TASKS', payload: [] });
      dispatch({ type: 'SET_COLUMNS', payload: [] });
    }
  };

  // Ensure default columns exist for a project
  const ensureDefaultColumns = async (projectId: string): Promise<boolean> => {
    try {
      const result = await fetchProjectColumns(projectId);
      
      if (result.success && result.data && result.data.length > 0) {
        // Columns already exist, just update state
        dispatch({ type: 'SET_COLUMNS', payload: result.data });
        return true;
      }
      
      // Create default columns
      const createResult = await createDefaultColumns(projectId);
      
      if (!createResult.success || !createResult.data) {
        throw new Error(createResult.errorMessage || 'Failed to create default columns');
      }
      
      dispatch({ type: 'SET_COLUMNS', payload: createResult.data });
      return true;
    } catch (error: any) {
      console.error('Error ensuring default columns:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    }
  };

  // Fetch columns for a project
  const fetchColumns = async (projectId: string) => {
    if (!projectId) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const result = await fetchProjectColumns(projectId);
      
      if (!result.success) {
        throw new Error(result.errorMessage || 'Failed to fetch columns');
      }
      
      if (result.data && result.data.length > 0) {
        // Columns exist, update state
        dispatch({ type: 'SET_COLUMNS', payload: result.data });
      } else {
        // No columns found, create defaults
        await ensureDefaultColumns(projectId);
      }
    } catch (error: any) {
      console.error('Error fetching columns:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast({
        title: 'Error',
        description: 'Failed to load columns',
        variant: 'destructive',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Add a new column
  const addColumn = async (title: string): Promise<Column | null> => {
    if (!state.activeProject) {
      toast({
        title: 'Error',
        description: 'Please select a project first',
        variant: 'destructive',
      });
      return null;
    }
    
    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      
      const result = await createColumn(state.activeProject.id, title);
      
      if (!result.success || !result.data) {
        throw new Error(result.errorMessage || 'Failed to create column');
      }
      
      const newColumn = result.data;
      
      // Add the column to state
      dispatch({ type: 'ADD_COLUMN', payload: newColumn });
      
      toast({
        title: 'Success',
        description: 'Column added successfully',
      });
      
      return newColumn;
    } catch (error: any) {
      console.error('Error adding column:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast({
        title: 'Error',
        description: 'Failed to add column',
        variant: 'destructive',
      });
      return null;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  // Remove a column
  const removeColumn = async (columnId: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      
      const result = await deleteColumn(columnId);
      
      if (!result.success) {
        throw new Error(result.errorMessage || 'Failed to delete column');
      }
      
      // Remove the column from state
      dispatch({ type: 'REMOVE_COLUMN', payload: columnId });
      
      // Update any tasks that were in this column
      const updatedTasks = state.tasks.map(task => {
        if (task.column_id === columnId) {
          return { ...task, column_id: null, status: 'todo' };
        }
        return task;
      });
      
      dispatch({ type: 'SET_TASKS', payload: updatedTasks });
      
      toast({
        title: 'Success',
        description: 'Column deleted successfully',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error removing column:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast({
        title: 'Error',
        description: 'Failed to delete column',
        variant: 'destructive',
      });
      return false;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  // Fetch tasks for a project
  const fetchTasks = async (projectId?: string) => {
    if (!user) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      } else if (state.activeProject) {
        query = query.eq('project_id', state.activeProject.id);
      } else {
        query = query.is('project_id', null);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      dispatch({ type: 'SET_TASKS', payload: data as Task[] });
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Create a new task
  const createTask = async (taskData: Partial<Task>): Promise<Task | null> => {
    if (!user) return null;
    
    if (!taskData.column_id && state.columns.length > 0) {
      // Default to first column if not specified
      taskData.column_id = state.columns[0].id;
    }
    
    if (!taskData.column_id) {
      toast({
        title: 'Error',
        description: 'No column available. Please create a column first.',
        variant: 'destructive',
      });
      return null;
    }
    
    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      
      const newTask = {
        title: taskData.title || 'Untitled Task',
        description: taskData.description || null,
        priority: taskData.priority || 'medium',
        due_date: taskData.due_date || null,
        attachment_url: taskData.attachment_url || null,
        project_id: taskData.project_id || state.activeProject?.id || null,
        user_id: user.id,
        column_id: taskData.column_id,
        completed: taskData.completed || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();
      
      if (error) throw error;
      
      const createdTask = data as Task;
      
      // Add the task to state
      dispatch({ type: 'ADD_TASK', payload: createdTask });
      
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
      
      return createdTask;
    } catch (error: any) {
      console.error('Error creating task:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
      return null;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  // Update an existing task
  const updateTask = async (task: Task): Promise<boolean> => {
    if (!task.id) return false;
    
    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      
      // Optimistically update state
      dispatch({ type: 'UPDATE_TASK', payload: task });
      
      const { error } = await supabase
        .from('tasks')
        .update({
          ...task,
          updated_at: new Date().toISOString(),
        })
        .eq('id', task.id);
      
      if (error) {
        // Rollback on error
        await fetchTasks(task.project_id || undefined);
        throw error;
      }
      
      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating task:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
      return false;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Remove the task from state
      dispatch({ type: 'REMOVE_TASK', payload: taskId });
      
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting task:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
      return false;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  // Move a task to a different column
  const moveTask = async (taskId: string, newColumnId: string): Promise<boolean> => {
    try {
      const task = state.tasks.find(t => t.id === taskId);
      
      if (!task) return false;
      
      const updatedTask = {
        ...task,
        column_id: newColumnId,
        updated_at: new Date().toISOString(),
      };
      
      // Optimistically update state
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      
      const { error } = await supabase
        .from('tasks')
        .update({ column_id: newColumnId, updated_at: new Date().toISOString() })
        .eq('id', taskId);
      
      if (error) {
        // Rollback on error
        dispatch({ type: 'UPDATE_TASK', payload: task });
        throw error;
      }
      
      return true;
    } catch (error: any) {
      console.error('Error moving task:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast({
        title: 'Error',
        description: 'Failed to move task',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Initialize by loading projects when user is available
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  return (
    <TaskContext.Provider
      value={{
        state,
        dispatch,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
        setActiveProject,
        fetchColumns,
        addColumn,
        removeColumn,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
        confirmDialogOpen,
        confirmDialogTitle,
        confirmDialogMessage,
        confirmDialogAction,
        showConfirmDialog,
        hideConfirmDialog,
      }}
    >
      {children}
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{confirmDialogTitle}</DialogTitle>
            <DialogDescription>{confirmDialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={hideConfirmDialog}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={async () => {
                try {
                  await confirmDialogAction();
                } finally {
                  hideConfirmDialog();
                }
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TaskContext.Provider>
  );
};

// Custom hook to use the task context
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  
  return context;
};
