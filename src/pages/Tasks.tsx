
import React, { useState } from 'react';
import { Check, Plus, Calendar, CheckSquare, Filter, MoreVertical, CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  due: Date | null;
  category: string;
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Complete quarterly report',
    completed: false,
    priority: 'high',
    due: new Date(2025, 4, 10),
    category: 'work'
  },
  {
    id: 2,
    title: 'Review marketing strategy',
    completed: false,
    priority: 'medium',
    due: new Date(2025, 4, 12),
    category: 'work'
  },
  {
    id: 3,
    title: 'Schedule team building',
    completed: false,
    priority: 'low',
    due: new Date(2025, 4, 15),
    category: 'work'
  },
  {
    id: 4,
    title: 'Buy groceries',
    completed: false,
    priority: 'medium',
    due: new Date(2025, 4, 6),
    category: 'personal'
  },
  {
    id: 5,
    title: 'Pay utility bills',
    completed: false,
    priority: 'high',
    due: new Date(2025, 4, 7),
    category: 'personal'
  },
  {
    id: 6,
    title: 'Workout session',
    completed: true,
    priority: 'medium',
    due: new Date(2025, 4, 5),
    category: 'personal'
  },
  {
    id: 7,
    title: 'Update project documentation',
    completed: true,
    priority: 'medium',
    due: new Date(2025, 4, 5),
    category: 'work'
  }
];

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-green-100 text-green-800'
};

const formatDueDate = (date: Date | null) => {
  if (!date) return 'No due date';
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  }
};

const isOverdue = (date: Date | null) => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
};

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle,
      completed: false,
      priority: 'medium',
      due: null,
      category: category === 'all' ? 'work' : category
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };
  
  const filteredTasks = tasks.filter(task => {
    // Filter by status
    if (filter === 'active' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    
    // Filter by category
    if (category !== 'all' && task.category !== category) return false;
    
    return true;
  });
  
  const activeTasks = filteredTasks.filter(task => !task.completed);
  const completedTasks = filteredTasks.filter(task => task.completed);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Tasks</h1>
          <p className="text-muted-foreground">Manage your tasks and deadlines</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </div>
      
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <CheckSquare className="h-5 w-5 mr-2" />
              Task Management
            </CardTitle>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setCategory('all')}>
                    All Categories
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCategory('work')}>
                    Work
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCategory('personal')}>
                    Personal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-6">
              <div className="flex-1">
                <Input 
                  placeholder="Add a new task..." 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                />
              </div>
              <Button onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
                Add
              </Button>
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
              
              <TabsContent value="all" className="mt-0 space-y-4">
                {activeTasks.length > 0 && (
                  <div className="space-y-3">
                    {activeTasks.map(task => (
                      <div key={task.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(task.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{task.title}</p>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs py-0.5 px-2 rounded-full ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span className={isOverdue(task.due) ? 'text-red-500 font-medium' : ''}>
                                {formatDueDate(task.due)}
                                {isOverdue(task.due) && (
                                  <span className="ml-1 flex items-center">
                                    <CircleAlert className="h-3 w-3 mr-0.5" />
                                    Overdue
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                              {task.category}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {completedTasks.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Completed ({completedTasks.length})</h4>
                    <div className="space-y-2">
                      {completedTasks.map(task => (
                        <div key={task.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors opacity-70">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(task.id)}
                            className="mt-0.5"
                          />
                          <p className="text-sm text-muted-foreground line-through flex-1">{task.title}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatDueDate(task.due)}
                          </span>
                        </div>
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
              
              <TabsContent value="active" className="mt-0">
                {/* Active tasks content - same as the first part of "all" tab */}
                {activeTasks.length > 0 ? (
                  <div className="space-y-3">
                    {activeTasks.map(task => (
                      <div key={task.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(task.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{task.title}</p>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs py-0.5 px-2 rounded-full ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span className={isOverdue(task.due) ? 'text-red-500 font-medium' : ''}>
                                {formatDueDate(task.due)}
                                {isOverdue(task.due) && (
                                  <span className="ml-1 flex items-center">
                                    <CircleAlert className="h-3 w-3 mr-0.5" />
                                    Overdue
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                              {task.category}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Check className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No active tasks</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      All your tasks are completed
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completed" className="mt-0">
                {/* Completed tasks content */}
                {completedTasks.length > 0 ? (
                  <div className="space-y-2">
                    {completedTasks.map(task => (
                      <div key={task.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors opacity-70">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(task.id)}
                          className="mt-0.5"
                        />
                        <p className="text-sm text-muted-foreground line-through flex-1">{task.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDueDate(task.due)}
                        </span>
                      </div>
                    ))}
                  </div>
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
      </div>
    </div>
  );
};

export default TasksPage;
