import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Layout } from '@/components/Layout';
import { AuthDebugPanel } from '@/components/AuthDebugPanel';
import { AuthWatcher } from '@/components/AuthWatcher';
import { useAuthStore } from '@/store/authStore';
import { useAuthRestore } from '@/hooks/useAuthRestore';

// Pages
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ReportPage } from '@/pages/ReportPage';
import { IssueDetailPage } from '@/pages/IssueDetailPage';
import { IssuesPage } from '@/pages/IssuesPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AdminPage } from '@/pages/AdminPage';
import { AuthDebugPage } from '@/pages/AuthDebugPage';
import { AuthTestPage } from '@/pages/AuthTestPage';
import { AdminTestPage } from '@/pages/AdminTestPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { initialize } = useAuthStore();

  // Use the auth restore hook for additional safety
  useAuthRestore();

  useEffect(() => {
    // Force immediate auth initialization on app start
    console.log('App: Forcing immediate auth initialization');
    initialize();
    
    // Reduce loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Slightly longer to allow auth initialization

    return () => clearTimeout(timer);
  }, [initialize]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthWatcher />
        <Router 
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={
                  <Layout>
                    <HomePage />
                  </Layout>
                } 
              />
              <Route 
                path="/login" 
                element={
                  <Layout showNavbar={false} showFooter={false}>
                    <LoginPage />
                  </Layout>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <Layout showNavbar={false} showFooter={false}>
                    <RegisterPage />
                  </Layout>
                } 
              />
              <Route 
                path="/issue/:id" 
                element={
                  <Layout>
                    <IssueDetailPage />
                  </Layout>
                } 
              />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/report" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ReportPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/issues" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <IssuesPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProfilePage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <AdminPage />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Debug Route */}
              {/* <Route 
                path="/auth-debug" 
                element={
                  <Layout>
                    <AuthDebugPage />
                  </Layout>
                } 
              />
               */}
              {/* Auth Test Route */}
              {/* <Route 
                path="/auth-test" 
                element={
                  <Layout>
                    <AuthTestPage />
                  </Layout>
                } 
              /> */}
              
              {/* Error Routes */}
              <Route 
                path="/unauthorized" 
                element={
                  <Layout>
                    <UnauthorizedPage />
                  </Layout>
                } 
              />
              <Route 
                path="*" 
                element={
                  <Layout>
                    <NotFoundPage />
                  </Layout>
                } 
              />
            </Routes>

            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: 'toast',
                style: {
                  background: '#363636',
                  color: '#fff',
                  padding: '16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
                success: {
                  className: 'toast-success',
                  style: {
                    background: '#f0fdf4',
                    color: '#166534',
                    border: '1px solid #bbf7d0',
                  },
                },
                error: {
                  className: 'toast-error',
                  style: {
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                  },
                },
              }}
            />

            {/* Auth Debug Panel (Development Only) */}
            {/* <AuthDebugPanel /> */}
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
