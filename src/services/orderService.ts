import apiClient from './apiClient';
import { PlaceOrderRequest, Order, OrderListParams, OrderListResponse } from './types';

export const orderService = {
  /**
   * Place a new order from current cart
   * @param orderData - Order details including shipping and billing information
   * @returns Promise with created order
   */
  async placeOrder(orderData: PlaceOrderRequest): Promise<Order> {
    const response = await apiClient.post<Order>('/api/orders', orderData);
    return response.data;
  },

  /**
   * Get current user's orders
   * @param params - Pagination parameters
   * @returns Promise with orders and pagination info
   */
  async getOrders(params?: OrderListParams): Promise<OrderListResponse> {
    const response = await apiClient.get<OrderListResponse>('/api/orders', { params });
    return response.data;
  },

  /**
   * Get order details by ID
   * @param orderId - Order ID
   * @returns Promise with order details
   */
  async getOrderById(orderId: string): Promise<Order> {
    const response = await apiClient.get<Order>(`/api/orders/${orderId}`);
    return response.data;
  },

  /**
   * Cancel an order
   * @param orderId - Order ID
   * @param reason - Cancellation reason
   * @returns Promise with updated order
   */
  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    const response = await apiClient.post<Order>(`/api/orders/${orderId}/cancel`, { reason });
    return response.data;
  }
};
