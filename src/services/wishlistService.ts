import apiClient from './apiClient';
import { AddToWishlistRequest, Wishlist } from './types';

export const wishlistService = {
  /**
   * Get wishlist
   */
  async getWishlist(): Promise<Wishlist> {
    const response = await apiClient.get<Wishlist>('/api/wishlist');
    return response.data;
  },

  /**
   * Add product to wishlist
   */
  async addToWishlist(data: AddToWishlistRequest): Promise<Wishlist> {
    const response = await apiClient.post<Wishlist>('/api/wishlist', data);
    return response.data;
  },

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(productId: string): Promise<Wishlist> {
    const response = await apiClient.delete<Wishlist>(`/api/wishlist/${productId}`);
    return response.data;
  },
};
