
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ListFilter, 
  Plus, 
  LayoutGrid, 
  List as ListIcon, 
  Calendar, 
  Image as ImageIcon
} from 'lucide-react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import TaskDialogForm from '@/components/tasks/TaskDialogForm';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import ListView from '@/components/tasks/ListView';
import { Task, Column } from '@/types/task';

const initialColumns: Column[] = [
  { id: 'ideas', title: 'Idea Dump' },
  { id: 'todo', title: 'To Do' },
  { id: 'inprogress', title: 'In Progress' },
  { id: 'done', title: 'Done' }
];

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch tasks from Supabase
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setTasks(data || []);
      } catch (error: any) {
        console.error('Error fetching tasks:', error.message);
        toast({
          title: 'Error fetching tasks',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [user, navigate, toast]);

  const handleCreateTask = async (newTask: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: newTask.title,
          description: newTask.description,
          due_date: newTask.due_date,
          status: newTask.status || 'todo',
          priority: newTask.priority,
          completed: newTask.completed || false,
          attachment_url: newTask.attachment_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) {
        throw error;
      }

      setTasks([...tasks, data[0]]);
      toast({
        title: 'Task created',
        description: 'Your task has been created successfully.'
      });
      setTaskDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating task:', error.message);
      toast({
        title: 'Error creating task',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          ...updatedTask,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedTask.id);

      if (error) {
        throw error;
      }

      setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
      toast({
        title: 'Task updated',
        description: 'Your task has been updated successfully.'
      });
      setEditingTask(null);
      setTaskDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating task:', error.message);
      toast({
        title: 'Error updating task',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTasks(tasks.filter(task => task.id !== id));
      toast({
        title: 'Task deleted',
        description: 'Your task has been deleted successfully.'
      });
    } catch (error: any) {
      console.error('Error deleting task:', error.message);
      toast({
        title: 'Error deleting task',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside of a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Find the task
    const taskToMove = tasks.find(task => task.id === draggableId);
    if (!taskToMove) return;

    // Create a new task with updated status
    const updatedTask = {
      ...taskToMove,
      status: destination.droppableId as string
    };

    // Optimistically update UI
    setTasks(
      tasks.map(task => (task.id === draggableId ? updatedTask : task))
    );

    // Update in the database
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: destination.droppableId,
          updated_at: new Date().toISOString()
        })
        .eq('id', draggableId);

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Error updating task status:', error.message);
      toast({
        title: 'Error updating task',
        description: error.message,
        variant: 'destructive'
      });
      // Revert UI change if API call failed
      setTasks([...tasks]);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Task Manager</h1>
          <p className="text-muted-foreground">Organize your tasks with kanban or list view</p>
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
          <Button onClick={() => { setEditingTask(null); setTaskDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">
            {viewMode === 'kanban' ? 'Kanban Board' : 'Task List'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading tasks...</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              {viewMode === 'kanban' ? (
                <KanbanBoard 
                  tasks={tasks} 
                  columns={initialColumns} 
                  onEditTask={handleEditTask} 
                  onDeleteTask={handleDeleteTask}
                />
              ) : (
                <ListView 
                  tasks={tasks} 
                  columns={initialColumns} 
                  onEditTask={handleEditTask} 
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

      <TaskDialogForm
        isOpen={taskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false);
          setEditingTask(null);
        }}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        columns={initialColumns}
      />
    </div>
  );
};

export default TaskManager;
