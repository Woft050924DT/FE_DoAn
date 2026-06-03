import type { User } from '../services/types';

export const isAdminUser = (user: User | null | undefined) =>
  user?.role === 'admin' || user?.role === 'staff';
