'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser, IAuthState } from '@/types/Auth.type';

interface AuthContextType {
  authState: IAuthState;
  login: (user: IUser) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  getCurrentUser: () => IUser | null;
  isManager: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<IAuthState>({
    isAuthenticated: false,
    user: null,
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({
          isAuthenticated: true,
          user,
        });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (user: IUser) => {
    setAuthState({
      isAuthenticated: true,
      user,
    });
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
    });
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => authState.isAuthenticated;

  const getCurrentUser = () => authState.user;

  const isManager = () => authState.user?.isManager || false;

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        logout,
        isAuthenticated,
        getCurrentUser,
        isManager,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
