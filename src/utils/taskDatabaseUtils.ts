
// This file is kept for backward compatibility
// It re-exports all task utilities from the new modular structure

import { 
  setupTaskDatabase, 
  setupTaskStorage, 
  fetchUserTasks, 
  initializeTaskSystem 
} from './tasks';

export {
  setupTaskDatabase,
  setupTaskStorage,
  fetchUserTasks,
  initializeTaskSystem
};
