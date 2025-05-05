
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Mic,
  Calendar as CalendarIcon,
  Mail,
  MessageSquare,
  Check,
  Bell,
  FolderKanban,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const menuItems = [
  {
    title: 'Dashboard',
    icon: Home,
    path: '/',
  },
  {
    title: 'Voice Command',
    icon: Mic,
    path: '/voice-command',
  },
  {
    title: 'Calendar',
    icon: CalendarIcon,
    path: '/calendar',
  },
  {
    title: 'Email',
    icon: Mail,
    path: '/email',
  },
  {
    title: 'Messages',
    icon: MessageSquare,
    path: '/messages',
  },
  {
    title: 'Tasks',
    icon: Check,
    path: '/tasks',
  },
  {
    title: 'Task Manager',
    icon: FolderKanban,
    path: '/task-manager',
  },
  {
    title: 'Notifications',
    icon: Bell,
    path: '/notifications',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card transition-all duration-300 border-r',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center justify-between px-4">
          <div
            className={cn(
              'flex items-center transition-all',
              isOpen ? 'justify-between w-full' : 'justify-center'
            )}
          >
            {isOpen && <span className="text-lg font-semibold">Luma</span>}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn(!isOpen && 'rotate-180')}
            >
              {isOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50',
                    !isOpen && 'justify-center'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {isOpen && <span>{item.title}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto px-2 py-4">
          <Separator className="mb-4" />
          {user && (
            <div
              className={cn(
                'flex items-center gap-2 rounded-md py-2',
                isOpen ? 'px-3' : 'justify-center'
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isOpen && (
                <div className="flex flex-1 flex-col overflow-hidden">
                  <div className="text-sm font-medium line-clamp-1">
                    {user.user_metadata?.name || user.email}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto justify-start px-0 text-xs text-muted-foreground"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Chevron components
const ChevronLeft = (props: React.SVGProps<SVGSVGElement>) => (
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
    {...props}
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRight = (props: React.SVGProps<SVGSVGElement>) => (
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
    {...props}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default Sidebar;
