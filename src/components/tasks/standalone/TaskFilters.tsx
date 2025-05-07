
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

interface TaskFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filter,
  setFilter
}) => {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-3 mb-6 justify-between">
        <div className="flex gap-2 flex-wrap">
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
      </Tabs>
    </>
  );
};

export default TaskFilters;
