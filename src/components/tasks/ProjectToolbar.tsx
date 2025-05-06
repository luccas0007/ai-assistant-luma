
import React from 'react';
import { LayoutGrid, List as ListIcon } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import ProjectSelector from '@/components/projects/ProjectSelector';
import { Project } from '@/types/project';

interface ProjectToolbarProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  isLoadingProjects: boolean;
  viewMode: 'kanban' | 'list';
  onViewModeChange: (value: 'kanban' | 'list') => void;
}

const ProjectToolbar: React.FC<ProjectToolbarProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  isLoadingProjects,
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold mb-1">Projects</h1>
        <p className="text-muted-foreground">Organize your projects with kanban or list view</p>
      </div>
      
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <ProjectSelector
          projects={projects}
          activeProject={activeProject}
          onSelectProject={onSelectProject}
          onCreateProject={onCreateProject}
          onEditProject={onEditProject}
          onDeleteProject={onDeleteProject}
          isLoading={isLoadingProjects}
        />
        
        <div className="flex items-center">
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={(value) => value && onViewModeChange(value as 'kanban' | 'list')}
          >
            <ToggleGroupItem value="kanban" aria-label="Kanban View">
              <LayoutGrid className="h-4 w-4 mr-1" />
              Kanban
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List View">
              <ListIcon className="h-4 w-4 mr-1" />
              List
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
};

export default ProjectToolbar;
