import { createBrowserRouter } from 'react-router';
import { LayoutStorefront } from './components/Layout/StorefrontLayout';
import { LayoutAdmin } from './components/Layout/AdminLayout';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { AdminRoute } from './components/Auth/AdminRoute';

import { ScreensHome } from './screens/Home';
import { ScreensProductList } from './screens/Product/List';
import { ScreensProductDetail } from './screens/Product/Detail';
import { ScreensCart } from './screens/Cart';
import { ScreensCheckout } from './screens/Checkout';
import { ScreensAccount } from './screens/Account';
import { ScreensLogin } from './screens/Login';
import { ScreensRegister } from './screens/Register';

import { ScreensAdminDashboard } from './screens/Admin/Dashboard';
import { ScreensAdminOrders } from './screens/Admin/Orders';
import { ScreensAdminProducts } from './screens/Admin/Products';
import { ScreensAdminInventory } from './screens/Admin/Inventory';
import { ScreensAdminBrands } from './screens/Admin/Brands';
import { ScreensAdminCategories } from './screens/Admin/Categories';

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
