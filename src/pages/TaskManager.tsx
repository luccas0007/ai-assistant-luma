
import React, { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { TaskProvider, useTaskContext } from '@/context/TaskContext';

// Import our components
import ProjectToolbar from '@/components/tasks/ProjectToolbar';
import TaskManagerErrorAlert from '@/components/tasks/TaskManagerErrorAlert';
import TaskBoardContainer from '@/components/tasks/TaskBoardContainer';
import TaskDialog from '@/components/tasks/TaskDialog';
import ColumnDialog from '@/components/tasks/ColumnDialog';
import ProjectDialog from '@/components/tasks/ProjectDialog';
import DeleteProjectDialog from '@/components/tasks/DeleteProjectDialog';

const TaskManagerContent = () => {
  const { 
    state, 
    createProject, 
    updateProject, 
    deleteProject, 
    setActiveProject,
    showConfirmDialog,
    addColumn
  } = useTaskContext();
  
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const { projects, activeProject, isProcessing } = state;

  // Open task dialog for creating a new task
  const handleCreateTask = () => {
    setEditingTask(null);
    setTaskDialogOpen(true);
  };

  // Open task dialog for editing a task
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  // Handle project selection
  const handleSelectProject = (project: Project | null) => {
    setActiveProject(project);
  };

  // Open project dialog for creating a new project
  const handleCreateProject = () => {
    setEditingProject(null);
    setProjectDialogOpen(true);
  };

  // Open project dialog for editing a project
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectDialogOpen(true);
  };

  // Confirm deleting a project
  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setDeleteProjectDialogOpen(true);
  };

  // Handle saving project (create or update)
  const handleSaveProject = async (name: string, description?: string) => {
    if (editingProject) {
      await updateProject({
        ...editingProject,
        name,
        description: description || null
      });
    } else {
      await createProject(name, description);
    }
    setProjectDialogOpen(false);
  };

  // Handle confirm project delete
  const handleConfirmDeleteProject = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete.id);
    }
    setDeleteProjectDialogOpen(false);
  };

  // Handle adding a new column
  const handleAddColumn = () => {
    setColumnDialogOpen(true);
  };

  // Handle saving a new column
  const handleSaveColumn = async (title: string) => {
    if (title.trim() === '') return;
    
    await addColumn(title);
    setColumnDialogOpen(false);
  };

  // Handle attachment upload (stub implementation)
  const handleUploadAttachment = async (file: File) => {
    console.log("Upload attachment stub - not implemented");
    // Implement file upload to Supabase storage here
    return { success: false, url: null };
  };

  return (
    <div className="space-y-6">
      <ProjectToolbar
        projects={projects}
        activeProject={activeProject}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
        isLoadingProjects={state.isLoading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <TaskManagerErrorAlert />

      <TaskBoardContainer 
        viewMode={viewMode}
        onCreateTask={handleCreateTask}
        onCreateProject={handleCreateProject}
        onAddColumn={handleAddColumn}
      />
      
      {/* Task Dialog */}
      <TaskDialog
        isOpen={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        task={editingTask}
        onUploadAttachment={handleUploadAttachment}
      />
      
      {/* Column Dialog */}
      <ColumnDialog
        isOpen={columnDialogOpen}
        onClose={() => setColumnDialogOpen(false)}
        onSave={handleSaveColumn}
        isProcessing={isProcessing}
      />
      
      {/* Project Dialog */}
      <ProjectDialog
        isOpen={projectDialogOpen}
        onClose={() => setProjectDialogOpen(false)}
        onSave={handleSaveProject}
        project={editingProject}
        isProcessing={isProcessing}
      />
      
      {/* Delete Project Dialog */}
      <DeleteProjectDialog
        isOpen={deleteProjectDialogOpen}
        onClose={() => setDeleteProjectDialogOpen(false)}
        onConfirm={handleConfirmDeleteProject}
        project={projectToDelete}
        isProcessing={isProcessing}
      />
      
      <Toaster />
    </div>
  );
};

const TaskManager = () => {
  return (
    <TaskProvider>
      <TaskManagerContent />
    </TaskProvider>
  );
};

export default TaskManager;
