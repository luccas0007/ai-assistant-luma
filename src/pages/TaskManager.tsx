
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
import { Input } from '@/components/ui/input';
import TaskDialogForm from '@/components/tasks/TaskDialogForm';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import ListView from '@/components/tasks/ListView';
import { Task, Column } from '@/types/task';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const defaultColumns: Column[] = [
  { id: 'ideas', title: 'Idea Dump' },
  { id: 'todo', title: 'To Do' },
  { id: 'inprogress', title: 'In Progress' },
  { id: 'done', title: 'Done' }
];

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Create database tables if they don't exist
  useEffect(() => {
    if (!user) return;
    
    const setupDatabase = async () => {
      try {
        // Check if tasks table exists, create if not
        const { error: tasksExistError } = await supabase
          .from('tasks')
          .select('*')
          .limit(1);
          
        if (tasksExistError && tasksExistError.message.includes('does not exist')) {
          // Create tasks table
          const { error: createError } = await supabase.rpc('create_tasks_table');
          if (createError) {
            console.log('Creating tasks table via SQL query');
            // If RPC function doesn't exist, use raw SQL
            await supabase.rpc('exec', { 
              query: `
                CREATE TABLE IF NOT EXISTS public.tasks (
                  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                  user_id UUID NOT NULL REFERENCES auth.users(id),
                  title TEXT NOT NULL,
                  description TEXT,
                  status TEXT NOT NULL DEFAULT 'todo',
                  priority TEXT NOT NULL DEFAULT 'medium',
                  due_date TIMESTAMPTZ,
                  completed BOOLEAN NOT NULL DEFAULT false,
                  attachment_url TEXT,
                  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
              `
            });
            
            // Configure RLS
            await supabase.rpc('exec', {
              query: `
                ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
                CREATE POLICY "Users can CRUD their own tasks" ON public.tasks
                  USING (auth.uid() = user_id)
                  WITH CHECK (auth.uid() = user_id);
              `
            });
          }
        }
        
        // Create storage bucket for attachments if it doesn't exist
        try {
          const { data: buckets } = await supabase.storage.listBuckets();
          const bucketExists = buckets?.some(bucket => bucket.name === 'task-attachments');
          
          if (!bucketExists) {
            await supabase.storage.createBucket('task-attachments', { public: true });
          }
        } catch (error) {
          console.error('Error checking/creating storage bucket:', error);
        }
        
      } catch (error) {
        console.error('Error setting up database:', error);
      }
    };
    
    setupDatabase();
  }, [user]);

  // Local storage for columns
  useEffect(() => {
    const storedColumns = localStorage.getItem('kanban-columns');
    if (storedColumns) {
      try {
        setColumns(JSON.parse(storedColumns));
      } catch (e) {
        console.error('Error parsing stored columns:', e);
      }
    }
  }, []);

  // Save columns to local storage when they change
  useEffect(() => {
    localStorage.setItem('kanban-columns', JSON.stringify(columns));
  }, [columns]);

  // Fetch tasks from Supabase
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        // First check if table exists
        const { data: tablesData, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_name', 'tasks')
          .eq('table_schema', 'public');
          
        if (tablesError) {
          console.error('Error checking if table exists:', tablesError);
          setTasks([]);
          setIsLoading(false);
          return;
        }
        
        // If table exists, fetch tasks
        if (tablesData && tablesData.length > 0) {
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            throw error;
          }

          setTasks(data || []);
        } else {
          // Table doesn't exist yet, just set empty tasks
          setTasks([]);
        }
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
      // Check if table exists first
      const { data: tablesData, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'tasks')
        .eq('table_schema', 'public');
        
      if (tablesError || !tablesData || tablesData.length === 0) {
        throw new Error('Tasks table does not exist. Please refresh the page to create it.');
      }
      
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

      setTasks([...(data || []), ...(tasks || [])]);
      toast({
        title: 'Task created',
        description: 'Your task has been created successfully.'
      });
      setTaskDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error creating task',
        description: error.message || 'An error occurred while creating the task',
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
  
  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    
    const newColumnId = newColumnTitle.toLowerCase().replace(/\s+/g, '-');
    
    // Check for duplicate column id
    if (columns.some(col => col.id === newColumnId)) {
      toast({
        title: 'Column already exists',
        description: 'A column with this name already exists',
        variant: 'destructive'
      });
      return;
    }
    
    const newColumn: Column = {
      id: newColumnId,
      title: newColumnTitle
    };
    
    setColumns([...columns, newColumn]);
    setNewColumnTitle('');
    setColumnDialogOpen(false);
    
    toast({
      title: 'Column added',
      description: `Column "${newColumnTitle}" has been added.`
    });
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setColumnDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Column
            </Button>
            <Button onClick={() => { setEditingTask(null); setTaskDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>
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
                  columns={columns} 
                  onEditTask={handleEditTask} 
                  onDeleteTask={handleDeleteTask}
                />
              ) : (
                <ListView 
                  tasks={tasks} 
                  columns={columns} 
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
    </div>
  );
};

export default TaskManager;
