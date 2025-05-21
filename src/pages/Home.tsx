
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Task Management System</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Organize your tasks efficiently with our powerful task management platform.
        </p>
        
        <div className="space-y-4 md:space-y-0 md:space-x-4">
          {user ? (
            <>
              <Button asChild size="lg" className="mr-4">
                <Link to="/task-manager">Go to Task Manager</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/tasks">View Simple Tasks</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg" className="mr-4">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-24 grid md:grid-cols-3 gap-8">
        <div className="bg-card shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-3">Kanban Board</h2>
          <p className="text-muted-foreground">
            Visualize your workflow and move tasks through different stages with drag-and-drop ease.
          </p>
        </div>
        
        <div className="bg-card shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-3">Multiple Projects</h2>
          <p className="text-muted-foreground">
            Organize tasks into separate projects to keep your work structured and manageable.
          </p>
        </div>
        
        <div className="bg-card shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-3">Task Priorities</h2>
          <p className="text-muted-foreground">
            Set priorities for your tasks and focus on what matters the most.
          </p>
        </div>
      </div>
      
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Start Managing Your Tasks Today</h2>
        <p className="text-muted-foreground mb-6">
          Sign up for free and experience the power of organized task management.
        </p>
        
        {!user && (
          <Button asChild size="lg">
            <Link to="/register">Get Started</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Home;
