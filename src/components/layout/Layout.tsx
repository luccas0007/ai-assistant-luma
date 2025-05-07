
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';

const Layout: React.FC = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`transition-all duration-300 ${isMobile ? 'ml-0' : (sidebarOpen ? 'ml-64' : 'ml-20')}`}>
        <Header toggleSidebar={toggleSidebar} />
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
