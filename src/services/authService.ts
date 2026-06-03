import apiClient from './apiClient';
import { LoginRequest, LoginResponse, RegisterRequest, ApiError } from './types';

export const authService = {
  /**
   * Login to the system
   * @param credentials - Email and password
   * @returns Promise with token and user data
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);

    // Store token and user data in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  /**
   * Register a new account
   * @param data - Registration data
   * @returns Promise with token and user data
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/auth/register', data);

    // Store token and user data in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  /**
   * Logout from the system
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
  },

  /**
   * Get stored user data
   */
  getUser(): { user_id: string; email: string; full_name: string; phone: string; role: string; avatar_url: string } | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Get user role
   */
  getRole(): string | null {
    const user = this.getUser();
    return user?.role ?? null;
  }
};
