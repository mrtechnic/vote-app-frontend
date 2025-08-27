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
  const hasLaunchedBefore = localStorage.getItem("hasLaunchedBefore");

  if (!hasLaunchedBefore) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setFirstLaunch(true);
    setLoading(false);
    localStorage.setItem("hasLaunchedBefore", "true");
    return;
  }

  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("token");

  if (storedUser && storedToken) {
    setUser(JSON.parse(storedUser));
    setToken(storedToken);   
  }

  setLoading(false);
}, []);


  const login = async (email: string, password: string) => {
    try {
      const { user: newUser, token: jwtToken } = await signin(email, password);
      
      if (!newUser || !jwtToken) {
        throw new Error('Invalid login response');
      }

      setToken(jwtToken); 
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem("token", jwtToken)
    } catch (error: any) {
      throw new Error(error?.error || error?.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const { user: newUser, token: jwtToken } = await signup(email, password, name);

      if (!newUser || !jwtToken) {
        throw new Error("Invalid register response")
      }

      setToken(jwtToken); 
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem("token", jwtToken)
    } catch (error: any) {
      throw new Error(error.error || error?.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const resetFirstLaunch = () => {
    localStorage.removeItem('hasLaunchedBefore');
    setFirstLaunch(true);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
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