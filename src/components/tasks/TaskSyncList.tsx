
import React from 'react';
import { format } from 'date-fns';
import { ExternalLink, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/task';
import { Project } from '@/types/project';
import { useNavigate } from 'react-router-dom';

interface TaskSyncListProps {
  tasks: Task[];
  projects: Project[];
  columns: Record<string, string>;
}

const priorityColors = {
  high: 'bg-red-100 text-red-800 hover:bg-red-200',
  medium: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  low: 'bg-green-100 text-green-800 hover:bg-green-200',
};

const statusColors: Record<string, string> = {
  todo: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  done: 'bg-green-100 text-green-800',
};

const TaskSyncList: React.FC<TaskSyncListProps> = ({ tasks, projects, columns }) => {
  const navigate = useNavigate();
  
  const getProjectName = (projectId: string | null) => {
    if (!projectId) return 'No Project';
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };
  
  const getStatusName = (statusId: string) => {
    return columns[statusId] || statusId;
  };
  
  const getStatusColor = (statusId: string) => {
    return statusColors[statusId] || 'bg-gray-100 text-gray-800';
  };
  
  const handleTaskClick = (task: Task) => {
    navigate(`/task-manager?project=${task.project_id}`);
  };
  
  if (tasks.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No tasks found</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-2">
        {tasks.map(task => (
          <div 
            key={task.id}
            className="p-3 border rounded-md bg-card hover:shadow-sm transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-sm">{task.title}</h4>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => handleTaskClick(task)}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground mb-2">
                  {getProjectName(task.project_id)}
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(task.status)}
                  >
                    {getStatusName(task.status)}
                  </Badge>
                  
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
                        {format(new Date(task.due_date), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default TaskSyncList;
