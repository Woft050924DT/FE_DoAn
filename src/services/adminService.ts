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
// ADMIN GENERIC CRUD
// ============================================================
export interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  is_active?: boolean;
}

export interface AdminListResponse<T> {
  data: T[];
  pagination: Pagination;
}

// ============================================================
// ADMIN POSTS
// ============================================================
export interface Post {
  post_id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author_name: string;
  author_avatar: string;
  thumbnail: string;
  status: "published" | "draft" | "scheduled";
  published_at: string;
  views: number;
}

export interface PostListParams extends AdminListParams {
  category?: string;
}

export interface PostListResponse {
  data: Post[];
  pagination: Pagination;
}

export const adminPostService = {
  async getList(params?: PostListParams): Promise<PostListResponse> {
    const response = await apiClient.get<PostListResponse>('/api/admin/posts', { params });
    return response.data;
  },
  async getById(id: string): Promise<Post> {
    const response = await apiClient.get<Post>(`/api/admin/posts/${id}`);
    return response.data;
  },
  async create(data: any): Promise<Post> {
    const response = await apiClient.post<Post>('/api/admin/posts', data);
    return response.data;
  },
  async update(id: string, data: any): Promise<Post> {
    const response = await apiClient.put<Post>(`/api/admin/posts/${id}`, data);
    return response.data;
  },
  async delete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/admin/posts/${id}`);
    return response.data;
  },
};

// ============================================================
// ADMIN CUSTOMERS
// ============================================================
export interface Customer {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  total_orders: number;
  total_spent: number;
  last_order_at: string;
  total_reviews: number;
  joined_at: string;
  status: "active" | "banned";
}

export interface CustomerListResponse {
  data: Customer[];
  pagination: Pagination;
}

export const adminCustomerService = {
  async getList(params?: AdminListParams): Promise<CustomerListResponse> {
    const response = await apiClient.get<CustomerListResponse>('/api/admin/customers', { params });
    return response.data;
  },
  async getById(id: string): Promise<Customer> {
    const response = await apiClient.get<Customer>(`/api/admin/customers/${id}`);
    return response.data;
  },
  async updateStatus(id: string, status: string): Promise<Customer> {
    const response = await apiClient.patch<Customer>(`/api/admin/customers/${id}`, { status });
    return response.data;
  },
};

// ============================================================
// ADMIN COUPONS
// ============================================================
export interface Coupon {
  coupon_id: string;
  code: string;
  title: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount: number;
  usage_limit: number;
  used_count: number;
  start_date: string;
  end_date: string;
  status: "active" | "scheduled" | "expired" | "disabled";
  is_featured: boolean;
}

export interface CouponListResponse {
  data: Coupon[];
  pagination: Pagination;
}

export const adminCouponService = {
  async getList(params?: AdminListParams): Promise<CouponListResponse> {
    const response = await apiClient.get<CouponListResponse>('/api/admin/coupons', { params });
    return response.data;
  },
  async create(data: any): Promise<Coupon> {
    const response = await apiClient.post<Coupon>('/api/admin/coupons', data);
    return response.data;
  },
  async update(id: string, data: any): Promise<Coupon> {
    const response = await apiClient.put<Coupon>(`/api/admin/coupons/${id}`, data);
    return response.data;
  },
  async delete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/admin/coupons/${id}`);
    return response.data;
  },
  async toggleStatus(id: string): Promise<Coupon> {
    const response = await apiClient.patch<Coupon>(`/api/admin/coupons/${id}/toggle`);
    return response.data;
  },
};

// ============================================================
// ADMIN BANNERS
// ============================================================
export interface Banner {
  banner_id: string;
  title: string;
  image_url: string;
  link: string;
  position: string;
  device: "all" | "desktop" | "mobile";
  status: "active" | "inactive";
  start_date: string;
  end_date: string;
  sort_order: number;
}

export interface BannerListResponse {
  data: Banner[];
  pagination: Pagination;
}

export const adminBannerService = {
  async getList(params?: AdminListParams): Promise<BannerListResponse> {
    const response = await apiClient.get<BannerListResponse>('/api/admin/banners', { params });
    return response.data;
  },
  async create(data: any): Promise<Banner> {
    const response = await apiClient.post<Banner>('/api/admin/banners', data);
    return response.data;
  },
  async update(id: string, data: any): Promise<Banner> {
    const response = await apiClient.put<Banner>(`/api/admin/banners/${id}`, data);
    return response.data;
  },
  async delete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/admin/banners/${id}`);
    return response.data;
  },
  async toggleStatus(id: string): Promise<Banner> {
    const response = await apiClient.patch<Banner>(`/api/admin/banners/${id}/toggle`);
    return response.data;
  },
};

// ============================================================
// ADMIN CATEGORIES
// ============================================================
export interface Category {
  category_id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  parent_name: string | null;
  product_count: number;
  status: "active" | "inactive";
  sort_order: number;
}

export interface CategoryListResponse {
  data: Category[];
  pagination: Pagination;
}

export const adminCategoryService = {
  async getList(params?: AdminListParams): Promise<CategoryListResponse> {
    const response = await apiClient.get<CategoryListResponse>('/api/admin/categories', { params });
    return response.data;
  },
  async create(data: any): Promise<Category> {
    const response = await apiClient.post<Category>('/api/admin/categories', data);
    return response.data;
  },
  async update(id: string, data: any): Promise<Category> {
    const response = await apiClient.put<Category>(`/api/admin/categories/${id}`, data);
    return response.data;
  },
  async delete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/admin/categories/${id}`);
    return response.data;
  },
};

// ============================================================
// ADMIN BRANDS
// ============================================================
export interface Brand {
  brand_id: string;
  name: string;
  slug: string;
  logo_url: string;
  product_count: number;
  featured: boolean;
  status: "active" | "inactive";
}

export interface BrandListResponse {
  data: Brand[];
  pagination: Pagination;
}

export const adminBrandService = {
  async getList(params?: AdminListParams): Promise<BrandListResponse> {
    const response = await apiClient.get<BrandListResponse>('/api/admin/brands', { params });
    return response.data;
  },
  async create(data: any): Promise<Brand> {
    const response = await apiClient.post<Brand>('/api/admin/brands', data);
    return response.data;
  },
  async update(id: string, data: any): Promise<Brand> {
    const response = await apiClient.put<Brand>(`/api/admin/brands/${id}`, data);
    return response.data;
  },
  async delete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/admin/brands/${id}`);
    return response.data;
  },
  async toggleFeatured(id: string): Promise<Brand> {
    const response = await apiClient.patch<Brand>(`/api/admin/brands/${id}/toggle-featured`);
    return response.data;
  },
};

// ============================================================
// ADMIN REVIEWS
// ============================================================
export interface Review {
  review_id: string;
  product_name: string;
  product_image: string;
  user_name: string;
  user_avatar: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
}

export interface ReviewListParams extends AdminListParams {
  approved?: boolean;
}

export interface ReviewListResponse {
  data: Review[];
  pagination: Pagination;
}

export const adminReviewService = {
  async getList(params?: ReviewListParams): Promise<ReviewListResponse> {
    const response = await apiClient.get<ReviewListResponse>('/api/admin/reviews', { params });
    return response.data;
  },
  async approve(id: string): Promise<Review> {
    const response = await apiClient.patch<Review>(`/api/admin/reviews/${id}/approve`);
    return response.data;
  },
  async reject(id: string): Promise<Review> {
    const response = await apiClient.patch<Review>(`/api/admin/reviews/${id}/reject`);
    return response.data;
  },
  async delete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/admin/reviews/${id}`);
    return response.data;
  },
};

// ============================================================
// ADMIN PAYMENT METHODS
// ============================================================
export interface PaymentMethodConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
  fee: string;
  min_amount: number;
  max_amount: number;
  instructions?: string;
}

export const adminPaymentService = {
  async getPaymentMethods(): Promise<PaymentMethodConfig[]> {
    const response = await apiClient.get<PaymentMethodConfig[]>('/api/admin/payment-methods');
    return response.data;
  },
  async updatePaymentMethod(id: string, data: Partial<PaymentMethodConfig>): Promise<PaymentMethodConfig> {
    const response = await apiClient.put<PaymentMethodConfig>(`/api/admin/payment-methods/${id}`, data);
    return response.data;
  },
  async updatePaymentSettings(data: any): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>('/api/admin/payment-methods/settings', data);
    return response.data;
  },
};

// ============================================================
// ADMIN SHIPPING METHODS
// ============================================================
export interface ShippingMethodConfig {
  id: string;
  name: string;
  courier: string;
  eta: string;
  base_price: number;
  free_threshold: number;
  max_weight: number;
  enabled: boolean;
  available_cities: string[];
}

export const adminShippingService = {
  async getShippingMethods(): Promise<ShippingMethodConfig[]> {
    const response = await apiClient.get<ShippingMethodConfig[]>('/api/admin/shipping-methods');
    return response.data;
  },
  async updateShippingMethod(id: string, data: Partial<ShippingMethodConfig>): Promise<ShippingMethodConfig> {
    const response = await apiClient.put<ShippingMethodConfig>(`/api/admin/shipping-methods/${id}`, data);
    return response.data;
  },
  async updateShippingSettings(data: any): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>('/api/admin/shipping-methods/settings', data);
    return response.data;
  },
};

// ============================================================
// ADMIN STAFF
// ============================================================
export interface AdminStaffMember extends StaffMember {
  conversations_handled: number;
  avg_response_time: string;
  last_active: string;
  joined_at: string;
}

export interface AdminStaffListResponse {
  data: AdminStaffMember[];
  pagination: Pagination;
}

export const adminStaffService = {
  async getList(params?: AdminListParams): Promise<AdminStaffListResponse> {
    const response = await apiClient.get<AdminStaffListResponse>('/api/admin/staff', { params });
    return response.data;
  },
  async create(data: any): Promise<AdminStaffMember> {
    const response = await apiClient.post<AdminStaffMember>('/api/admin/staff', data);
    return response.data;
  },
  async update(id: string, data: any): Promise<AdminStaffMember> {
    const response = await apiClient.put<AdminStaffMember>(`/api/admin/staff/${id}`, data);
    return response.data;
  },
  async delete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/admin/staff/${id}`);
    return response.data;
  },
};

// ============================================================
// ADMIN MEDIA
// ============================================================
export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: "image" | "video" | "document";
  size: number;
  dimensions?: string;
  uploaded_at: string;
  folder: string;
}

export interface MediaListParams extends AdminListParams {
  type?: string;
  folder?: string;
}

export interface MediaListResponse {
  data: MediaFile[];
  pagination: Pagination;
  total_size_mb: number;
}

export const adminMediaService = {
  async getList(params?: MediaListParams): Promise<MediaListResponse> {
    const response = await apiClient.get<MediaListResponse>('/api/admin/media', { params });
    return response.data;
  },
  async upload(formData: FormData): Promise<MediaFile> {
    const response = await apiClient.post<MediaFile>('/api/admin/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  async delete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/admin/media/${id}`);
    return response.data;
  },
};

// ============================================================
// ADMIN AI LOGS
// ============================================================
export interface AILog {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  question: string;
  reply: string;
  intent: string;
  confidence: number;
  was_helpful: boolean | null;
  handed_off: boolean;
  created_at: string;
  duration: number;
}

export interface AILogListParams extends AdminListParams {
  helpful?: boolean;
  handed_off?: boolean;
  low_confidence?: boolean;
}

export interface AILogListResponse {
  data: AILog[];
  pagination: Pagination;
}

export const adminAILogService = {
  async getList(params?: AILogListParams): Promise<AILogListResponse> {
    const response = await apiClient.get<AILogListResponse>('/api/admin/ai-logs', { params });
    return response.data;
  },
  async export(): Promise<AILog[]> {
    const response = await apiClient.get<AILog[]>('/api/admin/ai-logs/export');
    return response.data;
  },
};

// ============================================================
// ADMIN QUICK REPLIES
// ============================================================
export interface QuickReplyConfig {
  reply_id: string;
  shortcut: string;
  message: string;
  category: string;
  usage_count: number;
  is_active: boolean;
  created_at: string;
}

export interface QuickReplyListResponse {
  data: QuickReplyConfig[];
  pagination: Pagination;
}

export const adminQuickReplyService = {
  async getList(params?: AdminListParams): Promise<QuickReplyListResponse> {
    const response = await apiClient.get<QuickReplyListResponse>('/api/admin/quick-replies', { params });
    return response.data;
  },
  async create(data: any): Promise<QuickReplyConfig> {
    const response = await apiClient.post<QuickReplyConfig>('/api/admin/quick-replies', data);
    return response.data;
  },
  async update(id: string, data: any): Promise<QuickReplyConfig> {
    const response = await apiClient.put<QuickReplyConfig>(`/api/admin/quick-replies/${id}`, data);
    return response.data;
  },
  async delete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/admin/quick-replies/${id}`);
    return response.data;
  },
};

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
    const response = await apiClient.get<{ id: string; text: string; category: string }[]>('/api/admin/quick-replies');
    return (response.data.data ?? response.data).map(r => ({
      reply_id: 'id' in r ? String(r.id) : '',
      title: '',
      message: 'text' in r ? r.text : '',
      category: r.category ?? '',
    }));
  },
};

// ============================================================
// ADMIN SETTINGS
// ============================================================
export interface SystemSetting {
  setting_id: string;
  category: 'general' | 'email' | 'payment' | 'shipping';
  key: string;
  value: string;
  data_type: 'string' | 'number' | 'boolean';
  description: string;
  is_public: boolean;
  updated_at: string;
}

export interface SettingListResponse {
  data: SystemSetting[];
  pagination: Pagination;
}

export const adminSettingsService = {
  async getList(category?: string): Promise<SettingListResponse> {
    const response = await apiClient.get<SettingListResponse>('/api/admin/settings', {
      params: category ? { category } : {},
    });
    return response.data;
  },

  async update(key: string, value: string, category?: string): Promise<SystemSetting> {
    const response = await apiClient.put<SystemSetting>('/api/admin/settings', { key, value, category });
    return response.data;
  },

  async upsert(data: {
    category: string;
    key: string;
    value: string;
    data_type?: string;
    description?: string;
    is_public?: boolean;
  }): Promise<SystemSetting> {
    const response = await apiClient.post<SystemSetting>('/api/admin/settings', data);
    return response.data;
  },
};

// ============================================================
// ADMIN PAYMENTS
// ============================================================
export interface PaymentRecord {
  payment_id: string;
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  payment_method: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id: string | null;
  paid_at: string | null;
  refunded_at: string | null;
  refund_amount: number;
  created_at: string;
}

export interface PaymentListParams extends AdminListParams {
  payment_status?: string;
  payment_method?: string;
}

export interface PaymentListResponse {
  data: PaymentRecord[];
  pagination: Pagination;
}

export const adminPaymentsService = {
  async getList(params?: PaymentListParams): Promise<PaymentListResponse> {
    const response = await apiClient.get<PaymentListResponse>('/api/admin/payments', { params });
    return response.data;
  },

  async refund(id: string, refund_amount?: number): Promise<PaymentRecord> {
    const response = await apiClient.patch<PaymentRecord>(`/api/admin/payments/${id}/refund`, {
      refund_amount,
    });
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<PaymentRecord> {
    const response = await apiClient.patch<PaymentRecord>(`/api/admin/payments/${id}/status`, { status });
    return response.data;
  },
};

// ============================================================
// ADMIN TRAINING DATA
// ============================================================
export interface TrainingDataRecord {
  training_id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  intent: string;
  context: Record<string, any>;
  is_active: boolean;
  usage_count: number;
  positive_feedback: number;
  negative_feedback: number;
  created_at: string;
  updated_at: string;
}

export interface TrainingDataListResponse {
  data: TrainingDataRecord[];
  pagination: Pagination;
}

export interface TrainingDataParams extends AdminListParams {
  category?: string;
  intent?: string;
}

export const adminTrainingDataService = {
  async getList(params?: TrainingDataParams): Promise<TrainingDataListResponse> {
    const response = await apiClient.get<TrainingDataListResponse>('/api/admin/training-data', { params });
    return response.data;
  },

  async create(data: {
    category: string;
    question: string;
    answer: string;
    keywords?: string[];
    intent?: string;
    context?: Record<string, any>;
  }): Promise<TrainingDataRecord> {
    const response = await apiClient.post<TrainingDataRecord>('/api/admin/training-data', data);
    return response.data;
  },

  async update(id: string, data: Partial<{
    answer: string;
    keywords: string[];
    intent: string;
    is_active: boolean;
    context: Record<string, any>;
  }>): Promise<TrainingDataRecord> {
    const response = await apiClient.put<TrainingDataRecord>(`/api/admin/training-data/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/admin/training-data/${id}`);
    return response.data;
  },
};
