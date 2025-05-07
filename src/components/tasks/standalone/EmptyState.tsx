
import React from 'react';
import { Check } from 'lucide-react';

interface EmptyStateProps {
  filter: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ filter }) => {
  return (
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
  );
};

export default EmptyState;
