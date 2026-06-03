// Export API client
export { default as apiClient } from './apiClient';

// Export services
export { authService } from './authService';
export { productService } from './productService';
export { cartService } from './cartService';
export { orderService } from './orderService';
export { catalogService } from './catalogService';
export { addressService } from './addressService';
export { couponService } from './couponService';
export { inventoryService } from './inventoryService';
export { statsService } from './statsService';
export type { DashboardStats } from './statsService';

// Export inventory types
export type {
  InventoryItem,
  InventorySummary,
  InventoryTransaction
} from './inventoryService';

// Export shared types
export * from './types';