
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Categorize from "./pages/Categorize";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Landing from "./pages/Landing";
import AuthForm from "./components/auth/AuthForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  console.log("App component is rendering");
  
  // Simplified test version
  return (
    <div style={{background: 'blue', color: 'white', padding: '20px', fontSize: '24px'}}>
      APP IS LOADING - TEST MODE
    </div>
  );
};

export default App;
