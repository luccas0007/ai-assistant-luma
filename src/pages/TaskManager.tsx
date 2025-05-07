
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { useProjectManager } from '@/hooks/project-manager';
import useTaskManager from '@/hooks/task-manager';

// Import our components
import ProjectToolbar from '@/components/tasks/ProjectToolbar';
import TaskManagerErrorAlert from '@/components/tasks/TaskManagerErrorAlert';
import TaskBoardContainer from '@/components/tasks/TaskBoardContainer';
import TaskDialogsSection from '@/components/tasks/TaskDialogsSection';
import ProjectManagementSection from '@/components/tasks/ProjectManagementSection';

const TaskManager = () => {
  const projectManager = useProjectManager();
  const taskManager = useTaskManager();
  
  const {
    // Project state & actions
    projects,
    activeProject,
    isLoadingProjects,
    projectError,
    setProjectError,
    projectDialogOpen,
    setProjectDialogOpen,
    editingProject,
    setEditingProject,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject
  } = projectManager;
  
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
    
    // Task actions
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleDragEnd,
    handleAddColumn,
    handleDeleteColumn,
    handleUploadAttachment,
    refreshTasks
  } = taskManager;
  
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
      const updatedTask = {...taskToUpdate, status: newStatus, column_id: newStatus};
      handleUpdateTask(updatedTask);
    }
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

  return (
    <div className="space-y-6">
      <ProjectToolbar
        projects={projects}
        activeProject={activeProject}
        onSelectProject={projectManager.setActiveProject}
        onCreateProject={handleCreateNewProject}
        onEditProject={setEditingProject}
        onDeleteProject={(project) => handleDeleteProject(project.id)}
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

      <TaskBoardContainer 
        activeProject={activeProject}
        tasks={tasks}
        columns={columns}
        viewMode={viewMode}
        isProcessing={isProcessing}
        isLoading={isLoading}
        isLoadingProjects={isLoadingProjects}
        error={error}
        onCreateTask={handleCreateNewTask}
        onCreateProject={handleCreateNewProject}
        onAddColumn={() => setColumnDialogOpen(true)}
        onDragEnd={handleDragEnd}
        onEditTask={setEditingTask}
        onDeleteTask={handleDeleteTask}
        onDeleteColumn={handleDeleteColumn}
        onStatusChange={handleStatusChange}
      />
      
      <TaskDialogsSection
        taskDialogOpen={taskDialogOpen}
        setTaskDialogOpen={setTaskDialogOpen}
        editingTask={editingTask}
        setEditingTask={setEditingTask}
        columnDialogOpen={columnDialogOpen}
        setColumnDialogOpen={setColumnDialogOpen}
        newColumnTitle={newColumnTitle}
        setNewColumnTitle={setNewColumnTitle}
        handleAddColumn={handleAddColumn}
        handleCreateTask={handleCreateTask}
        handleUpdateTask={handleUpdateTask}
        handleUploadAttachment={handleUploadAttachment}
        columns={columns}
        projects={projects}
        activeProject={activeProject}
        isProcessing={isProcessing}
      />
      
      <ProjectManagementSection 
        projectDialogOpen={projectDialogOpen}
        setProjectDialogOpen={setProjectDialogOpen}
        editingProject={editingProject}
        setEditingProject={setEditingProject}
        isProcessing={isProcessing}
        handleSaveProject={handleSaveProject}
        handleDeleteProject={handleDeleteProject}
      />
      
      <Toaster />
    </div>
  );
};

export default TaskManager;
