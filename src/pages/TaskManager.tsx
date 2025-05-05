
import React from 'react';
import { 
  ListFilter, 
  Plus, 
  LayoutGrid, 
  List as ListIcon,
  AlertCircle
} from 'lucide-react';
import { DragDropContext } from 'react-beautiful-dnd';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import TaskDialog from '@/components/tasks/TaskDialog';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import ListView from '@/components/tasks/ListView';
import { useTaskManager } from '@/hooks/task-manager';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

const TaskManager = () => {
  const {
    tasks,
    columns,
    isLoading,
    error,
    setError,
    viewMode,
    setViewMode,
    taskDialogOpen,
    setTaskDialogOpen,
    editingTask,
    setEditingTask,
    columnDialogOpen,
    setColumnDialogOpen,
    newColumnTitle,
    setNewColumnTitle,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleDragEnd,
    handleAddColumn,
    handleUploadAttachment
  } = useTaskManager();
  
  const { toast } = useToast();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Projects</h1>
          <p className="text-muted-foreground">Organize your projects with kanban or list view</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'kanban' | 'list')}>
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setColumnDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Column
            </Button>
            <Button onClick={() => { 
              try {
                setEditingTask(null); 
                setTaskDialogOpen(true);
              } catch (error) {
                console.error("Error opening task dialog:", error);
                toast({
                  title: "Error",
                  description: "Could not open task dialog. Please try again.",
                  variant: "destructive"
                });
              }
            }}>
              <Plus className="h-4 w-4 mr-1" />
              Add Project
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            <div className="flex flex-col gap-2">
              <p>{error}</p>
              <Button variant="outline" size="sm" className="self-start" onClick={handleRetry}>
                Retry
              </Button>
              <Button variant="outline" size="sm" className="self-start" onClick={() => setError(null)}>
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">
            {viewMode === 'kanban' ? 'Project Board' : 'Project List'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading projects...</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              {viewMode === 'kanban' ? (
                <KanbanBoard 
                  tasks={tasks} 
                  columns={columns} 
                  onEditTask={setEditingTask} 
                  onDeleteTask={handleDeleteTask}
                />
              ) : (
                <ListView 
                  tasks={tasks} 
                  columns={columns} 
                  onEditTask={setEditingTask} 
                  onDeleteTask={handleDeleteTask}
                  onStatusChange={(taskId, newStatus) => {
                    const taskToUpdate = tasks.find(t => t.id === taskId);
                    if (taskToUpdate) {
                      const updatedTask = {...taskToUpdate, status: newStatus};
                      handleUpdateTask(updatedTask);
                    }
                  }}
                />
              )}
            </DragDropContext>
          )}
        </CardContent>
      </Card>

      <TaskDialog
        isOpen={taskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false);
          setEditingTask(null);
        }}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
        onUploadAttachment={handleUploadAttachment}
        task={editingTask}
        columns={columns}
      />
      
      {/* Add Column Dialog */}
      <Dialog open={columnDialogOpen} onOpenChange={setColumnDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="column-title">Column Title</Label>
              <Input
                id="column-title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Enter column title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setColumnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddColumn} disabled={!newColumnTitle.trim()}>
              Add Column
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Make sure we have the Toaster component */}
      <Toaster />
    </div>
  );
};

export default TaskManager;
