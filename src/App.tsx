
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import VoiceCommand from "./pages/VoiceCommand";
import Calendar from "./pages/Calendar";
import Email from "./pages/Email";
import Messages from "./pages/Messages";
import Tasks from "./pages/Tasks";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import React from "react";

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="voice-command" element={<VoiceCommand />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="email" element={<Email />} />
              <Route path="messages" element={<Messages />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
