import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <ShieldX className="mx-auto h-24 w-24 text-red-500" />
          <h1 className="mt-6 text-4xl font-bold text-gray-900">
            Access Denied
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            You don't have permission to access this page
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Please contact an administrator if you believe this is an error
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Link
            to="/"
            className="btn-primary w-full flex items-center justify-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn-secondary w-full flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Error Code: 403 - Forbidden
          </p>
        </div>
      </div>
    </div>
  );
};
