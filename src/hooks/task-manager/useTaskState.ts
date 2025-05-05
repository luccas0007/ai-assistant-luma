
import { useState } from 'react';
import { Task, Column } from '@/types/task';
import { loadColumns } from '@/utils/columnUtils';

/**
 * Hook for managing the state of the task manager
 */
export const useTaskState = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
