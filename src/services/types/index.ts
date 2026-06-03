// ============================================================
// AUTH TYPES
// ============================================================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  fullName?: string;
  phone?: string;
  avatar_url?: string;
  avatarUrl?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  user_id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  avatar_url: string;
}

// ============================================================
// PROFILE TYPES
// ============================================================
export interface Profile extends User {
  status: string;
  email_verified: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  user_addresses?: Address[];
}

export interface CreateProfileRequest {
  email: string;
  password: string;
  full_name?: string;
  fullName?: string;
  phone?: string;
  avatar_url?: string;
  avatarUrl?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  fullName?: string;
  phone?: string;
  avatar_url?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ProfileStats {
  total_orders: number;
  pending_orders: number;
  total_spent: number;
  total_reviews: number;
}

export interface Address {
  address_id: string;
  user_id: string;
  address_type: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  district: string | null;
  ward: string | null;
  postal_code: string | null;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressRequest {
  address_type?: string;
  addressType?: string;
  full_name?: string;
  fullName?: string;
  phone?: string;
  address_line1?: string;
  addressLine1?: string;
  address_line2?: string | null;
  addressLine2?: string | null;
  city?: string;
  district?: string;
  ward?: string;
  postal_code?: string;
  postalCode?: string;
  country?: string;
  is_default?: boolean;
  isDefault?: boolean;
}

// ============================================================
// PRODUCT TYPES
// ============================================================
export interface Product {
  product_id: string;
  name: string;
  slug: string;
  sku: string;
  short_description: string;
  description: string;
  price: number;
  compare_price: number;
  status: string;
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  categories?: Category;
  brands?: Brand;
  product_images: ProductImage[];
  product_variants?: ProductVariant[];
}

export interface ProductDetail extends Product {
  cost_price: number;
  weight: number;
  dimensions: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  published_at: string;
  product_reviews: ProductReview[];
}

export interface Category {
  category_id: string;
  name: string;
  slug: string;
}

export interface Brand {
  brand_id: string;
  name: string;
  slug: string;
  logo_url?: string;
}

export interface ProductImage {
  image_id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  variant_id: string;
  product_id?: string;
  sku?: string;
  name: string;
  option1_name?: string;
  option1_value?: string;
  option2_name?: string;
  option2_value?: string;
  price: number;
  compare_price: number;
  cost_price?: number;
  stock_quantity: number;
  image_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductReview {
  review_id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  users: {
    user_id: string;
    full_name: string;
    avatar_url: string;
  };
}

export interface CreateReviewRequest {
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  order_id?: string;
}

export interface ProductListParams {
  category_id?: string;
  brand_id?: string;
  featured?: boolean;
  best_seller?: boolean;
  new_arrival?: boolean;
  page?: number;
  limit?: number;
  q?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'sold' | 'rating';
}

export interface ProductListResponse {
  products: Product[];
  pagination: Pagination;
}

// Admin product management
export interface CreateProductRequest {
  name: string;
  slug?: string;
  sku: string;
  short_description?: string;
  description?: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  category_id?: string;
  brand_id?: string;
  status?: 'draft' | 'published' | 'out_of_stock';
  featured?: boolean;
  best_seller?: boolean;
  new_arrival?: boolean;
  weight?: number;
  dimensions?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  published_at?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface CreateVariantRequest {
  sku?: string;
  name: string;
  option1_name?: string;
  option1_value?: string;
  option2_name?: string;
  option2_value?: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  stock_quantity: number;
  image_url?: string;
}

// ============================================================
// CART TYPES
// ============================================================
export interface AddToCartRequest {
  product_id: string;
  variant_id?: string;
  quantity: number;
}

export interface CartItem {
  cart_item_id: string;
  cart_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
  products: {
    product_id: string;
    name: string;
    slug: string;
    price: number;
    compare_price: number;
    product_images: ProductImage[];
  };
  product_variants?: {
    variant_id: string;
    name: string;
    price: number;
    compare_price: number;
    stock_quantity: number;
  };
}

export interface Cart {
  cart_id: string | null;
  user_id: string | null;
  session_id: string | null;
  created_at: string;
  updated_at: string;
  cart_items: CartItem[];
}

// ============================================================
// ORDER TYPES
// ============================================================
export interface PlaceOrderRequest {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_district?: string;
  shipping_ward?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_city?: string;
  billing_district?: string;
  billing_ward?: string;
  billing_postal_code?: string;
  billing_country?: string;
  payment_method?: string;
  shipping_method?: string;
  coupon_code?: string;
  notes?: string;
}

export interface BuyNowRequest extends PlaceOrderRequest {
  product_id: string;
  variant_id?: string;
  quantity: number;
}

export interface OrderItem {
  order_item_id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Order {
  order_id: string;
  order_number: string;
  user_id: string;
  status: string;
  payment_status: string;
  shipping_status: string;
  customer_email: string;
  customer_phone: string;
  customer_name: string;
  shipping_address_line1: string;
  shipping_address_line2: string;
  shipping_city: string;
  shipping_district: string;
  shipping_ward: string;
  shipping_postal_code: string;
  shipping_country: string;
  billing_address_line1: string;
  billing_address_line2: string;
  billing_city: string;
  billing_district: string;
  billing_ward: string;
  billing_postal_code: string;
  billing_country: string;
  subtotal: number;
  shipping_fee: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  coupon_code: string;
  payment_method: string;
  shipping_method: string;
  notes: string;
  internal_notes: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: Pagination;
}

export interface OrderTimelineEvent {
  status: string;
  label: string;
  timestamp: string;
  note?: string | null;
  tracking_number?: string | null;
}

export interface OrderTrackingResponse {
  order_id: string;
  order_number: string;
  status: string;
  tracking_number: string | null;
  timeline: OrderTimelineEvent[];
}

export interface ShippingMethod {
  id: string;
  name: string;
  fee: number;
  estimated_days: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
}

export interface StatusOption {
  value: string;
  label: string;
  color: string;
}

// Admin order types
export interface AdminOrderListParams extends OrderListParams {
  search?: string;
  date_from?: string;
  date_to?: string;
  payment_status?: string;
}

export interface UpdateOrderRequest {
  status?: string;
  payment_status?: string;
  shipping_status?: string;
  tracking_number?: string;
  internal_notes?: string;
  shipped_at?: string;
  delivered_at?: string;
}

// ============================================================
// NOTIFICATION TYPES
// ============================================================
export interface Notification {
  notification_id: string;
  user_id: string;
  type: 'order' | 'promotion' | 'system';
  title: string;
  message: string;
  action_url?: string;
  icon?: string;
  is_read: boolean;
  read_at: string | null;
  data?: {
    order_id?: string;
    order_number?: string;
  };
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  pagination: Pagination;
}

export interface UnreadCountResponse {
  count: number;
}

// ============================================================
// WISHLIST TYPES
// ============================================================
export interface WishlistItem {
  wishlist_item_id: string;
  product_id: string;
  variant_id: string | null;
  created_at: string;
  products: {
    product_id: string;
    name: string;
    slug: string;
    price: number;
    compare_price: number;
    status: string;
    product_images: ProductImage[];
    product_variants?: {
      variant_id: string;
      name: string;
      price: number;
    }[];
  };
  product_variants?: {
    variant_id: string;
    name: string;
    price: number;
    stock_quantity: number;
  };
}

export interface Wishlist {
  wishlist_id: string;
  user_id: string;
  items: WishlistItem[];
}

export interface AddToWishlistRequest {
  product_id: string;
  variant_id?: string;
}

// ============================================================
// COUPON TYPES
// ============================================================
export interface CouponValidationRequest {
  coupon_code: string;
  cart_total: number;
}

export interface CouponValidationResponse {
  valid: boolean;
  coupon_code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount: number;
  discount_amount: number;
  message: string;
}

export interface UserCoupon {
  user_coupon_id: string;
  coupon_id: string;
  code: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount: number;
  expires_at: string;
  is_used: boolean;
  is_expired: boolean;
}

// ============================================================
// CHAT TYPES
// ============================================================
export interface ChatMessageRequest {
  message: string;
  session_id?: string;
  context?: {
    last_order_id?: string | null;
    last_product_id?: string | null;
    intent?: string | null;
  };
}

export interface ChatMessageResponse {
  reply: string;
  session_id: string;
  intent: string;
  confidence: number;
  suggestions: string[];
  handoff: boolean;
  data: {
    products?: Product[];
    order?: Order;
  } | null;
}

export interface ChatHistoryItem {
  message_id: string;
  conversation_id: string;
  sender_type: 'user' | 'bot' | 'staff';
  sender_id: string | null;
  sender_name: string;
  content: string;
  intent?: string | null;
  created_at: string;
}

// ============================================================
// ADMIN DASHBOARD TYPES
// ============================================================
export interface DashboardKPIs {
  today_revenue: number;
  revenue_change_percent: number;
  new_orders_today: number;
  orders_change_percent: number;
  total_users: number;
  users_change_percent: number;
  open_chats: number;
  chats_change_percent: number;
}

export interface RevenueDataPoint {
  day: string;
  revenue: number;
}

export interface OrderStatusBreakdown {
  status: string;
  count: number;
}

export interface ConversationSummary {
  conversation_id: string;
  customer: {
    user_id: string;
    full_name: string;
    email: string;
  };
  status: string;
  priority: string;
  last_message_at: string;
}

export interface DashboardResponse {
  kpis: DashboardKPIs;
  revenue_7days: RevenueDataPoint[];
  order_status_breakdown: OrderStatusBreakdown[];
  recent_orders: Order[];
  open_conversations: ConversationSummary[];
}

// ============================================================
// ADMIN AI TRAINING TYPES
// ============================================================
export interface AITrainingRecord {
  training_id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  intent: string;
  is_active: boolean;
  usage_count: number;
  positive_feedback: number;
  negative_feedback: number;
  created_at: string;
  updated_at: string;
}

export interface AITrainingListParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  active_only?: boolean;
}

export interface AITrainingListResponse {
  data: AITrainingRecord[];
  pagination: Pagination;
}

export interface CreateAITrainingRequest {
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  intent: string;
  is_active?: boolean;
}

export interface UpdateAITrainingRequest extends Partial<CreateAITrainingRequest> {}

export interface ImportAIRequest {
  records: CreateAITrainingRequest[];
}

export interface ImportAIResponse {
  imported: number;
  errors: string[];
}

export interface IntentCount {
  intent: string;
  count: number;
}

export interface LowConfidenceLog {
  question: string;
  predicted_intent: string;
  confidence_score: number;
  created_at: string;
}

export interface FeedbackTrendPoint {
  day: string;
  positive: number;
  negative: number;
}

export interface AITrainingMetrics {
  total_questions: number;
  avg_accuracy: number;
  top_intents: IntentCount[];
  low_confidence_logs: LowConfidenceLog[];
  feedback_trend_7days: FeedbackTrendPoint[];
}

// ============================================================
// ADMIN CHAT CONSOLE TYPES
// ============================================================
export interface ConversationCustomer {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
}

export interface Conversation {
  conversation_id: string;
  customer: ConversationCustomer;
  status: 'open' | 'waiting' | 'bot' | 'closed';
  priority: 'urgent' | 'high' | 'normal';
  assigned_to: string | null;
  assigned_staff_name: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  intent: string;
  tags: string[];
  created_at: string;
}

export interface ConversationMessage {
  message_id: string;
  conversation_id: string;
  sender_type: 'user' | 'bot' | 'staff';
  sender_id: string | null;
  sender_name: string;
  text: string;
  created_at: string;
}

export interface ConversationDetail {
  conversation: Conversation;
  messages: ConversationMessage[];
  customer_orders: Order[];
  internal_notes: string | null;
}

export interface ConversationListParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  assigned_to?: string;
  search?: string;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  pagination: Pagination;
}

export interface SendMessageRequest {
  text: string;
}

export interface UpdateConversationRequest {
  assigned_to?: string | null;
  priority?: 'urgent' | 'high' | 'normal';
  status?: 'open' | 'waiting' | 'closed';
  tags?: string[];
  internal_notes?: string;
}

export interface StaffMember {
  user_id: string;
  full_name: string;
  role: string;
  avatar_url: string;
  is_online: boolean;
}

export interface QuickReply {
  reply_id: string;
  title: string;
  message: string;
  category: string;
}

// ============================================================
// COMMON TYPES
// ============================================================
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  message?: string;
  code?: string;
}
