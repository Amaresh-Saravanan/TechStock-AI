import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  storeName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, name?: string) => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // TODO: Replace with Neon DB API call — no localStorage, pure in-memory state
  const [user, setUser] = useState<User | null>(null);
  const [isLoading] = useState<boolean>(false);

  const login = (email: string, _password: string, name?: string) => {
    // TODO: Replace with Neon DB API call → POST /api/auth/login
    setUser({ id: '1', name: name || email.split('@')[0], email });
  };

  const register = (name: string, email: string, _password: string) => {
    // TODO: Replace with Neon DB API call → POST /api/auth/register
    setUser({ id: '1', name, email });
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
