
import { useTaskFetcher } from './useTaskFetcher';
import { useTaskMutations } from './useTaskMutations';
import { useColumns } from './useColumns';

export const useStandaloneTasks = (projectId?: string | null) => {
  const { tasks, setTasks, isLoading, error, setError, refreshTasks } = useTaskFetcher(projectId);
  const { columns } = useColumns(projectId);
  const { addTask, updateTask, deleteTask, changeTaskStatus } = useTaskMutations(
    tasks,
    setTasks,
    setError,
    projectId
  );

  return {
    tasks,
    columns,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    refreshTasks
  };
};
