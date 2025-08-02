import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';

export const AuthTestPage: React.FC = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);

  const addTestResult = (test: string, result: any) => {
    setTestResults(prev => [...prev, { 
      test, 
      result, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const runTests = async () => {
    setTestResults([]);
    
    // Test 1: Check localStorage
    addTestResult('LocalStorage Token', authService.getToken());
    addTestResult('LocalStorage User', authService.getUser());
    
    // Test 2: Check API Call
    try {
      const profile = await authService.getProfile();
      addTestResult('API Profile Call', { success: true, user: profile.data.username });
    } catch (error: any) {
      addTestResult('API Profile Call', { success: false, error: error.response?.status });
    }
    
    // Test 3: Token Verification
    try {
      const isValid = await authService.verifyToken();
      addTestResult('Token Verification', isValid);
    } catch (error: any) {
      addTestResult('Token Verification', { error: error.message });
    }
  };

  const testLogin = async () => {
    try {
      // Test with demo credentials
      const response = await authService.login({
        email: 'aryan.patel+2@gmail.com',
        password: 'Aryanpatel123@'
      });
      
      if (response.success) {
        login(response.data.token, response.data.user);
        addTestResult('Test Login', { success: true, user: response.data.user.username });
      }
    } catch (error: any) {
      addTestResult('Test Login', { success: false, error: error.response?.data?.message });
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    setTestResults([]);
    addTestResult('Storage Cleared', 'All localStorage cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Test Page</h1>
        
        {/* Current Auth State */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Auth State</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>User:</strong> {user ? user.username : 'null'}</div>
            <div><strong>Is Authenticated:</strong> {isAuthenticated ? 'true' : 'false'}</div>
            <div><strong>Is Loading:</strong> {isLoading ? 'true' : 'false'}</div>
            <div><strong>User Email:</strong> {user ? user.email : 'null'}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={runTests}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Run Authentication Tests
            </button>
            <button
              onClick={testLogin}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Test Login
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
            <button
              onClick={clearStorage}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Storage
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Refresh Page
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Results</h2>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <strong className="text-gray-800">{result.test}</strong>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    <pre className="whitespace-pre-wrap">
                      {typeof result.result === 'object' 
                        ? JSON.stringify(result.result, null, 2)
                        : String(result.result)
                      }
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Test Instructions</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Click "Test Login" to log in with demo credentials</li>
            <li>2. Click "Run Authentication Tests" to check auth state</li>
            <li>3. Click "Refresh Page" to test persistence</li>
            <li>4. Run tests again to see if auth persists</li>
            <li>5. Check browser console for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
