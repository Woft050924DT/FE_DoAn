import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authService, cartService } from '../services';
import type { User } from '../services/types';

interface AppContextValue {
  user: User | null;
  isAuthenticated: boolean;
  cartCount: number;
  authLoading: boolean;
  setUser: (user: User | null) => void;
  refreshAuth: () => Promise<void>;
  refreshCart: () => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser());
  const [cartCount, setCartCount] = useState(0);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setCartCount(0);
      return;
    }
    try {
      const cart = await cartService.getCart();
      const count = (cart.cart_items || []).reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setUser(null);
      setCartCount(0);
      return;
    }
    try {
      const me = await authService.getMe();
      setUser(me);
      await refreshCart();
    } catch {
      authService.logout();
      setUser(null);
      setCartCount(0);
    }
  }, [refreshCart]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setCartCount(0);
  }, []);

  useEffect(() => {
    refreshAuth().finally(() => setAuthLoading(false));
  }, [refreshAuth]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user && authService.isAuthenticated(),
      cartCount,
      authLoading,
      setUser,
      refreshAuth,
      refreshCart,
      logout,
    }),
    [user, cartCount, authLoading, refreshAuth, refreshCart, logout]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}
