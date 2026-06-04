'use client'

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Package, Tag, Truck, Star, Percent,
  FileText, Image, Menu as MenuIcon, FolderOpen, MessageSquare, Bot,
  Database, Reply, Users, UserCheck, Settings, CreditCard,
  ChevronDown, Search, Zap, ChevronRight, Activity
} from "lucide-react";
import { NotificationBell } from "@/components/Notification";

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
      { icon: Tag, label: "Danh mục", path: "/admin/categories" },
      { icon: Activity, label: "Thương hiệu", path: "/admin/brands" },
      { icon: Star, label: "Đánh giá", path: "/admin/reviews" },
      { icon: Percent, label: "Mã giảm giá", path: "/admin/coupons" },
    ],
  },
  {
    label: "NỘI DUNG",
    items: [
      { icon: FileText, label: "Bài viết", path: "/admin/posts" },
      { icon: Image, label: "Banner", path: "/admin/banners" },
      { icon: FolderOpen, label: "Thư viện", path: "/admin/media" },
    ],
  },
  {
    label: "CHAT",
    items: [
      { icon: MessageSquare, label: "Hội thoại", path: "/admin/chat" },
      { icon: Bot, label: "AI Chat Log", path: "/admin/ai-logs" },
      { icon: Database, label: "Dữ liệu huấn luyện", path: "/admin/ai-training" },
      { icon: Reply, label: "Trả lời nhanh", path: "/admin/quick-replies" },
    ],
  },
  {
    label: "NGƯỜI DÙNG",
    items: [
      { icon: Users, label: "Khách hàng", path: "/admin/customers" },
      { icon: UserCheck, label: "Nhân viên", path: "/admin/staff" },
    ],
  },
  {
    label: "CÀI ĐẶT",
    items: [
      { icon: Settings, label: "Chung", path: "/admin/settings" },
      { icon: CreditCard, label: "Thanh toán", path: "/admin/payment" },
      { icon: Truck, label: "Vận chuyển", path: "/admin/shipping" },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname.startsWith(path);
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
              <Zap size={16} className="text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <p className="text-white font-bold text-sm">VietShop</p>
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
                    onClick={() => router.push(item.path)}
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
              onClick={() => router.push("/")}
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
              className="pl-8 pr-4 py-1.5 border border-[#E0E0E0] dark:border-[#374151] rounded-lg text-sm w-56 bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]"
            />
          </div>
          <NotificationBell />
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
          {children}
        </main>
      </div>
    </div>
  );
}
