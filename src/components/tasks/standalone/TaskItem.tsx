
import React from 'react';
import { Calendar, Paperclip, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';

import { Task, Column } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskItemProps {
  task: Task;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  toggleTaskCompletion: (task: Task) => void;
  changeTaskPriority: (task: Task, newPriority: string) => void;
  columns: Column[];
}

const priorityColors = {
  high: 'bg-red-100 text-red-800 hover:bg-red-200',
  medium: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  low: 'bg-green-100 text-green-800 hover:bg-green-200',
};

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onEditTask,
  onDeleteTask,
  toggleTaskCompletion,
  changeTaskPriority,
  columns
}) => {
  return (
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className={`cursor-pointer ${priorityColors[task.priority as keyof typeof priorityColors]}`}
                  >
                    {task.priority}
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => changeTaskPriority(task, 'high')} className="text-red-600">
                    High
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeTaskPriority(task, 'medium')} className="text-amber-600">
                    Medium
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeTaskPriority(task, 'low')} className="text-green-600">
                    Low
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
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
};

export default TaskItem;
