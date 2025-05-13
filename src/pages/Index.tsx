
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

const Index = () => {
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [refreshCount, setRefreshCount] = useState(0);

  // Listen for the custom refresh event
  useEffect(() => {
    const handleAppRefresh = () => {
      setLastRefreshed(new Date());
      setRefreshCount(prev => prev + 1);
    };

    window.addEventListener('app:refresh', handleAppRefresh);
    
    return () => {
      window.removeEventListener('app:refresh', handleAppRefresh);
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Pull to Refresh Demo</CardTitle>
          <RefreshCw className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <p className="text-xl font-medium">
              Pull down to refresh the page
            </p>
            <p className="text-muted-foreground mt-2">
              Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </p>
            <p className="text-muted-foreground mt-1">
              Refresh count: {refreshCount}
            </p>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-md">
            <h3 className="font-medium">How to use:</h3>
            <ol className="list-decimal list-inside mt-2 space-y-2 text-sm text-muted-foreground">
              <li>Scroll to the top of the page</li>
              <li>Pull down and hold until you see the refresh indicator</li>
              <li>Release to trigger the refresh</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
