import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, Clock, ArrowRight } from "lucide-react";
import { ProductCard } from "../../components/Product/ProductCard";
import { productService, catalogService } from "../../services";
import { mapProductCard, toNumber } from "../../utils/apiMappers";

const HERO_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1200&q=80",
    title: "Đồng Hồ Cao Cấp",
    subtitle: "Bộ sưu tập mới — Thiết kế tinh xảo, chính hãng quốc tế",
    cta: "Mua ngay",
    bg: "from-slate-900/70",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1200&q=80",
    title: "Đồng Hồ Nam",
    subtitle: "Phong cách lịch lãm — Giảm đến 20% tuần này",
    cta: "Khám phá",
    bg: "from-gray-900/70",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1542496654-2619d752d938?w=1200&q=80",
    title: "Smartwatch Thông Minh",
    subtitle: "Theo dõi sức khỏe, kết nối đa thiết bị — Giảm đến 15%",
    cta: "Xem bộ sưu tập",
    bg: "from-rose-900/70",
  },
];

const CATEGORIES = [
  { id: "1", name: "Đồng hồ nam", icon: "⌚", count: 186 },
  { id: "2", name: "Đồng hồ nữ", icon: "💎", count: 142 },
  { id: "3", name: "Smartwatch", icon: "📱", count: 98 },
  { id: "4", name: "Cao cấp", icon: "✨", count: 64 },
  { id: "5", name: "Thể thao", icon: "🏃", count: 112 },
  { id: "6", name: "Phụ kiện", icon: "🔗", count: 76 },
];


function useCountdown() {
  const [time, setTime] = useState({ h: 5, m: 23, s: 47 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return time;
}

function SectionHeader({ title, link }: { title: string; link?: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xl font-bold text-[#212121]">{title}</h2>
      {link && (
        <button
          onClick={() => navigate(link)}
          className="text-sm text-[#1565C0] flex items-center gap-1 hover:underline"
        >
          Xem tất cả <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

export function ScreensHome() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [flashSale, setFlashSale] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>(CATEGORIES);
  const [loading, setLoading] = useState(true);
  const countdown = useCountdown();

  useEffect(() => {
    const timer = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const [best, newest, all, cats] = await Promise.all([
          productService.getBestSellerProducts(8),
          productService.getNewArrivalProducts(8),
          productService.getProducts({ limit: 12 }),
          catalogService.getCategories(),
        ]);
        setBestSellers(best.products.map(mapProductCard));
        setNewArrivals(newest.products.map(mapProductCard));
        setFlashSale(
          all.products
            .filter((p) => p.compare_price && toNumber(p.compare_price) > toNumber(p.price))
            .map(mapProductCard)
            .slice(0, 6)
        );
        if (cats.length) {
          setCategories(
            cats.slice(0, 6).map((c) => ({
              id: c.category_id,
              slug: c.slug,
              name: c.name,
              icon: c.icon || "⌚",
              count: c._count?.products ?? 0,
            }))
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="pb-8">
      {/* Hero Carousel */}
      <div className="relative overflow-hidden h-[340px] sm:h-[440px] lg:h-[520px]">
        {HERO_SLIDES.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === slide ? "opacity-100" : "opacity-0"}`}
          >
            <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-r ${s.bg} to-transparent`} />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-8 w-full">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg">{s.title}</h1>
                <p className="text-base sm:text-lg text-white/90 mb-6 drop-shadow">{s.subtitle}</p>
                <button
                  onClick={() => navigate("/products")}
                  className="bg-[#E53935] hover:bg-[#C62828] text-white px-7 py-3 rounded-xl font-semibold transition-colors shadow-lg"
                >
                  {s.cta}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Controls */}
        <button
          onClick={() => setSlide((s) => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => setSlide((s) => (s + 1) % HERO_SLIDES.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors"
        >
          <ChevronRight size={18} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`rounded-full transition-all duration-300 ${i === slide ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/50"}`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        {/* Featured Categories */}
        <div className="mb-10">
          <SectionHeader title="📦 Danh mục nổi bật" />
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  navigate(cat.slug ? `/products?category_slug=${cat.slug}` : `/products?category_id=${cat.id}`)
                }
                className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 border border-[#E0E0E0] hover:border-[#E53935] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium text-[#212121] text-center leading-tight group-hover:text-[#E53935] transition-colors">{cat.name}</span>
                <span className="text-[10px] text-[#757575]">{cat.count} sp</span>
              </button>
            ))}
          </div>
        </div>

        {/* Flash Sale */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-[#212121]">⚡ Flash Sale</h2>
              <div className="flex items-center gap-1 bg-[#E53935] text-white px-3 py-1 rounded-full text-sm font-bold">
                <Clock size={13} />
                {pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}
              </div>
            </div>
            <button
              onClick={() => navigate("/products?sale=true")}
              className="text-sm text-[#1565C0] flex items-center gap-1 hover:underline"
            >
              Xem tất cả <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
            {flashSale.map((product) => (
              <div key={product.id} className="shrink-0 w-[200px]">
                <ProductCard
                  product={product}
                  onClick={() => navigate(`/products/${product.id}`)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Best Sellers */}
        <div className="mb-10">
          <SectionHeader title="🏆 Bán chạy nhất" link="/products?sort=sold" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {bestSellers.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => navigate(`/products/${product.id}`)}
              />
            ))}
          </div>
        </div>

        {/* New Arrivals */}
        <div className="mb-10">
          <SectionHeader title="🆕 Hàng mới về" link="/products?sort=new" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivals.slice(0, 8).map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => navigate(`/products/${product.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Promo Banner */}
        <div className="rounded-2xl overflow-hidden relative h-48 mb-2">
          <img
            src="https://images.unsplash.com/photo-1612817159947-93bb511b5ecc?w=1200&q=80"
            alt="Promo"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1565C0]/80 to-transparent flex items-center">
            <div className="px-10">
              <p className="text-white/80 text-sm mb-1">Ưu đãi đặc biệt</p>
              <h3 className="text-white text-2xl font-bold mb-3">Citizen Eco-Drive<br />Giảm đến 14%</h3>
              <button
                onClick={() => navigate("/products/3")}
                className="bg-white text-[#1565C0] text-sm font-semibold px-5 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
