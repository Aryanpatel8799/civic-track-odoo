import axiosInstance from './axiosInstance';
import { 
  Issue,
  IssueResponse,
  IssuesResponse,
  CreateIssueRequest,
  IssueFilters,
  SpamReportRequest,
  ActivityResponse
} from '@/types';

export const issueService = {
  // Get issues with filters and pagination
  getIssues: async (filters: IssueFilters = {}): Promise<IssuesResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await axiosInstance.get<IssuesResponse>(`/issues?${params.toString()}`);
    return response.data;
  },

  // Get nearby issues
  getNearbyIssues: async (lat: number, lng: number, distance: number = 5000, filters: IssueFilters = {}): Promise<IssuesResponse> => {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      distance: distance.toString(),
      ...Object.fromEntries(
        Object.entries(filters).map(([key, value]) => [key, value?.toString() || ''])
      )
    });

    const response = await axiosInstance.get<IssuesResponse>(`/issues/nearby?${params.toString()}`);
    return response.data;
  },

  // Get single issue by ID
  getIssueById: async (id: string): Promise<IssueResponse> => {
    const response = await axiosInstance.get<IssueResponse>(`/issues/${id}`);
    return response.data;
  },

  // Create new issue
  createIssue: async (data: CreateIssueRequest): Promise<IssueResponse> => {
    const formData = new FormData();
    
    // Append basic data
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('coordinates', JSON.stringify(data.coordinates));
    formData.append('isAnonymous', data.isAnonymous.toString());
    
    // Append address if provided
    if (data.address) {
      formData.append('address', data.address);
    }
    
    // Append images
    data.images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await axiosInstance.post<IssueResponse>('/issues', formData);
    return response.data;
  },

  // Update issue status (admin only)
  updateIssueStatus: async (id: string, status: Issue['status'], notes?: string): Promise<IssueResponse> => {
    const response = await axiosInstance.patch<IssueResponse>(`/issues/${id}/status`, {
      status,
      notes
    });
    return response.data;
  },

  // Upvote/downvote issue
  toggleUpvote: async (id: string): Promise<{ success: boolean; message: string; upvoted: boolean }> => {
    const response = await axiosInstance.post(`/issues/${id}/upvote`);
    return response.data;
  },

  // Report issue as spam
  reportSpam: async (id: string, data: SpamReportRequest): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.post(`/issues/${id}/spam`, data);
    return response.data;
  },

  // Get issue activity timeline
  getIssueActivity: async (id: string): Promise<ActivityResponse> => {
    const response = await axiosInstance.get<ActivityResponse>(`/issues/${id}/activity`);
    return response.data;
  },

  // Hide issue (admin only)
  hideIssue: async (id: string, reason?: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.patch(`/admin/issues/${id}/hide`, { reason });
    return response.data;
  },

  // Restore hidden issue (admin only)
  restoreIssue: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.patch(`/admin/issues/${id}/restore`);
    return response.data;
  },

  // Get user's issues
  getUserIssues: async (filters: IssueFilters = {}): Promise<IssuesResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await axiosInstance.get<IssuesResponse>(`/users/issues?${params.toString()}`);
    return response.data;
  },

  // Get issue statistics
  getIssueStats: async (): Promise<{
    success: boolean;
    data: {
      totalIssues: number;
      resolvedIssues: number;
      inProgressIssues: number;
      newIssues: number;
      byStatus: { [key: string]: number };
      byCategory: { [key: string]: number };
    };
  }> => {
    const response = await axiosInstance.get('/issues/stats');
    return response.data;
  }
};
