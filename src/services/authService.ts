import apiClient from './apiClient';
import { LoginRequest, LoginResponse, ApiError } from './types';

export const authService = {
  /**
   * Login to the system
   * @param credentials - Email and password
   * @returns Promise with token and user data
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
    
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  },

  /**
   * Logout from the system
   */
  logout(): void {
    localStorage.removeItem('token');
  },

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
};
