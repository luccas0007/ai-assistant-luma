
import React, { useState } from 'react';
import { MoreHorizontal, Calendar, Paperclip, Plus, Check, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';

import { Task, Column } from '@/types/task';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface ListViewProps {
  tasks: Task[];
  columns: Column[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
}

const priorityColors = {
  high: 'bg-red-100 text-red-800 hover:bg-red-200',
  medium: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  low: 'bg-green-100 text-green-800 hover:bg-green-200',
};

const statusColors = {
  ideas: 'bg-purple-100 text-purple-800',
  todo: 'bg-blue-100 text-blue-800',
  inprogress: 'bg-yellow-100 text-yellow-800',
  done: 'bg-green-100 text-green-800',
};

const ListView: React.FC<ListViewProps> = ({ 
  tasks, 
  columns, 
  onEditTask, 
  onDeleteTask,
  onStatusChange 
}) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [quickAdd, setQuickAdd] = useState('');
  
  // Group tasks by status
  const tasksByStatus = columns.reduce((acc, column) => {
    acc[column.id] = tasks
      .filter(task => task.status === column.id)
      .filter(task => {
        // Apply search filter
        if (!searchTerm) return true;
        return (
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      })
      .filter(task => {
        // Apply completion filter
        if (filter === 'all') return true;
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
      });
    return acc;
  }, {} as Record<string, Task[]>);
  
  // Toggle task completion status
  const toggleTaskCompletion = (task: Task) => {
    const updatedTask = { ...task, completed: !task.completed };
    onEditTask(updatedTask);
  };
  
  // Handle quick add of a task
  const handleQuickAdd = () => {
    if (!quickAdd.trim()) return;
    
    const defaultColumn = columns[0]?.id || 'todo';
    
    const newTask: Partial<Task> = {
      title: quickAdd,
      status: defaultColumn,
      priority: 'medium',
      completed: false,
    };
    
    // This would call a parent function that creates a new task
    // onAddTask(newTask);
    
    // Clear the input
    setQuickAdd('');
  };

  return (
    <div className="space-y-4">
      {/* Task filters and search */}
      <div className="flex flex-col md:flex-row gap-2 items-start md:items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
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
        
        {/* Quick add input */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input
            placeholder="Add a quick task..."
            className="w-full md:w-[250px]"
            value={quickAdd}
            onChange={(e) => setQuickAdd(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
          />
          <Button onClick={handleQuickAdd} disabled={!quickAdd.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Separator />
      
      {columns.map((column) => (
        <div key={column.id} className={tasksByStatus[column.id].length === 0 ? 'hidden' : ''}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sm flex items-center">
              <Badge variant="outline" className={statusColors[column.id as keyof typeof statusColors]}>
                {column.title}
              </Badge>
              <span className="text-muted-foreground ml-2 text-xs">
                {tasksByStatus[column.id].length} tasks
              </span>
            </h3>
          </div>
          <div className="space-y-2">
            {tasksByStatus[column.id].map((task) => (
              <div 
                key={task.id}
                className={`p-3 border rounded-md bg-card hover:shadow-sm transition-shadow ${task.completed ? 'opacity-70' : ''}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox 
                      checked={task.completed} 
                      onCheckedChange={() => toggleTaskCompletion(task)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </h4>
                      </div>
                      
                      {task.description && (
                        <p className={`text-xs text-muted-foreground mt-1 mb-2 ${task.completed ? 'line-through' : ''}`}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center flex-wrap gap-2 mt-2">
                        {task.priority && (
                          <Badge 
                            variant="outline" 
                            className={priorityColors[task.priority as keyof typeof priorityColors]}
                          >
                            {task.priority}
                          </Badge>
                        )}
                        
                        {task.due_date && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>
                              {format(new Date(task.due_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                        )}
                        
                        {task.attachment_url && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Paperclip className="h-3 w-3 mr-1" />
                            <span>Attachment</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select 
                      value={task.status} 
                      onValueChange={(status) => onStatusChange(task.id, status)}
                    >
                      <SelectTrigger className="h-7 w-[110px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((column) => (
                          <SelectItem key={column.id} value={column.id}>
                            {column.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
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
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {tasks.length === 0 && (
        <div className="text-center py-10">
          <Check className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium mt-2">No tasks found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new task to get started
          </p>
        </div>
      )}
      
      {tasks.length > 0 && Object.values(tasksByStatus).every(tasks => tasks.length === 0) && (
        <div className="text-center py-10">
          <Filter className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium mt-2">No matching tasks</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try changing your search or filter
          </p>
        </div>
      )}
    </div>
  );
};

export default ListView;
