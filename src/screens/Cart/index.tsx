import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Trash2, Tag, ShoppingBag, ArrowLeft, Check } from "lucide-react";
import { cartService } from "../../services";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

interface CartItem {
  id: string;
  product: any;
  quantity: number;
  color: string;
  size: string;
  selected: boolean;
}

export function ScreensCart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const cart = await cartService.getCart();
        const items = (cart.cart_items || []).map((item: any) => ({
          id: item.cart_item_id,
          product: item,
          quantity: item.quantity,
          color: item.variant || "",
          size: item.variant || "",
          selected: true,
        }));
        setCartItems(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const toggleSelect = (id: string) =>
    setCartItems((items) => items.map((item) => item.id === id ? { ...item, selected: !item.selected } : item));

  const toggleSelectAll = () => {
    const allSelected = cartItems.every((i) => i.selected);
    setCartItems((items) => items.map((item) => ({ ...item, selected: !allSelected })));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    setCartItems((items) => items.map((item) => item.id === id ? { ...item, quantity: qty } : item));
  };

  const removeItem = (id: string) => setCartItems((items) => items.filter((i) => i.id !== id));

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === "SALE10") {
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponError("Mã giảm giá không hợp lệ");
      setCouponApplied(false);
    }
  };

  const selectedItems = cartItems.filter((i) => i.selected);
  const subtotal = selectedItems.reduce((s, i) => s + (i.product.price || 0) * i.quantity, 0);
  const shipping = subtotal >= 500000 ? 0 : 30000;
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shipping - discount;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-7xl mb-4">🛒</div>
        <h2 className="text-xl font-semibold text-[#212121] mb-2">Giỏ hàng trống</h2>
        <p className="text-[#757575] mb-6">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
        <button
          onClick={() => navigate("/products")}
          className="bg-[#E53935] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#C62828] transition-colors"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/products")} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={18} className="text-[#212121]" />
        </button>
        <h1 className="text-xl font-bold text-[#212121]">Giỏ hàng ({cartItems.length} sản phẩm)</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left - Items */}
        <div className="flex-1 space-y-3">
          {/* Select all */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] px-4 py-3 flex items-center gap-3">
            <input
              type="checkbox"
              checked={cartItems.every((i) => i.selected)}
              onChange={toggleSelectAll}
              className="w-4 h-4 accent-[#1565C0] cursor-pointer"
            />
            <span className="text-sm font-medium text-[#212121]">Chọn tất cả ({cartItems.length} sản phẩm)</span>
          </div>

          {/* Cart items */}
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-[#E0E0E0] p-4">
              <div className="flex gap-3">
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => toggleSelect(item.id)}
                  className="w-4 h-4 accent-[#1565C0] cursor-pointer mt-1 shrink-0"
                />
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg border border-[#E0E0E0] shrink-0 cursor-pointer"
                  onClick={() => navigate(`/products/${item.product.product_id}`)}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium text-sm text-[#212121] line-clamp-2 cursor-pointer hover:text-[#1565C0]"
                    onClick={() => navigate(`/products/${item.product.product_id}`)}
                  >
                    {item.product.name}
                  </p>
                  <p className="text-xs text-[#757575] mt-0.5">
                    Màu: {item.color} · Size: {item.size}
                  </p>
                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    <div>
                      <span className="text-base font-semibold text-[#E53935]">{formatCurrency(item.product.price)}</span>
                      {item.product.compare_price && (
                        <span className="text-xs text-[#757575] line-through ml-2">{formatCurrency(item.product.compare_price)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-[#E0E0E0] rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 font-bold text-[#212121]"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 font-bold text-[#212121]"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-[#212121]">
                        = {formatCurrency((item.product.price || 0) * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-[#757575] hover:text-[#E53935] hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Coupon */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={16} className="text-[#E53935]" />
              <span className="font-medium text-sm text-[#212121]">Mã giảm giá</span>
            </div>
            {couponApplied ? (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <Check size={14} className="text-[#2E7D32]" />
                <span className="text-sm text-[#2E7D32] font-medium">Áp dụng mã SALE10 — Giảm 10%</span>
                <button
                  onClick={() => { setCouponApplied(false); setCouponCode(""); }}
                  className="ml-auto text-xs text-[#757575] hover:text-[#E53935]"
                >
                  Xóa
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá (thử: SALE10)"
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                  className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1565C0] ${
                    couponError ? "border-[#E53935]" : "border-[#E0E0E0]"
                  }`}
                />
                <button
                  onClick={applyCoupon}
                  className="bg-[#E53935] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#C62828] transition-colors"
                >
                  Áp dụng
                </button>
              </div>
            )}
            {couponError && <p className="text-xs text-[#E53935] mt-1">{couponError}</p>}
          </div>
        </div>

        {/* Right - Order Summary */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-5 sticky top-24">
            <h3 className="font-bold text-[#212121] mb-4">Tóm tắt đơn hàng</h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#757575]">Tạm tính ({selectedItems.length} sp)</span>
                <span className="text-[#212121]">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#757575]">Phí vận chuyển</span>
                <span className={shipping === 0 ? "text-[#2E7D32] font-medium" : "text-[#212121]"}>
                  {shipping === 0 ? "Miễn phí" : formatCurrency(shipping)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#757575]">Giảm giá (SALE10)</span>
                  <span className="text-[#2E7D32] font-medium">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="border-t border-[#E0E0E0] pt-2.5 flex justify-between">
                <span className="font-bold text-[#212121]">Tổng cộng</span>
                <span className="text-xl font-bold text-[#E53935]">{formatCurrency(total)}</span>
              </div>
            </div>

            {subtotal < 500000 && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-3">
                Mua thêm {formatCurrency(500000 - subtotal)} để được miễn phí vận chuyển!
              </p>
            )}

            <button
              onClick={() => navigate("/checkout")}
              disabled={selectedItems.length === 0}
              className="w-full mt-4 bg-[#E53935] text-white py-3 rounded-xl font-semibold hover:bg-[#C62828] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Tiến hành thanh toán
            </button>

            <button
              onClick={() => navigate("/products")}
              className="w-full mt-2 flex items-center justify-center gap-2 text-[#1565C0] text-sm py-2 hover:underline"
            >
              <ShoppingBag size={14} /> Tiếp tục mua sắm
            </button>

            {/* Payment icons */}
            <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-[#E0E0E0]">
              {["COD", "Bank", "MoMo", "VNPay", "PayPal"].map((m) => (
                <span key={m} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-[#757575] font-medium">{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
