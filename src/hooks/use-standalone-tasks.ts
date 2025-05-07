
import { useState, useEffect, useCallback } from 'react';
import { Task, Column } from '@/types/task';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useStandaloneTasks = (projectId?: string | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Default columns if none are provided from a project
  const defaultColumns: Column[] = [
    { id: 'todo', title: 'To Do', user_id: user?.id || '', project_id: 'default', position: 0 },
    { id: 'inprogress', title: 'In Progress', user_id: user?.id || '', project_id: 'default', position: 1 },
    { id: 'done', title: 'Done', user_id: user?.id || '', project_id: 'default', position: 2 },
  ];

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Build query based on whether a project is specified
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      } else {
        query = query.is('project_id', null);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Fetch columns for the specified project if any
      if (projectId) {
        const { data: columnData, error: columnError } = await supabase
          .from('columns')
          .select('*')
          .eq('project_id', projectId)
          .order('position', { ascending: true });

        if (columnError) {
          throw columnError;
        }

        setColumns(columnData as Column[] || []);
      } else {
        setColumns(defaultColumns);
      }

      setTasks(data as Task[] || []);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  }, [user, projectId, toast, defaultColumns]);

  // Add a new task
  const addTask = async (newTask: Partial<Task>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add tasks.",
        variant: "destructive"
      });
      return;
    }
    
    // Ensure the title is provided since it's required by database
    if (!newTask.title) {
      toast({
        title: "Error",
        description: "Task title is required.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a properly typed task object for insertion
      const taskData = {
        title: newTask.title, // Title is now guaranteed to exist
        user_id: user.id,
        description: newTask.description || null,
        status: newTask.status || 'todo',
        priority: newTask.priority || 'medium',
        due_date: newTask.due_date || null,
        completed: newTask.completed || false,
        attachment_url: newTask.attachment_url || null,
        attachment_path: newTask.attachment_path || null,
        project_id: projectId || null,
        column_id: newTask.column_id || newTask.status || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setTasks((prev) => [data[0] as Task, ...prev]);
        toast({
          title: "Success",
          description: "Task added successfully."
        });
      }
    } catch (error: any) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: `Failed to add task: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Update a task
  const updateTask = async (updatedTask: Task) => {
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

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      
      toast({
        title: "Success",
        description: "Task updated successfully."
      });
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
      
      toast({
        title: "Success",
        description: "Task deleted successfully."
      });
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Change task status
  const changeTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const taskToUpdate = tasks.find(task => task.id === taskId);
      
      if (!taskToUpdate) {
        throw new Error("Task not found");
      }
      
      const updatedTask = {
        ...taskToUpdate,
        status: newStatus,
        column_id: newStatus,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('tasks')
        .update(updatedTask)
        .eq('id', taskId);
        
      if (error) {
        throw error;
      }
      
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus, column_id: newStatus } : task))
      );
    } catch (error: any) {
      console.error("Error changing task status:", error);
      toast({
        title: "Error",
        description: `Failed to update task status: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Load tasks on component mount or when dependencies change
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    columns,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    refreshTasks: fetchTasks
  };
};
