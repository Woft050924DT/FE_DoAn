import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard, ShoppingBag, Package, Warehouse, Tag, Truck, Star, Percent,
  FileText, Image, Menu as MenuIcon, FolderOpen,
  Users, UserCheck, Settings, CreditCard, Bell,
  ChevronDown, Search, Watch, X, ChevronRight, Activity
} from "lucide-react";

const SIDEBAR_GROUPS = [
  {
    label: null,
    items: [{ icon: LayoutDashboard, label: "Tổng quan", path: "/admin" }],
  },
  {
    label: "BÁN HÀNG",
    items: [
      { icon: ShoppingBag, label: "Đơn hàng", path: "/admin/orders" },
      { icon: Package, label: "Sản phẩm", path: "/admin/products" },
      { icon: Warehouse, label: "Kho hàng", path: "/admin/inventory" },
      { icon: Tag, label: "Danh mục", path: "/admin/categories" },
      { icon: Activity, label: "Thương hiệu", path: "/admin/brands" },
    ],
  },
  {
    label: "NGƯỜI DÙNG",
    items: [
      { icon: Users, label: "Khách hàng", path: "/admin/customers" },
      { icon: UserCheck, label: "Nhân viên", path: "/admin/staff" },
    ],
  },
];

export function LayoutAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-[#F5F6FA] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-60" : "w-0 sm:w-16"} transition-all duration-300 bg-[#1E2A3A] flex-shrink-0 flex flex-col overflow-hidden`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center shrink-0">
              <Watch size={16} className="text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <p className="text-white font-bold text-sm">VietWatch</p>
                <p className="text-gray-400 text-xs">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {SIDEBAR_GROUPS.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "mt-3" : ""}>
              {group.label && sidebarOpen && (
                <p className="text-xs text-gray-500 font-semibold px-2 mb-1 mt-2">{group.label}</p>
              )}
              {group.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 relative
                      ${active
                        ? "bg-[#2563EB]/20 text-white border-l-2 border-[#2563EB] pl-[10px]"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <item.icon size={16} className="shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Storefront link */}
        {sidebarOpen && (
          <div className="p-3 border-t border-white/10">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center gap-2 text-gray-400 hover:text-white text-xs px-2 py-1.5 rounded hover:bg-white/5 transition-colors"
            >
              <ChevronRight size={12} />
              Xem cửa hàng
            </button>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-[#E0E0E0] flex items-center px-4 gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <MenuIcon size={18} className="text-[#212121]" />
          </button>
          <div className="flex-1" />
          <div className="relative hidden md:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Tìm kiếm..."
              className="pl-8 pr-4 py-1.5 border border-[#E0E0E0] rounded-lg text-sm w-56 focus:outline-none focus:border-[#1565C0]"
            />
          </div>
          <button className="relative p-2 hover:bg-gray-100 rounded-full">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#E53935] rounded-full text-white text-[8px] flex items-center justify-center">5</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2563EB] rounded-full flex items-center justify-center text-white text-xs font-bold">MT</div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-[#212121] leading-none">Minh Tuấn</p>
              <p className="text-xs text-[#757575]">Admin</p>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
