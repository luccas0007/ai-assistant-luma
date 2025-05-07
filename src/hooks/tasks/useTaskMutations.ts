
import { Task } from '@/types/task';
import { useTaskAdd } from './mutations/useTaskAdd';
import { useTaskUpdate } from './mutations/useTaskUpdate';
import { useTaskDelete } from './mutations/useTaskDelete';
import { useTaskStatus } from './mutations/useTaskStatus';

export const useTaskMutations = (
  tasks: Task[], 
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>, 
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  projectId?: string | null
) => {
  const { addTask } = useTaskAdd(tasks, setTasks, projectId);
  const { updateTask } = useTaskUpdate(tasks, setTasks);
  const { deleteTask } = useTaskDelete(tasks, setTasks);
  const { changeTaskStatus } = useTaskStatus(tasks, setTasks);

  return {
    addTask,
    updateTask,
    deleteTask,
    changeTaskStatus
  };
};
