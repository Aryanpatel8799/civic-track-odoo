import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setUser,
    initialize,
    setLoading,
    fetchUserWithToken
  } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AuthContext: Starting initialization');
      
      // Immediate check - don't wait for any delays
      const token = authService.getToken();
      const user = authService.getUser();
      
      console.log('AuthContext: Immediate localStorage check:', { 
        token: !!token, 
        user: !!user,
        tokenValue: token?.substring(0, 20) + '...',
        userEmail: user?.email
      });
      
      if (token && user) {
        console.log('AuthContext: Found complete auth data, logging in immediately');
        login(token, user);
        setLoading(false);
        return; // Exit early - no need for complex retry logic
      } else if (token && !user) {
        console.log('AuthContext: Found token but no user, fetching profile');
        try {
          await fetchUserWithToken(token);
          setLoading(false);
          return;
        } catch (error) {
          console.error('AuthContext: Failed to fetch user with token:', error);
          logout();
        }
      } else {
        console.log('AuthContext: No auth data found');
        logout();
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, [login, logout, setLoading, fetchUserWithToken]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
