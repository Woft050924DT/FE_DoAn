'use client'

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, MapPin, Truck, CreditCard, CheckCircle, ChevronRight, Zap, ShoppingCart, Trash2, Loader2 } from "lucide-react";
import { cartService, orderService, profileService } from "@/services";
import { Address, AddressRequest } from "@/services/types";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

type Step = 1 | 2 | 3 | 4;
type CheckoutAddress = {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
  type: string;
};

const STEPS = [
  { id: 1, label: "Địa chỉ", icon: MapPin },
  { id: 2, label: "Vận chuyển", icon: Truck },
  { id: 3, label: "Thanh toán", icon: CreditCard },
  { id: 4, label: "Xác nhận", icon: CheckCircle },
];

const toCheckoutAddress = (addr: Address) => ({
  id: addr.address_id,
  name: addr.full_name,
  phone: addr.phone,
  address: [addr.address_line1, addr.address_line2, addr.ward, addr.district, addr.city].filter(Boolean).join(", "),
  isDefault: addr.is_default,
  type: addr.address_type,
  raw: addr,
});

const SHIPPING_OPTIONS = [
  { id: "standard", label: "Tiêu chuẩn", courier: "GHN", eta: "3-5 ngày", price: 30000, date: "19-21/01/2024" },
  { id: "express", label: "Nhanh", courier: "GHTK", eta: "1-2 ngày", price: 60000, date: "17-18/01/2024" },
  { id: "same_day", label: "Hỏa tốc", courier: "Grab Express", eta: "Hôm nay", price: 120000, date: "Hôm nay" },
];

const PAYMENT_OPTIONS = [
  { id: "cod", label: "Thanh toán khi nhận hàng (COD)", note: "Thanh toán bằng tiền mặt khi nhận hàng", icon: "💵" },
  { id: "bank", label: "Chuyển khoản ngân hàng", note: "Chuyển khoản qua tài khoản ngân hàng", icon: "🏦" },
  { id: "momo", label: "Ví MoMo", note: "Thanh toán qua ví MoMo", icon: "📱" },
  { id: "vnpay", label: "VNPay QR", note: "Quét mã QR bằng app ngân hàng", icon: "📲" },
  { id: "paypal", label: "PayPal", note: "Thanh toán quốc tế qua PayPal", icon: "🌐" },
];

const normalizeCartItem = (item: any) => {
  const product = item.products || item.product || item;
  const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.image_url;
  return {
    ...item,
    name: product.name || item.name || "",
    image: product.image || primaryImage || product.product_images?.[0]?.image_url || null,
    price: item.price || product.price || 0,
    product: { ...product, image: product.image || primaryImage || product.product_images?.[0]?.image_url || null },
  };
};

const splitAddress = (address: string) => {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  return { line1: parts[0] || address, ward: parts[1] || "", district: parts[2] || "", city: parts[3] || parts[parts.length - 1] || "" };
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("mode") === "buynow";
  const [step, setStep] = useState<Step>(1);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedShipping, setSelectedShipping] = useState("express");
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<ReturnType<typeof toCheckoutAddress>[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [newAddress, setNewAddress] = useState({ name: "", phone: "", address: "", city: "", district: "", ward: "", cityId: "", districtId: "", wardId: "", type: "home", isDefault: false });
  const [savingAddress, setSavingAddress] = useState(false);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [placedOrderNumber, setPlacedOrderNumber] = useState("");

  useEffect(() => {
    if (isBuyNow) {
      // Mode mua ngay: đọc từ sessionStorage
      try {
        const raw = sessionStorage.getItem("buynow_item");
        if (raw) {
          const item = JSON.parse(raw);
          setCartItems([item]);
        }
      } catch {
        console.error("Cannot read buynow item");
      }
    } else {
      // Mode giỏ hàng: đọc từ API
      cartService.getCart()
        .then((cart) => setCartItems((cart.cart_items || []).map(normalizeCartItem)))
        .catch(console.error);
    }
  }, [isBuyNow]);

  // Fetch địa chỉ từ API
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setAddressesLoading(true);
        const profile = await profileService.getProfile().catch(() => null);
        if (profile) {
          setNewAddress(p => ({ ...p, name: p.name || profile.full_name || "", phone: p.phone || profile.phone || "" }));
        }
        const data = await profileService.getAddresses();
        const mapped = data.map(toCheckoutAddress);
        setAddresses(mapped);
        // Tự chọn địa chỉ mặc định
        const def = mapped.find((a) => a.isDefault) || mapped[0];
        if (def) setSelectedAddress(def.id);
      } catch (err) {
        console.error("Failed to load addresses:", err);
        // Nếu chưa đăng nhập hoặc lỗi → hiển thị form thêm địa chỉ
        setAddresses([]);
        setShowAddressForm(true);
      } finally {
        setAddressesLoading(false);
      }
    };
    loadAddresses();

    fetch("https://esgoo.net/api-tinhthanh/1/0.htm")
      .then(res => res.json())
      .then(data => {
        if (data.error === 0) setProvinces(data.data);
      })
      .catch(console.error);
  }, []);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    const pName = e.target.options[e.target.selectedIndex].text;
    setNewAddress(prev => ({ ...prev, cityId: pId, city: pId ? pName : "", districtId: "", district: "", wardId: "", ward: "" }));
    setDistricts([]);
    setWards([]);
    if (pId) {
      fetch(`https://esgoo.net/api-tinhthanh/2/${pId}.htm`)
        .then(res => res.json())
        .then(data => {
          if (data.error === 0) setDistricts(data.data);
        }).catch(console.error);
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dId = e.target.value;
    const dName = e.target.options[e.target.selectedIndex].text;
    setNewAddress(prev => ({ ...prev, districtId: dId, district: dId ? dName : "", wardId: "", ward: "" }));
    setWards([]);
    if (dId) {
      fetch(`https://esgoo.net/api-tinhthanh/3/${dId}.htm`)
        .then(res => res.json())
        .then(data => {
          if (data.error === 0) setWards(data.data);
        }).catch(console.error);
    }
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wId = e.target.value;
    const wName = e.target.options[e.target.selectedIndex].text;
    setNewAddress(prev => ({ ...prev, wardId: wId, ward: wId ? wName : "" }));
  };

  const shipping = SHIPPING_OPTIONS.find((s) => s.id === selectedShipping);
  const selectedAddressData = addresses.find((a) => a.id === selectedAddress);
  const subtotal = cartItems.reduce((s: number, i: any) => s + (i.price || 0) * i.quantity, 0);
  const total = subtotal + (shipping?.price || 0);
  const orderNumber = placedOrderNumber || "#DH2024" + Math.floor(Math.random() * 9000 + 1000);

  // Tạo địa chỉ mới qua API
  const addNewAddress = async () => {
    if (!newAddress.name.trim() || !newAddress.phone.trim() || !newAddress.address.trim() || !newAddress.cityId || !newAddress.districtId || !newAddress.wardId) {
      setOrderError("Vui lòng nhập đầy đủ thông tin địa chỉ");
      return;
    }
    try {
      setSavingAddress(true);
      setOrderError("");
      const payload: AddressRequest = {
        full_name: newAddress.name.trim(),
        phone: newAddress.phone.trim(),
        address_line1: newAddress.address.trim(),
        city: newAddress.city.trim(),
        district: newAddress.district.trim(),
        ward: newAddress.ward.trim(),
        address_type: newAddress.type,
        is_default: newAddress.isDefault,
        country: "Vietnam",
      };
      const created = await profileService.createAddress(payload);
      const mapped = toCheckoutAddress(created);
      setAddresses((prev) => [...prev, mapped]);
      setSelectedAddress(mapped.id);
      setShowAddressForm(false);
      
      const profile = await profileService.getProfile().catch(() => null);
      setNewAddress({ name: profile?.full_name || "", phone: profile?.phone || "", address: "", city: "", district: "", ward: "", cityId: "", districtId: "", wardId: "", type: "home", isDefault: false });
    } catch (err) {
      console.error(err);
      setOrderError("Không thể lưu địa chỉ. Vui lòng thử lại.");
    } finally {
      setSavingAddress(false);
    }
  };

  // Xóa địa chỉ
  const deleteAddress = async (id: string) => {
    try {
      setDeletingId(id);
      await profileService.deleteAddress(id);
      const remaining = addresses.filter((a) => a.id !== id);
      setAddresses(remaining);
      if (selectedAddress === id) {
        setSelectedAddress(remaining[0]?.id || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const placeOrder = async () => {
    if (!selectedAddressData) { setOrderError("Vui lòng chọn địa chỉ giao hàng"); setStep(1); return; }
    if (cartItems.length === 0) { setOrderError("Giỏ hàng đang trống"); return; }
    const parsed = splitAddress(selectedAddressData.address);
    try {
      setPlacingOrder(true);
      setOrderError("");
      const order = await orderService.placeOrder({
        customer_name: selectedAddressData.name,
        customer_email: "customer@example.com",
        customer_phone: selectedAddressData.phone,
        shipping_address_line1: parsed.line1,
        shipping_city: parsed.city,
        shipping_district: parsed.district,
        shipping_ward: parsed.ward,
        shipping_country: "Vietnam",
        payment_method: selectedPayment,
        shipping_method: selectedShipping,
      });
      setPlacedOrderNumber(order.order_number ? `#${order.order_number}` : orderNumber);
      // Xóa bú item mùa ngay khỏi session sau khi đặt hàng thành công
      if (isBuyNow) sessionStorage.removeItem("buynow_item");
      setStep(4);
    } catch (err) {
      console.error(err);
      setOrderError("Không thể đặt hàng. Vui lòng thử lại.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const StepProgress = () => (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
              step > s.id ? "bg-[#2E7D32] text-white" : step === s.id ? "bg-[#1565C0] text-white ring-4 ring-[#1565C0]/20" : "bg-gray-100 text-[#757575]"
            }`}>
              {step > s.id ? <Check size={16} /> : s.id}
            </div>
            <span className={`text-xs mt-1 ${step === s.id ? "text-[#1565C0] font-semibold" : step > s.id ? "text-[#2E7D32]" : "text-[#757575]"}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 ${step > s.id ? "bg-[#2E7D32]" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );

  const OrderSummary = () => (
    <div className="bg-white rounded-xl border border-[#E0E0E0] p-5 sticky top-24">
      <h3 className="font-bold text-[#212121] mb-4 text-sm">Đơn hàng của bạn</h3>
      <div className="space-y-3 mb-4">
        {cartItems.map((item: any) => (
          <div key={item.cart_item_id || item.id} className="flex gap-3">
            <div className="relative shrink-0">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
              ) : (
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">No img</div>
              )}
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#757575] rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#212121] line-clamp-2">{item.name}</p>
              {/* Hiển thị màu/size nếu có (mua ngay) */}
              {(item.color || item.size) && (
                <p className="text-[10px] text-[#757575] mt-0.5">
                  {item.color && `Màu: ${item.color}`}{item.color && item.size ? " · " : ""}{item.size && `Size: ${item.size}`}
                </p>
              )}
              <p className="text-sm font-semibold text-[#E53935] mt-0.5">{formatCurrency((item.price || 0) * item.quantity)}</p>
            </div>
          </div>
        ))}
        {cartItems.length === 0 && (
          <p className="text-xs text-[#757575] text-center py-4">Giỏ hàng trống</p>
        )}
      </div>
      <div className="border-t border-[#E0E0E0] pt-3 space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-[#757575]">Tạm tính</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#757575]">Vận chuyển</span>
          <span>{shipping ? formatCurrency(shipping.price) : "—"}</span>
        </div>
        <div className="flex justify-between font-bold text-base pt-1 border-t border-[#E0E0E0]">
          <span className="text-[#212121]">Tổng cộng</span>
          <span className="text-[#E53935]">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Mode badge */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
          isBuyNow ? "bg-[#E53935]/10 text-[#E53935]" : "bg-[#1565C0]/10 text-[#1565C0]"
        }`}>
          {isBuyNow ? <Zap size={13} /> : <ShoppingCart size={13} />}
          {isBuyNow ? "Mua ngay" : `Thanh toán giỏ hàng (${cartItems.length} sản phẩm)`}
        </div>
      </div>
      <StepProgress />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Step 1 - Address */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6">
              <h2 className="font-bold text-[#212121] mb-5 flex items-center gap-2">
                <MapPin size={18} className="text-[#1565C0]" /> Chọn địa chỉ giao hàng
              </h2>
              {orderError && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-[#E53935]">{orderError}</p>}

              {/* Loading state */}
              {addressesLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : addresses.length === 0 && !showAddressForm ? (
                /* Empty state — chưa có địa chỉ */
                <div className="text-center py-8 border-2 border-dashed border-[#E0E0E0] rounded-xl mb-3">
                  <p className="text-2xl mb-2">📍</p>
                  <p className="text-sm font-medium text-[#212121] mb-1">Chưa có địa chỉ nào</p>
                  <p className="text-xs text-[#757575] mb-3">Thêm địa chỉ để tiếp tục thanh toán</p>
                  <button onClick={() => setShowAddressForm(true)} className="bg-[#1565C0] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0D47A1]">
                    + Thêm địa chỉ ngay
                  </button>
                </div>
              ) : (
                /* Danh sách địa chỉ từ API */
                addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr.id)}
                    className={`flex items-start gap-3 p-4 border-2 rounded-xl mb-3 cursor-pointer transition-all relative group ${
                      selectedAddress === addr.id ? "border-[#1565C0] bg-blue-50/30" : "border-[#E0E0E0] hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio" name="address" value={addr.id}
                      checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)}
                      className="mt-0.5 accent-[#1565C0] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-[#212121]">{addr.name}</span>
                        <span className="text-sm text-[#757575]">· {addr.phone}</span>
                        {addr.isDefault && (
                          <span className="text-xs bg-[#1565C0]/10 text-[#1565C0] px-2 py-0.5 rounded-full font-medium">Mặc định</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${addr.type === "home" ? "bg-green-50 text-[#2E7D32]" : "bg-blue-50 text-[#1565C0]"}`}>
                          {addr.type === "home" ? "🏠 Nhà" : "🏢 Cơ quan"}
                        </span>
                      </div>
                      <p className="text-sm text-[#757575] mt-1">{addr.address}</p>
                    </div>
                    {/* Nút xóa */}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteAddress(addr.id); }}
                      disabled={deletingId === addr.id}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-[#E53935] hover:bg-red-50 rounded-lg transition-all shrink-0"
                      title="Xóa địa chỉ"
                    >
                      {deletingId === addr.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                ))
              )}

              {/* Form thêm địa chỉ mới */}
              {!addressesLoading && (
                <>
                  {!showAddressForm ? (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="w-full border-2 border-dashed border-[#E0E0E0] rounded-xl py-3 text-sm text-[#757575] hover:border-[#1565C0] hover:text-[#1565C0] transition-colors"
                    >
                      + Thêm địa chỉ mới
                    </button>
                  ) : (
                    <div className="border-2 border-[#1565C0]/30 rounded-xl p-4 mt-3 bg-blue-50/20">
                      <h3 className="font-semibold text-sm text-[#212121] mb-3 flex items-center gap-2">
                        <MapPin size={14} className="text-[#1565C0]" /> Địa chỉ mới
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-[#757575] mb-1 block">Họ và tên *</label>
                          <input value={newAddress.name} onChange={(e) => setNewAddress((p) => ({ ...p, name: e.target.value }))} placeholder="Nguyễn Văn A" className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm text-[#212121] bg-white focus:outline-none focus:border-[#1565C0]" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[#757575] mb-1 block">Điện thoại *</label>
                          <input value={newAddress.phone} onChange={(e) => setNewAddress((p) => ({ ...p, phone: e.target.value }))} placeholder="0901234567" className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm text-[#212121] bg-white focus:outline-none focus:border-[#1565C0]" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs font-medium text-[#757575] mb-1 block">Địa chỉ (số nhà, tên đường) *</label>
                          <input value={newAddress.address} onChange={(e) => setNewAddress((p) => ({ ...p, address: e.target.value }))} placeholder="123 Nguyễn Huệ..." className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm text-[#212121] bg-white focus:outline-none focus:border-[#1565C0]" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[#757575] mb-1 block">Tỉnh/Thành phố *</label>
                          <select value={newAddress.cityId} onChange={handleProvinceChange} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm text-[#212121] focus:outline-none focus:border-[#1565C0] bg-white">
                            <option value="" className="text-[#212121]">Chọn Tỉnh/Thành phố</option>
                            {provinces.map(p => (
                              <option key={p.id} value={p.id} className="text-[#212121]">{p.full_name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[#757575] mb-1 block">Quận/Huyện *</label>
                          <select value={newAddress.districtId} onChange={handleDistrictChange} disabled={!newAddress.cityId} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm text-[#212121] focus:outline-none focus:border-[#1565C0] bg-white disabled:bg-gray-50 disabled:text-gray-400">
                            <option value="" className="text-[#212121]">Chọn Quận/Huyện</option>
                            {districts.map(d => (
                              <option key={d.id} value={d.id} className="text-[#212121]">{d.full_name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[#757575] mb-1 block">Phường/Xã *</label>
                          <select value={newAddress.wardId} onChange={handleWardChange} disabled={!newAddress.districtId} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm text-[#212121] focus:outline-none focus:border-[#1565C0] bg-white disabled:bg-gray-50 disabled:text-gray-400">
                            <option value="" className="text-[#212121]">Chọn Phường/Xã</option>
                            {wards.map(w => (
                              <option key={w.id} value={w.id} className="text-[#212121]">{w.full_name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 mt-3 flex-wrap">
                        {["home", "office"].map((t) => (
                          <label key={t} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="addr_type" value={t} checked={newAddress.type === t} onChange={() => setNewAddress((p) => ({ ...p, type: t }))} className="accent-[#1565C0]" />
                            <span className="text-sm">{t === "home" ? "🏠 Nhà riêng" : "🏢 Cơ quan"}</span>
                          </label>
                        ))}
                        <label className="flex items-center gap-2 cursor-pointer ml-auto">
                          <input type="checkbox" checked={newAddress.isDefault} onChange={(e) => setNewAddress((p) => ({ ...p, isDefault: e.target.checked }))} className="accent-[#1565C0] w-4 h-4" />
                          <span className="text-sm text-[#757575]">Đặt làm mặc định</span>
                        </label>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={addNewAddress}
                          disabled={savingAddress}
                          className="flex items-center gap-2 rounded-xl bg-[#1565C0] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0D47A1] disabled:opacity-60"
                        >
                          {savingAddress ? <><Loader2 size={14} className="animate-spin" /> Đang lưu...</> : "Lưu địa chỉ"}
                        </button>
                        <button onClick={() => { setShowAddressForm(false); setOrderError(""); }} className="text-sm text-[#757575] hover:text-[#E53935] px-3">
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!selectedAddress && addresses.length > 0}
                className="w-full mt-6 bg-[#E53935] text-white py-3 rounded-xl font-semibold hover:bg-[#C62828] transition-colors disabled:opacity-40"
              >
                Tiếp tục <ChevronRight size={16} className="inline" />
              </button>
            </div>
          )}

          {/* Step 2 - Shipping */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6">
              <h2 className="font-bold text-[#212121] mb-5">Chọn phương thức vận chuyển</h2>
              <div className="space-y-3">
                {SHIPPING_OPTIONS.map((opt) => (
                  <label key={opt.id} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedShipping === opt.id ? "border-[#1565C0] bg-blue-50/30" : "border-[#E0E0E0] hover:border-gray-300"}`}>
                    <input type="radio" name="shipping" value={opt.id} checked={selectedShipping === opt.id} onChange={() => setSelectedShipping(opt.id)} className="accent-[#1565C0]" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#212121]">{opt.label}</span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-[#757575]">{opt.courier}</span>
                      </div>
                      <p className="text-xs text-[#757575] mt-0.5">Nhận hàng: <span className="text-[#2E7D32] font-medium">{opt.date}</span> · {opt.eta}</p>
                    </div>
                    <span className={`font-semibold text-sm ${opt.id === "standard" ? "text-[#2E7D32]" : "text-[#212121]"}`}>{formatCurrency(opt.price)}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 border border-[#E0E0E0] text-[#212121] py-3 rounded-xl font-medium hover:bg-gray-50">Quay lại</button>
                <button onClick={() => setStep(3)} className="flex-1 bg-[#E53935] text-white py-3 rounded-xl font-semibold hover:bg-[#C62828] transition-colors">Tiếp tục</button>
              </div>
            </div>
          )}

          {/* Step 3 - Payment */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6">
              <h2 className="font-bold text-[#212121] mb-5">Phương thức thanh toán</h2>
              {orderError && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-[#E53935]">{orderError}</p>}
              <div className="space-y-3">
                {PAYMENT_OPTIONS.map((opt) => (
                  <label key={opt.id} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPayment === opt.id ? "border-[#1565C0] bg-blue-50/30" : "border-[#E0E0E0] hover:border-gray-300"}`}>
                    <input type="radio" name="payment" value={opt.id} checked={selectedPayment === opt.id} onChange={() => setSelectedPayment(opt.id)} className="accent-[#1565C0]" />
                    <span className="text-xl">{opt.icon}</span>
                    <div>
                      <p className="font-medium text-sm text-[#212121]">{opt.label}</p>
                      {selectedPayment === opt.id && <p className="text-xs text-[#757575] mt-0.5">{opt.note}</p>}
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="flex-1 border border-[#E0E0E0] text-[#212121] py-3 rounded-xl font-medium hover:bg-gray-50">Quay lại</button>
                <button onClick={placeOrder} disabled={placingOrder} className="flex-1 bg-[#E53935] text-white py-3 rounded-xl font-semibold hover:bg-[#C62828] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                  {placingOrder ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang đặt hàng...
                    </span>
                  ) : "Đặt hàng"}
                </button>
              </div>
            </div>
          )}

          {/* Step 4 - Success */}
          {step === 4 && (
            <div className="bg-white rounded-2xl border border-[#E0E0E0] p-10 text-center">
              <div className="w-20 h-20 bg-[#2E7D32]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={40} className="text-[#2E7D32]" />
              </div>
              <h2 className="text-2xl font-bold text-[#212121] mb-2">Đặt hàng thành công! 🎉</h2>
              <p className="text-[#757575] mb-1">Cảm ơn bạn đã mua sắm tại VietShop</p>
              <p className="font-bold text-[#212121] text-lg mb-6">{orderNumber}</p>

              <div className="bg-[#F5F6FA] rounded-xl p-4 text-left mb-6">
                <p className="text-sm font-semibold text-[#212121] mb-3">Chi tiết đơn hàng</p>
                {cartItems.map((item: any) => (
                  <div key={item.cart_item_id || item.id} className="flex justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                    <span className="text-[#757575]">{item.name?.slice(0, 28)}{item.name?.length > 28 ? "..." : ""} ×{item.quantity}</span>
                    <span className="font-medium">{formatCurrency((item.price || 0) * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 mt-1">
                  <span className="font-bold text-sm">Tổng cộng</span>
                  <span className="font-bold text-[#E53935]">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/account")}
                  className="flex-1 border-2 border-[#1565C0] text-[#1565C0] py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                >
                  Theo dõi đơn hàng
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 bg-[#E53935] text-white py-3 rounded-xl font-semibold hover:bg-[#C62828] transition-colors"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        {step < 4 && (
          <div className="w-full lg:w-72 shrink-0">
            <OrderSummary />
          </div>
        )}
      </div>
    </div>
  );
}
