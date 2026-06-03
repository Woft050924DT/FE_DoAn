import apiClient from './apiClient';
import type { Pagination } from './types';

export interface InventorySummary {
  totalSkus: number;
  totalStock: number;
  outOfStock: number;
  lowStock: number;
  lowStockThreshold: number;
}

export interface InventoryItem {
  variant_id: string;
  product_id: string | null;
  sku: string | null;
  name: string | null;
  stock_quantity: number;
  price: number;
  cost_price?: number | string | null;
  is_active: boolean | null;
  products?: {
    product_id: string;
    name: string;
    sku: string | null;
    status: string | null;
    price?: number | string;
    cost_price?: number | string | null;
    product_images?: { image_url: string }[];
    brands?: { name: string };
    categories?: { name: string };
  };
}

export interface InventoryTransaction {
  transaction_id: string;
  product_id: string | null;
  variant_id: string | null;
  transaction_type: string;
  quantity: number;
  notes: string | null;
  created_at: string;
  product_variants?: {
    variant_id: string;
    name: string | null;
    sku: string | null;
    stock_quantity: number | null;
  };
  products?: {
    product_id: string;
    name: string;
    sku: string | null;
  };
  users?: {
    user_id: string;
    full_name: string;
    email: string;
  };
}

export interface InventoryListParams {
  search?: string;
  status?: 'all' | 'low' | 'out' | 'in_stock';
  page?: number;
  limit?: number;
}

export const inventoryService = {
  async getSummary(): Promise<InventorySummary> {
    const response = await apiClient.get<InventorySummary>('/api/inventory/summary');
    return response.data;
  },

  async getInventory(params?: InventoryListParams): Promise<{
    items: InventoryItem[];
    pagination: Pagination;
  }> {
    const response = await apiClient.get('/api/inventory', {
      params: {
        ...params,
        status: params?.status === 'all' ? undefined : params?.status,
      },
    });
    return response.data;
  },

  async getTransactions(params?: {
    page?: number;
    limit?: number;
    variant_id?: string;
  }): Promise<{ transactions: InventoryTransaction[]; pagination: Pagination }> {
    const response = await apiClient.get('/api/inventory/transactions', { params });
    return response.data;
  },

  async adjustStock(data: {
    variant_id: string;
    type: 'in' | 'out' | 'set';
    quantity: number;
    notes?: string;
  }) {
    const response = await apiClient.post('/api/inventory/adjust', data);
    return response.data as {
      variant: InventoryItem;
      previousStock: number;
      newStock: number;
    };
  },

  async receiveStock(data: {
    variant_id?: string;
    quantity: number;
    unit_cost: number;
    notes?: string;
    product?: {
      name: string;
      sku: string;
      price?: number;
      compare_price?: number;
      category_id?: string;
      brand_id?: string;
      short_description?: string;
      image_urls?: string[];
      status?: 'draft' | 'published';
    };
  }) {
    const response = await apiClient.post('/api/inventory/receive', data);
    return response.data as {
      variant_id: string;
      product_id?: string;
      product_name?: string;
      previousStock: number;
      newStock: number;
      unit_cost: number;
      isNewProduct?: boolean;
    };
  },
};
