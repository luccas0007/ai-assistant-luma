
// This file is maintained for backward compatibility
// It re-exports from the new modular column utility files

import { 
  createDefaultColumns,
  fetchProjectColumns,
  createColumn,
  deleteColumn,
  ColumnOperationResponse,
  ColumnData
} from './columns';

export {
  createDefaultColumns,
  fetchProjectColumns,
  createColumn,
  deleteColumn,
  ColumnOperationResponse,
  ColumnData
};
