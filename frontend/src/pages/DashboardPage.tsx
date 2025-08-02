import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus,
  MapPin, 
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  AlertCircle,
  CheckCircle,
  Eye,
  MessageSquare,
  Star,
  Award,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { issueService } from '@/services/issueService';
import { userService } from '@/services/userService';
import { IssueCard } from '@/components/IssueCard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'my-issues' | 'activity'>('overview');

  // Fetch user's issues
  const { data: userIssues, isLoading: issuesLoading } = useQuery(
    ['user-issues', user?._id],
    () => userService.getUserIssues({ 
      limit: 5,
      sort: 'createdAt',
      order: 'desc'
    }),
    { enabled: !!user?._id }
  );

  // Fetch recent issues for activity feed
  const { data: recentIssues, isLoading: recentLoading } = useQuery(
    ['recent-issues'],
    () => issueService.getIssues({ 
      limit: 10,
      sort: 'createdAt',
      order: 'desc'
    })
  );

  const myIssues = userIssues?.data?.issues || [];
  const recent = recentIssues?.data?.issues || [];

  // Calculate user stats
  const userStats = {
    totalReported: myIssues.length,
    resolved: myIssues.filter(issue => issue.status === 'Resolved').length,
    inProgress: myIssues.filter(issue => issue.status === 'In Progress').length,
    pending: myIssues.filter(issue => issue.status === 'Reported').length,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm ">
        <div className="container-responsive py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.username}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening in your community
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                to="/report"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Report New Issue
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-8">
        {/* Quick Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants} className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Issues Reported</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.totalReported}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.resolved}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.inProgress}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Impact Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.resolved * 10 + userStats.inProgress * 5}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'my-issues', label: 'My Issues', icon: FileText },
                { id: 'activity', label: 'Community Activity', icon: MessageSquare },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/report"
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <Plus className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Report New Issue</p>
                      <p className="text-sm text-gray-500">Submit a new civic issue</p>
                    </div>
                  </Link>
                  <Link
                    to="/issues"
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
                  >
                    <MapPin className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Browse Issues</p>
                      <p className="text-sm text-gray-500">Explore community issues</p>
                    </div>
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    <Star className="h-5 w-5 text-purple-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Update Profile</p>
                      <p className="text-sm text-gray-500">Manage your account</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Achievement Card */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="h-5 w-5 text-yellow-500 mr-2" />
                  Your Impact
                </h3>
                <div className="text-center">
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-3">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Community Hero</h4>
                    <p className="text-gray-600">
                      You've made a positive impact in your community!
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{userStats.resolved}</p>
                      <p className="text-sm text-gray-500">Issues Resolved</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {userStats.resolved * 10 + userStats.inProgress * 5}
                      </p>
                      <p className="text-sm text-gray-500">Impact Points</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'my-issues' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Your Recent Issues</h3>
                <Link to="/issues" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All →
                </Link>
              </div>
              
              {issuesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="card p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : myIssues.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myIssues.map((issue) => (
                    <IssueCard key={issue._id} issue={issue} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No issues reported yet</h3>
                  <p className="text-gray-500 mb-4">Start making a difference in your community!</p>
                  <Link to="/report" className="btn-primary">
                    Report Your First Issue
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Community Activity</h3>
              
              {recentLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="card p-4 animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recent.map((issue) => (
                    <motion.div
                      key={issue._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${
                            issue.status === 'Resolved' ? 'bg-green-500' :
                            issue.status === 'In Progress' ? 'bg-yellow-500' :
                            'bg-gray-400'
                          }`}></div>
                          <div>
                            <Link 
                              to={`/issue/${issue._id}`}
                              className="font-medium text-gray-900 hover:text-blue-600"
                            >
                              {issue.title}
                            </Link>
                            <p className="text-sm text-gray-500">
                              {issue.category} • {new Date(issue.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          issue.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                          issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
