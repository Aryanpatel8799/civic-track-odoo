import React, { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';

export const AuthWatcher: React.FC = () => {
  const { user, token, isAuthenticated, initialize } = useAuthStore();
  const hasInitialized = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    const checkAndRestore = () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      console.log('AuthWatcher: Checking auth state...', {
        storeState: { user: !!user, token: !!token, isAuthenticated },
        localStorage: { token: !!storedToken, user: !!storedUser },
        hasInitialized: hasInitialized.current,
        retryCount: retryCount.current
      });

      // If we have data in localStorage but not in store, reinitialize
      if (storedToken && storedUser && (!user || !token || !isAuthenticated)) {
        if (retryCount.current < maxRetries) {
          console.log('AuthWatcher: Mismatch detected, reinitializing...', retryCount.current + 1);
          initialize();
          retryCount.current++;
        } else {
          console.log('AuthWatcher: Max retries reached, giving up');
        }
      } else if (storedToken && storedUser && user && token && isAuthenticated) {
        console.log('AuthWatcher: Auth state is synchronized');
        retryCount.current = 0;
      }
      
      hasInitialized.current = true;
    };

    // Check immediately
    checkAndRestore();

    // Check periodically for mismatches
    const interval = setInterval(checkAndRestore, 1000);

    // Also check on focus (when user returns to tab)
    const handleFocus = () => {
      console.log('AuthWatcher: Window focused, checking auth state...');
      checkAndRestore();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, token, isAuthenticated, initialize]);

  return null; // This component doesn't render anything
};
