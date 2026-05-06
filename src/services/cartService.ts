import apiClient from './apiClient';
import { AddToCartRequest, Cart } from './types';

export const cartService = {
  /**
   * Add product to cart
   * @param item - Product ID, variant ID (optional), and quantity
   * @returns Promise with updated cart
   */
  async addToCart(item: AddToCartRequest): Promise<Cart> {
    const response = await apiClient.post<Cart>('/api/cart', item);
    return response.data;
  },

  /**
   * Get current user's cart
   * @returns Promise with cart data
   */
  async getCart(): Promise<Cart> {
    const response = await apiClient.get<Cart>('/api/cart');
    return response.data;
  },

  /**
   * Update cart item quantity
   * @param cartItemId - Cart item ID
   * @param quantity - New quantity
   * @returns Promise with updated cart
   */
  async updateCartItem(cartItemId: string, quantity: number): Promise<Cart> {
    const response = await apiClient.put<Cart>(`/api/cart/${cartItemId}`, { quantity });
    return response.data;
  },

  /**
   * Remove item from cart
   * @param cartItemId - Cart item ID
   * @returns Promise with updated cart
   */
  async removeCartItem(cartItemId: string): Promise<Cart> {
    const response = await apiClient.delete<Cart>(`/api/cart/${cartItemId}`);
    return response.data;
  },

  /**
   * Clear all items from cart
   * @returns Promise with empty cart
   */
  async clearCart(): Promise<Cart> {
    const response = await apiClient.delete<Cart>('/api/cart');
    return response.data;
  }
};
