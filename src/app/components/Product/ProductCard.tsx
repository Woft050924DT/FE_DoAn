import { useState } from "react";
import { useNavigate } from "react-router";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { cartService } from '../../services/cartService';
import { useApp } from '../../contexts/AppContext';
import { authService } from '../../services/authService';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  comparePrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  sold: number;
  badge?: string;
  discount?: number;
  stock?: number;
  defaultVariantId?: string | null;
}

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const navigate = useNavigate();
  const { refreshCart } = useApp();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!authService.isAuthenticated()) {
      navigate("/login");
      return;
    }
    setAddingToCart(true);
    try {
      await cartService.addToCart({
        product_id: product.id,
        variant_id: product.defaultVariantId || undefined,
        quantity: 1,
      });
      await refreshCart();
    } catch (error: any) {
      if (error.response?.status === 401) navigate("/login");
      else alert(error.response?.data?.error || "Không thể thêm vào giỏ");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div
      className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 relative"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {product.badge && (
        <div
          className={`absolute top-2 left-2 z-10 text-white text-[11px] font-bold px-2 py-0.5 rounded-full ${
            product.badge === "SALE" ? "bg-[#E53935]" : "bg-[#1565C0]"
          }`}
        >
          {product.badge === "SALE" ? `-${product.discount}%` : product.badge}
        </div>
      )}

      <button
        className="absolute top-2 right-2 z-10 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          setIsWishlisted(!isWishlisted);
        }}
      >
        <Heart
          size={14}
          className={isWishlisted ? "fill-[#E53935] text-[#E53935]" : "text-gray-400"}
        />
      </button>

      <div className="aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-3">
        <p className="text-[11px] text-[#757575] mb-0.5">{product.brand}</p>
        <h3 className="text-sm text-[#212121] line-clamp-2 min-h-[40px] leading-5">{product.name}</h3>

        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={11}
                className={s <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}
              />
            ))}
          </div>
          <span className="text-[11px] text-[#757575]">({product.reviewCount})</span>
          <span className="text-[11px] text-[#757575]">· {product.sold >= 1000 ? `${(product.sold / 1000).toFixed(1)}k` : product.sold} đã bán</span>
        </div>

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-base text-[#E53935] font-semibold">{formatCurrency(product.price)}</span>
          {product.comparePrice && (
            <span className="text-xs text-[#757575] line-through">{formatCurrency(product.comparePrice)}</span>
          )}
        </div>

        <button
          className={`mt-2.5 w-full py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5
            ${hovered ? "bg-[#E53935] text-white opacity-100" : "bg-[#E53935]/10 text-[#E53935] opacity-0 group-hover:opacity-100"}
            ${addingToCart ? "opacity-75 cursor-not-allowed" : ""}
          `}
          onClick={handleAddToCart}
          disabled={addingToCart}
        >
          <ShoppingCart size={13} />
          {addingToCart ? "Đang thêm..." : "Thêm vào giỏ"}
        </button>
      </div>
    </div>
  );
}
