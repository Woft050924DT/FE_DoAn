import apiClient from './apiClient';
import type { Brand, Category, CreateBrandRequest, CreateCategoryRequest } from './types';

export const catalogService = {
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<{ categories: Category[] }>('/api/categories');
    return response.data.categories;
  },

  async getCategoriesAdmin(): Promise<Category[]> {
    const response = await apiClient.get<{ categories: Category[] }>('/api/categories', {
      params: { admin: true },
    });
    return response.data.categories;
  },

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const response = await apiClient.post<Category>('/api/categories', data);
    return response.data;
  },

  async updateCategory(categoryId: string, data: Partial<CreateCategoryRequest>): Promise<Category> {
    const response = await apiClient.put<Category>(`/api/categories/${categoryId}`, data);
    return response.data;
  },

  async deleteCategory(categoryId: string): Promise<void> {
    await apiClient.delete(`/api/categories/${categoryId}`);
  },

  async getBrands(): Promise<Brand[]> {
    const response = await apiClient.get<{ brands: Brand[] }>('/api/brands');
    return response.data.brands;
  },

  async getBrandsAdmin(): Promise<Brand[]> {
    const response = await apiClient.get<{ brands: Brand[] }>('/api/brands', {
      params: { admin: true },
    });
    return response.data.brands;
  },

  async createBrand(data: CreateBrandRequest): Promise<Brand> {
    const response = await apiClient.post<Brand>('/api/brands', data);
    return response.data;
  },

  async updateBrand(brandId: string, data: Partial<CreateBrandRequest>): Promise<Brand> {
    const response = await apiClient.put<Brand>(`/api/brands/${brandId}`, data);
    return response.data;
  },

  async deleteBrand(brandId: string): Promise<void> {
    await apiClient.delete(`/api/brands/${brandId}`);
  },

  async getBanners(position?: string) {
    const response = await apiClient.get('/api/banners', { params: { position } });
    return response.data.banners;
  },
};
