import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Calendar, MapPin, LogOut, Trash2, Save } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const profileSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9]+$/, 'Phone number can only contain digits')
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || ''
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation(
    (data: Partial<ProfileFormData>) => authService.updateProfile(data),
    {
      onSuccess: (response) => {
        setUser(response.data);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
        queryClient.invalidateQueries(['user-profile']);
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to update profile';
        toast.error(message);
      }
    }
  );

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancelEdit = () => {
    reset({
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (confirmed) {
      // In a real app, you would call an API to delete the account
      toast.success('Account deletion feature will be implemented');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please login to view your profile.</p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-responsive py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600 mt-1">
                Manage your account settings and preferences
              </p>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-outline"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={updateProfileMutation.isLoading}
                    className="btn-primary"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('username')}
                      disabled={!isEditing}
                      className={`input pl-10 ${!isEditing ? 'bg-gray-50' : ''} ${errors.username ? 'border-red-300' : ''}`}
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('email')}
                      disabled={!isEditing}
                      className={`input pl-10 ${!isEditing ? 'bg-gray-50' : ''} ${errors.email ? 'border-red-300' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('phone')}
                      disabled={!isEditing}
                      className={`input pl-10 ${!isEditing ? 'bg-gray-50' : ''} ${errors.phone ? 'border-red-300' : ''}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                {/* Role (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      value={user.role === 'admin' ? 'Administrator' : 'User'}
                      disabled
                      className="input pl-10 bg-gray-50"
                    />
                  </div>
                </div>

                {/* Member Since */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Since
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      value={formatDate(user.createdAt)}
                      disabled
                      className="input pl-10 bg-gray-50"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Account Status */}
            {user.isBanned && (
              <div className="card p-6 border-red-200 bg-red-50">
                <h2 className="text-xl font-semibold text-red-900 mb-2">
                  Account Status
                </h2>
                <p className="text-red-800">
                  Your account has been temporarily restricted. Please contact support for more information.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Activity
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Issues Reported</span>
                  <span className="font-medium">{user.issuesReported}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Spam Reports</span>
                  <span className="font-medium">{user.spamReports}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Status</span>
                  <span className={`font-medium ${user.isBanned ? 'text-red-600' : 'text-green-600'}`}>
                    {user.isBanned ? 'Restricted' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/issues')}
                  className="w-full btn-outline text-left"
                >
                  <MapPin className="h-4 w-4 inline mr-2" />
                  View My Issues
                </button>
                <button
                  onClick={() => navigate('/report')}
                  className="w-full btn-outline text-left"
                >
                  <User className="h-4 w-4 inline mr-2" />
                  Report New Issue
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="card p-6 border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-4">
                Danger Zone
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full btn-outline text-red-600 border-red-300 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 inline mr-2" />
                  Logout
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full btn-outline text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 inline mr-2" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
