import apiClient from './apiClient';
import { AddToCartRequest, Cart } from './types';

export const cartService = {
  async addToCart(item: AddToCartRequest): Promise<Cart> {
    const response = await apiClient.post<Cart>('/api/cart', item);
    return response.data;
  },

  async getCart(): Promise<Cart> {
    const response = await apiClient.get<Cart>('/api/cart');
    return response.data;
  },

  async updateCartItem(cartItemId: string, quantity: number): Promise<Cart> {
    const response = await apiClient.patch<Cart>(`/api/cart/items/${cartItemId}`, { quantity });
    return response.data;
  },

  async removeCartItem(cartItemId: string): Promise<Cart> {
    const response = await apiClient.delete<Cart>(`/api/cart/items/${cartItemId}`);
    return response.data;
  },
};
