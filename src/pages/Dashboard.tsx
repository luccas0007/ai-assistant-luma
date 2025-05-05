
import React from 'react';
import VoiceAssistant from '@/components/widgets/VoiceAssistant';
import UpcomingEvents from '@/components/widgets/UpcomingEvents';
import TaskList from '@/components/widgets/TaskList';
import MessageCenter from '@/components/widgets/MessageCenter';
import NotificationCenter from '@/components/widgets/NotificationCenter';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Hello, User</h1>
        <p className="text-muted-foreground">Here's your assistant overview</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VoiceAssistant />
        {isMobile ? (
          <UpcomingEvents />
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <NotificationCenter />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {!isMobile && (
          <UpcomingEvents />
        )}
        <div className={`${isMobile ? '' : 'md:col-span-2'}`}>
          <TaskList />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <MessageCenter />
      </div>
      
      {isMobile && (
        <div className="grid grid-cols-1 gap-6">
          <NotificationCenter />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
