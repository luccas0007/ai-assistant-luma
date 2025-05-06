
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useProjectManager } from '@/hooks/project-manager';
import { Task } from '@/types/task';
import TaskSyncList from '@/components/tasks/TaskSyncList';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { loadAllTasks } = useProjectManager();
  
  // Create a mapping of column IDs to column names
  const columnMapping: Record<string, string> = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'done': 'Done'
  };
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const { tasks, error } = await loadAllTasks();
        if (error) {
          setError(error);
        } else {
          setTasks(tasks as Task[]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, loadAllTasks]);
  
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Recent Tasks</CardTitle>
        <Check className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>Error loading tasks: {error}</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>No tasks found</p>
          </div>
        ) : (
          <TaskSyncList 
            tasks={tasks} 
            columns={columnMapping}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TaskList;
