import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Check, MapPin, Truck, CreditCard, CheckCircle, ChevronRight } from "lucide-react";
import { cartService, orderService, addressService } from "../../services";
import { useApp } from "../../contexts/AppContext";
import { mapCartItemUi, toNumber } from "../../utils/apiMappers";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { id: 1, label: "Địa chỉ", icon: MapPin },
  { id: 2, label: "Vận chuyển", icon: Truck },
  { id: 3, label: "Thanh toán", icon: CreditCard },
  { id: 4, label: "Xác nhận", icon: CheckCircle },
];


const SHIPPING_OPTIONS = [
  { id: "standard", label: "Tiêu chuẩn", courier: "GHN", eta: "3-5 ngày", price: 30000, date: "19-21/01/2024" },
  { id: "express", label: "Nhanh", courier: "GHTK", eta: "1-2 ngày", price: 60000, date: "17-18/01/2024" },
  { id: "same_day", label: "Hỏa tốc", courier: "Grab Express", eta: "Hôm nay", price: 120000, date: "16/01/2024" },
];

const PAYMENT_OPTIONS = [
  { id: "cod", label: "Thanh toán khi nhận hàng (COD)", note: "Thanh toán khi nhận hàng", icon: "💵" },
  { id: "bank", label: "Chuyển khoản ngân hàng", note: "Chuyển khoản qua tài khoản ngân hàng", icon: "🏦" },
  { id: "momo", label: "Ví MoMo", note: "Thanh toán qua ví MoMo", icon: "📱" },
  { id: "vnpay", label: "VNPay QR", note: "Quét mã QR bằng app ngân hàng", icon: "📲" },
  { id: "paypal", label: "PayPal", note: "Thanh toán quốc tế qua PayPal", icon: "🌐" },
];

const ORDER_ITEMS: any[] = [];

export function ScreensCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshCart } = useApp();
  const couponFromCart = (location.state as { couponCode?: string })?.couponCode || "";
  const [step, setStep] = useState<Step>(1);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [placing, setPlacing] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState("express");
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cart, addrList] = await Promise.all([
          cartService.getCart(),
          addressService.getAddresses(),
        ]);
        setCartItems((cart.cart_items || []).map(mapCartItemUi));
        const mapped = addrList.map((a) => ({
          id: a.address_id,
          name: a.full_name,
          phone: a.phone,
          address: [a.address_line1, a.ward, a.district, a.city].filter(Boolean).join(", "),
          isDefault: a.is_default,
          type: a.address_type || "home",
          raw: a,
        }));
        setAddresses(mapped);
        const defaultAddr = mapped.find((a) => a.isDefault) || mapped[0];
        if (defaultAddr) setSelectedAddress(defaultAddr.id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const shipping = SHIPPING_OPTIONS.find((s) => s.id === selectedShipping);
  const subtotal = cartItems.reduce((s: number, i: any) => s + toNumber(i.price) * i.quantity, 0);
  const total = subtotal + (shipping?.price || 0);

  const placeOrder = async () => {
    const addr = addresses.find((a) => a.id === selectedAddress)?.raw;
    if (!addr) {
      alert("Vui lòng chọn địa chỉ giao hàng");
      return;
    }
    setPlacing(true);
    try {
      const order = await orderService.placeOrder({
        customer_name: addr.full_name || user?.full_name || "",
        customer_email: user?.email || "",
        customer_phone: addr.phone || user?.phone,
        shipping_address_line1: addr.address_line1,
        shipping_address_line2: addr.address_line2,
        shipping_city: addr.city,
        shipping_district: addr.district,
        shipping_ward: addr.ward,
        shipping_postal_code: addr.postal_code,
        payment_method: selectedPayment,
        shipping_method: selectedShipping,
        coupon_code: couponFromCart || undefined,
      });
      setOrderNumber(order.order_number);
      await refreshCart();
      setStep(4);
    } catch (err: any) {
      alert(err.response?.data?.error || "Đặt hàng thất bại");
    } finally {
      setPlacing(false);
    }
  };

  const StepProgress = () => (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                step > s.id
                  ? "bg-[#2E7D32] text-white"
                  : step === s.id
                  ? "bg-[#1565C0] text-white ring-4 ring-[#1565C0]/20"
                  : "bg-gray-100 text-[#757575]"
              }`}
            >
              {step > s.id ? <Check size={16} /> : s.id}
            </div>
            <span
              className={`text-xs mt-1 ${
                step === s.id ? "text-[#1565C0] font-semibold" : step > s.id ? "text-[#2E7D32]" : "text-[#757575]"
              }`}
            >
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
      {cartItems.map((item: any) => (
        <div key={item.cart_item_id || item.id} className="flex gap-3 mb-3">
          <div className="relative">
            <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#757575] rounded-full text-white text-[10px] flex items-center justify-center font-bold">
              {item.quantity}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#212121] line-clamp-2">{item.name}</p>
            <p className="text-sm font-semibold text-[#E53935] mt-0.5">{formatCurrency(toNumber(item.price) * item.quantity)}</p>
          </div>
        </div>
      ))}
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
      <StepProgress />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Step 1 - Address */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6">
              <h2 className="font-bold text-[#212121] mb-5">Chọn địa chỉ giao hàng</h2>

              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-4 border-2 rounded-xl mb-3 cursor-pointer transition-all ${
                    selectedAddress === addr.id ? "border-[#1565C0] bg-blue-50/30" : "border-[#E0E0E0] hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={selectedAddress === addr.id}
                    onChange={() => setSelectedAddress(addr.id)}
                    className="mt-0.5 accent-[#1565C0]"
                  />
                  <div className="flex-1">
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
                </label>
              ))}

              {!showAddressForm ? (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="w-full border-2 border-dashed border-[#E0E0E0] rounded-xl py-3 text-sm text-[#757575] hover:border-[#1565C0] hover:text-[#1565C0] transition-colors"
                >
                  + Thêm địa chỉ mới
                </button>
              ) : (
                <div className="border border-[#E0E0E0] rounded-xl p-4 mt-3">
                  <h3 className="font-semibold text-sm text-[#212121] mb-3">Địa chỉ mới</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: "Họ và tên", placeholder: "Nguyễn Văn A" },
                      { label: "Điện thoại", placeholder: "0901234567" },
                    ].map((field) => (
                      <div key={field.label}>
                        <label className="text-xs font-medium text-[#757575] mb-1 block">{field.label}</label>
                        <input
                          placeholder={field.placeholder}
                          className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1565C0]"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-[#757575] mb-1 block">Địa chỉ</label>
                      <input
                        placeholder="Số nhà, tên đường..."
                        className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1565C0]"
                      />
                    </div>
                    {[
                      { label: "Tỉnh/Thành phố", placeholder: "TP. Hồ Chí Minh" },
                      { label: "Quận/Huyện", placeholder: "Quận 1" },
                      { label: "Phường/Xã", placeholder: "Phường Bến Nghé" },
                    ].map((field) => (
                      <div key={field.label}>
                        <label className="text-xs font-medium text-[#757575] mb-1 block">{field.label}</label>
                        <input
                          placeholder={field.placeholder}
                          className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1565C0]"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="addr_type" value="home" defaultChecked className="accent-[#1565C0]" />
                      <span className="text-sm">🏠 Nhà riêng</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="addr_type" value="office" className="accent-[#1565C0]" />
                      <span className="text-sm">🏢 Cơ quan</span>
                    </label>
                  </div>
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input type="checkbox" className="accent-[#1565C0]" />
                    <span className="text-sm text-[#757575]">Đặt làm địa chỉ mặc định</span>
                  </label>
                  <button
                    onClick={() => setShowAddressForm(false)}
                    className="mt-3 text-sm text-[#757575] hover:text-[#E53935]"
                  >
                    Hủy
                  </button>
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                className="w-full mt-6 bg-[#E53935] text-white py-3 rounded-xl font-semibold hover:bg-[#C62828] transition-colors"
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
                  <label
                    key={opt.id}
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedShipping === opt.id ? "border-[#1565C0] bg-blue-50/30" : "border-[#E0E0E0] hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={opt.id}
                      checked={selectedShipping === opt.id}
                      onChange={() => setSelectedShipping(opt.id)}
                      className="accent-[#1565C0]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-[#212121]">{opt.label}</span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-[#757575]">{opt.courier}</span>
                      </div>
                      <p className="text-xs text-[#757575] mt-0.5">
                        Nhận hàng: <span className="text-[#2E7D32] font-medium">{opt.date}</span> · {opt.eta}
                      </p>
                    </div>
                    <span className={`font-semibold text-sm ${opt.id === "standard" ? "text-[#2E7D32]" : "text-[#212121]"}`}>
                      {formatCurrency(opt.price)}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 border border-[#E0E0E0] text-[#212121] py-3 rounded-xl font-medium hover:bg-gray-50">
                  Quay lại
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedAddress}
                  className="flex-1 bg-[#E53935] text-white py-3 rounded-xl font-semibold hover:bg-[#C62828] transition-colors disabled:opacity-40"
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {/* Step 3 - Payment */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6">
              <h2 className="font-bold text-[#212121] mb-5">Phương thức thanh toán</h2>
              <div className="space-y-3">
                {PAYMENT_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedPayment === opt.id ? "border-[#1565C0] bg-blue-50/30" : "border-[#E0E0E0] hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.id}
                      checked={selectedPayment === opt.id}
                      onChange={() => setSelectedPayment(opt.id)}
                      className="accent-[#1565C0]"
                    />
                    <span className="text-xl">{opt.icon}</span>
                    <div>
                      <p className="font-medium text-sm text-[#212121]">{opt.label}</p>
                      {selectedPayment === opt.id && (
                        <p className="text-xs text-[#757575] mt-0.5">{opt.note}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="flex-1 border border-[#E0E0E0] text-[#212121] py-3 rounded-xl font-medium hover:bg-gray-50">
                  Quay lại
                </button>
                <button
                  onClick={placeOrder}
                  disabled={placing}
                  className="flex-1 bg-[#E53935] text-white py-3 rounded-xl font-semibold hover:bg-[#C62828] transition-colors disabled:opacity-50"
                >
                  {placing ? "Đang xử lý..." : "Đặt hàng"}
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
              <h2 className="text-2xl font-bold text-[#212121] mb-2">Đặt hàng thành công!</h2>
              <p className="text-[#757575] mb-1">Cảm ơn bạn đã mua sắm tại VietWatch</p>
              <p className="font-bold text-[#212121] text-lg mb-6">{orderNumber}</p>

              <div className="bg-[#F5F6FA] rounded-xl p-4 text-left mb-6">
                <p className="text-sm font-semibold text-[#212121] mb-3">Chi tiết đơn hàng</p>
                {cartItems.map((item: any) => (
                  <div key={item.cart_item_id || item.id} className="flex justify-between text-sm py-1.5">
                    <span className="text-[#757575]">{(item.name || item.product?.name || "").slice(0, 30)}... ×{item.quantity}</span>
                    <span className="font-medium">{formatCurrency((item.price || item.product?.price || 0) * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-[#E0E0E0] pt-2 mt-2 flex justify-between">
                  <span className="font-bold text-sm">Tổng cộng</span>
                  <span className="font-bold text-[#E53935]">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 border-2 border-[#1565C0] text-[#1565C0] py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                  Theo dõi đơn hàng
                </button>
                <button
                  onClick={() => navigate("/")}
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
