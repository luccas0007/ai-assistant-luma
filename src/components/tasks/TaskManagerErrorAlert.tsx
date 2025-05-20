
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useTaskContext } from '@/context/TaskContext';

const TaskManagerErrorAlert: React.FC = () => {
  const { state, fetchTasks, fetchProjects } = useTaskContext();
  const { error } = state;

  if (!error) {
    return null;
  }

  const handleRetry = () => {
    fetchProjects();
    fetchTasks();
  };

  const handleDismissError = () => {
    // Clear error in the context
    const { dispatch } = useTaskContext();
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="flex justify-between items-center">
        <span>{error}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
          <Button variant="outline" size="sm" onClick={handleDismissError}>
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default TaskManagerErrorAlert;
