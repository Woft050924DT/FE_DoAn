import apiClient from './apiClient';
import {
  Brand,
  Category,
  CreateProductRequest,
  CreateReviewRequest,
  CreateVariantRequest,
  Product,
  ProductDetail,
  ProductListParams,
  ProductListResponse,
  ProductReview,
  UpdateProductRequest,
} from './types';

export const productService = {
  // ============================================================
  // PUBLIC - Products
  // ============================================================

  /**
   * Get product list with filters and pagination
   */
  async getProducts(params?: ProductListParams): Promise<ProductListResponse> {
    const response = await apiClient.get<ProductListResponse>('/api/products', { params });
    return response.data;
  },

  /**
   * Get product details by ID
   */
  async getProductById(id: string): Promise<ProductDetail> {
    const response = await apiClient.get<ProductDetail>(`/api/products/${id}`);
    return response.data;
  },

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 10): Promise<ProductListResponse> {
    const response = await apiClient.get<ProductListResponse>('/api/products', {
      params: { featured: true, limit },
    });
    return response.data;
  },

  /**
   * Get best seller products
   */
  async getBestSellerProducts(limit: number = 10): Promise<ProductListResponse> {
    const response = await apiClient.get<ProductListResponse>('/api/products', {
      params: { best_seller: true, limit },
    });
    return response.data;
  },

  /**
   * Get new arrival products
   */
  async getNewArrivalProducts(limit: number = 10): Promise<ProductListResponse> {
    const response = await apiClient.get<ProductListResponse>('/api/products', {
      params: { new_arrival: true, limit },
    });
    return response.data;
  },

  /**
   * Get products by category
   */
  async getProductsByCategory(
    categoryId: string,
    params?: Omit<ProductListParams, 'category_id'>
  ): Promise<ProductListResponse> {
    const response = await apiClient.get<ProductListResponse>('/api/products', {
      params: { category_id: categoryId, ...params },
    });
    return response.data;
  },

  /**
   * Get products by brand
   */
  async getProductsByBrand(
    brandId: string,
    params?: Omit<ProductListParams, 'brand_id'>
  ): Promise<ProductListResponse> {
    const response = await apiClient.get<ProductListResponse>('/api/products', {
      params: { brand_id: brandId, ...params },
    });
    return response.data;
  },

  // ============================================================
  // PUBLIC - Categories & Brands
  // ============================================================

  /**
   * Get category list
   */
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[] | { categories: Category[] }>('/api/categories');
    return Array.isArray(response.data) ? response.data : response.data.categories;
  },

  /**
   * Get brand list
   */
  async getBrands(): Promise<Brand[]> {
    const response = await apiClient.get<Brand[]>('/api/products/brands');
    return response.data;
  },

  // ============================================================
  // PUBLIC - Reviews
  // ============================================================

  /**
   * Get product reviews
   */
  async getReviews(productId: string): Promise<ProductReview[]> {
    const response = await apiClient.get<ProductReview[]>(`/api/products/${productId}/reviews`);
    return response.data;
  },

  /**
   * Add a product review
   */
  async addReview(productId: string, data: CreateReviewRequest): Promise<ProductReview> {
    const response = await apiClient.post<ProductReview>(`/api/products/${productId}/reviews`, data);
    return response.data;
  },

  /**
   * Mark a review as helpful
   */
  async markReviewHelpful(productId: string, reviewId: string): Promise<ProductReview> {
    const response = await apiClient.post<ProductReview>(
      `/api/products/${productId}/reviews/${reviewId}/helpful`
    );
    return response.data;
  },

  // ============================================================
  // ADMIN - Product Management
  // ============================================================

  /**
   * Create a new product (admin)
   */
  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await apiClient.post<Product>('/api/admin/products', data);
    return response.data;
  },

  /**
   * Update a product (admin)
   */
  async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
    const response = await apiClient.put<Product>(`/api/admin/products/${id}`, data);
    return response.data;
  },

  /**
   * Delete a product (admin)
   */
  async deleteProduct(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/admin/products/${id}`);
    return response.data;
  },

  /**
   * Get all products for admin (with full admin list)
   */
  async getAdminProducts(params?: ProductListParams & { status?: string; brand_id?: string; category_id?: string }): Promise<ProductListResponse> {
    const response = await apiClient.get<ProductListResponse>('/api/admin/products', { params });
    return response.data;
  },

  /**
   * Upload product image (admin)
   */
  async uploadProductImage(
    productId: string,
    data: { image_url: string; alt_text?: string; display_order?: number }
  ): Promise<{ image_id: string; image_url: string; alt_text: string; display_order: number; is_primary: boolean }> {
    const response = await apiClient.post(`/api/admin/products/${productId}/images`, data);
    return response.data;
  },

  /**
   * Delete product image (admin)
   */
  async deleteProductImage(productId: string, imageId: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `/api/admin/products/${productId}/images/${imageId}`
    );
    return response.data;
  },

  /**
   * Create product variant (admin)
   */
  async createVariant(productId: string, data: CreateVariantRequest): Promise<any> {
    const response = await apiClient.post(`/api/admin/products/${productId}/variants`, data);
    return response.data;
  },

  /**
   * Update product variant (admin)
   */
  async updateVariant(
    productId: string,
    variantId: string,
    data: Partial<CreateVariantRequest>
  ): Promise<any> {
    const response = await apiClient.put(`/api/admin/products/${productId}/variants/${variantId}`, data);
    return response.data;
  },
};
