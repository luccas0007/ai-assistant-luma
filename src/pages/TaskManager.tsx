
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { useProjectManager } from '@/hooks/project-manager';

// Import our new components
import ProjectToolbar from '@/components/tasks/ProjectToolbar';
import TaskManagerErrorAlert from '@/components/tasks/TaskManagerErrorAlert';
import TaskBoardHeader from '@/components/tasks/TaskBoardHeader';
import TaskBoardContent from '@/components/tasks/TaskBoardContent';
import ColumnDialog from '@/components/tasks/ColumnDialog';
import DeleteProjectDialog from '@/components/tasks/DeleteProjectDialog';
import TaskDialog from '@/components/tasks/TaskDialog';
import ProjectDialog from '@/components/projects/ProjectDialog';

const TaskManager = () => {
  // Project deletion state
  const [projectToDelete, setProjectToDelete] = useState<null | { id: string; name: string }>(null);
  
  const {
    // Task state
    tasks,
    columns,
    isLoading,
    error,
    setError,
    isProcessing,
    viewMode,
    setViewMode,
    taskDialogOpen,
    setTaskDialogOpen,
    editingTask,
    setEditingTask,
    columnDialogOpen,
    setColumnDialogOpen,
    newColumnTitle,
    setNewColumnTitle,
    
    // Project state
    projects,
    activeProject,
    isLoadingProjects,
    projectError,
    setProjectError,
    projectDialogOpen,
    setProjectDialogOpen,
    editingProject,
    setEditingProject,
    
    // Actions
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleDragEnd,
    handleAddColumn,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    setActiveProject,
    handleUploadAttachment,
    refreshTasks
  } = useProjectManager();
  
  const handleRetry = () => {
    refreshTasks();
  };
  
  const handleDismissError = () => {
    setError(null);
    setProjectError(null);
  };
  
  const handleCreateNewProject = () => {
    setEditingProject(null);
    setProjectDialogOpen(true);
  };
  
  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setProjectDialogOpen(true);
  };
  
  const handleDeleteProjectRequest = (project: any) => {
    setProjectToDelete({
      id: project.id,
      name: project.name
    });
  };
  
  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    
    await handleDeleteProject(projectToDelete.id);
    setProjectToDelete(null);
  };
  
  const handleSaveProject = async (name: string, description?: string) => {
    if (editingProject) {
      await handleUpdateProject({
        ...editingProject,
        name,
        description: description || null
      });
    } else {
      await handleCreateProject(name, description);
    }
  };
  
  const handleCreateNewTask = () => {
    try {
      setEditingTask(null);
      setTaskDialogOpen(true);
    } catch (error) {
      console.error("Error opening task dialog:", error);
    }
  };
  
  const handleStatusChange = (taskId: string, newStatus: string) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (taskToUpdate) {
      const updatedTask = {...taskToUpdate, status: newStatus};
      handleUpdateTask(updatedTask);
    }
  };

  return (
    <div className="space-y-6">
      <ProjectToolbar
        projects={projects}
        activeProject={activeProject}
        onSelectProject={setActiveProject}
        onCreateProject={handleCreateNewProject}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProjectRequest}
        isLoadingProjects={isLoadingProjects}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <TaskManagerErrorAlert
        error={error}
        projectError={projectError}
        handleRetry={handleRetry}
        handleDismissError={handleDismissError}
      />

      <Card>
        <TaskBoardHeader
          title={activeProject ? activeProject.name : 'Project Board'}
          onAddColumn={() => setColumnDialogOpen(true)}
          onAddTask={handleCreateNewTask}
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
            onDragEnd={handleDragEnd}
            onEditTask={setEditingTask}
            onDeleteTask={handleDeleteTask}
            onCreateProject={handleCreateNewProject}
            onCreateTask={handleCreateNewTask}
            onStatusChange={handleStatusChange}
          />
        </CardContent>
      </Card>

      <TaskDialog
        isOpen={taskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false);
          setEditingTask(null);
        }}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
        onUploadAttachment={handleUploadAttachment}
        task={editingTask}
        columns={columns}
        projects={projects}
        activeProject={activeProject}
      />
      
      <ProjectDialog
        isOpen={projectDialogOpen}
        onClose={() => {
          setProjectDialogOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        project={editingProject}
        isProcessing={isProcessing}
      />
      
      <ColumnDialog
        isOpen={columnDialogOpen}
        onClose={() => setColumnDialogOpen(false)}
        title={newColumnTitle}
        onTitleChange={setNewColumnTitle}
        onAddColumn={handleAddColumn}
        isProcessing={isProcessing}
      />
      
      <DeleteProjectDialog
        isOpen={projectToDelete !== null}
        onClose={() => setProjectToDelete(null)}
        projectName={projectToDelete?.name || null}
        onConfirmDelete={confirmDeleteProject}
      />
      
      <Toaster />
    </div>
  );
};

export default TaskManager;
