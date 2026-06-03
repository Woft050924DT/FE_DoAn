import { createBrowserRouter } from 'react-router';
import { LayoutStorefront } from '../components/Layout/StorefrontLayout';
import { LayoutAdmin } from '../components/Layout/AdminLayout';
import { ProtectedRoute } from '../components/Auth/ProtectedRoute';
import { AdminRoute } from '../components/Auth/AdminRoute';

import { ScreensHome } from './Home';
import { ScreensProductList } from './Product/List';
import { ScreensProductDetail } from './Product/Detail';
import { ScreensCart } from './Cart';
import { ScreensCheckout } from './Checkout';
import { ScreensAccount } from './Account';
import { ScreensLogin } from './Login';
import { ScreensRegister } from './Register';

import { ScreensAdminDashboard } from './Admin/Dashboard';
import { ScreensAdminOrders } from './Admin/Orders';
import { ScreensAdminProducts } from './Admin/Products';
import { ScreensAdminInventory } from './Admin/Inventory';
import { ScreensAdminBrands } from './Admin/Brands';
import { ScreensAdminCategories } from './Admin/Categories';

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
