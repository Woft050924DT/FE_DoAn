import apiClient from './apiClient';

export type DashboardStats = {
  kpis: {
    todayRevenue: number;
    revenueChange: number;
    todayOrders: number;
    ordersChange: number;
    totalUsers: number;
    publishedProducts: number;
  };
  revenueByDay: { day: string; revenue: number; date: string }[];
  orderStatusChart: { status: string; name: string; value: number; color: string }[];
  recentOrders: any[];
};

export const statsService = {
  async getDashboard(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/api/stats/dashboard');
    return response.data;
  },
};
