import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';

export const AuthDebugPage: React.FC = () => {
  const { user, token, isAuthenticated, isLoading } = useAuthStore();
  const [localStorageData, setLocalStorageData] = useState<any>({});
  const [authServiceData, setAuthServiceData] = useState<any>({});
  const [apiTestResult, setApiTestResult] = useState<any>(null);

  useEffect(() => {
    // Check localStorage directly
    const lsToken = localStorage.getItem('authToken');
    const lsUser = localStorage.getItem('user');
    const lsAuthStore = localStorage.getItem('auth-store');
    
    setLocalStorageData({
      authToken: lsToken,
      user: lsUser ? JSON.parse(lsUser) : null,
      authStore: lsAuthStore ? JSON.parse(lsAuthStore) : null
    });

    // Check authService
    setAuthServiceData({
      token: authService.getToken(),
      user: authService.getUser(),
      isAuthenticated: authService.isAuthenticated()
    });

    // Test API call
    testApiCall();
  }, []);

  const testApiCall = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setApiTestResult({
        status: response.status,
        success: response.ok,
        data: data
      });
    } catch (error) {
      setApiTestResult({
        status: 'ERROR',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const refreshAuth = () => {
    useAuthStore.getState().initialize();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Zustand Store State */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Zustand Store State</h2>
            <div className="space-y-2 text-sm">
              <div><strong>User:</strong> {user ? user.username : 'null'}</div>
              <div><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'null'}</div>
              <div><strong>Is Authenticated:</strong> {isAuthenticated ? 'true' : 'false'}</div>
              <div><strong>Is Loading:</strong> {isLoading ? 'true' : 'false'}</div>
            </div>
          </div>

          {/* Local Storage Data */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Local Storage Data</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Auth Token:</strong> {localStorageData.authToken ? `${localStorageData.authToken.substring(0, 20)}...` : 'null'}</div>
              <div><strong>User:</strong> {localStorageData.user ? localStorageData.user.username : 'null'}</div>
              <div><strong>Auth Store:</strong> {localStorageData.authStore ? 'present' : 'null'}</div>
            </div>
          </div>

          {/* Auth Service Data */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Auth Service Data</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Token:</strong> {authServiceData.token ? `${authServiceData.token.substring(0, 20)}...` : 'null'}</div>
              <div><strong>User:</strong> {authServiceData.user ? authServiceData.user.username : 'null'}</div>
              <div><strong>Is Authenticated:</strong> {authServiceData.isAuthenticated ? 'true' : 'false'}</div>
            </div>
          </div>

          {/* API Test Result */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">API Test Result</h2>
            {apiTestResult ? (
              <div className="space-y-2 text-sm">
                <div><strong>Status:</strong> <span className={apiTestResult.success ? 'text-green-600' : 'text-red-600'}>{apiTestResult.status}</span></div>
                <div><strong>Success:</strong> {apiTestResult.success ? 'true' : 'false'}</div>
                {apiTestResult.data && (
                  <div><strong>User from API:</strong> {apiTestResult.data.username}</div>
                )}
                {apiTestResult.error && (
                  <div><strong>Error:</strong> {apiTestResult.error}</div>
                )}
              </div>
            ) : (
              <div>Loading...</div>
            )}
          </div>
        </div>

        <div className="mt-8 flex space-x-4">
          <button
            onClick={refreshAuth}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Authentication
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Hard Reload Page
          </button>
          <button
            onClick={() => {
              setApiTestResult(null);
              testApiCall();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test API Again
          </button>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Instructions</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>1. Login normally, then navigate to this page</li>
            <li>2. Check if all data sources show the same information</li>
            <li>3. Refresh the page and check again</li>
            <li>4. Look for mismatches between Zustand store and localStorage</li>
            <li>5. Check if API calls succeed with the stored token</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
