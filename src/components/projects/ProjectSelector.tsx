
import React from 'react';
import { ChevronDown, FolderPlus, Settings, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Project } from '@/types/project';

interface ProjectSelectorProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  isLoading: boolean;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Button variant="outline" className="w-56 justify-start opacity-70" disabled>
        <span className="truncate">Loading projects...</span>
      </Button>
    );
  }

  if (projects.length === 0) {
    return (
      <Button
        variant="outline"
        className="w-56 justify-start"
        onClick={onCreateProject}
      >
        <FolderPlus className="mr-2 h-4 w-4" />
        <span>Create your first project</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-56 justify-between">
          <span className="flex items-center truncate">
            {activeProject?.name || 'Select a project'}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => onSelectProject(project)}
            className={activeProject?.id === project.id ? 'bg-accent' : ''}
          >
            <span className="truncate flex-1">{project.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onCreateProject}>
          <FolderPlus className="mr-2 h-4 w-4" />
          <span>New Project</span>
        </DropdownMenuItem>
        {activeProject && (
          <>
            <DropdownMenuItem onClick={() => onEditProject(activeProject)}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Edit Project</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDeleteProject(activeProject)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete Project</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProjectSelector;
