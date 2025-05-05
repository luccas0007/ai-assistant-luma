
import { useState } from 'react';
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

  return {
    // Task state
    tasks,
    setTasks,
    
    // Column state
    columns,
    setColumns,
    
    // UI state
    isLoading,
    setIsLoading,
    error,
    setError,
    viewMode,
    setViewMode,
    
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
