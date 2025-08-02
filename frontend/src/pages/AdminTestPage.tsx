import React, { useState } from 'react';
import { authService } from '@/services/authService';
import { adminService } from '@/services/adminService';

export const AdminTestPage: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, result: any) => {
    setResults(prev => [...prev, {
      test,
      result,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testAdminEndpoints = async () => {
    setLoading(true);
    setResults([]);

    try {
      // Test authentication first
      const token = authService.getToken();
      addResult('Auth Token Present', !!token);

      if (!token) {
        addResult('Error', 'No authentication token found. Please login first.');
        setLoading(false);
        return;
      }

      // Test profile to check if user is admin
      try {
        const profile = await authService.getProfile();
        addResult('Current User Profile', {
          username: profile.data.username,
          role: profile.data.role,
          isAdmin: profile.data.role === 'admin'
        });

        if (profile.data.role !== 'admin') {
          addResult('Error', 'Current user is not an admin. Cannot test admin endpoints.');
          setLoading(false);
          return;
        }
      } catch (error: any) {
        addResult('Profile Check Failed', error.response?.data || error.message);
        setLoading(false);
        return;
      }

      // Test admin dashboard
      try {
        const dashboard = await adminService.getDashboard();
        addResult('Admin Dashboard', {
          success: dashboard.success,
          totalUsers: dashboard.data?.overview?.totalUsers,
          totalIssues: dashboard.data?.overview?.totalIssues,
          totalSpamReports: dashboard.data?.overview?.totalSpamReports
        });
      } catch (error: any) {
        addResult('Admin Dashboard Failed', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message
        });
      }

      // Test get users
      try {
        const users = await adminService.getUsers();
        addResult('Get Users', {
          success: users.success,
          userCount: users.data?.length || 0,
          firstUser: users.data?.[0]?.username || 'None'
        });
      } catch (error: any) {
        addResult('Get Users Failed', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message
        });
      }

      // Test get spam reports
      try {
        const spamReports = await adminService.getSpamReports();
        addResult('Get Spam Reports', {
          success: spamReports.success,
          reportCount: spamReports.data?.reports?.length || 0,
          totalReports: spamReports.data?.pagination?.totalReports || 0
        });
      } catch (error: any) {
        addResult('Get Spam Reports Failed', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message
        });
      }

      // Test spam summary
      try {
        const spamSummary = await adminService.getSpamSummary();
        addResult('Get Spam Summary', {
          success: spamSummary.success,
          summaryCount: spamSummary.data?.length || 0
        });
      } catch (error: any) {
        addResult('Get Spam Summary Failed', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message
        });
      }

      // Test system health
      try {
        const health = await adminService.getSystemHealth();
        addResult('System Health', {
          success: health.success,
          dbStatus: health.data?.dbStatus,
          apiStatus: health.data?.apiStatus
        });
      } catch (error: any) {
        addResult('System Health Failed', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message
        });
      }

    } catch (error: any) {
      addResult('Unexpected Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loginAsAdmin = async () => {
    try {
      setLoading(true);
      const response = await authService.login({
        email: 'aryan.patel+2@gmail.com',
        password: 'Aryanpatel123@'
      });
      
      if (response.success) {
        addResult('Admin Login', {
          success: true,
          user: response.data.user.username,
          role: response.data.user.role
        });
        // Store token using auth service
        authService.setToken(response.data.token);
        authService.setUser(response.data.user);
      }
    } catch (error: any) {
      addResult('Admin Login Failed', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin API Test Page</h1>
        
        {/* Actions */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={loginAsAdmin}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Login as Admin'}
            </button>
            <button
              onClick={testAdminEndpoints}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Admin Endpoints'}
            </button>
            <button
              onClick={() => setResults([])}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Test Results */}
        {results.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Results</h2>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <strong className="text-gray-800">{result.test}</strong>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  <div className="mt-1 text-sm">
                    <pre className="whitespace-pre-wrap bg-gray-50 p-2 rounded text-xs overflow-x-auto">
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
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Testing Instructions</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Click "Login as Admin" to authenticate with admin credentials</li>
            <li>2. Click "Test Admin Endpoints" to test all admin API endpoints</li>
            <li>3. Check the results to see which endpoints are working and which are failing</li>
            <li>4. Look for HTTP status codes and error messages for failed requests</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
