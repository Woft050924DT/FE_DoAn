'use client'

import { useState, useEffect } from "react";
import { Plus, Download, Star, Eye, Edit2, Copy, Trash2 } from "lucide-react";
import { productService } from "@/services";
import { OrderStatusBadge } from "@/components/Order/StatusBadge";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { ProductFilterSection } from "@/components/Product/FilterSection";
import { TableDataTable } from "@/components/Table/DataTable";

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
  rating: apiProduct.product_reviews?.length > 0 ? apiProduct.product_reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / apiProduct.product_reviews.length : 4.5,
  stock: apiProduct.product_variants?.reduce((sum: number, v: any) => sum + v.stock_quantity, 0) || 0,
  featured: apiProduct.featured,
  status: apiProduct.status,
});

const TABS = ["Tất cả", "Đang bán", "Nháp", "Hết hàng", "Ngừng bán"];

export default function AdminProductsPage() {
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
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
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
          <div className="flex-1 space-y-4">
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
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Mô tả chi tiết</label>
                  <textarea rows={4} placeholder="Mô tả đầy đủ về sản phẩm..." className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] resize-none" />
                </div>
              </div>
            </div>
          </div>
          <div className="w-full xl:w-72 space-y-4">
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
              <h3 className="font-semibold text-[#212121] mb-4">Xuất bản</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Trạng thái</label>
                  <select className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1565C0] bg-white">
                    <option>Nháp</option><option>Đang bán</option><option>Ngừng bán</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 border border-[#E0E0E0] py-2 rounded-lg text-sm hover:bg-gray-50">Lưu nháp</button>
                <button className="flex-1 bg-[#2563EB] text-white py-2 rounded-lg text-sm hover:bg-blue-700">Đăng</button>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
              <h3 className="font-semibold text-[#212121] mb-4">Giá bán</h3>
              <div className="space-y-3">
                {[{ label: "Giá bán *", placeholder: "0đ" }, { label: "Giá gốc", placeholder: "0đ" }].map((f) => (
                  <div key={f.label}>
                    <label className="text-xs font-medium text-[#757575] mb-1 block">{f.label}</label>
                    <input placeholder={f.placeholder} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1565C0]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const columns = [
    { key: "product", header: "Sản phẩm", render: (p: any) => (
        <div className="flex items-center gap-3">
          <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
          <div><p className="font-medium text-[#212121] text-xs line-clamp-1 max-w-40">{p.name}</p><p className="text-[#757575] text-[11px]">{p.sku}</p></div>
        </div>
      )},
    { key: "category", header: "Danh mục", render: (p: any) => <span className="text-[#757575] text-xs">{p.category}</span> },
    { key: "brand", header: "Thương hiệu", render: (p: any) => <span className="text-xs font-medium text-[#757575]">{p.brand}</span> },
    { key: "price", header: "Giá", render: (p: any) => (
        <div>
          <p className="font-semibold text-[#E53935] text-xs">{formatCurrency(p.price)}</p>
          {p.comparePrice && <p className="text-[#757575] text-[11px] line-through">{formatCurrency(p.comparePrice)}</p>}
        </div>
      )},
    { key: "stock", header: "Tồn kho", render: (p: any) => (
        <span className={`text-xs font-medium ${p.stock === 0 ? "text-[#E53935]" : p.stock <= 10 ? "text-[#E65100]" : "text-[#2E7D32]"}`}>
          {p.stock === 0 ? "Hết hàng" : `${p.stock} sp`}
        </span>
      )},
    { key: "status", header: "Trạng thái", render: (p: any) => <OrderStatusBadge status={p.status} /> },
    { key: "featured", header: "Nổi bật", render: (p: any) => (
        <button className={`text-xl ${p.featured ? "text-amber-400" : "text-gray-200 hover:text-amber-200"}`}>★</button>
      )},
  ];

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Quản lý sản phẩm"
        subtitle={`Tổng ${products.length} sản phẩm`}
        actions={
          <>
            <button className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50"><Download size={14} /> Xuất</button>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus size={14} /> Thêm sản phẩm</button>
          </>
        }
      />
      <ProductFilterSection search={search} onSearchChange={setSearch} searchPlaceholder="Tìm sản phẩm, SKU..." tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <TableDataTable
        data={filteredProducts}
        columns={columns}
        selectedIds={selectedProducts}
        onToggleSelect={toggleSelect}
        onToggleAll={toggleAll}
        idKey="id"
        renderRowActions={(p: any) => (
          <div className={`flex items-center gap-1 transition-opacity ${hoveredRow === p.id ? "opacity-100" : "opacity-0"}`}>
            {[Eye, Edit2, Copy, Trash2].map((Icon, i) => (
              <button key={i} className={`p-1.5 rounded-lg transition-colors ${Icon === Trash2 ? "hover:bg-red-50 text-[#E53935]" : "hover:bg-gray-100 text-[#757575]"}`}><Icon size={13} /></button>
            ))}
          </div>
        )}
      />
    </div>
  );
}
