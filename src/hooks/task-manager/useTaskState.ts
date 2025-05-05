
import { useState, useCallback } from 'react';
import { Task, Column } from '@/types/task';

/**
 * Hook for managing the state of the task manager
 */
export const useTaskState = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Create a callback to prevent unnecessary re-renders
  const updateTasks = useCallback((newTasks: Task[] | ((prevTasks: Task[]) => Task[])) => {
    setTasks(newTasks);
  }, []);

  // Safe error setting - ensure we always get a string
  const setErrorSafe = useCallback((err: unknown) => {
    if (err === null) {
      setError(null);
    } else if (typeof err === 'string') {
      setError(err);
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('An unknown error occurred');
    }
  }, []);

  return {
    // Task state
    tasks,
    setTasks: updateTasks,
    
    // Column state
    columns,
    setColumns,
    
    // UI state
    isLoading,
    setIsLoading,
    error,
    setError: setErrorSafe,
    viewMode,
    setViewMode,
    isProcessing,
    setIsProcessing,
    
    // Task dialog state
    taskDialogOpen,
    setTaskDialogOpen,
    editingTask,
    setEditingTask,
    
    // Column dialog state
    columnDialogOpen,
    setColumnDialogOpen,
    newColumnTitle,
    setNewColumnTitle,
  };
};

export default useTaskState;
