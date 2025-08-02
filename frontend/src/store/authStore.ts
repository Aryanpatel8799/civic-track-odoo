import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { authService } from '@/services/authService';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
  forceReAuthentication: () => void;
  fetchUserWithToken: (token: string) => Promise<void>;
}

// Initialize from localStorage immediately
const getInitialState = () => {
  try {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    
    console.log('AuthStore: Initial state from localStorage:', { token: !!token, user: !!user });
    
    if (token && user) {
      return {
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      };
    }
  } catch (error) {
    console.error('AuthStore: Error reading initial state:', error);
  }
  
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true
  };
};

// Create the store
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Use initial state from localStorage
      ...getInitialState(),

      login: (token: string, user: User) => {
        console.log('AuthStore: Login called with:', { token: !!token, user: !!user });
        authService.setToken(token);
        authService.setUser(user);
        set({ 
          user, 
          token, 
          isAuthenticated: true,
          isLoading: false 
        });
        console.log('AuthStore: Login state set');
      },

      logout: () => {
        console.log('AuthStore: Logout called');
        authService.logout();
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false 
        });
        console.log('AuthStore: Logout state set');
      },

      setUser: (user: User) => {
        authService.setUser(user);
        set({ user });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      initialize: () => {
        console.log('AuthStore: Initializing...');
        try {
          const token = localStorage.getItem('authToken');
          const userData = localStorage.getItem('user');
          const user = userData ? JSON.parse(userData) : null;
          
          console.log('AuthStore: Initialize - found:', { token: !!token, user: !!user });
          
          if (token && user) {
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false
            });
          }
        } catch (error) {
          console.error('AuthStore: Initialize error:', error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      },

      forceReAuthentication: () => {
        console.log('AuthStore: Force re-authentication called');
        const token = authService.getToken();
        const user = authService.getUser();
        
        if (token && user) {
          console.log('AuthStore: Re-authenticating with existing credentials');
          set({ 
            user, 
            token, 
            isAuthenticated: true,
            isLoading: false 
          });
        } else {
          console.log('AuthStore: No credentials found for re-authentication');
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false,
            isLoading: false 
          });
        }
      },

      fetchUserWithToken: async (token: string) => {
        console.log('AuthStore: Fetching user profile with token');
        try {
          // Temporarily set the token so the API call can use it
          authService.setToken(token);
          
          const response = await authService.getProfile();
          if (response.success) {
            console.log('AuthStore: Successfully fetched user profile');
            // Store both user and token
            authService.setUser(response.data);
            set({ 
              user: response.data, 
              token, 
              isAuthenticated: true,
              isLoading: false 
            });
          } else {
            console.log('AuthStore: Failed to fetch user profile');
            // Clear the token since profile fetch failed
            authService.logout();
            set({ 
              user: null, 
              token: null, 
              isAuthenticated: false,
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('AuthStore: Error fetching user profile:', error);
          // Clear auth data on error
          authService.logout();
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false,
            isLoading: false 
          });
        }
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
      version: 1,
      // Immediately merge with localStorage on hydration
      merge: (persistedState, currentState) => {
        console.log('Zustand: Merge called', { persistedState: !!persistedState, currentState: !!currentState });
        
        // Prioritize localStorage data for immediate restoration
        try {
          const token = localStorage.getItem('authToken');
          const userData = localStorage.getItem('user');
          const user = userData ? JSON.parse(userData) : null;
          
          if (token && user) {
            console.log('Zustand: Using localStorage data for immediate restoration');
            return {
              ...currentState,
              user,
              token,
              isAuthenticated: true,
              isLoading: false
            };
          }
        } catch (error) {
          console.error('Zustand: Error reading localStorage in merge:', error);
        }
        
        // Fallback to persisted state if available
        if (persistedState) {
          console.log('Zustand: Using persisted state');
          return { ...currentState, ...persistedState };
        }
        
        console.log('Zustand: Using current state');
        return currentState;
      },
      // Force rehydration on mount
      onRehydrateStorage: (state) => {
        console.log('Zustand: Starting rehydration');
        return (state, error) => {
          if (error) {
            console.log('Zustand: Rehydration error:', error);
          } else {
            console.log('Zustand: Rehydration complete:', { 
              user: !!state?.user, 
              token: !!state?.token, 
              isAuthenticated: state?.isAuthenticated 
            });
          }
        };
      }
    }
  )
);

// Listen for localStorage changes and sync with store
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'authToken' || e.key === 'user') {
      console.log('AuthStore: localStorage changed, reinitializing...');
      useAuthStore.getState().initialize();
    }
  });
}
