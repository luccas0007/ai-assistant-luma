
// This file will be deprecated. Please use '@/utils/tasks' instead.
// Re-exports for backward compatibility

import { setupTaskDatabase } from './tasks/setup';
import { fetchUserTasks } from './tasks/queries';
import { initializeTaskSystem } from './tasks';

export {
  setupTaskDatabase,
  fetchUserTasks,
  initializeTaskSystem
};
