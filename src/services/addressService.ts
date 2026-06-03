import apiClient from './apiClient';

export interface UserAddress {
  address_id: string;
  user_id?: string;
  address_type?: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  district?: string;
  ward?: string;
  postal_code?: string;
  country?: string;
  is_default?: boolean;
}

export const addressService = {
  async getAddresses(): Promise<UserAddress[]> {
    const response = await apiClient.get<{ addresses: UserAddress[] }>('/api/addresses');
    return response.data.addresses;
  },

  async createAddress(data: Partial<UserAddress>) {
    const response = await apiClient.post<UserAddress>('/api/addresses', data);
    return response.data;
  },

  async updateAddress(id: string, data: Partial<UserAddress>) {
    const response = await apiClient.put<UserAddress>(`/api/addresses/${id}`, data);
    return response.data;
  },

  async deleteAddress(id: string) {
    await apiClient.delete(`/api/addresses/${id}`);
  },
};
