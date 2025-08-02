export interface User {
  _id: string;
  username: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  isBanned: boolean;
  issuesReported: number;
  spamReports: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  phone: string;
  password: string;
}

export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: 'Road' | 'Water' | 'Cleanliness' | 'Lighting' | 'Safety';
  status: 'Reported' | 'In Progress' | 'Resolved';
  user?: User;
  isAnonymous: boolean;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  images: string[];
  spamVotes: number;
  isVisible: boolean;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  views: number;
  upvotes: number;
  lastStatusUpdate: string;
  estimatedResolutionTime?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  distance?: number; // For nearby queries
}

export interface CreateIssueRequest {
  title: string;
  description: string;
  category: Issue['category'];
  coordinates: [number, number];
  address?: string;
  isAnonymous: boolean;
  images: File[];
}

export interface IssueResponse {
  success: boolean;
  message: string;
  data: {
    issue: Issue;
  };
}

export interface IssuesResponse {
  success: boolean;
  message: string;
  data: {
    issues: Issue[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface IssueFilters {
  page?: number;
  limit?: number;
  sort?: 'createdAt' | 'upvotes' | 'spamVotes' | 'views' | 'distance';
  order?: 'asc' | 'desc';
  search?: string;
  category?: Issue['category'];
  status?: Issue['status'];
  lat?: number;
  lng?: number;
  distance?: number;
}

export interface SpamReportRequest {
  reason: 'Inappropriate Content' | 'Fake Report' | 'Duplicate' | 'Spam' | 'Other';
  description?: string;
}

export interface ActivityLog {
  _id: string;
  issue: string;
  action: string;
  note: string;
  updatedBy: User;
  metadata: {
    previousStatus?: string;
    priority?: string;
    estimatedResolutionTime?: string;
    adminNotes?: string;
  };
  createdAt: string;
}

export interface ActivityResponse {
  success: boolean;
  data: {
    activities: ActivityLog[];
  };
}

export interface AdminDashboardData {
  overview: {
    totalIssues: number;
    totalUsers: number;
    totalSpamReports: number;
    hiddenIssues: number;
    avgResolutionTime: number;
  };
  charts: {
    statusBreakdown: Array<{ name: string; value: number }>;
    categoryBreakdown: Array<{ name: string; value: number }>;
    issuesTrend: Array<{ date: string; count: number }>;
    geographicDistribution: Array<{ location: string; count: number }>;
  };
  topReporters: Array<{
    user: User;
    issueCount: number;
  }>;
}

export interface AdminDashboardResponse {
  success: boolean;
  data: AdminDashboardData;
}

export interface ApiError {
  success: false;
  message: string;
  error: {
    code: string;
    details?: Array<{
      field: string;
      message: string;
      value: any;
    }>;
    timestamp: string;
    requestId: string;
  };
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  location: {
    autoDetect: boolean;
    defaultLocation?: LocationCoordinates;
  };
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}
