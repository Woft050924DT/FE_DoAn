import apiClient from './apiClient';
import {
  AdminOrderListParams,
  BuyNowRequest,
  Order,
  OrderListParams,
  OrderListResponse,
  OrderTrackingResponse,
  PaymentMethod,
  PlaceOrderRequest,
  ShippingMethod,
  StatusOption,
  UpdateOrderRequest,
} from './types';

export const orderService = {
  // ============================================================
  // CUSTOMER - Orders
  // ============================================================

  /**
   * Place a new order from current cart
   */
  async placeOrder(orderData: PlaceOrderRequest): Promise<Order> {
    const response = await apiClient.post<Order>('/api/orders', orderData);
    return response.data;
  },

  /**
   * Buy now (add product directly and place order)
   */
  async buyNow(orderData: BuyNowRequest): Promise<Order> {
    const response = await apiClient.post<Order>('/api/orders/buy-now', orderData);
    return response.data;
  },

  /**
   * Get current user's orders
   */
  async getOrders(params?: OrderListParams): Promise<OrderListResponse> {
    const response = await apiClient.get<OrderListResponse>('/api/orders', { params });
    return response.data;
  },

  /**
   * Get order details by ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    const response = await apiClient.get<Order>(`/api/orders/${orderId}`);
    return response.data;
  },

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    const response = await apiClient.post<Order>(`/api/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  /**
   * Track order status and timeline
   */
  async trackOrder(orderId: string): Promise<OrderTrackingResponse> {
    const response = await apiClient.get<OrderTrackingResponse>(`/api/orders/${orderId}/track`);
    return response.data;
  },

  // ============================================================
  // CUSTOMER - Checkout Options
  // ============================================================

  /**
   * Get checkout options (shipping + payment methods combined)
   */
  async getCheckoutOptions(): Promise<{ shipping_methods: ShippingMethod[]; payment_methods: PaymentMethod[] }> {
    const response = await apiClient.get('/api/orders/checkout-options');
    return response.data;
  },

  /**
   * Get shipping methods
   */
  async getShippingMethods(): Promise<{ shipping_methods: ShippingMethod[] }> {
    const response = await apiClient.get<{ shipping_methods: ShippingMethod[] }>('/api/orders/shipping-methods');
    return response.data;
  },

  /**
   * Get payment methods
   */
  async getPaymentMethods(): Promise<{ payment_methods: PaymentMethod[] }> {
    const response = await apiClient.get<{ payment_methods: PaymentMethod[] }>('/api/orders/payment-methods');
    return response.data;
  },

  /**
   * Get order status options
   */
  async getStatusOptions(): Promise<{ statuses: StatusOption[] }> {
    const response = await apiClient.get<{ statuses: StatusOption[] }>('/api/orders/status-options');
    return response.data;
  },

  // ============================================================
  // ADMIN - Order Management
  // ============================================================

  /**
   * Get all orders (admin/staff)
   */
  async getAdminOrders(params?: AdminOrderListParams): Promise<OrderListResponse> {
    const response = await apiClient.get<OrderListResponse>('/api/admin/orders', { params });
    return response.data;
  },

  /**
   * Update order (admin/staff) - status, tracking, internal notes, etc.
   */
  async updateOrder(orderId: string, data: UpdateOrderRequest): Promise<Order> {
    const response = await apiClient.patch<Order>(`/api/admin/orders/${orderId}`, data);
    return response.data;
  },

  /**
   * Export orders (admin/staff)
   */
  async exportOrders(params?: AdminOrderListParams): Promise<Order[]> {
    const response = await apiClient.get<Order[]>('/api/admin/orders/export', { params });
    return response.data;
  },
};
