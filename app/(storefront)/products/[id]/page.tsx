'use client'

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Star, ChevronRight, ShoppingCart, Zap, Truck, Share2,
  Heart, Shield, RotateCcw, ThumbsUp, ChevronLeft, ChevronRight as ChevronRightIcon
} from "lucide-react";
import { cartService, productService } from "@/services";
import { ProductCard } from "@/components/Product/ProductCard";

const TABS = ["Mô tả", "Thông số", "Đánh giá (128)", "Hỏi đáp"];
const COLORS = [
  { name: "Titan Tự Nhiên", hex: "#B8A99A" },
  { name: "Titan Đen", hex: "#2C2C2C" },
  { name: "Titan Trắng", hex: "#F5F5F0" },
  { name: "Titan Xanh", hex: "#4A6C8C" },
];
const SIZES = ["64GB", "128GB", "256GB", "512GB", "1TB"];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const transformProduct = (apiProduct: any) => ({
  id: apiProduct.product_id,
  name: apiProduct.name,
  brand: apiProduct.brands?.name || "",
  category: apiProduct.categories?.name || "",
  sku: apiProduct.sku,
  price: apiProduct.price,
  comparePrice: apiProduct.compare_price,
  image: apiProduct.product_images?.find((img: any) => img.is_primary)?.image_url || apiProduct.product_images?.[0]?.image_url || "",
  images: apiProduct.product_images?.map((img: any) => img.image_url) || [],
  rating: apiProduct.product_reviews?.length > 0
    ? apiProduct.product_reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / apiProduct.product_reviews.length
    : 4.5,
  reviewCount: apiProduct.product_reviews?.length || 0,
  sold: apiProduct.view_count || 0,
  stock: apiProduct.product_variants?.reduce((sum: number, v: any) => sum + v.stock_quantity, 0) || 0,
  badge: apiProduct.new_arrival ? "NEW" : apiProduct.featured ? "HOT" : null,
  discount: apiProduct.compare_price ? Math.round((1 - apiProduct.price / apiProduct.compare_price) * 100) : 0,
  featured: apiProduct.featured,
  status: apiProduct.status,
  description: apiProduct.description || apiProduct.short_description || "",
});

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(2);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(id || "");
        setProduct(transformProduct(data));
      } catch (err) {
        setError("Không thể tải thông tin sản phẩm");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const data = await productService.getProducts({ limit: 6 });
        setRelatedProducts(data.products
          .filter((p: any) => p.product_id !== product?.id)
          .map(transformProduct)
          .slice(0, 6)
        );
      } catch (err) {
        console.error("Failed to fetch related products:", err);
      }
    };
    if (product) fetchRelatedProducts();
  }, [product]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1565C0] mx-auto mb-4"></div>
            <p className="text-[#757575]">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-[#212121] mb-2">Lỗi</h3>
            <p className="text-[#757575] mb-4">{error || "Không tìm thấy sản phẩm"}</p>
            <button
              onClick={() => router.push("/products")}
              className="bg-[#1565C0] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#0D47A1]"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [product.image];

  const handleAddToCart = async () => {
    if (!product || addingToCart) return false;
    try {
      setAddingToCart(true);
      setCartMessage("");
      await cartService.addToCart({ product_id: product.id, quantity });
      setCartMessage("Đã thêm sản phẩm vào giỏ hàng");
      return true;
    } catch (err) {
      console.error("Failed to add to cart:", err);
      setCartMessage("Không thể thêm sản phẩm vào giỏ hàng");
      return false;
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    const added = await handleAddToCart();
    if (added) router.push("/checkout");
  };

  const ratingBreakdown = [
    { stars: 5, count: 89 },
    { stars: 4, count: 25 },
    { stars: 3, count: 9 },
    { stars: 2, count: 3 },
    { stars: 1, count: 2 },
  ];
  const totalReviews = ratingBreakdown.reduce((s, r) => s + r.count, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-[#757575] mb-6">
        <button onClick={() => router.push("/")} className="hover:text-[#E53935]">Trang chủ</button>
        <ChevronRight size={13} />
        <button onClick={() => router.push("/products")} className="hover:text-[#E53935]">Sản phẩm</button>
        <ChevronRight size={13} />
        <span className="text-[#212121] font-medium line-clamp-1">{product.name}</span>
      </div>

      {/* Main product section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3 border border-[#E0E0E0]">
            <img
              src={images[selectedImage] || product.image}
              alt={product.name}
              className="w-full h-full object-cover cursor-zoom-in"
            />
            {product.badge && (
              <div className="absolute top-3 left-3 bg-[#E53935] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                -{product.discount}%
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((s) => (s - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setSelectedImage((s) => (s + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"
                >
                  <ChevronRightIcon size={16} />
                </button>
              </>
            )}
          </div>
          <div className="flex gap-2">
            {images.slice(0, 5).map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                  selectedImage === i ? "border-[#1565C0] ring-2 ring-[#1565C0]/20" : "border-[#E0E0E0]"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm text-[#1565C0] font-medium mb-1 hover:underline cursor-pointer">{product.brand}</p>
          <h1 className="text-2xl font-bold text-[#212121] mb-1">{product.name}</h1>
          <p className="text-xs text-[#757575] mb-3">SKU: {product.sku}</p>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} className={s <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"} />
              ))}
              <span className="text-sm font-medium text-[#212121] ml-1">{product.rating}</span>
            </div>
            <button className="text-sm text-[#1565C0] hover:underline">({product.reviewCount} đánh giá)</button>
            <span className="text-sm text-[#757575]">· Đã bán {product.sold >= 1000 ? `${(product.sold / 1000).toFixed(1)}k` : product.sold}</span>
          </div>

          <div className="bg-[#F5F6FA] rounded-xl p-4 mb-5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl font-bold text-[#E53935]">{formatCurrency(product.price)}</span>
              {product.comparePrice && (
                <span className="text-lg text-[#757575] line-through">{formatCurrency(product.comparePrice)}</span>
              )}
              {product.discount > 0 && (
                <span className="bg-[#E53935] text-white text-sm font-bold px-2 py-0.5 rounded-full">−{product.discount}%</span>
              )}
            </div>
          </div>

          {/* Colors */}
          <div className="mb-4">
            <p className="text-sm font-medium text-[#212121] mb-2">
              Màu sắc: <span className="font-normal text-[#757575]">{COLORS[selectedColor].name}</span>
            </p>
            <div className="flex gap-2">
              {COLORS.map((color, i) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(i)}
                  title={color.name}
                  className={`w-8 h-8 rounded-full transition-all ${selectedColor === i ? "ring-2 ring-[#1565C0] ring-offset-2" : "ring-1 ring-gray-300"}`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="mb-4">
            <p className="text-sm font-medium text-[#212121] mb-2">
              Dung lượng: <span className="font-normal text-[#757575]">{SIZES[selectedSize]}</span>
            </p>
            <div className="flex gap-2 flex-wrap">
              {SIZES.map((size, i) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(i)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    selectedSize === i ? "bg-[#1E2A3A] text-white border-[#1E2A3A]" : "border-[#E0E0E0] text-[#212121] hover:border-[#1565C0]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-5">
            <p className="text-sm font-medium text-[#212121]">Số lượng:</p>
            <div className="flex items-center border border-[#E0E0E0] rounded-lg overflow-hidden">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 text-[#212121] font-bold">−</button>
              <span className="w-10 text-center text-sm font-medium">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 text-[#212121] font-bold">+</button>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-[#1565C0] text-[#1565C0] py-3 rounded-xl font-semibold hover:bg-[#1565C0]/5 transition-colors disabled:opacity-60"
            >
              <ShoppingCart size={18} />
              {addingToCart ? "Đang thêm..." : "Thêm vào giỏ"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={addingToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-[#E53935] text-white py-3 rounded-xl font-semibold hover:bg-[#C62828] transition-colors disabled:opacity-60"
            >
              <Zap size={18} />
              Mua ngay
            </button>
            <button
              onClick={() => setWishlisted(!wishlisted)}
              className={`w-12 h-12 flex items-center justify-center border-2 rounded-xl transition-colors ${
                wishlisted ? "border-[#E53935] bg-[#E53935]/5 text-[#E53935]" : "border-[#E0E0E0] text-[#757575] hover:border-[#E53935]"
              }`}
            >
              <Heart size={18} className={wishlisted ? "fill-[#E53935]" : ""} />
            </button>
          </div>
          {cartMessage && (
            <p className={`text-sm mb-4 ${cartMessage.startsWith("Đã") ? "text-[#2E7D32]" : "text-[#E53935]"}`}>{cartMessage}</p>
          )}

          <div className="flex items-center gap-2 text-sm text-[#757575] mb-3">
            <Truck size={15} className="text-[#2E7D32]" />
            Miễn phí vận chuyển đơn từ 500.000đ
          </div>
          <div className="flex gap-4 text-xs text-[#757575]">
            <span className="flex items-center gap-1"><Shield size={13} className="text-[#2E7D32]" />Bảo hành 12T</span>
            <span className="flex items-center gap-1"><RotateCcw size={13} className="text-[#1565C0]" />Đổi trả 7 ngày</span>
            <span className="flex items-center gap-1"><Zap size={13} className="text-amber-500" />Hàng chính hãng</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[#E0E0E0] mb-8 overflow-hidden">
        <div className="flex border-b border-[#E0E0E0] overflow-x-auto">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === i ? "text-[#1565C0] border-b-2 border-[#1565C0] -mb-px" : "text-[#757575] hover:text-[#212121]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === 0 && (
            <div className="text-sm text-[#757575] leading-relaxed">
              <p className="mb-3">{product.description}</p>
              <p>Sản phẩm được nhập khẩu chính hãng, đầy đủ phụ kiện, tem nhãn còn nguyên vẹn.</p>
            </div>
          )}
          {activeTab === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[["Thương hiệu", product.brand], ["SKU", product.sku], ["Bảo hành", "12 tháng"], ["Xuất xứ", "Chính hãng"]].map(([key, val]) => (
                <div key={key} className="flex gap-3 text-sm">
                  <span className="text-[#757575] w-28 shrink-0">{key}</span>
                  <span className="text-[#212121] font-medium">{val}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === 2 && (
            <div className="flex gap-8 mb-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-[#212121]">{product.rating}</div>
                <div className="flex justify-center mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} className={s <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"} />
                  ))}
                </div>
                <p className="text-xs text-[#757575] mt-1">{totalReviews} đánh giá</p>
              </div>
              <div className="flex-1 min-w-48 space-y-1.5">
                {ratingBreakdown.map((rb) => (
                  <div key={rb.stars} className="flex items-center gap-2 text-xs">
                    <span className="w-4 text-right text-[#757575]">{rb.stars}★</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="h-2 bg-amber-400 rounded-full" style={{ width: `${(rb.count / totalReviews) * 100}%` }} />
                    </div>
                    <span className="w-6 text-[#757575]">{rb.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 3 && (
            <div className="text-center py-8 text-[#757575]">
              <p className="text-4xl mb-3">💬</p>
              <p className="font-medium text-[#212121]">Chưa có câu hỏi nào</p>
              <button className="mt-4 bg-[#1565C0] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#0D47A1]">Đặt câu hỏi</button>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div>
        <h2 className="text-xl font-bold text-[#212121] mb-5">Sản phẩm liên quan</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
          {relatedProducts.map((p) => (
            <div key={p.id} className="shrink-0 w-[200px]">
              <ProductCard product={p} onClick={() => router.push(`/products/${p.id}`)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
