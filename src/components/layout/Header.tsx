
import React from 'react';
import { Bell, Calendar, MessageSquare, Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const isMobile = useIsMobile();
  
  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-menu"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        )}
        
        <div className="flex items-center space-x-1 md:space-x-2">
          {isMobile ? (
            <div className="ml-2 font-semibold">
              <span className="gradient-text">AI</span> Assistant
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-xs">
                <Calendar className="h-4 w-4 mr-1" />
                Calendar
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                <Mail className="h-4 w-4 mr-1" />
                Email
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                <MessageSquare className="h-4 w-4 mr-1" />
                Messages
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                <Check className="h-4 w-4 mr-1" />
                Tasks
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-assistant-purple rounded-full"></span>
          </Button>
          <Button variant="ghost" size="icon" className="ml-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-assistant-blue to-assistant-purple flex items-center justify-center text-white font-medium">
              U
            </div>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
