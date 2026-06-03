import { useState, useEffect } from "react";
import { Plus, Download, Star, Eye, Edit2, Copy, Trash2 } from "lucide-react";
import { productService } from "../../services";
import { OrderStatusBadge } from "../../components/Order/StatusBadge";
import { UIPageHeader } from "../../components/UI/PageHeader";
import { ProductFilterSection } from "../../components/Product/FilterSection";
import { TableDataTable } from "../../components/Table/DataTable";

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
  image: apiProduct.product_images?.find((img: any) => img.is_primary)?.image_url || apiProduct.product_images?.[0]?.image_url || null,
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

const TABS = ["Tất cả", "Đang bán", "Nháp", "Hết hàng", "Ngừng bán"];

export function ScreensAdminProducts() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getProducts();
        setProducts(data.products.map(transformProduct));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 0) return matchSearch;
    if (activeTab === 1) return matchSearch && p.status === "active";
    if (activeTab === 3) return matchSearch && p.status === "out_of_stock";
    return matchSearch;
  });

  const toggleSelect = (id: string) =>
    setSelectedProducts((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleAll = () => {
    if (selectedProducts.length === filteredProducts.length) setSelectedProducts([]);
    else setSelectedProducts(filteredProducts.map((p) => p.id));
  };

  if (showForm) {
    return (
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setShowForm(false)} className="text-sm text-[#1565C0] hover:underline">← Quay lại</button>
          <span className="text-[#757575]">/</span>
          <h1 className="text-lg font-bold text-[#212121]">Thêm sản phẩm mới</h1>
        </div>

        <div className="flex flex-col xl:flex-row gap-5">
          {/* Main form */}
          <div className="flex-1 space-y-4">
            {/* Basic info */}
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
              <h3 className="font-semibold text-[#212121] mb-4">Thông tin cơ bản</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Tên sản phẩm *</label>
                  <input placeholder="Nhập tên sản phẩm..." className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#757575] mb-1 block">SKU *</label>
                    <input placeholder="VD: IP15PM-256" className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#757575] mb-1 block">Thương hiệu</label>
                    <select className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] bg-white">
                      <option>Chọn thương hiệu...</option>
                      {["Apple", "Samsung", "Sony", "Xiaomi"].map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Mô tả ngắn</label>
                  <textarea rows={2} placeholder="Mô tả ngắn gọn về sản phẩm..." className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] resize-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Mô tả chi tiết</label>
                  <div className="border border-[#E0E0E0] rounded-lg overflow-hidden">
                    <div className="bg-[#F5F6FA] px-3 py-2 border-b border-[#E0E0E0] flex gap-2">
                      {["B", "I", "U", "H1", "H2", "List", "Link"].map((t) => (
                        <button key={t} className="text-xs px-1.5 py-0.5 hover:bg-white rounded font-medium text-[#757575]">{t}</button>
                      ))}
                    </div>
                    <textarea rows={5} placeholder="Mô tả đầy đủ về sản phẩm..." className="w-full px-3 py-2.5 text-sm focus:outline-none resize-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
              <h3 className="font-semibold text-[#212121] mb-4">Hình ảnh sản phẩm</h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="border-2 border-dashed border-[#E0E0E0] rounded-xl aspect-square flex flex-col items-center justify-center hover:border-[#1565C0] cursor-pointer col-span-2 row-span-2">
                  <div className="text-3xl mb-2">📷</div>
                  <p className="text-xs text-[#757575] text-center">Kéo thả ảnh<br />hoặc click để tải lên</p>
                </div>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-2 border-dashed border-[#E0E0E0] rounded-xl aspect-square flex items-center justify-center hover:border-[#1565C0] cursor-pointer">
                    <span className="text-xl text-[#E0E0E0]">+</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Variants */}
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
              <h3 className="font-semibold text-[#212121] mb-4">Biến thể sản phẩm</h3>
              <div className="flex gap-2 mb-4">
                {["Màu sắc", "Dung lượng", "Kích thước"].map((opt) => (
                  <button key={opt} className="text-xs border border-[#E0E0E0] px-3 py-1.5 rounded-full hover:border-[#1565C0] hover:text-[#1565C0]">
                    + {opt}
                  </button>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#F5F6FA]">
                    <tr>
                      {["Biến thể", "SKU", "Giá bán", "Giá gốc", "Tồn kho", "Kích hoạt"].map((h) => (
                        <th key={h} className="text-left px-3 py-2 font-semibold text-[#757575]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F6FA]">
                    {["256GB - Titan Đen", "512GB - Titan Đen", "256GB - Titan Trắng"].map((variant) => (
                      <tr key={variant}>
                        <td className="px-3 py-2 font-medium">{variant}</td>
                        <td className="px-3 py-2"><input className="border border-[#E0E0E0] rounded px-2 py-1 w-24 focus:outline-none focus:border-[#1565C0]" placeholder="SKU" /></td>
                        <td className="px-3 py-2"><input className="border border-[#E0E0E0] rounded px-2 py-1 w-28 focus:outline-none focus:border-[#1565C0]" placeholder="0đ" /></td>
                        <td className="px-3 py-2"><input className="border border-[#E0E0E0] rounded px-2 py-1 w-28 focus:outline-none focus:border-[#1565C0]" placeholder="0đ" /></td>
                        <td className="px-3 py-2"><input type="number" className="border border-[#E0E0E0] rounded px-2 py-1 w-16 focus:outline-none focus:border-[#1565C0]" placeholder="0" /></td>
                        <td className="px-3 py-2">
                          <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#2E7D32]" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-full xl:w-72 space-y-4">
            {/* Publish */}
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
              <h3 className="font-semibold text-[#212121] mb-4">Xuất bản</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Trạng thái</label>
                  <select className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1565C0] bg-white">
                    <option>Nháp</option>
                    <option>Đang bán</option>
                    <option>Ngừng bán</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Ngày đăng</label>
                  <input type="datetime-local" className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1565C0]" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 border border-[#E0E0E0] py-2 rounded-lg text-sm hover:bg-gray-50">Lưu nháp</button>
                <button className="flex-1 bg-[#2563EB] text-white py-2 rounded-lg text-sm hover:bg-blue-700">Đăng</button>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
              <h3 className="font-semibold text-[#212121] mb-4">Giá bán</h3>
              <div className="space-y-3">
                {[
                  { label: "Giá bán *", placeholder: "0đ" },
                  { label: "Giá gốc", placeholder: "0đ" },
                  { label: "Giá vốn", placeholder: "0đ" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="text-xs font-medium text-[#757575] mb-1 block">{f.label}</label>
                    <input placeholder={f.placeholder} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1565C0]" />
                  </div>
                ))}
                <div className="flex justify-between text-xs pt-1">
                  <span className="text-[#757575]">Lợi nhuận</span>
                  <span className="font-semibold text-[#2E7D32]">—</span>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
              <h3 className="font-semibold text-[#212121] mb-3">Danh mục</h3>
              <div className="space-y-1.5">
                {["Điện tử", "Điện thoại", "Thời trang", "Nhà cửa"].map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer text-sm text-[#212121]">
                    <input type="checkbox" className="accent-[#1565C0]" />
                    {cat}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const columns = [
    {
      key: "product",
      header: "Sản phẩm",
      render: (product: any) => (
        <div className="flex items-center gap-3">
          <img src={product.image || null} alt={product.name} className="w-10 h-10 rounded-lg object-cover shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div>
            <p className="font-medium text-[#212121] text-xs line-clamp-1 max-w-40">{product.name}</p>
            <p className="text-[#757575] text-[11px]">{product.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Danh mục",
      render: (product: any) => <span className="text-[#757575] text-xs">{product.category}</span>,
    },
    {
      key: "brand",
      header: "Thương hiệu",
      render: (product: any) => <span className="text-xs font-medium text-[#757575]">{product.brand}</span>,
    },
    {
      key: "price",
      header: "Giá",
      render: (product: any) => (
        <div>
          <p className="font-semibold text-[#E53935] text-xs">{formatCurrency(product.price)}</p>
          {product.comparePrice && (
            <p className="text-[#757575] text-[11px] line-through">{formatCurrency(product.comparePrice)}</p>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Tồn kho",
      render: (product: any) => (
        <span className={`text-xs font-medium ${product.stock === 0 ? "text-[#E53935]" : product.stock! <= 10 ? "text-[#E65100]" : "text-[#2E7D32]"}`}>
          {product.stock === 0 ? "Hết hàng" : `${product.stock} sp`}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (product: any) => <OrderStatusBadge status={product.status} />,
    },
    {
      key: "featured",
      header: "Nổi bật",
      render: (product: any) => (
        <button className={`text-xl ${product.featured ? "text-amber-400" : "text-gray-200 hover:text-amber-200"}`}>
          ★
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Quản lý sản phẩm"
        subtitle={`Tổng ${products.length} sản phẩm`}
        actions={
          <>
            <button className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
              <Download size={14} /> Xuất
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <Plus size={14} /> Thêm sản phẩm
            </button>
          </>
        }
      />

      <ProductFilterSection
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm sản phẩm, SKU..."
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <TableDataTable
        data={filteredProducts}
        columns={columns}
        selectedIds={selectedProducts}
        onToggleSelect={toggleSelect}
        onToggleAll={toggleAll}
        idKey="id"
        renderRowActions={(product: any) => (
          <div className={`flex items-center gap-1 transition-opacity ${hoveredRow === product.id ? "opacity-100" : "opacity-0"}`}>
            {[Eye, Edit2, Copy, Trash2].map((Icon, i) => (
              <button
                key={i}
                className={`p-1.5 rounded-lg transition-colors ${Icon === Trash2 ? "hover:bg-red-50 text-[#E53935]" : "hover:bg-gray-100 text-[#757575] hover:text-[#212121]"}`}
              >
                <Icon size={13} />
              </button>
            ))}
          </div>
        )}
      />

      <div className="px-5 py-3 border-t border-[#E0E0E0] flex items-center justify-between text-sm text-[#757575]">
        <span>Hiển thị {filteredProducts.length} sản phẩm</span>
        <div className="flex gap-1">
          {["←", "1", "2", "→"].map((p) => (
            <button key={p} className={`w-8 h-8 flex items-center justify-center rounded-lg ${p === "1" ? "bg-[#2563EB] text-white" : "hover:bg-gray-100"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
