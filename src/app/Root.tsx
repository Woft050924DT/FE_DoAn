import { createBrowserRouter } from 'react-router';
import { LayoutStorefront } from '../components/Layout/StorefrontLayout';
import { LayoutAdmin } from '../components/Layout/AdminLayout';
import { ProtectedRoute } from '../components/Auth/ProtectedRoute';
import { AdminRoute } from '../components/Auth/AdminRoute';

import { ScreensHome } from './home/page';
import { ScreensProductList } from './products/page';
import { ScreensProductDetail } from './products/[id]/page';
import { ScreensCart } from './cart/page';
import { ScreensCheckout } from './checkout/page';
import { ScreensAccount } from './account/page';
import { ScreensLogin } from './login/page';
import { ScreensRegister } from './register/page';

import { ScreensAdminDashboard } from './admin/page';
import { ScreensAdminOrders } from './admin/orders/page';
import { ScreensAdminProducts } from './admin/products/page';
import { ScreensAdminInventory } from './admin/inventory/page';
import { ScreensAdminBrands } from './admin/brands/page';
import { ScreensAdminCategories } from './admin/categories/page';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: LayoutStorefront,
    children: [
      { index: true, Component: ScreensHome },
      { path: 'products', Component: ScreensProductList },
      { path: 'products/:id', Component: ScreensProductDetail },
      {
        path: 'cart',
        element: (
          <ProtectedRoute>
            <ScreensCart />
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <ScreensCheckout />
          </ProtectedRoute>
        ),
      },
      {
        path: 'account',
        element: (
          <ProtectedRoute>
            <ScreensAccount />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/login',
    Component: ScreensLogin,
  },
  {
    path: '/register',
    Component: ScreensRegister,
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <LayoutAdmin />
      </AdminRoute>
    ),
    children: [
      { index: true, Component: ScreensAdminDashboard },
      { path: 'orders', Component: ScreensAdminOrders },
      { path: 'products', Component: ScreensAdminProducts },
      { path: 'inventory', Component: ScreensAdminInventory },
      { path: 'categories', Component: ScreensAdminCategories },
      { path: 'brands', Component: ScreensAdminBrands },
    ],
  },
]);
