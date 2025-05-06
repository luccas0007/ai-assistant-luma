
import React from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import ListView from '@/components/tasks/ListView';
import LoadingState from '@/components/tasks/LoadingState';
import EmptyProjectState from '@/components/tasks/EmptyProjectState';
import EmptyTasksState from '@/components/tasks/EmptyTasksState';
import { Task } from '@/types/task';
import { Column } from '@/types/task';

interface TaskBoardContentProps {
  isLoading: boolean;
  isLoadingProjects: boolean;
  activeProject: any;
  tasks: Task[];
  columns: Column[];
  viewMode: 'kanban' | 'list';
  error: string | null;
  onDragEnd: (result: DropResult) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onCreateProject: () => void;
  onCreateTask: () => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
}

const TaskBoardContent: React.FC<TaskBoardContentProps> = ({
  isLoading,
  isLoadingProjects,
  activeProject,
  tasks,
  columns,
  viewMode,
  error,
  onDragEnd,
  onEditTask,
  onDeleteTask,
  onCreateProject,
  onCreateTask,
  onStatusChange
}) => {
  if (isLoading || isLoadingProjects) {
    return <LoadingState />;
  }
  
  if (!activeProject) {
    return <EmptyProjectState onCreateProject={onCreateProject} />;
  }
  
  if (tasks.length === 0 && !error) {
    return <EmptyTasksState onCreateTask={onCreateTask} />;
  }
  
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {viewMode === 'kanban' ? (
        <KanbanBoard 
          tasks={tasks} 
          columns={columns} 
          onEditTask={onEditTask} 
          onDeleteTask={onDeleteTask}
        />
      ) : (
        <ListView 
          tasks={tasks} 
          columns={columns} 
          onEditTask={onEditTask} 
          onDeleteTask={onDeleteTask}
          onStatusChange={onStatusChange}
        />
      )}
    </DragDropContext>
  );
};

export default TaskBoardContent;
