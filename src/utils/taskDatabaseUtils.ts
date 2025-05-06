
// This file is kept for backward compatibility
// It re-exports all task utilities from the new modular structure

import { 
  setupTaskDatabase, 
  fetchUserTasks, 
  initializeTaskSystem 
} from './tasks';

export {
  setupTaskDatabase,
  fetchUserTasks,
  initializeTaskSystem
};
