
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useToast } from '@/hooks/use-toast';

const Layout: React.FC = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { toast } = useToast();
  
  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleRefresh = async () => {
    // Re-fetch data or reload content
    // This will be called when users pull down to refresh
    try {
      // Allow components to handle their own refresh via a custom event
      const refreshEvent = new CustomEvent('app:refresh');
      window.dispatchEvent(refreshEvent);
      
      // Display a success toast when refresh completes
      toast({
        title: "Refreshed",
        description: "The page content has been updated",
      });
    } catch (error) {
      console.error('Refresh failed:', error);
      toast({
        title: "Refresh failed",
        description: "Could not refresh the content",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isMobile ? 'ml-0' : (sidebarOpen ? 'ml-64' : 'ml-20')}`}>
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-auto p-2 sm:p-4 md:p-6">
          <div className="container mx-auto max-w-7xl">
            <PullToRefresh onRefresh={handleRefresh}>
              <Outlet />
            </PullToRefresh>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
