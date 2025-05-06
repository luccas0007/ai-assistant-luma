
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyTasksStateProps {
  onCreateTask: () => void;
}

const EmptyTasksState: React.FC<EmptyTasksStateProps> = ({ onCreateTask }) => {
  return (
    <div className="flex flex-col justify-center items-center h-64 gap-4 text-center">
      <div className="rounded-full bg-primary/10 p-6">
        <Plus className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-medium mb-1">No tasks yet</h3>
        <p className="text-muted-foreground mb-4">
          Create your first task to get started
        </p>
        <Button onClick={onCreateTask}>
          <Plus className="h-4 w-4 mr-1" />
          Create Task
        </Button>
      </div>
    </div>
  );
};

export default EmptyTasksState;
