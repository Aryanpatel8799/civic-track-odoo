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

  // Queries
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    ['admin-dashboard', dateRange],
    () => adminService.getDashboard(dateRange),
    { enabled: activeTab === 'dashboard' }
  );

  const { data: usersData, isLoading: usersLoading } = useQuery(
    ['admin-users'],
    () => adminService.getUsers(),
    { enabled: activeTab === 'users' }
  );

  const { data: adminIssues, isLoading: issuesLoading } = useQuery(
    ['admin-issues', statusFilter, categoryFilter, spamFilter, searchTerm, dateFrom, dateTo],
    () => adminService.getAdminIssues({
      ...(statusFilter !== 'all' && { status: statusFilter as any }),
      ...(categoryFilter !== 'all' && { category: categoryFilter as any }),
      ...(spamFilter !== 'all' && { spamVotes: spamFilter as any }),
      ...(searchTerm && { search: searchTerm }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
      limit: 50
    }),
    { enabled: activeTab === 'issues' }
  );

  const { data: moderationQueue, isLoading: moderationLoading } = useQuery(
    ['moderation-queue'],
    () => adminService.getModerationQueue(),
    { enabled: activeTab === 'moderation' }
  );

  const { data: spamData, isLoading: spamLoading } = useQuery(
    ['admin-spam'],
    () => adminService.getSpamSummary(),
    { enabled: activeTab === 'spam-reports' }
  );

  const { data: spamReportsData, isLoading: spamReportsLoading } = useQuery(
    ['admin-spam-reports'],
    () => adminService.getSpamReports(),
    { enabled: activeTab === 'spam-reports' }
  );

  const { data: healthData, isLoading: healthLoading } = useQuery(
    ['system-health'],
    () => adminService.getSystemHealth(),
    { 
      enabled: activeTab === 'health',
      refetchInterval: 30000 // Refresh every 30 seconds
    }
  );

  // Mutations
  const banUserMutation = useMutation(
    ({ userId, reason }: { userId: string; reason: string }) => 
      adminService.banUser(userId, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users']);
        toast.success('User banned successfully');
        setShowBanModal(false);
        setBanReason('');
        setSelectedUser(null);
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
      adminService.hideIssue(issueId, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-issues']);
        queryClient.invalidateQueries(['moderation-queue']);
        toast.success('Issue hidden successfully');
      },
      onError: () => {
        toast.error('Failed to hide issue');
      }
    }
  );

  const restoreIssueMutation = useMutation(
    (issueId: string) => adminService.restoreIssue(issueId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-issues']);
        queryClient.invalidateQueries(['moderation-queue']);
        toast.success('Issue restored successfully');
      },
      onError: () => {
        toast.error('Failed to restore issue');
      }
    }
  );

  const updateStatusMutation = useMutation(
    ({ issueId, status, notes }: { issueId: string; status: string; notes?: string }) => 
      adminService.updateIssueStatus(issueId, status, notes),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-issues']);
        queryClient.invalidateQueries(['moderation-queue']);
        toast.success('Issue status updated successfully');
      },
      onError: () => {
        toast.error('Failed to update issue status');
      }
    }
  );

  const updateNotesMutation = useMutation(
    ({ issueId, notes }: { issueId: string; notes: string }) => 
      adminService.updateAdminNotes(issueId, notes),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-issues']);
        queryClient.invalidateQueries(['moderation-queue']);
        toast.success('Admin notes updated successfully');
        setEditingNotes(null);
        setAdminNotes('');
      },
      onError: () => {
        toast.error('Failed to update admin notes');
      }
    }
  );

  const exportMutation = useMutation(
    ({ type, filters }: { type: 'issues' | 'users' | 'spam'; filters?: any }) => 
      adminService.exportData(type, filters),
    {
      onSuccess: (blob, variables) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${variables.type}-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Export completed successfully');
      },
      onError: () => {
        toast.error('Failed to export data');
      }
    }
  );

  const dashboard = dashboardData?.data;
  const users = usersData?.data?.users || [];
  const issues = adminIssues?.data?.issues || [];
  const moderationIssues = moderationQueue?.data?.issues || [];
  const spamReports = spamReportsData?.data?.reports || [];
  const spamSummary = spamData?.data || [];
  const health = healthData?.data;

  const handleBanUser = (user: User) => {
    setSelectedUser(user);
    setShowBanModal(true);
  };

  const handleUnbanUser = (userId: string) => {
    unbanUserMutation.mutate(userId);
  };

  const handleHideIssue = (issueId: string, title: string) => {
    const reason = prompt(`Enter reason for hiding "${title}":`);
    if (reason) {
      hideIssueMutation.mutate({ issueId, reason });
    }
  };

  const handleRestoreIssue = (issueId: string) => {
    restoreIssueMutation.mutate(issueId);
  };

  const handleStatusUpdate = (issueId: string, status: string) => {
    updateStatusMutation.mutate({ issueId, status });
  };

  const handleNotesUpdate = (issueId: string) => {
    if (adminNotes.trim()) {
      updateNotesMutation.mutate({ issueId, notes: adminNotes });
    }
  };

  const handleExport = (type: 'issues' | 'users' | 'spam') => {
    const filters: any = {};
    if (type === 'issues') {
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (categoryFilter !== 'all') filters.category = categoryFilter;
      if (spamFilter !== 'all') filters.spamVotes = spamFilter;
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;
    }
    exportMutation.mutate({ type, filters });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSpamFilter('all');
    setDateFrom('');
    setDateTo('');
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
            {/* <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                Admin Panel
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive management and analytics for CivicTrack
              </p>
            </div> */}
            {/* <div className="flex items-center gap-4">
              <button
                onClick={() => queryClient.invalidateQueries()}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div> */}
          </div>
        </div>
      </div>

      <div className="container-responsive py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
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
          <div>
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
                        <Clock className="h-6 w-6 text-purple-600" />
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
                        {(dashboard?.topReporters || [])
                          .filter(reporter => reporter && reporter.user && reporter.user.username)
                          .map((reporter, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {reporter.user?.username || 'Unknown User'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {reporter.user?.email || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {reporter.issueCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {reporter.user?.createdAt ? new Date(reporter.user.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleExport('users')}
                  className="btn-secondary flex items-center gap-2"
                  disabled={exportMutation.isLoading}
                >
                  <Download className="h-4 w-4" />
                  Export Users
                </button>
              </div>
            </div>
            
            {usersLoading ? (
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
                      {users.filter(user => user && user._id).map((user: User) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user?.username || 'Unknown User'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user?.phone || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.issuesReported}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {user.isBanned ? 'Banned' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.role !== 'admin' && (
                              <div className="flex space-x-2">
                                {user.isBanned ? (
                                  <button
                                    onClick={() => handleUnbanUser(user._id)}
                                    className="text-green-600 hover:text-green-800"
                                    title="Unban user"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleBanUser(user)}
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
                <button
                  onClick={() => handleExport('issues')}
                  className="btn-secondary flex items-center gap-2"
                  disabled={exportMutation.isLoading}
                >
                  <Download className="h-4 w-4" />
                  Export Issues
                </button>
                <button
                  onClick={resetFilters}
                  className="btn-secondary flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="card p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search issues..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="input"
                  >
                    <option value="all">All Categories</option>
                    <option value="Road">Road</option>
                    <option value="Water">Water</option>
                    <option value="Cleanliness">Cleanliness</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Safety">Safety</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spam Level</label>
                  <select
                    value={spamFilter}
                    onChange={(e) => setSpamFilter(e.target.value)}
                    className="input"
                  >
                    <option value="all">All Levels</option>
                    <option value="none">No Spam</option>
                    <option value="medium">Medium Spam</option>
                    <option value="high">High Spam</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="input"
                  />
                </div>
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
                          Spam
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
                      {issues.filter(issue => issue && issue._id).map((issue: Issue) => (
                        <tr key={issue._id}>
                          <td className="px-6 py-4">
                            <div>
                              <Link
                                to={`/issue/${issue._id}`}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 max-w-xs truncate block"
                              >
                                {issue.title}
                              </Link>
                              <div className="text-sm text-gray-500">
                                {new Date(issue.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {issue.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={issue.status}
                              onChange={(e) => handleStatusUpdate(issue._id, e.target.value)}
                              className="text-xs border rounded px-2 py-1"
                            >
                              <option value="Reported">Reported</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                            </select>
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
                                  onClick={() => handleRestoreIssue(issue._id)}
                                  className="text-green-600 hover:text-green-800"
                                  title="Restore issue"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setEditingNotes(issue._id);
                                  setAdminNotes(issue.adminNotes || '');
                                }}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit admin notes"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
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

        {activeTab === 'moderation' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Moderation Panel</h3>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-sm text-red-600">
                  {moderationIssues.length} issues need attention
                </span>
              </div>
            </div>
            
            {moderationLoading ? (
              <div className="card p-6 animate-pulse">
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : moderationIssues.length === 0 ? (
              <div className="card p-12 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Moderation Required</h3>
                <p className="text-gray-500">All issues are currently clean of spam reports</p>
              </div>
            ) : (
              <div className="space-y-6">
                {moderationIssues.filter(issue => issue && issue._id).map((issue: Issue) => (
                  <div key={issue._id} className="card p-6 border-l-4 border-red-500">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <Link
                            to={`/issue/${issue._id}`}
                            className="text-lg font-medium text-blue-600 hover:text-blue-800"
                          >
                            {issue.title}
                          </Link>
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            {issue.spamVotes} spam reports
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{issue.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Category: {issue.category}</span>
                          <span>Status: {issue.status}</span>
                          <span>Reporter: {issue.isAnonymous ? 'Anonymous' : issue.user?.username}</span>
                          <span>Date: {new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => handleRestoreIssue(issue._id)}
                          className="btn-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleHideIssue(issue._id, issue.title)}
                          className="btn-sm bg-red-600 text-white hover:bg-red-700 flex items-center gap-1"
                        >
                          <X className="h-3 w-3" />
                          Hide
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'spam-reports' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Spam Reports Analysis</h3>
              <button
                onClick={() => handleExport('spam')}
                className="btn-secondary flex items-center gap-2"
                disabled={exportMutation.isLoading}
              >
                <Download className="h-4 w-4" />
                Export Reports
              </button>
            </div>
            
            {spamLoading ? (
              <div className="card p-6 animate-pulse">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Spam Reasons Chart */}
                <div className="card p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Spam Reasons Breakdown</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={spamReports}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ reason, percentage }: any) => `${reason} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {spamReports.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                {/* Spam Stats */}
                <div className="card p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Statistics</h4>
                  <div className="space-y-4">
                    {spamLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading spam statistics...</p>
                      </div>
                    ) : spamSummary && Array.isArray(spamSummary) && spamSummary.length > 0 ? (
                      spamSummary.map((report, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{report.reason}</p>
                            <p className="text-sm text-gray-500">{report.percentage}% of all reports</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{report.count}</p>
                            <p className="text-sm text-gray-500">reports</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500">No spam statistics available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Spam Reports List */}
                <div className="card p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Reports</h4>
                  <div className="space-y-4">
                    {spamReportsLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading spam reports...</p>
                      </div>
                    ) : spamReports && Array.isArray(spamReports) && spamReports.length > 0 ? (
                      spamReports.map((report, index) => (
                        <div key={report._id || index} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium text-gray-900">
                              {report.issueId?.title || 'Issue Title Not Available'}
                            </h5>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              report.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              report.status === 'Reviewed' ? 'bg-blue-100 text-blue-800' :
                              report.status === 'Action Taken' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {report.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Reason:</strong> {report.reason}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Reported by:</strong> {report.reportedBy?.username || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                          {report.description && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Description:</strong> {report.description}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500">No spam reports available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'health' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live monitoring</span>
              </div>
            </div>
            
            {healthLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="card p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : health ? (
              <>
                {/* Health Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="card p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Zap className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Uptime</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Database className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Database</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {health.dbStatus}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Activity className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Response Time</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {health.responseTime}ms
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Monitor className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">API Status</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {health.apiStatus}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="card p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">System Resources</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Memory Usage</span>
                        <span className="font-medium">{health.memoryUsage}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Disk Space</span>
                        <span className="font-medium">{health.diskSpace}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Database Stats</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Issues</span>
                        <span className="font-medium">{health.totalIssues}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Users</span>
                        <span className="font-medium">{health.totalUsers}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card p-12 text-center">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Health Check Failed</h3>
                <p className="text-gray-500">Unable to retrieve system health information</p>
              </div>
            )}
          </div>
        )}

        {/* Ban User Modal */}
        {showBanModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ban User: {selectedUser.username}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for ban
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="input min-h-[100px]"
                  placeholder="Enter reason for banning this user..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowBanModal(false);
                    setBanReason('');
                    setSelectedUser(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (banReason.trim()) {
                      banUserMutation.mutate({ userId: selectedUser._id, reason: banReason });
                    }
                  }}
                  disabled={!banReason.trim() || banUserMutation.isLoading}
                  className="btn-primary bg-red-600 hover:bg-red-700"
                >
                  Ban User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Notes Modal */}
        {editingNotes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Admin Notes
              </h3>
              <div className="mb-4">
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="input min-h-[100px]"
                  placeholder="Enter admin notes for this issue..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setEditingNotes(null);
                    setAdminNotes('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleNotesUpdate(editingNotes)}
                  disabled={updateNotesMutation.isLoading}
                  className="btn-primary"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
