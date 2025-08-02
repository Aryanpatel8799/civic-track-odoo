import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Flag, 
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Settings,
  Shield,
  Eye,
  EyeOff,
  Ban,
  UserCheck,
  AlertTriangle,
  Activity,
  Search,
  Filter,
  MoreVertical,
  Check,
  X,
  Download,
  RefreshCw,
  MapPin,
  Clock,
  Star,
  UserX,
  Edit,
  Save,
  AlertCircle,
  Monitor,
  Database,
  Zap
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { issueService } from '@/services/issueService';
import { User, Issue } from '@/types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

type AdminTab = 'dashboard' | 'users' | 'issues' | 'moderation' | 'spam-reports' | 'health';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [dateRange, setDateRange] = useState(30);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [spamFilter, setSpamFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    ['admin-dashboard', dateRange],
    () => adminService.getDashboard(dateRange),
    { enabled: activeTab === 'dashboard' }
  );

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery(
    ['admin-users'],
    () => adminService.getUsers(),
    { enabled: activeTab === 'users' }
  );

  // Fetch admin issues
  const { data: adminIssues, isLoading: issuesLoading } = useQuery(
    ['admin-issues', statusFilter, searchTerm],
    () => adminService.getAdminIssues({
      ...(statusFilter !== 'all' && { status: statusFilter as any }),
      ...(searchTerm && { search: searchTerm }),
      limit: 50
    }),
    { enabled: activeTab === 'issues' }
  );

  // Fetch spam reports
  const { data: spamData, isLoading: spamLoading } = useQuery(
    ['admin-spam'],
    () => adminService.getSpamSummary(),
    { enabled: activeTab === 'spam-reports' }
  );

  // Mutations
  const banUserMutation = useMutation(
    ({ userId, reason }: { userId: string; reason: string }) => 
      adminService.banUser(userId, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users']);
        toast.success('User banned successfully');
      },
      onError: () => {
        toast.error('Failed to ban user');
      }
    }
  );

  const unbanUserMutation = useMutation(
    (userId: string) => adminService.unbanUser(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users']);
        toast.success('User unbanned successfully');
      },
      onError: () => {
        toast.error('Failed to unban user');
      }
    }
  );

  const hideIssueMutation = useMutation(
    ({ issueId, reason }: { issueId: string; reason: string }) => 
      issueService.hideIssue(issueId, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-issues']);
        toast.success('Issue hidden successfully');
      },
      onError: () => {
        toast.error('Failed to hide issue');
      }
    }
  );

  const restoreIssueMutation = useMutation(
    (issueId: string) => issueService.restoreIssue(issueId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-issues']);
        toast.success('Issue restored successfully');
      },
      onError: () => {
        toast.error('Failed to restore issue');
      }
    }
  );

  const dashboard = dashboardData?.data;
  const users = usersData?.data || [];
  const issues = adminIssues?.data?.issues || [];
  const spamReports = spamData?.data || [];

  const handleBanUser = (userId: string, username: string) => {
    const reason = prompt(`Enter reason for banning ${username}:`);
    if (reason) {
      banUserMutation.mutate({ userId, reason });
    }
  };

  const handleHideIssue = (issueId: string, title: string) => {
    const reason = prompt(`Enter reason for hiding "${title}":`);
    if (reason) {
      hideIssueMutation.mutate({ issueId, reason });
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'issues', label: 'Issue Management', icon: FileText },
    { id: 'moderation', label: 'Moderation Panel', icon: Shield },
    { id: 'spam-reports', label: 'Spam Reports', icon: Flag },
    { id: 'health', label: 'System Health', icon: Monitor },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-responsive py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                Admin Panel
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive management of CivicTrack platform
              </p>
            </div>
            {activeTab === 'dashboard' && (
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  Date Range:
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(Number(e.target.value))}
                  className="input"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                  <option value={365}>Last year</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-responsive py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminTab)}
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
        {activeTab === 'dashboard' && (
          <>
            {dashboardLoading ? (
              <div className="animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="card p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="card p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Issues</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {dashboard?.overview.totalIssues || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {dashboard?.overview.totalUsers || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <Flag className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Spam Reports</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {dashboard?.overview.totalSpamReports || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {dashboard?.overview.avgResolutionTime?.toFixed(1) || 0} days
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Status Breakdown */}
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <PieChart className="h-5 w-5 mr-2" />
                      Issues by Status
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={dashboard?.charts.statusBreakdown || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(dashboard?.charts.statusBreakdown || []).map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Category Breakdown */}
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Issues by Category
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dashboard?.charts.categoryBreakdown || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Issues Trend */}
                <div className="card p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Issues Trend Over Time
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboard?.charts.issuesTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Reporters */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Top Issue Reporters
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Issues Reported
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Join Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(dashboard?.topReporters || []).map((reporter, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {reporter.user.username}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {reporter.user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {reporter.issueCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(reporter.user.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
              <div className="text-sm text-gray-500">
                Total Users: {users.length}
              </div>
            </div>
            
            {usersLoading ? (
              <div className="card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Issues
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user: User) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.username}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {user._id.slice(-8)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.issuesReported || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.isBanned 
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {user.isBanned ? 'Banned' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.role !== 'admin' && (
                              <div className="flex space-x-2">
                                {user.isBanned ? (
                                  <button
                                    onClick={() => unbanUserMutation.mutate(user._id)}
                                    className="text-green-600 hover:text-green-800"
                                    title="Unban user"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleBanUser(user._id, user.username)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Ban user"
                                  >
                                    <Ban className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'issues' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Issue Management</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search issues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input w-64"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">All Statuses</option>
                  <option value="Reported">Reported</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
            
            {issuesLoading ? (
              <div className="card p-6 animate-pulse">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Issue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reporter
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Spam Reports
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Visibility
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {issues.map((issue) => (
                        <tr key={issue._id}>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                {issue.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(issue.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {issue.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              issue.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                              issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {issue.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {issue.isAnonymous ? 'Anonymous' : issue.user?.username || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              issue.spamVotes > 5 ? 'bg-red-100 text-red-800' :
                              issue.spamVotes > 2 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {issue.spamVotes}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              issue.isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {issue.isVisible ? 'Visible' : 'Hidden'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              {issue.isVisible ? (
                                <button
                                  onClick={() => handleHideIssue(issue._id, issue.title)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Hide issue"
                                >
                                  <EyeOff className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => restoreIssueMutation.mutate(issue._id)}
                                  className="text-green-600 hover:text-green-800"
                                  title="Restore issue"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'spam-reports' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Spam Reports Management</h3>
              <div className="text-sm text-gray-500">
                Total Reports: {spamReports.length}
              </div>
            </div>
            
            {spamLoading ? (
              <div className="card p-6 animate-pulse">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : spamReports.length > 0 ? (
              <div className="card p-6">
                <div className="space-y-4">
                  {spamReports.map((report: any) => (
                    <div key={report._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">
                            {report.issue?.title || 'Deleted Issue'}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                            <span>Reason: {report.reason}</span>
                            <span>•</span>
                            <span>
                              Reported by: {report.reportedBy?.username || 'Unknown'}
                            </span>
                            <span>•</span>
                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                          {report.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              Description: {report.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Issue Status:</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              report.issue?.isVisible 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {report.issue?.isVisible ? 'Visible' : 'Hidden'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {report.issue?.isVisible ? (
                            <button
                              onClick={() => handleHideIssue(report.issue._id, report.issue.title)}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Hide Issue
                            </button>
                          ) : (
                            <button
                              onClick={() => restoreIssueMutation.mutate(report.issue._id)}
                              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              Restore Issue
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Spam Reports</h3>
                <p className="text-gray-500">No spam reports to review at this time.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
