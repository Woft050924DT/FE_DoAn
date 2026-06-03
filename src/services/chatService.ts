import apiClient from './apiClient';
import { ChatHistoryItem, ChatMessageRequest, ChatMessageResponse } from './types';

export const chatService = {
  /**
   * Send a message to the AI chatbot
   */
  async sendMessage(data: ChatMessageRequest): Promise<ChatMessageResponse> {
    const response = await apiClient.post<ChatMessageResponse>('/api/chat', data);
    return response.data;
  },

  /**
   * Get chat history for a session
   */
  async getHistory(params: { session_id: string; limit?: number }): Promise<ChatHistoryItem[]> {
    const response = await apiClient.get<ChatHistoryItem[]>('/api/chat/history', { params });
    return response.data;
  },
};
