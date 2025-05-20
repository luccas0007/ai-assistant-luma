
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import TaskBoardHeader from '@/components/tasks/TaskBoardHeader';
import TaskBoardContent from '@/components/tasks/TaskBoardContent';
import { useTaskContext } from '@/context/TaskContext';

interface TaskBoardContainerProps {
  viewMode: 'kanban' | 'list';
  onCreateTask: () => void;
  onCreateProject: () => void;
  onAddColumn: () => void;
}

const TaskBoardContainer: React.FC<TaskBoardContainerProps> = ({
  viewMode,
  onCreateTask,
  onCreateProject,
  onAddColumn,
}) => {
  const { state } = useTaskContext();
  const { activeProject, isLoading, isProcessing } = state;

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
          viewMode={viewMode}
          onCreateProject={onCreateProject}
          onCreateTask={onCreateTask}
        />
      </CardContent>
    </Card>
  );
};

export default TaskBoardContainer;
