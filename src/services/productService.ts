import apiClient from './apiClient';
import { Category, Product, ProductDetail, ProductListParams, ProductListResponse } from './types';

export const productService = {
  /**
   * Get product list with filters and pagination
   * @param params - Query parameters for filtering and pagination
   * @returns Promise with products and pagination info
   */
  async getProducts(params?: ProductListParams): Promise<ProductListResponse> {
    const response = await apiClient.get<ProductListResponse>('/api/products', { params });
    return response.data;
  },

  /**
   * Get category list
   * @returns Promise with categories
   */
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[] | { categories: Category[] }>('/api/categories');
    return Array.isArray(response.data) ? response.data : response.data.categories;
  },

  /**
   * Get product details by ID
   * @param id - Product ID
   * @returns Promise with product details
   */
  async getProductById(id: string): Promise<ProductDetail> {
    const response = await apiClient.get<ProductDetail>(`/api/products/${id}`);
    return response.data;
  },

  /**
   * Get featured products
   * @param limit - Number of products to return
   * @returns Promise with products
   */
  async getFeaturedProducts(limit: number = 10): Promise<ProductListResponse> {
    const response = await apiClient.get<ProductListResponse>('/api/products', {
      params: { featured: true, limit }
    });
    return response.data;
  },

  /**
   * Get best seller products
   * @param limit - Number of products to return
   * @returns Promise with products
   */
  async getBestSellerProducts(limit: number = 10): Promise<ProductListResponse> {
    const response = await apiClient.get<ProductListResponse>('/api/products', {
      params: { best_seller: true, limit }
    });
    return response.data;
  },

  /**
   * Get new arrival products
   * @param limit - Number of products to return
   * @returns Promise with products
   */
  async getNewArrivalProducts(limit: number = 10): Promise<ProductListResponse> {
    const response = await apiClient.get<ProductListResponse>('/api/products', {
      params: { new_arrival: true, limit }
    });
    return response.data;
  },

  /**
   * Get products by category
   * @param categoryId - Category ID
   * @param params - Additional query parameters
   * @returns Promise with products and pagination info
   */
  async getProductsByCategory(
    categoryId: string,
    params?: Omit<ProductListParams, 'category_id'>
  ): Promise<ProductListResponse> {
    const response = await apiClient.get<ProductListResponse>('/api/products', {
      params: { category_id: categoryId, ...params }
    });
    return response.data;
  },

  /**
   * Get products by brand
   * @param brandId - Brand ID
   * @param params - Additional query parameters
   * @returns Promise with products and pagination info
   */
  async getProductsByBrand(
    brandId: string,
    params?: Omit<ProductListParams, 'brand_id'>
  ): Promise<ProductListResponse> {
    const response = await apiClient.get<ProductListResponse>('/api/products', {
      params: { brand_id: brandId, ...params }
    });
    return response.data;
  }
};
