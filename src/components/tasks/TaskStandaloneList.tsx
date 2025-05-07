
import React, { useState } from 'react';
import { 
  Plus, 
  Check, 
  Filter, 
  MoreHorizontal, 
  Calendar, 
  Paperclip, 
  Search, 
  CheckSquare 
} from 'lucide-react';
import { format } from 'date-fns';

import { Task, Column } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';

interface TaskStandaloneListProps {
  tasks: Task[];
  columns: Column[];
  onAddTask: (task: Partial<Task>) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
  isLoading?: boolean;
  title?: string;
  projectId?: string | null;
}

const priorityColors = {
  high: 'bg-red-100 text-red-800 hover:bg-red-200',
  medium: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  low: 'bg-green-100 text-green-800 hover:bg-green-200',
};

const TaskStandaloneList: React.FC<TaskStandaloneListProps> = ({
  tasks,
  columns,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  isLoading = false,
  title = "My Tasks",
  projectId = null
}) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [quickAdd, setQuickAdd] = useState('');

  // Filter tasks based on active filters
  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !(task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }
    
    // Completion filter
    if (filter === 'active' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    
    return true;
  });

  // Group tasks by completion status for easier display
  const activeTasks = filteredTasks.filter(task => !task.completed);
  const completedTasks = filteredTasks.filter(task => task.completed);

  // Handle quick add of a task
  const handleQuickAdd = () => {
    if (!quickAdd.trim()) return;
    
    const defaultColumn = columns.find(c => c.title.toLowerCase() === 'to do' || c.title.toLowerCase() === 'todo')?.id || 
                          columns[0]?.id || 
                          'todo';
    
    const newTask: Partial<Task> = {
      title: quickAdd,
      status: defaultColumn,
      priority: 'medium',
      completed: false,
      project_id: projectId,
      column_id: defaultColumn
    };
    
    onAddTask(newTask);
    setQuickAdd('');
  };
  
  // Toggle task completion
  const toggleTaskCompletion = (task: Task) => {
    onEditTask({
      ...task,
      completed: !task.completed
    });
  };

  // Task item component
  const TaskItem = ({ task }: { task: Task }) => (
    <div className={`p-3 border rounded-md hover:bg-muted/50 transition-colors ${task.completed ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => toggleTaskCompletion(task)}
          className="mt-0.5"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </p>
            <div className="flex items-center gap-2">
              {task.priority && (
                <Badge 
                  variant="outline" 
                  className={priorityColors[task.priority as keyof typeof priorityColors]}
                >
                  {task.priority}
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditTask(task)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDeleteTask(task.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {task.description && (
            <p className={`text-xs text-muted-foreground mt-1 ${task.completed ? 'line-through' : ''}`}>
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {task.due_date && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span>
                  {format(new Date(task.due_date), 'MMM d, yyyy')}
                </span>
              </div>
            )}
            {task.attachment_url && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Paperclip className="h-3.5 w-3.5 mr-1" />
                <span>Attachment</span>
              </div>
            )}
            {columns.length > 0 && (
              <div className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                {columns.find(col => col.id === task.status)?.title || task.status}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckSquare className="mr-2 h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <CheckSquare className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-3 mb-6 justify-between">
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-9 w-[200px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 flex-1 md:flex-none">
            <Input
              placeholder="Add a quick task..."
              className="flex-1"
              value={quickAdd}
              onChange={(e) => setQuickAdd(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
            />
            <Button onClick={handleQuickAdd} disabled={!quickAdd.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger 
              value="all" 
              onClick={() => setFilter('all')}
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="active" 
              onClick={() => setFilter('active')}
            >
              Active
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              onClick={() => setFilter('completed')}
            >
              Completed
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {activeTasks.length > 0 && (
              <div className="space-y-2">
                {activeTasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            )}
            
            {completedTasks.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">
                  Completed ({completedTasks.length})
                </h4>
                <div className="space-y-2">
                  {completedTasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}
            
            {filteredTasks.length === 0 && (
              <div className="text-center py-8">
                <Check className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No tasks found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {filter === 'all' 
                    ? 'Add a new task to get started' 
                    : filter === 'active'
                      ? 'No active tasks found'
                      : 'No completed tasks found'
                  }
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="active" className="space-y-2">
            {activeTasks.length > 0 ? (
              activeTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))
            ) : (
              <div className="text-center py-8">
                <Check className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No active tasks</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  All tasks are completed
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-2">
            {completedTasks.length > 0 ? (
              completedTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))
            ) : (
              <div className="text-center py-8">
                <Check className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No completed tasks</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete some tasks to see them here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TaskStandaloneList;
