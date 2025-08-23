import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/index';
import type { AuthState } from '../types/index';
import { signin, signup } from '../utils/api';

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  firstLaunch: boolean;
  resetFirstLaunch: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstLaunch, setFirstLaunch] = useState(false);

  useEffect(() => {
    const hasLaunchedBefore = localStorage.getItem('hasLaunchedBefore');

    // Check if this is the first launch
    if (!hasLaunchedBefore || hasLaunchedBefore === 'null' || hasLaunchedBefore === 'undefined') {
      // Clear any existing authentication data on first launch
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setFirstLaunch(true);
      setUser(null);
      setToken(null);
      localStorage.setItem('hasLaunchedBefore', 'true');
      setLoading(false);
      return;
    }

    // Always clear authentication data on app start (except first launch)
    // This ensures users always see login page when they visit the app
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await signin(email, password);
      const { user: newUser } = response;

      setToken('authenticated'); // Since backend handles token via cookies
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error: any) {
      throw new Error(error?.error || error?.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await signup(email, password, name);
      const { user: newUser } = response;

      setToken('authenticated'); // Since backend handles token via cookies
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error: any) {
      throw new Error(error.error || error?.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
  };

  const resetFirstLaunch = () => {
    localStorage.removeItem('hasLaunchedBefore');
    setFirstLaunch(true);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading,
    firstLaunch,
    resetFirstLaunch,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};