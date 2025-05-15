import React, { useEffect, useState } from 'react';
import { Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TaskStandaloneList from '@/components/tasks/TaskStandaloneList';
import { useStandaloneTasks } from '@/hooks/tasks';
import { useAuth } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { Skeleton } from '@/components/ui/skeleton';
import { Task } from '@/types/task';
import TaskDialog from '@/components/tasks/TaskDialog';
import { useToast } from '@/hooks/use-toast';

const TasksPage: React.FC = () => {
  const {
    tasks,
    columns,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    refreshTasks
  } = useStandaloneTasks();
  
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  
  useEffect(() => {
    // This effect helps debug render cycles
    console.log("Tasks page rendered - Auth status:", !!user, "Loading:", isLoading, "Tasks count:", tasks.length);
  });

  // Handle opening the edit dialog
  const handleEditTask = (task: Task) => {
    console.log("Opening edit dialog for task:", task);
    setEditingTask({...task});
    setTaskDialogOpen(true);
  };
  
  // Handle saving task updates
  const handleSaveTask = async (task: Partial<Task>) => {
    console.log("Saving task:", task);
    try {
      if (editingTask) {
        // This is an edit operation
        const updatedTask = { 
          ...editingTask, 
          ...task,
          // Ensure these fields are always present
          id: editingTask.id,
          user_id: editingTask.user_id,
          created_at: editingTask.created_at,
        } as Task;
        
        console.log("Final update task object:", updatedTask);
        await updateTask(updatedTask);
        toast({
          title: "Success",
          description: "Task updated successfully"
        });
      } else {
        // This is a create operation
        await addTask(task);
        toast({
          title: "Success",
          description: "Task created successfully"
        });
      }
      
      // Always close dialog and clear editing state after operation
      setTaskDialogOpen(false);
      setEditingTask(null);
    } catch (error: any) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: `Failed to save task: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  // Handle attachment uploads
  const handleUploadAttachment = async (file: File) => {
    console.log("Upload attachment stub - not implemented for standalone tasks");
    // For now, just return a mock response since we're not implementing real uploads in this PR
    return { success: false, url: null };
  };
  
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Tasks</h1>
            <p className="text-muted-foreground">Manage your tasks and deadlines</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-4 border rounded-lg bg-card">
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => refreshTasks()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Tasks</h1>
            <p className="text-muted-foreground">Manage your tasks and deadlines</p>
          </div>
        </div>
        
        <div className="border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-8 w-[150px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
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
        onAddTask={() => {
          setEditingTask(null);
          setTaskDialogOpen(true);
        }}
        onEditTask={handleEditTask}
        onDeleteTask={deleteTask}
        onStatusChange={changeTaskStatus}
        isLoading={isLoading}
        title="My Tasks"
      />
      
      <TaskDialog
        isOpen={taskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        onUploadAttachment={handleUploadAttachment}
        task={editingTask}
        columns={columns}
        projects={[]}
        activeProject={null}
      />
      
      <Toaster />
    </div>
  );
};

export default TasksPage;
