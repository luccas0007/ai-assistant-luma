
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Check } from 'lucide-react';

const dummyTasks = [
  {
    id: 1,
    title: 'Complete quarterly report',
    completed: false,
    priority: 'high',
    due: new Date(2025, 4, 10)
  },
  {
    id: 2,
    title: 'Review marketing strategy',
    completed: false,
    priority: 'medium',
    due: new Date(2025, 4, 12)
  },
  {
    id: 3,
    title: 'Schedule team building',
    completed: false,
    priority: 'low',
    due: new Date(2025, 4, 15)
  },
  {
    id: 4,
    title: 'Update project documentation',
    completed: true,
    priority: 'medium',
    due: new Date(2025, 4, 5)
  }
];

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-green-100 text-green-800'
};

const formatDueDate = (date: Date) => {
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

const TaskList: React.FC = () => {
  const [tasks, setTasks] = React.useState(dummyTasks);
  
  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Tasks</CardTitle>
        <Check className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {activeTasks.map(task => (
            <div key={task.id} className="flex items-start gap-2 pb-2">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{task.title}</p>
                  <span className={`text-xs py-0.5 px-2 rounded-full ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Due: {formatDueDate(task.due)}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {completedTasks.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Completed</h4>
            <div className="space-y-2">
              {completedTasks.map(task => (
                <div key={task.id} className="flex items-start gap-2 pb-2">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-0.5"
                  />
                  <p className="text-sm text-muted-foreground line-through">{task.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskList;
