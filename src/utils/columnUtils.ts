
import { Column } from '@/types/task';

// Default columns for the Kanban board with required properties
export const defaultColumns: Column[] = [
  { 
    id: 'todo', 
    title: 'To Do',
    user_id: '',  // Will be populated when actually used
    project_id: '', // Will be populated when actually used
    position: 0
  },
  { 
    id: 'in-progress', 
    title: 'In Progress',
    user_id: '',  // Will be populated when actually used
    project_id: '', // Will be populated when actually used
    position: 1
  },
  { 
    id: 'done', 
    title: 'Done',
    user_id: '',  // Will be populated when actually used
    project_id: '', // Will be populated when actually used
    position: 2
  }
];

/**
 * Loads columns from local storage or returns defaults
 */
export const loadColumns = (): Column[] => {
  const storedColumns = localStorage.getItem('kanban-columns');
  if (storedColumns) {
    try {
      return JSON.parse(storedColumns);
    } catch (e) {
      console.error('Error parsing stored columns:', e);
      return defaultColumns;
    }
  }
  return defaultColumns;
};

/**
 * Saves columns to local storage
 */
export const saveColumns = (columns: Column[]): void => {
  localStorage.setItem('kanban-columns', JSON.stringify(columns));
};

/**
 * Creates a new column with a unique ID
 */
export const createColumn = (title: string, existingColumns: Column[]): Column | null => {
  if (!title.trim()) return null;
  
  const newColumnId = title.toLowerCase().replace(/\s+/g, '-');
  
  // Check for duplicate column id
  if (existingColumns.some(col => col.id === newColumnId)) {
    return null;
  }
  
  return {
    id: newColumnId,
    title: title,
    user_id: '',  // Will be populated when actually used
    project_id: '', // Will be populated when actually used
    position: existingColumns.length // Set position to the end of the list
  };
};
