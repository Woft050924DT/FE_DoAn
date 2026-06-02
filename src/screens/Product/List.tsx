import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { ChevronRight, ChevronDown, ChevronUp, SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import { productService } from "../../services";
import type { Category, Product } from "../../services/types";
import { ProductCard } from "../../components/Product/ProductCard";

const BRANDS = ["Apple", "Samsung", "Sony", "Xiaomi", "Oppo", "Lenovo"];
const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "rating", label: "Đánh giá cao nhất" },
  { value: "sold", label: "Bán chạy nhất" },
];

const transformProduct = (apiProduct: any) => ({
  id: apiProduct.product_id,
  name: apiProduct.name,
  brand: apiProduct.brands?.name || "",
  brandId: apiProduct.brands?.brand_id || "",
  category: apiProduct.categories?.name || "",
  categoryId: apiProduct.categories?.category_id || "",
  categorySlug: apiProduct.categories?.slug || "",
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
  bestSeller: apiProduct.best_seller,
  newArrival: apiProduct.new_arrival,
  status: apiProduct.status,
  description: apiProduct.description || apiProduct.short_description || "",
});

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const STATUS_FILTERS = ["Còn hàng", "Đang giảm giá", "Hàng mới", "Bán chạy"];

export function ScreensProductList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [expandedCat, setExpandedCat] = useState<string | null>("api-categories");
  const [activeStatusFilters, setActiveStatusFilters] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let nextCategories: Category[] = [];

        try {
          nextCategories = await productService.getCategories();
        } catch {
          const data = await productService.getProducts({ page: 1, limit: 100 });
          const categoryMap = new Map<string, Category>();

          data.products.forEach((product: Product) => {
            if (product.categories?.category_id) {
              categoryMap.set(product.categories.category_id, product.categories);
            }
          });

          nextCategories = Array.from(categoryMap.values());
        }

        setCategories(nextCategories);

        const queryCategory = new URLSearchParams(location.search).get("cat");
        if (queryCategory) {
          const matchedCategory = nextCategories.find((category) =>
            [category.category_id, category.slug, category.name].some(
              (value) => value?.toLowerCase() === queryCategory.toLowerCase()
            )
          );

          if (matchedCategory) {
            setSelectedCategoryId(matchedCategory.category_id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProducts({ 
          page: pagination.page, 
          limit: pagination.limit,
          category_id: selectedCategoryId || undefined,
          best_seller: activeStatusFilters.includes("Bán chạy") ? true : undefined,
          new_arrival: activeStatusFilters.includes("Hàng mới") ? true : undefined,
        });
        setProducts(data.products.map(transformProduct));
        setPagination(data.pagination);
      } catch (err) {
        setError("Không thể tải danh sách sản phẩm");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [pagination.page, pagination.limit, selectedCategoryId, activeStatusFilters]);

  const toggleBrand = (brand: string) =>
    setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);

  const toggleRating = (r: number) =>
    setSelectedRatings((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);

  const toggleStatus = (s: string) =>
    setActiveStatusFilters((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const selectedCategory = categories.find((category) => category.category_id === selectedCategoryId);
  const hasLocalFilters =
    selectedBrands.length > 0 ||
    selectedRatings.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 50000000 ||
    activeStatusFilters.includes("Đang giảm giá") ||
    activeStatusFilters.includes("Còn hàng");

  const displayedProducts = useMemo(() => {
    return products.filter((product) => {
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const matchPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchRating = selectedRatings.length === 0 || selectedRatings.some((rating) => product.rating >= rating);
      const matchSale = !activeStatusFilters.includes("Đang giảm giá") || product.discount > 0;
      const matchStock = !activeStatusFilters.includes("Còn hàng") || product.stock > 0;

      return matchBrand && matchPrice && matchRating && matchSale && matchStock;
    });
  }, [products, selectedBrands, priceRange, selectedRatings, activeStatusFilters]);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setFilterOpen(false);
  };

  const sortedProducts = [...displayedProducts].sort((a, b) => {
    if (sort === "price_asc") return a.price - b.price;
    if (sort === "price_desc") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "sold") return b.sold - a.sold;
    return 0;
  });

  const SidebarContent = () => (
    <div className="space-y-5">
      {/* Categories */}
      <div>
        <h4 className="font-semibold text-[#212121] mb-3 text-sm">Danh mục</h4>
        <div className="space-y-1">
          <button
            onClick={() => handleSelectCategory("")}
            className={`block w-full text-left py-1.5 text-sm rounded-md px-2 ${
              selectedCategoryId === ""
                ? "text-[#1565C0] font-semibold bg-blue-50"
                : "text-[#212121] hover:text-[#1565C0]"
            }`}
          >
            Tất cả sản phẩm
          </button>
          <div>
            <button
              className="w-full flex items-center justify-between py-1.5 text-sm text-[#212121] hover:text-[#1565C0]"
              onClick={() => setExpandedCat(expandedCat === "api-categories" ? null : "api-categories")}
            >
              <span>Danh mục sản phẩm</span>
              {expandedCat === "api-categories" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {expandedCat === "api-categories" && (
              <div className="pl-3 space-y-1 mb-1">
                {categories.map((category) => (
                  <button
                    key={category.category_id}
                    onClick={() => handleSelectCategory(category.category_id)}
                    className={`block w-full text-left py-1 text-xs rounded px-2 ${
                      selectedCategoryId === category.category_id
                        ? "text-[#1565C0] font-semibold bg-blue-50"
                        : "text-[#757575] hover:text-[#1565C0] hover:font-medium"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
                {categories.length === 0 && (
                  <p className="py-1 text-xs text-[#757575]">Chưa có danh mục</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#E0E0E0]" />

      {/* Brands */}
      <div>
        <h4 className="font-semibold text-[#212121] mb-3 text-sm">Thương hiệu</h4>
        <div className="space-y-2">
          {BRANDS.map((brand) => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="w-4 h-4 rounded border-[#E0E0E0] accent-[#1565C0]"
              />
              <span className="text-sm text-[#212121] group-hover:text-[#1565C0]">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-[#E0E0E0]" />

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-[#212121] mb-3 text-sm">Khoảng giá</h4>
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={50000000}
            step={500000}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-[#E53935]"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Từ"
              value={priceRange[0].toLocaleString("vi-VN")}
              className="flex-1 border border-[#E0E0E0] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#1565C0]"
              readOnly
            />
            <span className="text-[#757575] self-center">—</span>
            <input
              type="text"
              placeholder="Đến"
              value={priceRange[1].toLocaleString("vi-VN")}
              className="flex-1 border border-[#E0E0E0] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#1565C0]"
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="border-t border-[#E0E0E0]" />

      {/* Rating */}
      <div>
        <h4 className="font-semibold text-[#212121] mb-3 text-sm">Đánh giá</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedRatings.includes(r)}
                onChange={() => toggleRating(r)}
                className="w-4 h-4 rounded accent-[#1565C0]"
              />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={`text-base leading-none ${s <= r ? "text-amber-400" : "text-gray-200"}`}>★</span>
                ))}
                {r < 5 && <span className="text-xs text-[#757575]">trở lên</span>}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-[#E0E0E0]" />

      {/* Status */}
      <div>
        <h4 className="font-semibold text-[#212121] mb-3 text-sm">Trạng thái</h4>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => toggleStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeStatusFilters.includes(s)
                  ? "bg-[#E53935] text-white border-[#E53935]"
                  : "border-[#E0E0E0] text-[#212121] hover:border-[#E53935]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-2">
        <button className="flex-1 bg-[#E53935] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#C62828] transition-colors">
          Áp dụng
        </button>
        <button
          onClick={() => {
            setSelectedBrands([]);
            setSelectedRatings([]);
            setActiveStatusFilters([]);
            setPriceRange([0, 50000000]);
            handleSelectCategory("");
          }}
          className="text-sm text-[#757575] hover:text-[#E53935] px-3"
        >
          Đặt lại
        </button>
      </div>
    </div>
  );

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

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-[#212121] mb-2">Lỗi</h3>
            <p className="text-[#757575] mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#1565C0] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#0D47A1]"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-[#757575] mb-5">
        <button onClick={() => navigate("/")} className="hover:text-[#E53935]">Trang chủ</button>
        <ChevronRight size={13} />
        <button onClick={() => handleSelectCategory("")} className="hover:text-[#E53935]">Sản phẩm</button>
        {selectedCategory && (
          <>
            <ChevronRight size={13} />
            <span className="text-[#212121] font-medium">{selectedCategory.name}</span>
          </>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-60 shrink-0 bg-white rounded-xl border border-[#E0E0E0] p-4 h-fit sticky top-24">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-3 mb-4 flex items-center gap-3 flex-wrap">
            <span className="text-sm text-[#757575]">
              <span className="font-semibold text-[#212121]">{hasLocalFilters ? sortedProducts.length : pagination.total}</span> sản phẩm
            </span>
            <div className="flex-1" />

            <button
              className="lg:hidden flex items-center gap-1.5 text-sm border border-[#E0E0E0] rounded-lg px-3 py-1.5 hover:border-[#1565C0]"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <SlidersHorizontal size={14} /> Bộ lọc
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-[#E0E0E0] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#1565C0] bg-white"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <div className="flex border border-[#E0E0E0] rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 ${viewMode === "grid" ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-50"}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 ${viewMode === "list" ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-50"}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Product Grid */}
          {sortedProducts.length > 0 ? (
            <div className={viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
              : "flex flex-col gap-3"
            }>
              {sortedProducts.map((product) => (
                viewMode === "grid" ? (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => navigate(`/products/${product.id}`)}
                  />
                ) : (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border border-[#E0E0E0] p-4 flex gap-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-lg" />
                    <div className="flex-1">
                      <p className="text-xs text-[#757575]">{product.brand}</p>
                      <p className="font-medium text-[#212121] mt-0.5 line-clamp-2">{product.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={`text-sm ${s <= Math.round(product.rating) ? "text-amber-400" : "text-gray-200"}`}>★</span>
                        ))}
                        <span className="text-xs text-[#757575]">({product.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-lg text-[#E53935] font-semibold">{product.price.toLocaleString("vi-VN")}đ</span>
                        {product.comparePrice && (
                          <span className="text-sm text-[#757575] line-through">{product.comparePrice.toLocaleString("vi-VN")}đ</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-16 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-[#212121] mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-[#757575] mb-4">Thử điều chỉnh bộ lọc để tìm kiếm tốt hơn</p>
              <button
                onClick={() => {
                  setSelectedBrands([]);
                  setSelectedRatings([]);
                  setActiveStatusFilters([]);
                  setPriceRange([0, 50000000]);
                  handleSelectCategory("");
                }}
                className="bg-[#E53935] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#C62828]"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-8">
              <button 
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="w-8 h-8 flex items-center justify-center border border-[#E0E0E0] rounded-lg text-[#757575] hover:border-[#1565C0] hover:text-[#1565C0] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ←
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    className={`w-8 h-8 flex items-center justify-center border rounded-lg text-sm transition-colors ${
                      pageNum === pagination.page
                        ? "bg-[#1565C0] text-white border-[#1565C0]"
                        : "border-[#E0E0E0] text-[#757575] hover:border-[#1565C0] hover:text-[#1565C0]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button 
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                disabled={pagination.page === pagination.totalPages}
                className="w-8 h-8 flex items-center justify-center border border-[#E0E0E0] rounded-lg text-[#757575] hover:border-[#1565C0] hover:text-[#1565C0] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
