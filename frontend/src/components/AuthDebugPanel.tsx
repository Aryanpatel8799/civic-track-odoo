import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';

export const AuthDebugPanel: React.FC = () => {
  const { user, token, isAuthenticated, isLoading, initialize, forceReAuthentication, fetchUserWithToken } = useAuthStore();

  const handleRefreshAuth = () => {
    console.log('Debug: Refreshing auth state');
    initialize();
  };

  const handleForceReAuth = () => {
    console.log('Debug: Forcing re-authentication');
    forceReAuthentication();
  };

  const handleClearAll = () => {
    console.log('Debug: Clearing all auth data');
    authService.logout();
    localStorage.removeItem('auth-store');
    forceReAuthentication();
  };

  const handleFetchUserWithToken = async () => {
    const token = authService.getToken();
    if (token) {
      console.log('Debug: Fetching user with existing token');
      try {
        await fetchUserWithToken(token);
      } catch (error) {
        console.error('Debug: Failed to fetch user with token:', error);
      }
    } else {
      alert('No token found in localStorage');
    }
  };

  const checkLocalStorage = () => {
    const lsToken = authService.getToken();
    const lsUser = authService.getUser();
    const zustandStore = localStorage.getItem('auth-store');
    
    console.log('Debug: LocalStorage check:', {
      token: !!lsToken,
      user: !!lsUser,
      zustandStore: !!zustandStore,
      tokenValue: lsToken?.substring(0, 20) + '...',
      userEmail: lsUser?.email
    });
    
    alert(`Auth Debug:
Token: ${lsToken ? 'Found' : 'Missing'}
User: ${lsUser ? 'Found' : 'Missing'}
Zustand Store: ${zustandStore ? 'Found' : 'Missing'}
Store Auth: ${isAuthenticated ? 'True' : 'False'}
`);
  };

  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50">
      <div className="text-sm mb-2">
        <strong>Auth Debug Panel</strong>
      </div>
      <div className="text-xs mb-2 space-y-1">
        <div>User: {user ? '✅' : '❌'} {user?.email}</div>
        <div>Token: {token ? '✅' : '❌'}</div>
        <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>Loading: {isLoading ? '⏳' : '✅'}</div>
      </div>
      <div className="space-y-2">
        <button
          onClick={checkLocalStorage}
          className="w-full text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
          Check Storage
        </button>
        <button
          onClick={handleRefreshAuth}
          className="w-full text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
        >
          Refresh Auth
        </button>
        <button
          onClick={handleForceReAuth}
          className="w-full text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
        >
          Force Re-Auth
        </button>
        <button
          onClick={handleFetchUserWithToken}
          className="w-full text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
        >
          Fetch User w/ Token
        </button>
        <button
          onClick={handleClearAll}
          className="w-full text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};
