import apiClient from './apiClient';

export const couponService = {
  async validate(code: string, subtotal: number) {
    const response = await apiClient.post('/api/coupons/validate', { code, subtotal });
    return response.data as {
      valid: boolean;
      code: string;
      discount_amount: number;
      discount_type: string;
      description?: string;
    };
  },
};
