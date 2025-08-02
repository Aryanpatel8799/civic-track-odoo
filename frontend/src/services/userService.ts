import axiosInstance from './axiosInstance';
import { IssuesResponse, IssueFilters } from '@/types';

export const userService = {
  // Get current user's issues
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
};
