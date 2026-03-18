import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to initialize authentication state
  const checkAuth = async () => {
    try {
      // Temporarily bypass backend to use Local Storage
      const storedUser = localStorage.getItem('techstock_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []); // Run only once on mount

  useEffect(() => {
    // Listen for global 401 unauthorized events emitted from the API interceptor
    const handleUnauthorized = () => {
      setUser((currentUser) => {
        // Avoid spamming toasts or loops
        if (currentUser) {
          toast.error('Your session has expired. Please log in again.');
        }
        return null;
      });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = (userData: User) => {
    localStorage.setItem('techstock_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Remove from frontend cache completely
      localStorage.removeItem('techstock_user');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
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
