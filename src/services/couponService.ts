import apiClient from './apiClient';
import { CouponValidationRequest, CouponValidationResponse, UserCoupon } from './types';

export const couponService = {
  /**
   * Validate a coupon code
   */
  async validateCoupon(data: CouponValidationRequest): Promise<CouponValidationResponse> {
    const response = await apiClient.post<CouponValidationResponse>('/api/coupons/validate', data);
    return response.data;
  },

  /**
   * Get user's coupons
   */
  async getUserCoupons(): Promise<UserCoupon[]> {
    const response = await apiClient.get<UserCoupon[]>('/api/coupons');
    return response.data;
  },
};
