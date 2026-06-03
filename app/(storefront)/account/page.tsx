'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, MapPin, Star, Bell, Ticket, Lock, LogOut, ChevronRight, Plus, Edit2, Trash2,
} from "lucide-react";
import { orderService, profileService } from "@/services";
import { Address, Profile } from "@/services/types";
import { OrderStatusBadge } from "@/components/Order/StatusBadge";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const transformOrder = (apiOrder: any) => ({
  id: apiOrder.order_number,
  customer: { name: apiOrder.customer_name, email: apiOrder.customer_email, avatar: apiOrder.customer_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "NA" },
  items: apiOrder.order_items?.length || 0,
  total: apiOrder.total_amount,
  status: apiOrder.status,
  paymentMethod: apiOrder.payment_method,
  date: new Date(apiOrder.created_at).toLocaleDateString("vi-VN"),
  address: `${apiOrder.shipping_address_line1}, ${apiOrder.shipping_city}`,
});

const getInitials = (name?: string) => name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "NA";
const formatAddress = (addr: Address) => [addr.address_line1, addr.address_line2, addr.ward, addr.district, addr.city].filter(Boolean).join(", ");

const USER = { name: "Nguyễn Văn An", email: "an.nguyen@gmail.com", avatar: "NA", memberSince: "Tháng 3, 2022", totalOrders: 24, pendingOrders: 2, totalSpent: 45680000, totalReviews: 18 };
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Tổng quan", id: "overview" },
  { icon: ShoppingBag, label: "Đơn hàng", id: "orders", badge: 2 },
  { icon: MapPin, label: "Địa chỉ", id: "addresses" },
  { icon: Star, label: "Đánh giá", id: "reviews" },
  { icon: Bell, label: "Thông báo", id: "notifications", badge: 5 },
  { icon: Ticket, label: "Voucher", id: "vouchers" },
  { icon: Lock, label: "Đổi mật khẩu", id: "password" },
  { icon: LogOut, label: "Đăng xuất", id: "logout" },
];
const NOTIFICATIONS = [
  { id: "n1", icon: "📦", title: "Đơn hàng đang giao", message: "Đơn hàng #DH2024003 đã được giao đến bưu cục.", time: "2 giờ trước", unread: true },
  { id: "n2", icon: "🎉", title: "Khuyến mãi đặc biệt", message: "Flash Sale cuối tuần – Giảm đến 50%!", time: "5 giờ trước", unread: true },
  { id: "n3", icon: "⭐", title: "Đánh giá sản phẩm", message: "Hãy đánh giá sản phẩm để nhận điểm thưởng!", time: "1 ngày trước", unread: false },
  { id: "n4", icon: "✅", title: "Thanh toán thành công", message: "Đơn hàng #DH2024001 đã được thanh toán.", time: "2 ngày trước", unread: false },
];
const FALLBACK_ADDRESSES = [
  { id: "a1", type: "home", name: "Nguyễn Văn An", phone: "0901234567", address: "123 Nguyễn Huệ, Phường Bến Nghé", city: "Q1, TP. Hồ Chí Minh", isDefault: true },
  { id: "a2", type: "office", name: "Nguyễn Văn An", phone: "0901234567", address: "456 Đinh Tiên Hoàng, Phường Đa Kao", city: "Q1, TP. Hồ Chí Minh", isDefault: false },
];
const ORDER_TABS = ["Tất cả", "Chờ xác nhận", "Đang xử lý", "Đang giao", "Đã giao", "Đã hủy"];

export default function AccountPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("overview");
  const [orderTab, setOrderTab] = useState(0);
  const [notifFilter, setNotifFilter] = useState("all");
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const displayUser = {
    ...USER,
    name: profile?.full_name || USER.name,
    email: profile?.email || USER.email,
    avatar: getInitials(profile?.full_name || USER.name),
    memberSince: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("vi-VN") : USER.memberSince,
  };

  const NOTIF_FILTERS = ["Tất cả", "Chưa đọc", "Đơn hàng", "Khuyến mãi", "Hệ thống"];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getOrders({ page: 1, limit: 5 });
        setOrders(data.orders.map(transformOrder));
      } catch (err) { console.error(err); }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfile(data);
        setAddresses(data.user_addresses || []);
      } catch (err) { console.error(err); }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeSection !== "addresses") return;
    const fetchAddresses = async () => {
      try {
        const data = await profileService.getAddresses();
        setAddresses(data);
      } catch (err) { console.error(err); }
    };
    fetchAddresses();
  }, [activeSection]);

  const setDefaultAddress = async (addressId: string) => {
    try {
      const updated = await profileService.updateAddress(addressId, { is_default: true });
      setAddresses((prev) => prev.map((addr) => ({ ...addr, is_default: addr.address_id === updated.address_id })));
    } catch (err) { console.error(err); }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      await profileService.deleteAddress(addressId);
      setAddresses((prev) => prev.filter((addr) => addr.address_id !== addressId));
    } catch (err) { console.error(err); }
  };

  const accountAddresses = addresses.length > 0
    ? addresses.map((addr) => ({ id: addr.address_id, apiAddressId: addr.address_id, type: addr.address_type, name: addr.full_name, phone: addr.phone, address: formatAddress(addr), city: addr.country, isDefault: addr.is_default }))
    : FALLBACK_ADDRESSES;
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden">
            <div className="p-5 text-center border-b border-[#E0E0E0]">
              <div className="w-16 h-16 bg-[#1565C0] rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">{displayUser.avatar}</div>
              <p className="font-semibold text-[#212121]">{displayUser.name}</p>
              <p className="text-xs text-[#757575] mt-0.5">{displayUser.email}</p>
            </div>
            <nav className="py-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "logout") { localStorage.removeItem("token"); router.push("/"); }
                    else setActiveSection(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    activeSection === item.id ? "bg-[#E53935]/5 text-[#E53935] font-medium border-r-2 border-[#E53935]"
                    : item.id === "logout" ? "text-[#E53935] hover:bg-red-50" : "text-[#212121] hover:bg-gray-50"
                  }`}
                >
                  <item.icon size={16} className="shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {"badge" in item && item.badge && (
                    <span className="w-5 h-5 bg-[#E53935] text-white text-[10px] rounded-full flex items-center justify-center font-bold">{item.badge}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {activeSection === "overview" && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-[#1565C0] to-[#1976D2] rounded-2xl p-6 text-white">
                <h2 className="text-xl font-bold mb-1">Xin chào, {displayUser.name.split(" ").pop()}! 👋</h2>
                <p className="text-white/70 text-sm">Thành viên từ {displayUser.memberSince}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Tổng đơn", value: USER.totalOrders, icon: "📦", color: "text-[#1565C0]" },
                  { label: "Chờ xử lý", value: USER.pendingOrders, icon: "⏳", color: "text-amber-600" },
                  { label: "Đã chi tiêu", value: formatCurrency(USER.totalSpent).replace("₫", "đ"), icon: "💰", color: "text-[#E53935]", small: true },
                  { label: "Đã đánh giá", value: USER.totalReviews, icon: "⭐", color: "text-[#2E7D32]" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl border border-[#E0E0E0] p-4 text-center">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <p className={`font-bold ${"small" in stat && stat.small ? "text-sm" : "text-xl"} ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-[#757575] mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0E0E0]">
                  <h3 className="font-semibold text-[#212121]">Đơn hàng gần đây</h3>
                  <button onClick={() => setActiveSection("orders")} className="text-sm text-[#1565C0] hover:underline flex items-center gap-1">Xem tất cả <ChevronRight size={13} /></button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F5F6FA]">
                      <tr>{["Mã đơn", "Ngày", "Sản phẩm", "Tổng tiền", "Trạng thái", ""].map((h) => (<th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-[#757575]">{h}</th>))}</tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F6FA]">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#F5F6FA]">
                          <td className="px-4 py-3 font-medium text-[#1565C0]">{order.id}</td>
                          <td className="px-4 py-3 text-[#757575]">{order.date}</td>
                          <td className="px-4 py-3 text-[#757575]">{order.items} sản phẩm</td>
                          <td className="px-4 py-3 font-medium">{formatCurrency(order.total)}</td>
                          <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                          <td className="px-4 py-3"><button className="text-xs text-[#1565C0] hover:underline">Xem</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === "orders" && (
            <div className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden">
              <div className="p-5 border-b border-[#E0E0E0]">
                <h3 className="font-bold text-[#212121] mb-4">Đơn hàng của tôi</h3>
                <div className="flex gap-1 overflow-x-auto">
                  {ORDER_TABS.map((tab, i) => (
                    <button key={tab} onClick={() => setOrderTab(i)} className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${orderTab === i ? "bg-[#E53935] text-white" : "text-[#757575] hover:bg-gray-100"}`}>{tab}</button>
                  ))}
                </div>
              </div>
              <div className="p-5 space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-[#E0E0E0] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-[#F5F6FA]">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm text-[#212121]">{order.id}</span>
                        <span className="text-xs text-[#757575]">{order.date}</span>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-[#757575]">{order.items} sản phẩm</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-bold text-[#E53935]">{formatCurrency(order.total)}</span>
                        <div className="flex gap-2">
                          <button className="text-xs border border-[#E0E0E0] px-3 py-1.5 rounded-lg hover:bg-gray-50">Xem chi tiết</button>
                          <button className="text-xs bg-[#E53935] text-white px-3 py-1.5 rounded-lg hover:bg-[#C62828]">Mua lại</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "addresses" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#212121]">Địa chỉ của tôi</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {accountAddresses.map((addr) => (
                  <div key={addr.id} className={`bg-white border-2 rounded-2xl p-5 ${addr.isDefault ? "border-[#1565C0]" : "border-[#E0E0E0]"}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${addr.type === "home" ? "bg-green-100 text-[#2E7D32]" : "bg-blue-100 text-[#1565C0]"}`}>{addr.type === "home" ? "🏠 Nhà" : "🏢 Cơ quan"}</span>
                        {addr.isDefault && <span className="text-xs bg-[#1565C0]/10 text-[#1565C0] px-2 py-0.5 rounded-full font-medium">Mặc định</span>}
                      </div>
                    </div>
                    <p className="font-semibold text-sm text-[#212121]">{addr.name}</p>
                    <p className="text-sm text-[#757575]">{addr.phone}</p>
                    <p className="text-sm text-[#757575] mt-1">{addr.address}</p>
                    <p className="text-sm text-[#757575]">{addr.city}</p>
                    <div className="flex gap-2 mt-4">
                      <button className="flex items-center gap-1 text-xs text-[#1565C0] border border-[#1565C0]/30 px-3 py-1.5 rounded-lg hover:bg-blue-50"><Edit2 size={11} /> Sửa</button>
                      {!addr.isDefault && (
                        <>
                          <button onClick={() => "apiAddressId" in addr && deleteAddress(addr.apiAddressId as string)} className="flex items-center gap-1 text-xs text-[#E53935] border border-[#E53935]/30 px-3 py-1.5 rounded-lg hover:bg-red-50"><Trash2 size={11} /> Xóa</button>
                          <button onClick={() => "apiAddressId" in addr && setDefaultAddress(addr.apiAddressId as string)} className="text-xs text-[#757575] border border-[#E0E0E0] px-3 py-1.5 rounded-lg hover:bg-gray-50">Đặt mặc định</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <button className="border-2 border-dashed border-[#E0E0E0] rounded-2xl p-5 flex flex-col items-center justify-center gap-2 hover:border-[#1565C0] hover:bg-blue-50/20 transition-colors min-h-40">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"><Plus size={20} className="text-[#757575]" /></div>
                  <span className="text-sm text-[#757575]">Thêm địa chỉ mới</span>
                </button>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden">
              <div className="p-5 border-b border-[#E0E0E0]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#212121]">Thông báo</h3>
                  <button className="text-sm text-[#1565C0] hover:underline">Đánh dấu tất cả đã đọc</button>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {NOTIF_FILTERS.map((f) => (
                    <button key={f} onClick={() => setNotifFilter(f)} className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${notifFilter === f ? "bg-[#E53935] text-white" : "text-[#757575] hover:bg-gray-100"}`}>{f}</button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-[#F5F6FA]">
                {NOTIFICATIONS.map((notif) => (
                  <div key={notif.id} className={`flex items-start gap-4 px-5 py-4 hover:bg-[#F5F6FA] transition-colors ${notif.unread ? "bg-blue-50/30" : ""}`}>
                    <span className="text-2xl shrink-0">{notif.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm text-[#212121]">{notif.title}</p>
                        {notif.unread && <div className="w-2 h-2 bg-[#E53935] rounded-full mt-1.5 shrink-0" />}
                      </div>
                      <p className="text-sm text-[#757575] mt-0.5">{notif.message}</p>
                      <p className="text-xs text-[#757575] mt-1.5">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!["overview", "orders", "addresses", "notifications"].includes(activeSection) && (
            <div className="bg-white rounded-2xl border border-[#E0E0E0] p-16 text-center">
              <p className="text-4xl mb-3">🚧</p>
              <p className="font-semibold text-[#212121]">Đang phát triển</p>
              <p className="text-sm text-[#757575] mt-1">Tính năng này sẽ sớm ra mắt!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
