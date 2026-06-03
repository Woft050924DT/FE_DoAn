// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
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

// Product Types
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
  parent_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  icon?: string | null;
  display_order?: number;
  is_active?: boolean;
  _count?: { products: number };
}

export interface Brand {
  brand_id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  description?: string | null;
  website?: string | null;
  is_active?: boolean;
  _count?: { products: number };
}

export type CreateBrandRequest = {
  name: string;
  slug?: string;
  logo_url?: string;
  description?: string;
  website?: string;
  is_active?: boolean;
};

export type CreateCategoryRequest = {
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
  icon?: string;
  display_order?: number;
  parent_id?: string | null;
  is_active?: boolean;
};

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
  order_id: string;
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

export interface ProductListParams {
  category_id?: string;
  brand_id?: string;
  featured?: boolean;
  best_seller?: boolean;
  new_arrival?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  admin?: boolean;
  status?: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  short_description?: string;
  description?: string;
  category_id?: string;
  brand_id?: string;
  status?: 'draft' | 'published' | 'archived';
  featured?: boolean;
  best_seller?: boolean;
  new_arrival?: boolean;
  image_url?: string;
  image_urls?: string[];
  stock_quantity?: number;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

export interface UpdateOrderRequest {
  status?: string;
  notes?: string;
  internal_notes?: string;
  tracking_number?: string;
  cancellation_reason?: string;
  status_note?: string;
}

export interface ProductListResponse {
  products: Product[];
  pagination: Pagination;
}

// Cart Types
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

// Order Types
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
}

export interface OrderListResponse {
  orders: Order[];
  pagination: Pagination;
}

// Common Types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
}

