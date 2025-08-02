import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="mx-auto h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center mb-8">
          <span className="text-4xl font-bold text-primary-600">404</span>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="btn-primary inline-flex items-center"
          >
            <Home className="h-5 w-5 mr-2" />
            Go Home
          </Link>
          
          <div>
            <button
              onClick={() => window.history.back()}
              className="btn-outline inline-flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-8">
          <span className="text-4xl font-bold text-red-600">403</span>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          You don't have permission to access this page.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="btn-primary inline-flex items-center"
          >
            <Home className="h-5 w-5 mr-2" />
            Go Home
          </Link>
          
          <div>
            <Link
              to="/login"
              className="btn-outline inline-flex items-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
