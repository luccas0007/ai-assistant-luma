
import React from 'react';
import { Task, Column } from '@/types/task';
import TaskItem from '../standalone/TaskItem';
import EmptyState from './EmptyState';

interface TaskListProps {
  tasks: Task[];
  columns: Column[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  toggleTaskCompletion: (task: Task) => void;
  changeTaskPriority: (task: Task, newPriority: string) => void;
  filter: string;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  columns,
  onEditTask,
  onDeleteTask,
  toggleTaskCompletion,
  changeTaskPriority,
  filter
}) => {
  // Add debugging for edit task
  const handleEditTask = (task: Task) => {
    console.log("TaskList forwarding edit task:", task);
    onEditTask(task);
  };
  
  if (tasks.length === 0) {
    return <EmptyState filter={filter} />;
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEditTask={handleEditTask}
          onDeleteTask={onDeleteTask}
          toggleTaskCompletion={toggleTaskCompletion}
          changeTaskPriority={changeTaskPriority}
          columns={columns}
        />
      ))}
    </div>
  );
};

export default TaskList;
