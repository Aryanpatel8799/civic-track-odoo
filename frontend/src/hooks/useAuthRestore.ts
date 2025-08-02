import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuthRestore = () => {
  const initialize = useAuthStore(state => state.initialize);
  
  useEffect(() => {
    // Force initialize on mount
    console.log('useAuthRestore: Forcing auth initialization...');
    initialize();
  }, [initialize]);
};
