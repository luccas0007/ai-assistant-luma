
import React, { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import { Task, Column } from '@/types/task';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent
} from '@/components/ui/tabs';

// Import our refactored components
import TaskFilters from './standalone/TaskFilters';
import QuickAddTask from './standalone/QuickAddTask';
import TaskList from './standalone/TaskList';
import LoadingState from './standalone/LoadingState';

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

  // Toggle task completion with fixed function
  const toggleTaskCompletion = (task: Task) => {
    console.log("Toggling task completion:", task.id, !task.completed);
    const updatedTask = {
      ...task,
      completed: !task.completed
    };
    onEditTask(updatedTask);
  };

  // Change task priority
  const changeTaskPriority = (task: Task, newPriority: string) => {
    console.log("Changing task priority:", task.id, "to", newPriority);
    const updatedTask = {
      ...task,
      priority: newPriority
    };
    onEditTask(updatedTask);
  };

  // Enhanced edit task handler with logging
  const handleEditTask = (task: Task) => {
    console.log("Edit task triggered for:", task);
    onEditTask(task);
  };

  if (isLoading) {
    return <LoadingState />;
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
          <div className="relative">
            <TaskFilters 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filter={filter}
              setFilter={setFilter}
            />
          </div>
          <QuickAddTask 
            onAddTask={onAddTask}
            columns={columns}
            projectId={projectId}
          />
        </div>

        <Tabs defaultValue="all">
          <TabsContent value="all">
            <TaskList 
              tasks={filteredTasks}
              columns={columns}
              onEditTask={handleEditTask}
              onDeleteTask={onDeleteTask}
              toggleTaskCompletion={toggleTaskCompletion}
              changeTaskPriority={changeTaskPriority}
              filter={filter}
            />
          </TabsContent>
          
          <TabsContent value="active">
            <TaskList 
              tasks={filteredTasks.filter(task => !task.completed)}
              columns={columns}
              onEditTask={handleEditTask}
              onDeleteTask={onDeleteTask}
              toggleTaskCompletion={toggleTaskCompletion}
              changeTaskPriority={changeTaskPriority}
              filter="active"
            />
          </TabsContent>
          
          <TabsContent value="completed">
            <TaskList 
              tasks={filteredTasks.filter(task => task.completed)}
              columns={columns}
              onEditTask={handleEditTask}
              onDeleteTask={onDeleteTask}
              toggleTaskCompletion={toggleTaskCompletion}
              changeTaskPriority={changeTaskPriority}
              filter="completed"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TaskStandaloneList;
