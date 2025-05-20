
import React from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import ListView from '@/components/tasks/ListView';
import LoadingState from '@/components/tasks/LoadingState';
import EmptyProjectState from '@/components/tasks/EmptyProjectState';
import EmptyTasksState from '@/components/tasks/EmptyTasksState';
import { useTaskContext } from '@/context/TaskContext';

interface TaskBoardContentProps {
  viewMode: 'kanban' | 'list';
  onCreateProject: () => void;
  onCreateTask: () => void;
}

const TaskBoardContent: React.FC<TaskBoardContentProps> = ({
  viewMode,
  onCreateProject,
  onCreateTask
}) => {
  const { 
    state, 
    moveTask, 
    updateTask, 
    showConfirmDialog,
    deleteTask,
    removeColumn
  } = useTaskContext();
  
  const { 
    tasks, 
    columns, 
    activeProject, 
    isLoading 
  } = state;

  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Move the task to the new column
    moveTask(draggableId, destination.droppableId);
  };

  // Handle task edit
  const handleEditTask = (task: Task) => {
    onEditTask(task);
  };

  // Handle task deletion with confirmation
  const handleDeleteTask = (taskId: string) => {
    showConfirmDialog(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      async () => {
        await deleteTask(taskId);
      }
    );
  };

  // Handle column deletion with confirmation
  const handleDeleteColumn = (columnId: string) => {
    showConfirmDialog(
      'Delete Column',
      'Are you sure you want to delete this column? All tasks will be moved to the default column.',
      async () => {
        await removeColumn(columnId);
      }
    );
  };

  // Handle status change for list view
  const handleStatusChange = (taskId: string, newStatus: string) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (taskToUpdate) {
      const updatedTask = {...taskToUpdate, column_id: newStatus};
      updateTask(updatedTask);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }
  
  if (!activeProject) {
    return <EmptyProjectState onCreateProject={onCreateProject} />;
  }
  
  // Filter columns to only show those belonging to the active project
  const projectColumns = columns.filter(column => 
    column.project_id === activeProject.id
  );
  
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
  
  if (projectTasks.length === 0) {
    return <EmptyTasksState onCreateTask={onCreateTask} />;
  }
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {viewMode === 'kanban' ? (
        <KanbanBoard 
          tasks={projectTasks} 
          columns={projectColumns} 
          onEditTask={handleEditTask} 
          onDeleteTask={handleDeleteTask}
          onDeleteColumn={handleDeleteColumn}
        />
      ) : (
        <ListView 
          tasks={projectTasks} 
          columns={projectColumns} 
          onEditTask={handleEditTask} 
          onDeleteTask={handleDeleteTask}
          onStatusChange={handleStatusChange}
        />
      )}
    </DragDropContext>
  );
};

export default TaskBoardContent;
