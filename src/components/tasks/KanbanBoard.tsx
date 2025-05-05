
import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { MoreHorizontal, Calendar, Paperclip } from 'lucide-react';
import { format } from 'date-fns';

import { Task, Column } from '@/types/task';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface KanbanBoardProps {
  tasks: Task[];
  columns: Column[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const priorityColors = {
  high: 'bg-red-100 text-red-800 hover:bg-red-200',
  medium: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  low: 'bg-green-100 text-green-800 hover:bg-green-200',
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, columns, onEditTask, onDeleteTask }) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div key={column.id} className="flex-shrink-0 w-80">
          <div className="bg-muted rounded-md p-3">
            <h3 className="font-medium mb-3 px-1 flex justify-between items-center">
              <span>{column.title}</span>
              <Badge variant="outline">
                {tasks.filter(task => task.status === column.id).length}
              </Badge>
            </h3>
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[calc(100vh-300px)] transition-colors rounded-md ${snapshot.isDraggingOver ? 'bg-accent' : ''}`}
                >
                  {tasks
                    .filter(task => task.status === column.id)
                    .map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-2 ${snapshot.isDragging ? 'opacity-70' : ''}`}
                          >
                            <Card className="shadow-sm hover:shadow transition-shadow">
                              <CardContent className="p-3">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
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
                                
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                                
                                <div className="flex justify-between items-center mt-3">
                                  <div className="flex items-center gap-2">
                                    {task.priority && (
                                      <Badge 
                                        variant="outline" 
                                        className={priorityColors[task.priority as keyof typeof priorityColors]}
                                      >
                                        {task.priority}
                                      </Badge>
                                    )}
                                    
                                    {task.attachment_url && (
                                      <Paperclip className="h-3 w-3 text-muted-foreground" />
                                    )}
                                  </div>
                                  
                                  {task.due_date && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      <span>
                                        {format(new Date(task.due_date), 'MMM d')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
