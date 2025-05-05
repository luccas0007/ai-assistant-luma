
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Mail, 
  MessageSquare, 
  Check, 
  Mic,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const isMobile = useIsMobile();
  
  const menuItems = [
    { icon: <Calendar className="h-5 w-5" />, label: 'Calendar', path: '/calendar' },
    { icon: <Mail className="h-5 w-5" />, label: 'Email', path: '/email' },
    { icon: <MessageSquare className="h-5 w-5" />, label: 'Messages', path: '/messages' },
    { icon: <Check className="h-5 w-5" />, label: 'Tasks', path: '/tasks' },
    { icon: <Bell className="h-5 w-5" />, label: 'Notifications', path: '/notifications' }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full bg-sidebar
        transition-all duration-300 ease-in-out
        ${isMobile ? (isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full') : 'w-64'}
        ${!isMobile && !isOpen ? 'w-20' : ''}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
            {(!isMobile || isOpen) && (
              <Link to="/" className={`font-semibold text-sidebar-foreground ${!isMobile && !isOpen ? 'hidden' : ''}`}>
                <span className="gradient-text">AI</span> Assistant
              </Link>
            )}
            {!isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-auto"
                onClick={toggleSidebar}
              >
                {isOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                )}
              </Button>
            )}
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item, i) => (
              <Link 
                key={i} 
                to={item.path}
                className={`
                  flex items-center p-3 rounded-md hover:bg-sidebar-accent
                  transition-colors group text-sidebar-foreground
                `}
              >
                <span className={`${isOpen || isMobile ? 'mr-3' : 'mx-auto'}`}>
                  {item.icon}
                </span>
                {(isOpen || isMobile) && <span>{item.label}</span>}
                {!isOpen && !isMobile && (
                  <div className="absolute left-20 rounded-md px-2 py-1 ml-6 bg-sidebar-primary text-sidebar-primary-foreground
                  scale-0 group-hover:scale-100 transition-all duration-100 origin-left">
                    {item.label}
                  </div>
                )}
              </Link>
            ))}
          </nav>
          
          {/* Voice command button */}
          <div className="p-4 border-t border-sidebar-border">
            <Link to="/voice-command">
              <Button 
                className={`
                  w-full group relative flex items-center justify-center
                  bg-gradient-to-r from-assistant-blue to-assistant-purple hover:from-assistant-purple hover:to-assistant-blue
                  text-white transition-all duration-300
                  ${!isOpen && !isMobile ? 'p-2 aspect-square' : 'py-3'}
                `}
              >
                <Mic className={`h-5 w-5 ${isOpen || isMobile ? 'mr-2' : ''}`} />
                {(isOpen || isMobile) && <span>Voice Command</span>}
                {!isOpen && !isMobile && (
                  <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-black text-white
                  scale-0 group-hover:scale-100 transition-all duration-100 origin-left whitespace-nowrap">
                    Voice Command
                  </div>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
