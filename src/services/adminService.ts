import apiClient from './apiClient';
import {
  AITrainingListParams,
  AITrainingListResponse,
  AITrainingMetrics,
  ConversationDetail,
  ConversationListParams,
  ConversationListResponse,
  ConversationMessage,
  Conversation,
  CreateAITrainingRequest,
  DashboardResponse,
  QuickReply,
  SendMessageRequest,
  StaffMember,
  UpdateAITrainingRequest,
  UpdateConversationRequest,
} from './types';

// ============================================================
// ADMIN DASHBOARD
// ============================================================
export const adminDashboardService = {
  /**
   * Get dashboard statistics
   */
  async getDashboard(): Promise<DashboardResponse> {
    const response = await apiClient.get<DashboardResponse>('/api/admin/dashboard');
    return response.data;
  },
};

// ============================================================
// ADMIN AI TRAINING
// ============================================================
export const adminAITrainingService = {
  /**
   * Get training Q&A list
   */
  async getTrainingList(params?: AITrainingListParams): Promise<AITrainingListResponse> {
    const response = await apiClient.get<AITrainingListResponse>('/api/admin/ai-training', { params });
    return response.data;
  },

  /**
   * Create training Q&A
   */
  async createTraining(data: CreateAITrainingRequest): Promise<any> {
    const response = await apiClient.post('/api/admin/ai-training', data);
    return response.data;
  },

  /**
   * Update training Q&A
   */
  async updateTraining(id: string, data: UpdateAITrainingRequest): Promise<any> {
    const response = await apiClient.put(`/api/admin/ai-training/${id}`, data);
    return response.data;
  },

  /**
   * Delete training Q&A
   */
  async deleteTraining(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/admin/ai-training/${id}`);
    return response.data;
  },

  /**
   * Import training data (JSON array)
   */
  async importTraining(data: { records: CreateAITrainingRequest[] }): Promise<{ imported: number; errors: string[] }> {
    const response = await apiClient.post('/api/admin/ai-training/import', data);
    return response.data;
  },

  /**
   * Export training data
   */
  async exportTraining(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/api/admin/ai-training/export');
    return response.data;
  },

  /**
   * Get AI training metrics
   */
  async getMetrics(): Promise<AITrainingMetrics> {
    const response = await apiClient.get<AITrainingMetrics>('/api/admin/ai-training/metrics');
    return response.data;
  },
};

// ============================================================
// ADMIN CHAT CONSOLE
// ============================================================
export const adminChatService = {
  /**
   * Get conversations list
   */
  async getConversations(params?: ConversationListParams): Promise<ConversationListResponse> {
    const response = await apiClient.get<ConversationListResponse>('/api/admin/conversations', { params });
    return response.data;
  },

  /**
   * Get conversation detail with messages
   */
  async getConversationDetail(id: string): Promise<ConversationDetail> {
    const response = await apiClient.get<ConversationDetail>(`/api/admin/conversations/${id}`);
    return response.data;
  },

  /**
   * Send a staff message
   */
  async sendMessage(conversationId: string, data: SendMessageRequest): Promise<ConversationMessage> {
    const response = await apiClient.post<ConversationMessage>(
      `/api/admin/conversations/${conversationId}/messages`,
      data
    );
    return response.data;
  },

  /**
   * Update conversation (assign staff, change priority/status, tags)
   */
  async updateConversation(
    conversationId: string,
    data: UpdateConversationRequest
  ): Promise<Conversation> {
    const response = await apiClient.patch<Conversation>(
      `/api/admin/conversations/${conversationId}`,
      data
    );
    return response.data;
  },
};

// ============================================================
// ADMIN SHARED
// ============================================================
export const adminSharedService = {
  /**
   * Get staff list (for chat console assignment)
   */
  async getStaff(): Promise<StaffMember[]> {
    const response = await apiClient.get<StaffMember[]>('/api/staff');
    return response.data;
  },

  /**
   * Get quick reply templates
   */
  async getQuickReplies(): Promise<QuickReply[]> {
    const response = await apiClient.get<QuickReply[]>('/api/admin/quick-replies');
    return response.data;
  },
};
