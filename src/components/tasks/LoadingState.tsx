
import React from 'react';
import { Loader } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-64 gap-4">
      <Loader className="h-8 w-8 animate-spin text-primary" />
      <p>Loading project data...</p>
    </div>
  );
};

export default LoadingState;
