
import React from 'react';
import { useForm } from 'react-hook-form';
import { Loader, X as CloseIcon } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Project } from '@/types/project';

interface ProjectFormData {
  name: string;
  description: string;
}

interface ProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => Promise<any>;
  project: Project | null;
  isProcessing: boolean;
}

const ProjectDialog: React.FC<ProjectDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  project,
  isProcessing
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
    },
  });

  // Reset form when dialog opens/closes or project changes
  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: project?.name || '',
        description: project?.description || '',
      });
    }
  }, [isOpen, project, reset]);

  const onSubmit = async (data: ProjectFormData) => {
    await onSave(data.name, data.description || undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {project ? 'Edit Project' : 'Create New Project'}
            </DialogTitle>
            <DialogDescription>
              {project
                ? 'Update your project details below.'
                : 'Fill in the details to create a new project.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name', { required: 'Project name is required' })}
                placeholder="Enter project name"
                className={errors.name ? 'border-destructive' : ''}
                disabled={isProcessing}
              />
              {errors.name && (
                <p className="text-destructive text-sm">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe the purpose of this project board"
                rows={4}
                className={errors.description ? 'border-destructive' : ''}
                disabled={isProcessing}
              />
              {errors.description && (
                <p className="text-destructive text-sm">{errors.description.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {project ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{project ? 'Update Project' : 'Create Project'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDialog;
