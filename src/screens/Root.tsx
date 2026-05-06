import { createBrowserRouter } from "react-router";
import { LayoutStorefront } from "../components/Layout/StorefrontLayout";
import { LayoutAdmin } from "../components/Layout/AdminLayout";

// Storefront screens
import { ScreensHome } from "./Home";
import { ScreensProductList } from "./Product/List";
import { ScreensProductDetail } from "./Product/Detail";
import { ScreensCart } from "./Cart";
import { ScreensCheckout } from "./Checkout";
import { ScreensAccount } from "./Account";
import { ScreensLogin } from "./Login";

// Admin screens
import { ScreensAdminDashboard } from "./Admin/Dashboard";
import { ScreensAdminOrders } from "./Admin/Orders";
import { ScreensAdminProducts } from "./Admin/Products";
import { ScreensAdminChatConsole } from "./Admin/ChatConsole";
import { ScreensAdminAITraining } from "./Admin/AITraining";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LayoutStorefront,
    children: [
      { index: true, Component: ScreensHome },
      { path: "products", Component: ScreensProductList },
      { path: "products/:id", Component: ScreensProductDetail },
      { path: "cart", Component: ScreensCart },
      { path: "checkout", Component: ScreensCheckout },
      { path: "account", Component: ScreensAccount },
    ],
  },
  {
    path: "/login",
    Component: ScreensLogin,
  },
  {
    path: "/admin",
    Component: LayoutAdmin,
    children: [
      { index: true, Component: ScreensAdminDashboard },
      { path: "orders", Component: ScreensAdminOrders },
      { path: "products", Component: ScreensAdminProducts },
      { path: "chat", Component: ScreensAdminChatConsole },
      { path: "ai-training", Component: ScreensAdminAITraining },
    ],
  },
]);
