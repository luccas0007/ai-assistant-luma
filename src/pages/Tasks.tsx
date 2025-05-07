
import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TaskStandaloneList from '@/components/tasks/TaskStandaloneList';
import { useStandaloneTasks } from '@/hooks/use-standalone-tasks';
import { useAuth } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';

const TasksPage: React.FC = () => {
  const {
    tasks,
    columns,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    changeTaskStatus
  } = useStandaloneTasks();
  
  const { user } = useAuth();
  
  // Handle authentication check
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <Check className="h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
        <p className="text-muted-foreground mb-6">
          Please log in to view and manage your tasks.
        </p>
        <Button asChild>
          <a href="/login">Log In</a>
        </Button>
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Tasks</h1>
          <p className="text-muted-foreground">Manage your tasks and deadlines</p>
        </div>
      </div>
      
      <TaskStandaloneList
        tasks={tasks}
        columns={columns}
        onAddTask={addTask}
        onEditTask={updateTask}
        onDeleteTask={deleteTask}
        onStatusChange={changeTaskStatus}
        isLoading={isLoading}
        title="My Tasks"
      />
      
      <Toaster />
    </div>
  );
};

export default TasksPage;
