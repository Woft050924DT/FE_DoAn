import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ChevronRight, ChevronDown, ChevronUp, SlidersHorizontal, LayoutGrid, List, Search } from "lucide-react";
import { productService, catalogService } from "../../services";
import type { Brand, Category } from "../../services/types";
import { mapProductCard } from "../../utils/apiMappers";
import { resolveCategorySlugFromSearchParams } from "../../utils/categorySlugs";
import { ProductCard } from "../../components/Product/ProductCard";

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "rating", label: "Đánh giá cao nhất" },
  { value: "sold", label: "Bán chạy nhất" },
];

function buildCategoryTree(categories: Category[]) {
  const roots = categories.filter((c) => !c.parent_id);
  return roots.map((root) => ({
    id: root.category_id,
    slug: root.slug,
    name: root.name,
    children: categories
      .filter((c) => c.parent_id === root.category_id)
      .map((c) => ({ id: c.category_id, slug: c.slug, name: c.name })),
  }));
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const STATUS_FILTERS = ["Còn hàng", "Đang giảm giá", "Hàng mới", "Bán chạy"];

export function ScreensProductList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [activeStatusFilters, setActiveStatusFilters] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [brandList, categoryList] = await Promise.all([
          catalogService.getBrands(),
          catalogService.getCategories(),
        ]);
        setBrands(brandList);
        setCategories(categoryList);
        const tree = buildCategoryTree(categoryList);
        if (tree.length > 0) setExpandedCat(tree[0].name);
      } catch (err) {
        console.error(err);
      }
    };
    loadCatalog();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const categoryFilter = resolveCategorySlugFromSearchParams(
          searchParams.get("category_id"),
          searchParams.get("cat"),
          searchParams.get("category_slug")
        );
        const data = await productService.getProducts({
          page: pagination.page,
          limit: pagination.limit,
          search: searchParams.get("q") || undefined,
          ...categoryFilter,
          best_seller: searchParams.get("sort") === "sold" || undefined,
          new_arrival: searchParams.get("sort") === "new" || undefined,
          featured: searchParams.get("sale") === "true" || undefined,
        });
        setProducts(data.products.map(mapProductCard));
        setPagination(data.pagination);
        setError(null);
      } catch (err) {
        setError("Không thể tải danh sách sản phẩm");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams, pagination.page, pagination.limit]);

  const toggleBrand = (brand: string) =>
    setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);

  const toggleRating = (r: number) =>
    setSelectedRatings((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);

  const toggleStatus = (s: string) =>
    setActiveStatusFilters((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const categoryTree = buildCategoryTree(categories);

  const sortedProducts = [...products]
    .filter((p) => selectedBrands.length === 0 || selectedBrands.includes(p.brand))
    .sort((a, b) => {
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
          {categoryTree.map((cat) => (
            <div key={cat.id}>
              <button
                className="w-full flex items-center justify-between py-1.5 text-sm text-[#212121] hover:text-[#1565C0]"
                onClick={() => {
                  navigate(`/products?category_slug=${cat.slug}`);
                  setExpandedCat(expandedCat === cat.name ? null : cat.name);
                }}
              >
                <span>{cat.name}</span>
                {expandedCat === cat.name ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {expandedCat === cat.name && cat.children.length > 0 && (
                <div className="pl-3 space-y-1 mb-1">
                  {cat.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => navigate(`/products?category_slug=${child.slug}`)}
                      className="block w-full text-left py-1 text-xs text-[#757575] hover:text-[#1565C0] hover:font-medium"
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#E0E0E0]" />

      {/* Brands */}
      <div>
        <h4 className="font-semibold text-[#212121] mb-3 text-sm">Thương hiệu</h4>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label key={brand.brand_id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand.name)}
                onChange={() => toggleBrand(brand.name)}
                className="w-4 h-4 rounded border-[#E0E0E0] accent-[#1565C0]"
              />
              <span className="text-sm text-[#212121] group-hover:text-[#1565C0]">{brand.name}</span>
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
          onClick={() => { setSelectedBrands([]); setSelectedRatings([]); setActiveStatusFilters([]); }}
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
        <button onClick={() => navigate("/products")} className="hover:text-[#E53935]">Đồng hồ</button>
        <ChevronRight size={13} />
        <span className="text-[#212121] font-medium">Tất cả</span>
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
              <span className="font-semibold text-[#212121]">{pagination.total}</span> sản phẩm
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
          {products.length > 0 ? (
            <div className={viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
              : "flex flex-col gap-3"
            }>
              {products.map((product) => (
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
                onClick={() => { setSelectedBrands([]); setSelectedRatings([]); }}
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
