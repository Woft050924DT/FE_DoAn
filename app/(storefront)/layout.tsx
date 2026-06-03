'use client'

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search, ChevronDown, ShoppingCart,
  Facebook, Instagram, Youtube, Menu, X, Zap
} from "lucide-react";
import { ChatWidget } from "@/components/Chat/ChatWidget";
import { NotificationBell } from "@/components/Notification";

const NAV_LINKS = [
  { label: "Tất cả danh mục", path: "/products" },
  { label: "Điện tử", path: "/products?cat=electronics" },
  { label: "Thời trang", path: "/products?cat=fashion" },
  { label: "Nhà cửa", path: "/products?cat=home" },
  { label: "Flash Sale 🔥", path: "/products?sale=true", red: true },
];

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount] = useState(3);

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E0E0E0] shadow-sm">
        {/* Main header row */}
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer shrink-0"
            onClick={() => router.push("/")}
          >
            <div className="w-8 h-8 bg-[#E53935] rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-[#212121] hidden sm:block">VietShop</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-3 text-[#757575]" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#E0E0E0] rounded-full text-sm focus:outline-none focus:border-[#1565C0] bg-[#F5F6FA]"
                onKeyDown={(e) => e.key === "Enter" && router.push(`/products?q=${searchQuery}`)}
              />
              <button
                onClick={() => router.push(`/products?q=${searchQuery}`)}
                className="absolute right-1 bg-[#E53935] text-white text-xs px-3 py-1.5 rounded-full hover:bg-[#C62828] transition-colors"
              >
                Tìm
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="relative p-2 hover:bg-gray-100 rounded-full">
              <NotificationBell />
            </button>
            <button
              className="relative p-2 hover:bg-gray-100 rounded-full"
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart size={20} className="text-[#212121]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#E53935] rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="hidden sm:flex items-center gap-1.5 pl-1 pr-3 py-1 hover:bg-gray-100 rounded-full"
              onClick={() => router.push("/account")}
            >
              <div className="w-7 h-7 bg-[#1565C0] rounded-full flex items-center justify-center text-white text-xs font-bold">NA</div>
              <span className="text-sm text-[#212121] hidden md:block">Tài khoản</span>
              <ChevronDown size={14} className="text-[#757575] hidden md:block" />
            </button>
            <button className="sm:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Secondary Nav */}
        <div className="border-t border-[#F5F6FA] bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="hidden sm:flex items-center gap-6 h-10 overflow-x-auto">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.path}
                  onClick={() => router.push(link.path)}
                  className={`text-sm whitespace-nowrap hover:text-[#E53935] transition-colors shrink-0 ${
                    link.red ? "text-[#E53935] font-semibold" : "text-[#212121]"
                  } ${pathname === link.path ? "font-semibold" : ""}`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-[#E0E0E0] bg-white py-2 px-4">
            {NAV_LINKS.map((link) => (
              <button
                key={link.path}
                onClick={() => { router.push(link.path); setMobileMenuOpen(false); }}
                className={`block w-full text-left py-2 text-sm ${link.red ? "text-[#E53935] font-semibold" : "text-[#212121]"}`}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#212121] text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-[#E53935] rounded-lg flex items-center justify-center">
                  <Zap size={14} className="text-white" />
                </div>
                <span className="text-white font-bold">VietShop</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">Mua sắm thông minh, tiết kiệm tối đa với hàng ngàn sản phẩm chính hãng.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Hỗ trợ khách hàng</h4>
              <ul className="space-y-1.5 text-sm text-gray-400">
                {["Trung tâm trợ giúp", "Chính sách đổi trả", "Theo dõi đơn hàng", "Phương thức thanh toán"].map(item => (
                  <li key={item} className="hover:text-white cursor-pointer transition-colors">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Tài khoản</h4>
              <ul className="space-y-1.5 text-sm text-gray-400">
                {["Đăng nhập", "Đăng ký", "Đơn hàng của tôi", "Danh sách yêu thích"].map(item => (
                  <li key={item} className="hover:text-white cursor-pointer transition-colors">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Liên hệ</h4>
              <ul className="space-y-1.5 text-sm text-gray-400">
                <li>📞 1800 1234 (Miễn phí)</li>
                <li>✉️ support@vietshop.vn</li>
                <li>⏰ 8:00 - 22:00 (T2 - CN)</li>
              </ul>
              <div className="flex gap-3 mt-4">
                {[Facebook, Instagram, Youtube].map((Icon, i) => (
                  <button key={i} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#E53935] transition-colors">
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">© 2024 VietShop. Tất cả quyền được bảo lưu.</p>
            <div className="flex items-center gap-3">
              {["COD", "Bank", "MoMo", "VNPay"].map(method => (
                <span key={method} className="text-xs bg-white/10 px-2 py-1 rounded font-medium text-gray-300">{method}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
}
