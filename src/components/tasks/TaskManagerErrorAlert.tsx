
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface TaskManagerErrorAlertProps {
  error: string | null;
  projectError: string | null;
  handleRetry: () => void;
  handleDismissError: () => void;
}

const TaskManagerErrorAlert: React.FC<TaskManagerErrorAlertProps> = ({
  error,
  projectError,
  handleRetry,
  handleDismissError
}) => {
  if (!error && !projectError) return null;
  
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        <div className="flex flex-col gap-2">
          <p>{error || projectError}</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" className="self-start" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button variant="outline" size="sm" className="self-start" onClick={handleDismissError}>
              Dismiss
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default TaskManagerErrorAlert;
