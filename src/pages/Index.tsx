
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../components/LandingPage';
import ReportPage from '../components/ReportPage';
import MapView from '../components/MapView';
import UserDashboard from '../components/UserDashboard';
import AdminDashboard from '../components/AdminDashboard';
import Navigation from '../components/Navigation';
import { useAuth } from '../hooks/useAuth';

function RequireAuth({ children, role }: { children: JSX.Element, role: 'admin' | 'user' }) {
  const { isAuthenticated, role: authRole } = useAuth();
  if (!isAuthenticated || authRole !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}

const Index = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background dark:bg-gray-950 transition-colors duration-500">
        <Navigation />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/dashboard/user" element={<RequireAuth role="user"><UserDashboard /></RequireAuth>} />
          <Route path="/dashboard/admin" element={<RequireAuth role="admin"><AdminDashboard /></RequireAuth>} />
        </Routes>
      </div>
    </Router>
  );
};

export default Index;
