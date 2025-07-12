
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from '../components/LandingPage';
import ReportPage from '../components/ReportPage';
import MapView from '../components/MapView';
import UserDashboard from '../components/UserDashboard';
import AdminDashboard from '../components/AdminDashboard';
import Navigation from '../components/Navigation';
import { useAuth } from '../hooks/useAuth';
import Profile from './Profile';
import MyReports from './MyReports';

function RequireAuth({ children, role }: { children: JSX.Element, role: 'admin' | 'user' }) {
  const { isAuthenticated, role: authRole } = useAuth();
  if (!isAuthenticated || authRole !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}

const PageTransitionWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: 'easeInOut' }}
    style={{ minHeight: '100vh' }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransitionWrapper><LandingPage /></PageTransitionWrapper>} />
        <Route path="/report" element={<PageTransitionWrapper><ReportPage /></PageTransitionWrapper>} />
        <Route path="/map" element={<PageTransitionWrapper><MapView /></PageTransitionWrapper>} />
        <Route path="/dashboard/user" element={<PageTransitionWrapper><RequireAuth role="user"><UserDashboard /></RequireAuth></PageTransitionWrapper>} />
        <Route path="/dashboard/admin" element={<PageTransitionWrapper><RequireAuth role="admin"><AdminDashboard /></RequireAuth></PageTransitionWrapper>} />
        <Route path="/profile" element={<PageTransitionWrapper><Profile /></PageTransitionWrapper>} />
        <Route path="/my-reports" element={<PageTransitionWrapper><MyReports /></PageTransitionWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

const Index = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background dark:bg-gray-950 transition-colors duration-500">
        <Navigation />
        <AnimatedRoutes />
      </div>
    </Router>
  );
};

export default Index;
