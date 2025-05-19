
import React, { useEffect } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import ListView from '@/components/tasks/ListView';
import LoadingState from '@/components/tasks/LoadingState';
import EmptyProjectState from '@/components/tasks/EmptyProjectState';
import EmptyTasksState from '@/components/tasks/EmptyTasksState';
import { Task } from '@/types/task';
import { Column } from '@/types/task';
import { Project } from '@/types/project';

interface TaskBoardContentProps {
  isLoading: boolean;
  isLoadingProjects: boolean;
  activeProject: Project | null;
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
  onDeleteColumn?: (columnId: string) => void;
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
  onStatusChange,
  onDeleteColumn
}) => {
  // Debug logging to help track issues with board loading
  useEffect(() => {
    if (activeProject) {
      console.log("TaskBoardContent: Project loaded:", activeProject.id, activeProject.name);
      console.log("TaskBoardContent: Columns loaded:", columns.length, columns.map(c => ({id: c.id, title: c.title, project_id: c.project_id})));
      console.log("TaskBoardContent: Tasks loaded:", tasks.length, tasks.map(t => ({id: t.id, title: t.title, column_id: t.column_id})));
    }
  }, [activeProject, columns, tasks]);

  if (isLoading || isLoadingProjects) {
    return <LoadingState />;
  }
  
  if (!activeProject) {
    return <EmptyProjectState onCreateProject={onCreateProject} />;
  }
  
  // Filter columns to only show those belonging to the active project
  const projectColumns = columns.filter(column => 
    column.project_id === activeProject.id
  );
  
  useEffect(() => {
    if (activeProject && projectColumns.length === 0) {
      console.log("No columns found for project:", activeProject.id);
    }
  }, [activeProject, projectColumns]);
  
  if (projectColumns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <h3 className="text-xl font-semibold mb-2">No Columns Available</h3>
        <p className="text-muted-foreground mb-4">
          This project doesn't have any columns set up yet.
        </p>
        <EmptyTasksState onCreateTask={onCreateTask} />
      </div>
    );
  }
  
  // Filter tasks to show only those belonging to the current project
  const projectTasks = tasks.filter(task => task.project_id === activeProject.id);
  
  if (projectTasks.length === 0 && !error) {
    return <EmptyTasksState onCreateTask={onCreateTask} />;
  }
  
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {viewMode === 'kanban' ? (
        <KanbanBoard 
          tasks={projectTasks} 
          columns={projectColumns} 
          onEditTask={onEditTask} 
          onDeleteTask={onDeleteTask}
          onDeleteColumn={onDeleteColumn}
        />
      ) : (
        <ListView 
          tasks={projectTasks} 
          columns={projectColumns} 
          onEditTask={onEditTask} 
          onDeleteTask={onDeleteTask}
          onStatusChange={onStatusChange}
        />
      )}
    </DragDropContext>
  );
};

export default TaskBoardContent;
