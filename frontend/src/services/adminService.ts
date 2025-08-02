import axiosInstance from './axiosInstance';
import { AdminDashboardResponse, IssuesResponse, IssueFilters, User } from '@/types';

export const adminService = {
  // Get dashboard analytics
  getDashboard: async (dateRange: number = 30): Promise<AdminDashboardResponse> => {
    const response = await axiosInstance.get<AdminDashboardResponse>(`/admin/dashboard?dateRange=${dateRange}`);
    return response.data;
  },

  // Get all issues with admin filters
  getAdminIssues: async (filters: IssueFilters & {
    spamVotes?: 'none' | 'medium' | 'high';
    dateFrom?: string;
    dateTo?: string;
    priority?: string;
    isVisible?: boolean;
  } = {}): Promise<IssuesResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await axiosInstance.get<IssuesResponse>(`/admin/issues?${params.toString()}`);
    return response.data;
  },

  // Get all users
  getUsers: async (): Promise<{ 
    success: boolean; 
    data: { 
      users: User[]; 
      pagination: {
        currentPage: number;
        totalPages: number;
        totalUsers: number;
      };
    };
  }> => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },

  // Get spam reports
  getSpamReports: async (): Promise<{
    success: boolean;
    data: {
      reports: Array<{
        _id: string;
        issueId: {
          _id: string;
          title: string;
          description: string;
          category: string;
        };
        reportedBy: {
          _id: string;
          username: string;
          email: string;
        };
        reason: string;
        description: string;
        status: string;
        createdAt: string;
        reviewedBy?: {
          _id: string;
          username: string;
        };
        reviewedAt?: string;
        actionTaken?: string;
      }>;
      pagination: {
        currentPage: number;
        totalPages: number;
        totalReports: number;
      };
    };
  }> => {
    const response = await axiosInstance.get('/admin/spam-reports');
    return response.data;
  },

  // Ban user
  banUser: async (userId: string, reason: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.patch(`/admin/users/${userId}/ban`, { reason });
    return response.data;
  },

  // Unban user
  unbanUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.patch(`/admin/users/${userId}/unban`);
    return response.data;
  },

  // Get spam reports summary
  getSpamSummary: async (): Promise<{
    success: boolean;
    data: Array<{
      reason: string;
      count: number;
      percentage: number;
    }>;
  }> => {
    const response = await axiosInstance.get('/admin/spam-summary');
    return response.data;
  },

  // Hide issue
  hideIssue: async (issueId: string, reason: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.patch(`/admin/issues/${issueId}/hide`, { reason });
    return response.data;
  },

  // Restore issue
  restoreIssue: async (issueId: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.patch(`/admin/issues/${issueId}/restore`);
    return response.data;
  },

  // Update issue status
  updateIssueStatus: async (issueId: string, status: string, adminNotes?: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.patch(`/issues/${issueId}/status`, { 
      status,
      ...(adminNotes && { adminNotes })
    });
    return response.data;
  },

  // Update admin notes
  updateAdminNotes: async (issueId: string, adminNotes: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.patch(`/admin/issues/${issueId}/admin-notes`, { adminNotes });
    return response.data;
  },

  // Get moderation queue (high spam issues)
  getModerationQueue: async (): Promise<IssuesResponse> => {
    const response = await axiosInstance.get('/admin/issues?spamVotes=high');
    return response.data;
  },

  // Get system health
  getSystemHealth: async (): Promise<{
    success: boolean;
    data: {
      uptime: number;
      dbStatus: string;
      apiStatus: string;
      responseTime: number;
      totalIssues: number;
      totalUsers: number;
      diskSpace: string;
      memoryUsage: string;
    };
  }> => {
    const response = await axiosInstance.get('/admin/health');
    return response.data;
  },

  // Export data
  exportData: async (type: 'issues' | 'users' | 'spam', filters?: any): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    params.append('type', type);
    
    const response = await axiosInstance.get(`/admin/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
