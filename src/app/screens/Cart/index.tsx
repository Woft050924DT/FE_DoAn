import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Trash2, Tag, ArrowLeft, Check } from "lucide-react";
import { cartService, couponService } from "../../services";
import { mapCartItemUi, toNumber } from "../../utils/apiMappers";
import { useApp } from "../../contexts/AppContext";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

export function ScreensCart() {
  const navigate = useNavigate();
  const { refreshCart } = useApp();
  const [cartItems, setCartItems] = useState<ReturnType<typeof mapCartItemUi>[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCart = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const cart = await cartService.getCart();
      setCartItems((cart.cart_items || []).map(mapCartItemUi));
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart(true);
  }, [loadCart]);

  const toggleSelect = (id: string) =>
    setCartItems((items) => items.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)));

  const toggleSelectAll = () => {
    const allSelected = cartItems.every((i) => i.selected);
    setCartItems((items) => items.map((item) => ({ ...item, selected: !allSelected })));
  };

  const updateQuantity = async (id: string, qty: number) => {
    if (qty < 1) return;
    const item = cartItems.find((i) => i.id === id);
    if (item && item.maxStock > 0 && qty > item.maxStock) {
      alert(`Chỉ còn ${item.maxStock} sản phẩm trong kho`);
      return;
    }
    setCartItems((items) =>
      items.map((item) => item.id === id ? { ...item, quantity: qty } : item)
    );
    try {
      await cartService.updateCartItem(id, qty);
      await refreshCart();
    } catch (err: any) {
      alert(err.response?.data?.error || "Không thể cập nhật số lượng");
      await loadCart();
    }
  };

  const removeItem = async (id: string) => {
    try {
      await cartService.removeCartItem(id);
      await loadCart();
      await refreshCart();
    } catch (err) {
      console.error(err);
    }
  };

  const applyCoupon = async () => {
    const subtotal = cartItems.filter((i) => i.selected).reduce((s, i) => s + i.price * i.quantity, 0);
    try {
      const result = await couponService.validate(couponCode, subtotal);
      setDiscountAmount(toNumber(result.discount_amount));
      setAppliedCoupon(result.code);
      setCouponError("");
    } catch (err: any) {
      setCouponError(err.response?.data?.error || "Mã giảm giá không hợp lệ");
      setDiscountAmount(0);
      setAppliedCoupon("");
    }
  };

  const selectedItems = cartItems.filter((i) => i.selected);
  const subtotal = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shipping - discountAmount;

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
        <div className="flex-1 space-y-3">
          <div className="bg-white rounded-xl border border-[#E0E0E0] px-4 py-3 flex items-center gap-3">
            <input
              type="checkbox"
              checked={cartItems.every((i) => i.selected)}
              onChange={toggleSelectAll}
              className="w-4 h-4 accent-[#1565C0] cursor-pointer"
            />
            <span className="text-sm font-medium text-[#212121]">Chọn tất cả ({cartItems.length} sản phẩm)</span>
          </div>

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
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg border border-[#E0E0E0] shrink-0 cursor-pointer"
                  onClick={() => navigate(`/products/${item.product_id}`)}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium text-sm text-[#212121] line-clamp-2 cursor-pointer hover:text-[#1565C0]"
                    onClick={() => navigate(`/products/${item.product_id}`)}
                  >
                    {item.name}
                  </p>
                  {item.variant_name && (
                    <p className="text-xs text-[#757575] mt-0.5">Biến thể: {item.variant_name}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    <span className="text-base font-semibold text-[#E53935]">{formatCurrency(item.price)}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-[#E0E0E0] rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 font-bold"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.maxStock > 0 && item.quantity >= item.maxStock}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-1.5 text-[#757575] hover:text-[#E53935]">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-white rounded-xl border border-[#E0E0E0] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={16} className="text-[#E53935]" />
              <span className="font-medium text-sm">Mã giảm giá</span>
            </div>
            {appliedCoupon ? (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <Check size={14} className="text-[#2E7D32]" />
                <span className="text-sm text-[#2E7D32] font-medium">
                  {appliedCoupon} — Giảm {formatCurrency(discountAmount)}
                </span>
                <button
                  onClick={() => {
                    setAppliedCoupon(""); setDiscountAmount(0); setCouponCode("");
                  }}
                  className="ml-auto text-xs text-[#757575]"
                >
                  Xóa
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã (vd: SAVE10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm"
                />
                <button onClick={applyCoupon} className="bg-[#E53935] text-white px-4 py-2 rounded-lg text-sm">
                  Áp dụng
                </button>
              </div>
            )}
            {couponError && <p className="text-xs text-[#E53935] mt-1">{couponError}</p>}
          </div>
        </div>

        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-5 sticky top-24">
            <h3 className="font-bold mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#757575]">Tạm tính</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#757575]">Phí vận chuyển</span>
                <span>{shipping === 0 ? "Miễn phí" : formatCurrency(shipping)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#757575]">Giảm giá</span>
                  <span className="text-[#2E7D32]">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Tổng cộng</span>
                <span className="text-[#E53935] text-xl">{formatCurrency(total)}</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/checkout", { state: { couponCode: appliedCoupon } })}
              disabled={selectedItems.length === 0}
              className="w-full mt-4 bg-[#E53935] text-white py-3 rounded-xl font-semibold disabled:opacity-40"
            >
              Tiến hành thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
