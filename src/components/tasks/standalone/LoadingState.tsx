
import React from 'react';
import { Loader2 as Loader } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const LoadingState: React.FC = () => {
  return (
    <Card>
      <CardContent className="flex justify-center items-center py-16">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </CardContent>
    </Card>
  );
};

export default LoadingState;
