
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import TaskBoardHeader from '@/components/tasks/TaskBoardHeader';
import TaskBoardContent from '@/components/tasks/TaskBoardContent';
import { DropResult } from 'react-beautiful-dnd';
import { Task, Column } from '@/types/task';
import { Project } from '@/types/project';

interface TaskBoardContainerProps {
  activeProject: Project | null;
  tasks: Task[];
  columns: Column[];
  viewMode: 'kanban' | 'list';
  isProcessing: boolean;
  isLoading: boolean;
  isLoadingProjects: boolean;
  error: string | null;
  onCreateTask: () => void;
  onCreateProject: () => void;
  onAddColumn: () => void;
  onDragEnd: (result: DropResult) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
}

const TaskBoardContainer: React.FC<TaskBoardContainerProps> = ({
  activeProject,
  tasks,
  columns,
  viewMode,
  isProcessing,
  isLoading,
  isLoadingProjects,
  error,
  onCreateTask,
  onCreateProject,
  onAddColumn,
  onDragEnd,
  onEditTask,
  onDeleteTask,
  onDeleteColumn,
  onStatusChange
}) => {
  return (
    <Card>
      <TaskBoardHeader
        title={activeProject ? activeProject.name : 'Project Board'}
        onAddColumn={onAddColumn}
        onAddTask={onCreateTask}
        isProcessing={isProcessing}
        isLoading={isLoading}
        isProjectSelected={!!activeProject}
      />
      
      <CardContent>
        <TaskBoardContent
          isLoading={isLoading}
          isLoadingProjects={isLoadingProjects}
          activeProject={activeProject}
          tasks={tasks}
          columns={columns}
          viewMode={viewMode}
          error={error}
          onDragEnd={onDragEnd}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onDeleteColumn={onDeleteColumn}
          onCreateProject={onCreateProject}
          onCreateTask={onCreateTask}
          onStatusChange={onStatusChange}
        />
      </CardContent>
    </Card>
  );
};

export default TaskBoardContainer;
