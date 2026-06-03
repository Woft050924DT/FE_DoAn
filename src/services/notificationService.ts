import apiClient from './apiClient';
import { Notification, NotificationListResponse, UnreadCountResponse } from './types';

export const notificationService = {
  /**
   * Get notifications list
   */
  async getNotifications(params?: { page?: number; limit?: number }): Promise<NotificationListResponse> {
    const response = await apiClient.get<NotificationListResponse>('/api/notifications', { params });
    return response.data;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await apiClient.patch<Notification>(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>('/api/notifications/read-all');
    return response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await apiClient.get<UnreadCountResponse>('/api/notifications/unread-count');
    return response.data;
  },
};
