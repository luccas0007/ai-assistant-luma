
import React from 'react';
import { MoreHorizontal, Calendar, Paperclip } from 'lucide-react';
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
  // Group tasks by status
  const tasksByStatus = columns.reduce((acc, column) => {
    acc[column.id] = tasks.filter(task => task.status === column.id);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="space-y-6">
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
                className="p-3 border rounded-md bg-card hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm">{task.title}</h4>
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
                    
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1 mb-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2">
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
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {tasks.length === 0 && (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium">No tasks found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new task to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default ListView;
