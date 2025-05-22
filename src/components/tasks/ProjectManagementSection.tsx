
import React, { useState } from 'react';
import ProjectDialog from '@/components/projects/ProjectDialog';
import DeleteProjectDialog from '@/components/tasks/DeleteProjectDialog';
import { Project } from '@/types/project';

interface ProjectManagementSectionProps {
  projectDialogOpen: boolean;
  setProjectDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingProject: Project | null;
  setEditingProject: React.Dispatch<React.SetStateAction<Project | null>>;
  isProcessing: boolean;
  handleSaveProject: (name: string, description?: string) => Promise<void>;
  handleDeleteProject: (id: string) => Promise<boolean>; // Updated return type to match implementation
}

const ProjectManagementSection: React.FC<ProjectManagementSectionProps> = ({
  projectDialogOpen,
  setProjectDialogOpen,
  editingProject,
  setEditingProject,
  isProcessing,
  handleSaveProject,
  handleDeleteProject
}) => {
  // State for project deletion confirmation
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const handleCreateNewProject = () => {
    setEditingProject(null);
    setProjectDialogOpen(true);
  };
  
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectDialogOpen(true);
  };
  
  const handleDeleteProjectRequest = (project: Project) => {
    setProjectToDelete(project);
  };
  
  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    
    await handleDeleteProject(projectToDelete.id);
    setProjectToDelete(null);
  };

  return (
    <>
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
      
      <DeleteProjectDialog
        isOpen={projectToDelete !== null}
        onClose={() => setProjectToDelete(null)}
        project={projectToDelete}
        onConfirm={confirmDeleteProject}
        isProcessing={isProcessing}
      />
    </>
  );
};

export default ProjectManagementSection;
