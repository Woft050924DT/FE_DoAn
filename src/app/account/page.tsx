import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard, ShoppingBag, MapPin, Star, Bell, Ticket,
  Lock, LogOut, ChevronRight, Plus, Edit2, Trash2, X
} from "lucide-react";
import { orderService, addressService } from "../../services";
import type { UserAddress } from "../../services/addressService";
import { useApp } from "../../contexts/AppContext";
import { OrderStatusBadge } from "../../components/Order/StatusBadge";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const transformOrder = (apiOrder: any) => ({
  id: apiOrder.order_number,
  customer: {
    name: apiOrder.customer_name,
    email: apiOrder.customer_email,
    avatar: apiOrder.customer_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "NA"
  },
  items: apiOrder.order_items?.length || 0,
  total: Number(apiOrder.total_amount) || 0,
  status: apiOrder.status,
  paymentMethod: apiOrder.payment_method,
  date: new Date(apiOrder.created_at).toLocaleDateString("vi-VN"),
  address: `${apiOrder.shipping_address_line1}, ${apiOrder.shipping_city}`
});


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
  { id: "n2", icon: "🎉", title: "Khuyến mãi đặc biệt", message: "Flash Sale cuối tuần – Giảm đến 50% hàng ngàn sản phẩm!", time: "5 giờ trước", unread: true },
  { id: "n3", icon: "⭐", title: "Đánh giá sản phẩm", message: "Hãy đánh giá sản phẩm bạn đã mua để nhận điểm thưởng!", time: "1 ngày trước", unread: false },
  { id: "n4", icon: "✅", title: "Thanh toán thành công", message: "Đơn hàng #DH2024001 đã được thanh toán thành công.", time: "2 ngày trước", unread: false },
];


const ORDER_TABS = ["Tất cả", "Chờ xác nhận", "Đang xử lý", "Đang giao", "Đã giao", "Đã hủy"];

type AddressFormState = {
  address_type: "home" | "office";
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  ward: string;
  district: string;
  city: string;
  postal_code: string;
  is_default: boolean;
};

const emptyAddressForm = (): AddressFormState => ({
  address_type: "home",
  full_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  ward: "",
  district: "",
  city: "",
  postal_code: "",
  is_default: false,
});

const addressToForm = (a: UserAddress): AddressFormState => ({
  address_type: a.address_type === "office" || a.address_type === "work" ? "office" : "home",
  full_name: a.full_name || "",
  phone: a.phone || "",
  address_line1: a.address_line1 || "",
  address_line2: a.address_line2 || "",
  ward: a.ward || "",
  district: a.district || "",
  city: a.city || "",
  postal_code: a.postal_code || "",
  is_default: Boolean(a.is_default),
});

const formToApiPayload = (f: AddressFormState) => ({
  address_type: f.address_type === "office" ? "office" : "home",
  full_name: f.full_name.trim(),
  phone: f.phone.trim(),
  address_line1: f.address_line1.trim(),
  address_line2: f.address_line2.trim() || undefined,
  ward: f.ward.trim() || undefined,
  district: f.district.trim() || undefined,
  city: f.city.trim(),
  postal_code: f.postal_code.trim() || undefined,
  country: "Vietnam",
  is_default: f.is_default,
});

function addressTypeLabel(type?: string | null) {
  if (type === "office" || type === "work") return { short: "🏢 Cơ quan", className: "bg-blue-100 text-[#1565C0]" };
  return { short: "🏠 Nhà", className: "bg-green-100 text-[#2E7D32]" };
}

export function ScreensAccount() {
  const navigate = useNavigate();
  const { user, logout } = useApp();
  const [activeSection, setActiveSection] = useState("overview");
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddressForm);
  const [addressFormError, setAddressFormError] = useState("");
  const [addressSaving, setAddressSaving] = useState(false);
  const [orderTab, setOrderTab] = useState(0);
  const [notifFilter, setNotifFilter] = useState("all");
  const [orders, setOrders] = useState<any[]>([]);

  const NOTIF_FILTERS = ["Tất cả", "Chưa đọc", "Đơn hàng", "Khuyến mãi", "Hệ thống"];

  const userInitials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "NA";

  const loadAddresses = async () => {
    const list = await addressService.getAddresses();
    setAddresses(list);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData] = await Promise.all([orderService.getOrders({ page: 1, limit: 20 })]);
        setOrders(ordersData.orders.map(transformOrder));
        await loadAddresses();
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const openNewAddress = () => {
    setEditingAddressId(null);
    setAddressForm({ ...emptyAddressForm(), is_default: addresses.length === 0 });
    setAddressFormError("");
    setAddressModalOpen(true);
  };

  const openEditAddress = (a: UserAddress) => {
    setEditingAddressId(a.address_id);
    setAddressForm(addressToForm(a));
    setAddressFormError("");
    setAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setAddressModalOpen(false);
    setEditingAddressId(null);
    setAddressFormError("");
  };

  const handleSaveAddress = async () => {
    const payload = formToApiPayload(addressForm);
    if (!payload.full_name || !payload.phone || !payload.address_line1 || !payload.city) {
      setAddressFormError("Vui lòng điền họ tên, số điện thoại, địa chỉ và tỉnh/thành phố.");
      return;
    }
    setAddressSaving(true);
    setAddressFormError("");
    try {
      if (editingAddressId) {
        await addressService.updateAddress(editingAddressId, payload);
      } else {
        await addressService.createAddress(payload);
      }
      await loadAddresses();
      closeAddressModal();
    } catch (err: any) {
      setAddressFormError(err.response?.data?.error || "Không thể lưu địa chỉ.");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (a: UserAddress) => {
    if (!window.confirm(`Xóa địa chỉ của ${a.full_name}?`)) return;
    try {
      await addressService.deleteAddress(a.address_id);
      await loadAddresses();
    } catch (err: any) {
      alert(err.response?.data?.error || "Không thể xóa địa chỉ.");
    }
  };

  const handleSetDefaultAddress = async (a: UserAddress) => {
    if (a.is_default) return;
    try {
      await addressService.updateAddress(a.address_id, { is_default: true });
      await loadAddresses();
    } catch (err: any) {
      alert(err.response?.data?.error || "Không thể đặt mặc định.");
    }
  };

  const updateAddressForm = (patch: Partial<AddressFormState>) => {
    setAddressForm((prev) => ({ ...prev, ...patch }));
  };

  const recentOrders = orders.slice(0, 5);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "processing").length;
  const totalSpent = orders
  .filter((o) =>
    ["delivered", "completed"].includes(o.status)
  )
  .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden">
            {/* User info */}
            <div className="p-5 text-center border-b border-[#E0E0E0]">
              <div className="w-16 h-16 bg-[#1565C0] rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                {userInitials}
              </div>
              <p className="font-semibold text-[#212121]">{user?.full_name}</p>
              <p className="text-xs text-[#757575] mt-0.5">{user?.email}</p>
            </div>

            {/* Nav */}
            <nav className="py-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "logout") {
                      logout();
                      navigate("/login", { replace: true });
                      return;
                    }
                    setActiveSection(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    activeSection === item.id
                      ? "bg-[#E53935]/5 text-[#E53935] font-medium border-r-2 border-[#E53935]"
                      : item.id === "logout"
                      ? "text-[#E53935] hover:bg-red-50"
                      : "text-[#212121] hover:bg-gray-50"
                  }`}
                >
                  <item.icon size={16} className="shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="w-5 h-5 bg-[#E53935] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Overview */}
          {activeSection === "overview" && (
            <div className="space-y-5">
              {/* Welcome */}
              <div className="bg-gradient-to-r from-[#1565C0] to-[#1976D2] rounded-2xl p-6 text-white">
                <h2 className="text-xl font-bold mb-1">Xin chào, {user?.full_name?.split(" ").pop()}! 👋</h2>
                <p className="text-white/70 text-sm">Khách hàng VietWatch</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Tổng đơn", value: totalOrders, icon: "📦", color: "text-[#1565C0]" },
                  { label: "Chờ xử lý", value: pendingOrders, icon: "⏳", color: "text-amber-600" },
                  { label: "Đã chi tiêu", value: formatCurrency(totalSpent).replace("₫", "đ"), icon: "💰", color: "text-[#E53935]", small: true },
                  { label: "Đánh giá", value: "—", icon: "⭐", color: "text-[#2E7D32]" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl border border-[#E0E0E0] p-4 text-center">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <p className={`font-bold ${stat.small ? "text-sm" : "text-xl"} ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-[#757575] mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              <div className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0E0E0]">
                  <h3 className="font-semibold text-[#212121]">Đơn hàng gần đây</h3>
                  <button onClick={() => setActiveSection("orders")} className="text-sm text-[#1565C0] hover:underline flex items-center gap-1">
                    Xem tất cả <ChevronRight size={13} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F5F6FA]">
                      <tr>
                        {["Mã đơn", "Ngày", "Sản phẩm", "Tổng tiền", "Trạng thái", ""].map((h) => (
                          <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-[#757575]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F6FA]">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#F5F6FA]">
                          <td className="px-4 py-3 font-medium text-[#1565C0]">{order.id}</td>
                          <td className="px-4 py-3 text-[#757575]">{order.date}</td>
                          <td className="px-4 py-3 text-[#757575]">{order.items} sản phẩm</td>
                          <td className="px-4 py-3 font-medium">{formatCurrency(order.total)}</td>
                          <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                          <td className="px-4 py-3">
                            <button className="text-xs text-[#1565C0] hover:underline">Xem</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Notifications */}
              <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5">
                <h3 className="font-semibold text-[#212121] mb-4">Thông báo gần đây</h3>
                <div className="space-y-3">
                  {NOTIFICATIONS.slice(0, 3).map((notif) => (
                    <div key={notif.id} className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${notif.unread ? "bg-blue-50/50" : ""}`}>
                      <span className="text-xl shrink-0">{notif.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm text-[#212121]">{notif.title}</p>
                          {notif.unread && <div className="w-2 h-2 bg-[#E53935] rounded-full mt-1 shrink-0" />}
                        </div>
                        <p className="text-xs text-[#757575] mt-0.5 line-clamp-1">{notif.message}</p>
                        <p className="text-xs text-[#757575] mt-1">{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Orders */}
          {activeSection === "orders" && (
            <div className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden">
              <div className="p-5 border-b border-[#E0E0E0]">
                <h3 className="font-bold text-[#212121] mb-4">Đơn hàng của tôi</h3>
                <div className="flex gap-1 overflow-x-auto">
                  {ORDER_TABS.map((tab, i) => (
                    <button
                      key={tab}
                      onClick={() => setOrderTab(i)}
                      className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                        orderTab === i ? "bg-[#E53935] text-white" : "text-[#757575] hover:bg-gray-100"
                      }`}
                    >
                      {tab}
                    </button>
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
                          {order.status === "delivered" && (
                            <button className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100">Đánh giá</button>
                          )}
                          {order.status === "pending" && (
                            <button className="text-xs bg-red-50 text-[#E53935] border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100">Hủy đơn</button>
                          )}
                          <button className="text-xs bg-[#E53935] text-white px-3 py-1.5 rounded-lg hover:bg-[#C62828]">Mua lại</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Addresses */}
          {activeSection === "addresses" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#212121]">Địa chỉ của tôi</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const typeCfg = addressTypeLabel(addr.address_type);
                  const line = [addr.address_line1, addr.ward, addr.district].filter(Boolean).join(", ");
                  return (
                    <div
                      key={addr.address_id}
                      className={`bg-white border-2 rounded-2xl p-5 ${addr.is_default ? "border-[#1565C0]" : "border-[#E0E0E0]"}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeCfg.className}`}>
                            {typeCfg.short}
                          </span>
                          {addr.is_default && (
                            <span className="text-xs bg-[#1565C0]/10 text-[#1565C0] px-2 py-0.5 rounded-full font-medium">
                              Mặc định
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="font-semibold text-sm text-[#212121]">{addr.full_name}</p>
                      <p className="text-sm text-[#757575]">{addr.phone}</p>
                      <p className="text-sm text-[#757575] mt-1">{line}</p>
                      {addr.address_line2 ? <p className="text-sm text-[#757575]">{addr.address_line2}</p> : null}
                      <p className="text-sm text-[#757575]">{addr.city}</p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        <button
                          type="button"
                          onClick={() => openEditAddress(addr)}
                          className="flex items-center gap-1 text-xs text-[#1565C0] border border-[#1565C0]/30 px-3 py-1.5 rounded-lg hover:bg-blue-50"
                        >
                          <Edit2 size={11} /> Sửa
                        </button>
                        {!addr.is_default && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr)}
                              className="flex items-center gap-1 text-xs text-[#E53935] border border-[#E53935]/30 px-3 py-1.5 rounded-lg hover:bg-red-50"
                            >
                              <Trash2 size={11} /> Xóa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr)}
                              className="text-xs text-[#757575] border border-[#E0E0E0] px-3 py-1.5 rounded-lg hover:bg-gray-50"
                            >
                              Đặt mặc định
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={openNewAddress}
                  className="border-2 border-dashed border-[#E0E0E0] rounded-2xl p-5 flex flex-col items-center justify-center gap-2 hover:border-[#1565C0] hover:bg-blue-50/20 transition-colors min-h-40"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Plus size={20} className="text-[#757575]" />
                  </div>
                  <span className="text-sm text-[#757575]">Thêm địa chỉ mới</span>
                </button>
              </div>

              {/* Modal thêm / sửa địa chỉ */}
              {addressModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                  <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0E0E0]">
                      <h4 className="font-semibold text-[#212121]">
                        {editingAddressId ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
                      </h4>
                      <button
                        type="button"
                        onClick={closeAddressModal}
                        className="p-1 rounded-lg hover:bg-gray-100 text-[#757575]"
                        aria-label="Đóng"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="p-5 space-y-3">
                      {addressFormError ? (
                        <p className="text-sm text-[#E53935] bg-red-50 px-3 py-2 rounded-lg">{addressFormError}</p>
                      ) : null}
                      <div>
                        <label className="text-xs font-medium text-[#757575] block mb-1">Loại</label>
                        <select
                          value={addressForm.address_type}
                          onChange={(e) =>
                            updateAddressForm({ address_type: e.target.value as "home" | "office" })
                          }
                          className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="home">Nhà</option>
                          <option value="office">Cơ quan</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-[#757575] block mb-1">Họ và tên *</label>
                          <input
                            value={addressForm.full_name}
                            onChange={(e) => updateAddressForm({ full_name: e.target.value })}
                            className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm"
                            placeholder="Nguyễn Văn A"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[#757575] block mb-1">Số điện thoại *</label>
                          <input
                            value={addressForm.phone}
                            onChange={(e) => updateAddressForm({ phone: e.target.value })}
                            className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm"
                            placeholder="0901234567"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#757575] block mb-1">Địa chỉ (số nhà, đường) *</label>
                        <input
                          value={addressForm.address_line1}
                          onChange={(e) => updateAddressForm({ address_line1: e.target.value })}
                          className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm"
                          placeholder="123 Đường ABC"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#757575] block mb-1">Địa chỉ dòng 2</label>
                        <input
                          value={addressForm.address_line2}
                          onChange={(e) => updateAddressForm({ address_line2: e.target.value })}
                          className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm"
                          placeholder="Tòa nhà, căn hộ (tuỳ chọn)"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-medium text-[#757575] block mb-1">Phường/Xã</label>
                          <input
                            value={addressForm.ward}
                            onChange={(e) => updateAddressForm({ ward: e.target.value })}
                            className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[#757575] block mb-1">Quận/Huyện</label>
                          <input
                            value={addressForm.district}
                            onChange={(e) => updateAddressForm({ district: e.target.value })}
                            className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[#757575] block mb-1">Tỉnh/TP *</label>
                          <input
                            value={addressForm.city}
                            onChange={(e) => updateAddressForm({ city: e.target.value })}
                            className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm"
                            placeholder="Hà Nội"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#757575] block mb-1">Mã bưu điện</label>
                        <input
                          value={addressForm.postal_code}
                          onChange={(e) => updateAddressForm({ postal_code: e.target.value })}
                          className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm max-w-xs"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-[#212121] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addressForm.is_default}
                          onChange={(e) => updateAddressForm({ is_default: e.target.checked })}
                          className="rounded border-[#E0E0E0] accent-[#1565C0]"
                        />
                        Đặt làm địa chỉ mặc định
                      </label>
                    </div>
                    <div className="flex gap-2 justify-end px-5 py-4 border-t border-[#E0E0E0] bg-[#F5F6FA]/50 rounded-b-2xl">
                      <button
                        type="button"
                        onClick={closeAddressModal}
                        disabled={addressSaving}
                        className="px-4 py-2 text-sm border border-[#E0E0E0] rounded-lg hover:bg-white disabled:opacity-50"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAddress}
                        disabled={addressSaving}
                        className="px-4 py-2 text-sm bg-[#1565C0] text-white rounded-lg hover:bg-[#0D47A1] disabled:opacity-50"
                      >
                        {addressSaving ? "Đang lưu..." : "Lưu địa chỉ"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <div className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden">
              <div className="p-5 border-b border-[#E0E0E0]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#212121]">Thông báo</h3>
                  <button className="text-sm text-[#1565C0] hover:underline">Đánh dấu tất cả đã đọc</button>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {NOTIF_FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setNotifFilter(f)}
                      className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                        notifFilter === f ? "bg-[#E53935] text-white" : "text-[#757575] hover:bg-gray-100"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-[#F5F6FA]">
                {NOTIFICATIONS.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-4 px-5 py-4 hover:bg-[#F5F6FA] transition-colors ${notif.unread ? "bg-blue-50/30" : ""}`}
                  >
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

          {/* Other sections placeholder */}
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
