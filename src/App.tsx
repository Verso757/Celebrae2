import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/useAuth';
import { Loader2 } from 'lucide-react';

import Login from './pages/auth/Login';
import Onboarding from './pages/auth/Onboarding';
import Landing from './pages/Landing';
import Dashboard from './pages/dashboard/Dashboard';
import EventDetail from './pages/dashboard/EventDetail';
import Builder from './pages/builder/Builder';
import InvitationView from './pages/e/[slug]/InvitationView';

export default function App() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A96E]" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={user && !profile ? <Onboarding /> : <Navigate to={user ? "/dashboard" : "/login"} />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={user && profile ? <Dashboard /> : <Navigate to={user ? "/onboarding" : "/login"} />} />
        <Route path="/dashboard/evento/:eventId" element={user && profile ? <EventDetail /> : <Navigate to={user ? "/onboarding" : "/login"} />} />
        <Route path="/builder/:eventId?" element={user && profile ? <Builder /> : <Navigate to={user ? "/onboarding" : "/login"} />} />
        
        {/* Public routes */}
        <Route path="/e/:slug" element={<InvitationView />} />
        
        {/* Default route */}
        <Route path="/" element={user ? (profile ? <Navigate to="/dashboard" /> : <Navigate to="/onboarding" />) : <Landing />} />
      </Routes>
    </BrowserRouter>
  );
}
