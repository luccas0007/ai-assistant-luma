import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DropResult } from 'react-beautiful-dnd';
import { useToast } from '@/hooks/use-toast';

import { useAuth } from '@/context/AuthContext';
import { Task, Column } from '@/types/task';
import { setupTaskDatabase, fetchUserTasks } from '@/utils/taskDatabaseUtils';
import { createTask, updateTask, deleteTask, updateTaskStatus } from '@/utils/taskOperations';
import { loadColumns, saveColumns, createColumn } from '@/utils/columnUtils';

export const useTaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize database if needed
  useEffect(() => {
    if (!user) return;
    
    const initDb = async () => {
      try {
        await setupTaskDatabase();
      } catch (error: any) {
        console.error('Error setting up database:', error.message);
        toast({
          title: 'Database setup error',
          description: 'Could not initialize database. Please try again later.',
          variant: 'destructive'
        });
      }
    };
    
    initDb();
  }, [user, toast]);

  // Load columns from local storage
  useEffect(() => {
    const loadedColumns = loadColumns();
    if (loadedColumns.length === 0) {
      // Initialize with default columns if none exist
      const defaultColumns = [
        { id: 'todo', title: 'To Do' },
        { id: 'in-progress', title: 'In Progress' },
        { id: 'done', title: 'Done' }
      ];
      setColumns(defaultColumns);
      saveColumns(defaultColumns);
    } else {
      setColumns(loadedColumns);
    }
  }, []);

  // Fetch tasks from Supabase
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadTasks = async () => {
      setIsLoading(true);
      try {
        // First make sure the database is set up
        await setupTaskDatabase();
        
        const { data, error } = await fetchUserTasks(user.id);
        
        if (error) {
          throw error;
        }
        
        setTasks(data);
      } catch (error: any) {
        console.error('Error fetching tasks:', error.message);
        toast({
          title: 'Error fetching tasks',
          description: error.message || 'Failed to load your tasks',
          variant: 'destructive'
        });
        // Set empty tasks array to prevent undefined errors
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [user, navigate, toast]);

  const handleCreateTask = async (newTask: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to create tasks',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log("Creating task with data:", newTask);
      
      // Clear any previous errors
      const { data, error } = await createTask(user.id, newTask);
      
      if (error) {
        console.error('Task creation error details:', error);
        let errorMessage = 'An error occurred while creating the task';
        
        if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }
        
        toast({
          title: 'Error creating task',
          description: errorMessage,
          variant: 'destructive'
        });
        throw error;
      }

      if (!data || data.length === 0) {
        toast({
          title: 'Task creation issue',
          description: 'Task was created but no data was returned. Refreshing may be needed.',
          variant: 'destructive'
        });
        // Reload tasks to ensure we have the latest data
        const { data: refreshedTasks } = await fetchUserTasks(user.id);
        setTasks(refreshedTasks);
        setTaskDialogOpen(false);
        return;
      }

      console.log("Task created successfully:", data);
      setTasks(prev => [...data, ...prev]);
      toast({
        title: 'Task created',
        description: 'Your task has been created successfully.'
      });
      setTaskDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error creating task',
        description: error.message || 'An error occurred while creating the task',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      const { error } = await updateTask(updatedTask);

      if (error) {
        throw error;
      }

      setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
      toast({
        title: 'Task updated',
        description: 'Your task has been updated successfully.'
      });
      setEditingTask(null);
      setTaskDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating task:', error.message);
      toast({
        title: 'Error updating task',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const { error } = await deleteTask(id);

      if (error) {
        throw error;
      }

      setTasks(tasks.filter(task => task.id !== id));
      toast({
        title: 'Task deleted',
        description: 'Your task has been deleted successfully.'
      });
    } catch (error: any) {
      console.error('Error deleting task:', error.message);
      toast({
        title: 'Error deleting task',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside of a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Find the task
    const taskToMove = tasks.find(task => task.id === draggableId);
    if (!taskToMove) return;

    // Create a new task with updated status
    const updatedTask = {
      ...taskToMove,
      status: destination.droppableId as string
    };

    // Optimistically update UI
    setTasks(
      tasks.map(task => (task.id === draggableId ? updatedTask : task))
    );

    // Update in the database
    try {
      const { error } = await updateTaskStatus(draggableId, destination.droppableId);

      if (error) {
        throw error;
      }
      
      // Success toast
      toast({
        title: 'Task moved',
        description: `Task moved to ${columns.find(c => c.id === destination.droppableId)?.title || destination.droppableId}`
      });
    } catch (error: any) {
      console.error('Error updating task status:', error.message);
      toast({
        title: 'Error updating task',
        description: error.message,
        variant: 'destructive'
      });
      // Revert UI change if API call failed
      setTasks([...tasks]);
    }
  };

  const handleAddColumn = () => {
    const newColumn = createColumn(newColumnTitle, columns);
    
    if (!newColumn) {
      toast({
        title: 'Column already exists',
        description: 'A column with this name already exists',
        variant: 'destructive'
      });
      return;
    }
    
    setColumns([...columns, newColumn]);
    setNewColumnTitle('');
    setColumnDialogOpen(false);
    
    toast({
      title: 'Column added',
      description: `Column "${newColumnTitle}" has been added.`
    });
  };

  return {
    tasks,
    columns,
    isLoading,
    viewMode,
    setViewMode,
    taskDialogOpen,
    setTaskDialogOpen,
    editingTask,
    setEditingTask,
    columnDialogOpen,
    setColumnDialogOpen,
    newColumnTitle,
    setNewColumnTitle,
    handleCreateTask,
    handleUpdateTask: updateTask, 
    handleDeleteTask,
    handleDragEnd,
    handleAddColumn
  };
};
