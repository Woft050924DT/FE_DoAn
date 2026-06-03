import apiClient from './apiClient';
import {
  Address,
  AddressRequest,
  ApiError,
  ChangePasswordRequest,
  Profile,
  ProfileStats,
  UpdateProfileRequest,
} from './types';

export const profileService = {
  // ============================================================
  // Profile
  // ============================================================

  /**
   * Get current user's profile
   */
  async getProfile(): Promise<Profile> {
    const response = await apiClient.get<Profile>('/api/profile');
    return response.data;
  },

  /**
   * Update profile
   */
  async updateProfile(profile: UpdateProfileRequest): Promise<Profile> {
    const response = await apiClient.put<Profile>('/api/profile', profile);
    return response.data;
  },

  /**
   * Delete own account
   */
  async deleteProfile(): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>('/api/profile');
    return response.data;
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>('/api/profile/password', data);
    return response.data;
  },

  /**
   * Get account stats (total orders, spent, reviews)
   */
  async getStats(): Promise<ProfileStats> {
    const response = await apiClient.get<ProfileStats>('/api/profile/stats');
    return response.data;
  },

  // ============================================================
  // Addresses
  // ============================================================

  /**
   * Get all addresses
   */
  async getAddresses(): Promise<Address[]> {
    const response = await apiClient.get<Address[]>('/api/profile/addresses');
    return response.data;
  },

  /**
   * Get single address
   */
  async getAddress(addressId: string): Promise<Address> {
    const response = await apiClient.get<Address>(`/api/profile/addresses/${addressId}`);
    return response.data;
  },

  /**
   * Create new address
   */
  async createAddress(address: AddressRequest): Promise<Address> {
    const response = await apiClient.post<Address>('/api/profile/addresses', address);
    return response.data;
  },

  /**
   * Update address
   */
  async updateAddress(addressId: string, address: AddressRequest): Promise<Address> {
    const response = await apiClient.put<Address>(`/api/profile/addresses/${addressId}`, address);
    return response.data;
  },

  /**
   * Delete address
   */
  async deleteAddress(addressId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/profile/addresses/${addressId}`);
    return response.data;
  },
};
