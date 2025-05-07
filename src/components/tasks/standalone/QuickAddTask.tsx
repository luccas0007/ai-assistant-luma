
import React, { useState } from 'react';
import { Plus, Loader2 as Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/task';

interface QuickAddTaskProps {
  onAddTask: (task: Partial<Task>) => void;
  columns: Array<{id: string; title: string}>;
  projectId?: string | null;
}

const QuickAddTask: React.FC<QuickAddTaskProps> = ({
  onAddTask,
  columns,
  projectId
}) => {
  const [quickAdd, setQuickAdd] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Handle quick add of a task
  const handleQuickAdd = async () => {
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
      column_id: null // Set to null to avoid UUID type errors
    };
    
    setIsAdding(true);
    await onAddTask(newTask);
    setIsAdding(false);
    setQuickAdd('');
  };

  return (
    <div className="flex gap-2 flex-1 md:flex-none">
      <Input
        placeholder="Add a quick task..."
        className="flex-1"
        value={quickAdd}
        onChange={(e) => setQuickAdd(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
      />
      <Button onClick={handleQuickAdd} disabled={!quickAdd.trim() || isAdding}>
        {isAdding ? (
          <Loader className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </>
        )}
      </Button>
    </div>
  );
};

export default QuickAddTask;
