
import React, { useEffect } from 'react';
import { Task } from '@/types/task';
import TaskDialog from '@/components/tasks/TaskDialog';
import ColumnDialog from '@/components/tasks/ColumnDialog';
import { Project } from '@/types/project';
import { Column } from '@/types/task';

interface TaskDialogsSectionProps {
  taskDialogOpen: boolean;
  setTaskDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingTask: Task | null;
  setEditingTask: React.Dispatch<React.SetStateAction<Task | null>>;
  columnDialogOpen: boolean; 
  setColumnDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newColumnTitle: string;
  setNewColumnTitle: React.Dispatch<React.SetStateAction<string>>;
  handleAddColumn: () => Promise<void>;
  handleCreateTask: (task: Partial<Task>) => Promise<void>;
  handleUpdateTask: (task: Task) => Promise<void>;
  handleUploadAttachment: (file: File) => Promise<any>;
  columns: Column[];
  projects: Project[];
  activeProject: Project | null;
  isProcessing: boolean;
}

const TaskDialogsSection: React.FC<TaskDialogsSectionProps> = ({
  taskDialogOpen,
  setTaskDialogOpen,
  editingTask,
  setEditingTask,
  columnDialogOpen,
  setColumnDialogOpen,
  newColumnTitle,
  setNewColumnTitle,
  handleAddColumn,
  handleCreateTask,
  handleUpdateTask,
  handleUploadAttachment,
  columns,
  projects,
  activeProject,
  isProcessing
}) => {
  // Add debugging for task editing
  useEffect(() => {
    if (taskDialogOpen && editingTask) {
      console.log("TaskDialog opened for editing:", editingTask);
    }
  }, [taskDialogOpen, editingTask]);

  return (
    <>
      <TaskDialog
        isOpen={taskDialogOpen}
        onClose={() => {
          console.log("Closing task dialog");
          setTaskDialogOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onUploadAttachment={handleUploadAttachment}
        onSave={async (task) => {
          console.log("Saving task:", task);
          try {
            if (editingTask) {
              // Make a complete copy to ensure we have all required fields
              const updatedTask = { ...editingTask, ...task } as Task;
              await handleUpdateTask(updatedTask);
            } else {
              await handleCreateTask(task);
            }
          } finally {
            // Ensure dialog closes even if there's an error
            setTaskDialogOpen(false);
            setEditingTask(null);
          }
        }}
      />
      
      <ColumnDialog
        isOpen={columnDialogOpen}
        onClose={() => setColumnDialogOpen(false)}
        title={newColumnTitle}
        onTitleChange={setNewColumnTitle}
        onAddColumn={handleAddColumn}
        isProcessing={isProcessing}
      />
    </>
  );
};

export default TaskDialogsSection;
