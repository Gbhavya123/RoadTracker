
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, MapPin, Shield, User, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FancyThemeToggle from './ThemeToggle';
import { useAuth } from '../hooks/useAuth';
import { FcGoogle } from 'react-icons/fc';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const location = useLocation();
  const { isAuthenticated, logout, setUser, role: authRole, setRole: setAuthRole } = useAuth();
  const navigate = useNavigate();

  // Google login handlers for each role
  const loginAsAdmin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
          setDropdownOpen(false);
          setAuthRole('admin');
          navigate('/dashboard/admin');
          setRole(null);
        });
    },
    onError: () => alert('Login Failed'),
    flow: 'implicit',
  });

  const loginAsUser = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
          setDropdownOpen(false);
          setAuthRole('user');
          navigate('/dashboard/user');
          setRole(null);
        });
    },
    onError: () => alert('Login Failed'),
    flow: 'implicit',
  });

  // Only show dashboard links for the correct role
  const navItems = [
    { name: 'Report Issue', path: '/report', icon: MapPin },
    { name: 'Live Map', path: '/map', icon: Map },
    ...(isAuthenticated && authRole === 'user' ? [
      { name: 'Dashboard', path: '/dashboard/user', icon: User },
    ] : []),
    ...(isAuthenticated && authRole === 'admin' ? [
      { name: 'Admin', path: '/dashboard/admin', icon: Shield },
    ] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              RoadTracker
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent ${
                    isActive(item.path)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <FancyThemeToggle />
            {isAuthenticated ? (
              <Button className="ml-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" onClick={logout}>
                Sign Out
              </Button>
            ) : (
              <div className="relative">
                <Button
                  className="ml-4 flex items-center gap-2 bg-white text-gray-800 border border-gray-300 shadow hover:bg-gray-100 hover:shadow-lg transition-all duration-200 px-5 py-2 rounded-lg"
                  onClick={() => setDropdownOpen((open) => !open)}
                  onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                >
                  <FcGoogle className="w-5 h-5" />
                  <span>Sign In</span>
                </Button>
                <AnimatePresence>
                  {dropdownOpen && !role && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-[calc(100%+16px)] min-w-[180px] bg-white rounded-lg shadow-lg z-50 flex flex-col gap-2 p-2 border border-gray-200"
                      style={{ minWidth: '200px' }}
                    >
                      <button
                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition border border-gray-300 shadow"
                        style={{ height: '40px' }}
                        onClick={() => loginAsAdmin()}
                      >
                        <FcGoogle className="w-5 h-5" /> Admin
                      </button>
                      <button
                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition border border-gray-300 shadow"
                        style={{ height: '40px' }}
                        onClick={() => loginAsUser()}
                      >
                        <FcGoogle className="w-5 h-5" /> User
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile menu button and theme toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <FancyThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="px-4 pt-3">
              {isAuthenticated ? (
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700" onClick={logout}>
                  Sign Out
                </Button>
              ) : (
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700" asChild>
                  <a href="/">Sign In</a>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
