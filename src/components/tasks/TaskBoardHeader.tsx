
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';

interface TaskBoardHeaderProps {
  title: string;
  onAddColumn: () => void;
  onAddTask: () => void;
  isProcessing: boolean;
  isLoading: boolean;
  isProjectSelected: boolean;
}

const TaskBoardHeader: React.FC<TaskBoardHeaderProps> = ({
  title,
  onAddColumn,
  onAddTask,
  isProcessing,
  isLoading,
  isProjectSelected
}) => {
  return (
    <CardHeader className="pb-3 flex flex-row items-center justify-between">
      <CardTitle className="text-lg font-medium">
        {title}
      </CardTitle>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onAddColumn} disabled={isProcessing || isLoading}>
          <Plus className="h-4 w-4 mr-1" />
          Add Column
        </Button>
        <Button onClick={onAddTask} disabled={isProcessing || isLoading || !isProjectSelected}>
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </div>
    </CardHeader>
  );
};

export default TaskBoardHeader;
