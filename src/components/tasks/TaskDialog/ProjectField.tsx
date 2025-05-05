
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Project } from '@/types/project';

interface ProjectFieldProps {
  projects: Project[];
  projectId: string | null;
  setProjectId: (id: string | null) => void;
}

const ProjectField: React.FC<ProjectFieldProps> = ({
  projects,
  projectId,
  setProjectId
}) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="project">Project</Label>
      <Select 
        value={projectId || undefined} 
        onValueChange={(value) => setProjectId(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProjectField;
