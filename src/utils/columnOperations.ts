
// This file is maintained for backward compatibility
// It re-exports from the new modular column utility files

import { 
  createDefaultColumns,
  fetchProjectColumns,
  createColumn,
  deleteColumn
} from './columns';

// Export types with proper 'export type' syntax for TypeScript modules
export { createDefaultColumns, fetchProjectColumns, createColumn, deleteColumn };
export type { ColumnOperationResponse, ColumnData } from './columns/types';
