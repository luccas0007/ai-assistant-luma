
import { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

import Account from '@/pages/Account';
import Home from '@/pages/Home';
import TasksPage from '@/pages/Tasks';
import TaskManager from '@/pages/TaskManager';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import { TaskProvider } from '@/context/TaskContext';

function App() {
  const [authCompleted, setAuthCompleted] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Simulate auth check delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Get current session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      setAuthCompleted(true);
      
      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          setSession(newSession);
        }
      );
      
      return () => subscription.unsubscribe();
    };

    checkAuth();
  }, []);

  return (
    <div className="app">
      <TaskProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/account"
            element={
              session ? (
                <Account session={session} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/tasks" element={<TasksPage />} />
          <Route
            path="/task-manager"
            element={
              session ? (
                <TaskManager />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </TaskProvider>
    </div>
  );
}

export default App;
