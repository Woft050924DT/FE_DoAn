// Export API client
export { default as apiClient } from './apiClient';

// Export services
export { authService } from './authService';
export { productService } from './productService';
export { cartService } from './cartService';
export { orderService } from './orderService';
export { profileService } from './profileService';
export { notificationService } from './notificationService';
export { wishlistService } from './wishlistService';
export { couponService } from './couponService';
export { chatService } from './chatService';
export {
  adminDashboardService,
  adminAITrainingService,
  adminChatService,
  adminSharedService,
  adminCustomerService,
  adminCouponService,
  adminReviewService,
  adminPostService,
  adminBannerService,
  adminCategoryService,
  adminBrandService,
  adminStaffService,
  adminMediaService,
  adminAILogService,
  adminQuickReplyService,
  adminPaymentService,
  adminShippingService,
  adminSettingsService,
  adminPaymentsService,
  adminTrainingDataService,
} from './adminService';

// Export types
export * from './types';
