import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
  isAuthenticated: boolean;
  logout: () => void;
  role: 'admin' | 'user' | null;
  setRole: (role: 'admin' | 'user' | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const isAuthenticated = !!user;
  const logout = () => {
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, logout, role, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 