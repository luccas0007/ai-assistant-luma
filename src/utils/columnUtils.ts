
import { Column } from '@/types/task';

// Default columns for the Kanban board
export const defaultColumns: Column[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' }
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
    title: title
  };
};
