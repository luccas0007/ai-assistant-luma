
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import VoiceCommand from "./pages/VoiceCommand";
import Calendar from "./pages/Calendar";
import Email from "./pages/Email";
import Messages from "./pages/Messages";
import Tasks from "./pages/Tasks";
import TaskManager from "./pages/TaskManager";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { initializeDatabase } from "./lib/supabase";

const queryClient = new QueryClient();

// Initialize database when app loads
const DatabaseInitializer = () => {
  useEffect(() => {
    const init = async () => {
      try {
        console.log("Initializing database on app startup...");
        await initializeDatabase();
      } catch (error) {
        console.error("Error initializing database:", error);
      }
    };
    
    init();
  }, []);
  
  return null;
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <TooltipProvider>
            <DatabaseInitializer />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="voice-command" element={<VoiceCommand />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="email" element={<Email />} />
                <Route path="messages" element={<Messages />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="task-manager" element={<TaskManager />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
