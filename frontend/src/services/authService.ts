import axiosInstance from './axiosInstance';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User 
} from '@/types';

export const authService = {
  // Register new user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<{ success: boolean; data: User }> => {
    const response = await axiosInstance.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<{ success: boolean; data: User }> => {
    const response = await axiosInstance.put('/auth/profile', data);
    return response.data;
  },

  // Logout (clear local storage)
  logout: () => {
    try {
      console.log('AuthService: Clearing localStorage');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Also clear any Zustand persistence
      localStorage.removeItem('auth-store');
    } catch (error) {
      console.error('AuthService: Error during logout:', error);
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    console.log('AuthService: isAuthenticated check:', !!token);
    return !!token;
  },

  // Verify token validity by making a test API call
  verifyToken: async (): Promise<boolean> => {
    try {
      const token = authService.getToken();
      if (!token) {
        console.log('AuthService: No token found for verification');
        return false;
      }

      console.log('AuthService: Verifying token...');
      const response = await axiosInstance.get('/auth/profile');
      console.log('AuthService: Token verification successful');
      return response.status === 200;
    } catch (error: any) {
      console.log('AuthService: Token verification failed:', error.response?.status);
      if (error.response?.status === 401) {
        // Token is expired or invalid
        console.log('AuthService: Token is invalid, clearing auth data');
        authService.logout();
        return false;
      }
      // For other errors (network, server errors), assume token might still be valid
      console.log('AuthService: Network/server error during verification, assuming token is valid');
      return true;
    }
  },

  // Get stored auth token
  getToken: (): string | null => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('AuthService: getToken called, found:', !!token);
      return token;
    } catch (error) {
      console.error('AuthService: Failed to get token from localStorage:', error);
      return null;
    }
  },

  // Store auth token
  setToken: (token: string): void => {
    try {
      console.log('AuthService: setToken called');
      localStorage.setItem('authToken', token);
    } catch (error) {
      console.error('AuthService: Failed to set token in localStorage:', error);
    }
  },

  // Get stored user data
  getUser: (): User | null => {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      console.log('AuthService: getUser called, found:', !!user);
      return user;
    } catch (error) {
      console.error('AuthService: Failed to get user from localStorage:', error);
      return null;
    }
  },

  // Store user data
  setUser: (user: User): void => {
    try {
      console.log('AuthService: setUser called');
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('AuthService: Failed to set user in localStorage:', error);
    }
  }
};
