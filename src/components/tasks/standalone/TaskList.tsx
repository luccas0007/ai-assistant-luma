
import React from 'react';
import { Task, Column } from '@/types/task';
import TaskItem from './TaskItem';
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
  // Group tasks by completion status for easier display
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  if (tasks.length === 0) {
    return <EmptyState filter={filter} />;
  }

  if (filter === 'active') {
    return activeTasks.length > 0 ? (
      <div className="space-y-2">
        {activeTasks.map(task => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            toggleTaskCompletion={toggleTaskCompletion}
            changeTaskPriority={changeTaskPriority}
            columns={columns}
          />
        ))}
      </div>
    ) : (
      <EmptyState filter="active" />
    );
  }

  if (filter === 'completed') {
    return completedTasks.length > 0 ? (
      <div className="space-y-2">
        {completedTasks.map(task => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            toggleTaskCompletion={toggleTaskCompletion}
            changeTaskPriority={changeTaskPriority}
            columns={columns}
          />
        ))}
      </div>
    ) : (
      <EmptyState filter="completed" />
    );
  }

  return (
    <div className="space-y-4">
      {activeTasks.length > 0 && (
        <div className="space-y-2">
          {activeTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              toggleTaskCompletion={toggleTaskCompletion}
              changeTaskPriority={changeTaskPriority}
              columns={columns}
            />
          ))}
        </div>
      )}
      
      {completedTasks.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">
            Completed ({completedTasks.length})
          </h4>
          <div className="space-y-2">
            {completedTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                toggleTaskCompletion={toggleTaskCompletion}
                changeTaskPriority={changeTaskPriority}
                columns={columns}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
