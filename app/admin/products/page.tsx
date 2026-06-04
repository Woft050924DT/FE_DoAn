'use client'

import { useState, useEffect, useCallback } from "react";
import { Plus, Download, Star, Eye, Edit2, Trash2, Package, Image as ImageIcon, X, RefreshCw, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { productService } from "@/services/productService";
import { adminBrandService, adminCategoryService } from "@/services/adminService";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { TableDataTable } from "@/components/Table/DataTable";
import type { Brand } from "@/services/types";
import type { Category } from "@/services/adminService";

const TABS = ["Tất cả", "Đang bán", "Nháp", "Hết hàng", "Ngừng bán"];
const STATUS_MAP_ADMIN: Record<number, string | undefined> = { 0: undefined, 1: "published", 2: "draft", 3: "out_of_stock", 4: "inactive" };
const formatCurrency = (amount: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const transformProduct = (apiProduct: any) => ({
  id: apiProduct.product_id,
  name: apiProduct.name,
  slug: apiProduct.slug,
  sku: apiProduct.sku,
  brand: apiProduct.brands?.name || "",
  category: apiProduct.categories?.name || "",
  price: apiProduct.price,
  comparePrice: apiProduct.compare_price,
  image: apiProduct.product_images?.find((img: any) => img.is_primary)?.image_url || apiProduct.product_images?.[0]?.image_url || "",
  rating: apiProduct.product_reviews?.length > 0
    ? (apiProduct.product_reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / apiProduct.product_reviews.length)
    : (Math.random() * 1 + 4).toFixed(1),
  stock: apiProduct.product_variants?.reduce((sum: number, v: any) => sum + v.stock_quantity, 0) || 0,
  featured: apiProduct.featured,
  bestSeller: apiProduct.best_seller,
  newArrival: apiProduct.new_arrival,
  status: apiProduct.status,
  raw: apiProduct,
});

const STATUS_COLORS: Record<string, { label: string; cls: string }> = {
  published: { label: "Đang bán", cls: "bg-green-100 text-green-700" },
  draft: { label: "Nháp", cls: "bg-gray-100 text-gray-700" },
  out_of_stock: { label: "Hết hàng", cls: "bg-red-100 text-red-700" },
  inactive: { label: "Ngừng bán", cls: "bg-amber-100 text-amber-700" },
};

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  // Drawer state
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "add" | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "", sku: "", short_description: "", description: "",
    price: "", compare_price: "", cost_price: "",
    category_id: "", brand_id: "",
    status: "draft",
    featured: false, best_seller: false, new_arrival: false,
    weight: "", dimensions: "",
    meta_title: "", meta_description: "", meta_keywords: "",
  });

  // Variants state
  const [variants, setVariants] = useState<any[]>([]);
  const [newVariant, setNewVariant] = useState({ name: "", option1_name: "Màu", option1_value: "", option2_name: "Size", option2_value: "", price: "", compare_price: "", cost_price: "", stock_quantity: "" });
  const [variantsExpanded, setVariantsExpanded] = useState(true);

  // Filters
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getAdminProducts({
        status: STATUS_MAP_ADMIN[activeTab],
        q: search || undefined,
        page,
        limit: LIMIT,
      });
      setProducts((data.products || data.data || []).map(transformProduct));
      if (data.pagination) {
        setTotal(data.pagination.total);
      }
    } catch (err) {
      // fallback to public API
      try {
        const data = await productService.getProducts({ q: search || undefined, limit: 100 });
        setProducts((data.products || []).map(transformProduct));
      } catch {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    adminBrandService.getList({ limit: 100 }).then(r => setBrands(r.data)).catch(() => {});
    adminCategoryService.getList({ limit: 100 }).then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const openAdd = () => {
    setFormData({ name: "", sku: "", short_description: "", description: "", price: "", compare_price: "", cost_price: "", category_id: "", brand_id: "", status: "draft", featured: false, best_seller: false, new_arrival: false, weight: "", dimensions: "", meta_title: "", meta_description: "", meta_keywords: "" });
    setVariants([]);
    setSelectedProduct(null);
    setDrawerMode("add");
  };

  const openEdit = (product: any) => {
    const p = product?.raw || product;
    if (!p) return;
    setFormData({
      name: p.name || "", sku: p.sku || "", short_description: p.short_description || "",
      description: p.description || "",
      price: String(p.price || ""), compare_price: String(p.compare_price || ""), cost_price: String(p.cost_price || ""),
      category_id: p.category_id || p.categories?.category_id || "",
      brand_id: p.brand_id || p.brands?.brand_id || "",
      status: p.status || "draft",
      featured: p.featured || false, best_seller: p.best_seller || false, new_arrival: p.new_arrival || false,
      weight: String(p.weight || ""), dimensions: p.dimensions || "",
      meta_title: p.meta_title || "", meta_description: p.meta_description || "", meta_keywords: p.meta_keywords || "",
    });
    setVariants(p.product_variants || []);
    setSelectedProduct(product);
    setDrawerMode("edit");
  };

  const openView = async (product: any) => {
    setSelectedProduct(product);
    setDrawerMode("view");
    try {
      const full = await productService.getProductById(product.id);
      setSelectedProduct(transformProduct(full));
      setVariants(full.product_variants || []);
    } catch { /* use existing */ }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.sku) return;
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        short_description: formData.short_description,
        description: formData.description,
        price: Number(formData.price),
        compare_price: formData.compare_price ? Number(formData.compare_price) : undefined,
        cost_price: formData.cost_price ? Number(formData.cost_price) : undefined,
        category_id: formData.category_id || undefined,
        brand_id: formData.brand_id || undefined,
        status: formData.status,
        featured: formData.featured,
        best_seller: formData.best_seller,
        new_arrival: formData.new_arrival,
        weight: formData.weight ? Number(formData.weight) : undefined,
        dimensions: formData.dimensions || undefined,
        meta_title: formData.meta_title || undefined,
        meta_description: formData.meta_description || undefined,
        meta_keywords: formData.meta_keywords || undefined,
      };
      if (drawerMode === "add") {
        await productService.createProduct(payload as any);
      } else {
        await productService.updateProduct(selectedProduct!.id, payload as any);
      }
      setDrawerMode(null);
      setSelectedProduct(null);
      fetchProducts();
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    try {
      await productService.deleteProduct(productId);
      fetchProducts();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleAddVariant = async () => {
    if (!selectedProduct || !newVariant.name || !newVariant.price) return;
    setSaving(true);
    try {
      const variant = await productService.createVariant(selectedProduct.id, {
        name: newVariant.name,
        option1_name: newVariant.option1_name,
        option1_value: newVariant.option1_value,
        option2_name: newVariant.option2_name,
        option2_value: newVariant.option2_value,
        price: Number(newVariant.price),
        compare_price: newVariant.compare_price ? Number(newVariant.compare_price) : undefined,
        cost_price: newVariant.cost_price ? Number(newVariant.cost_price) : undefined,
        stock_quantity: Number(newVariant.stock_quantity) || 0,
      });
      setVariants(prev => [...prev, variant]);
      setNewVariant({ name: "", option1_name: "Màu", option1_value: "", option2_name: "Size", option2_value: "", price: "", compare_price: "", cost_price: "", stock_quantity: "" });
    } catch (err) {
      console.error("Add variant failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm("Xóa biến thể này?")) return;
    setVariants(prev => prev.filter(v => v.variant_id !== variantId));
  };

  const toggleSelect = (id: string) =>
    setSelectedProducts((prev) => prev.includes(id) ? prev.filter((x) => id !== x) : [...prev, id]);
  const toggleAll = () => {
    if (selectedProducts.length === products.length) setSelectedProducts([]);
    else setSelectedProducts(products.map((p) => p.id));
  };

  const columns = [
    { key: "product", header: "Sản phẩm", render: (p: any) => (
        <div className="flex items-center gap-3">
          {p.image ? (
            <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
              <ImageIcon size={16} className="text-gray-300" />
            </div>
          )}
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
    { key: "status", header: "Trạng thái", render: (p: any) => {
      const s = STATUS_COLORS[p.status] || { label: p.status, cls: "bg-gray-100 text-gray-700" };
      return <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.cls}`}>{s.label}</span>;
    }},
    { key: "featured", header: "Nổi bật", render: (p: any) => (
        <span className={`text-lg ${p.featured ? "text-amber-400" : "text-gray-200"}`}>★</span>
      )},
  ];

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Quản lý sản phẩm"
        subtitle={`Tổng ${total} sản phẩm`}
        actions={
          <>
            <button className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50"><Download size={14} /> Xuất</button>
            <button onClick={openAdd} className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus size={14} /> Thêm sản phẩm</button>
          </>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-[#E0E0E0] p-4">
        <div className="flex gap-3 flex-wrap items-center mb-3">
          <div className="relative flex-1 min-w-48">
            <Eye size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Tìm sản phẩm, SKU..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-4 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:border-[#1565C0]"
            />
          </div>
          <select
            onChange={(e) => { /* filter by brand */ }}
            className="border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1565C0] bg-white"
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.name}</option>)}
          </select>
          <select
            onChange={(e) => { /* filter by category */ }}
            className="border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1565C0] bg-white"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => { setActiveTab(i); setPage(1); }} className={`px-4 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${activeTab === i ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-100"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <TableDataTable
        data={products}
        columns={columns}
        selectedIds={selectedProducts}
        onToggleSelect={toggleSelect}
        onToggleAll={toggleAll}
        idKey="id"
        onRowHover={setHoveredRow}
        renderRowActions={(p: any) => (
          <div className={`flex items-center gap-1 transition-opacity ${hoveredRow === p.id ? "opacity-100" : "opacity-0"}`}>
            <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]" title="Sửa"><Edit2 size={13} /></button>
            <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#E53935]" title="Xóa"><Trash2 size={13} /></button>
          </div>
        )}
      />

      <div className="px-5 py-3 border-t border-[#E0E0E0] flex items-center justify-between text-sm text-[#757575]">
        <span>Hiển thị {products.length}/{total} sản phẩm</span>
        <div className="flex gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-50">←</button>
          <button onClick={() => setPage(p => p + 1)} disabled={products.length < LIMIT} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-50">→</button>
        </div>
      </div>

      {/* Product Detail/Edit Drawer */}
      {drawerMode && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => { setDrawerMode(null); setSelectedProduct(null); }} />
          <div className="relative bg-white h-full overflow-y-auto shadow-2xl flex flex-col overflow-x-hidden"
            style={{ width: "min(672px, 100vw)" }}>
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0] shrink-0">
              <div>
                <h3 className="font-bold text-[#212121]">
                  {drawerMode === "add" ? "Thêm sản phẩm mới" : drawerMode === "edit" ? `Sửa: ${selectedProduct?.name || ""}` : selectedProduct?.name}
                </h3>
                {drawerMode !== "add" && selectedProduct?.sku && <p className="text-xs text-[#757575] mt-0.5">SKU: {selectedProduct.sku}</p>}
              </div>
              <div className="flex items-center gap-2">
                {drawerMode === "view" && (
                  <button onClick={() => openEdit(selectedProduct!)} className="flex items-center gap-1.5 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    <Edit2 size={13} /> Sửa
                  </button>
                )}
                {drawerMode !== "view" && (
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                    {saving ? <RefreshCw size={13} className="animate-spin" /> : null}
                    {saving ? "Đang lưu..." : "Lưu"}
                  </button>
                )}
                <button onClick={() => { setDrawerMode(null); setSelectedProduct(null); }} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-5 min-w-0 overflow-x-hidden">
              {drawerMode === "view" ? (
                /* VIEW MODE */
                <div />
              ) : (
                /* EDIT / ADD MODE */
                <>
                  {/* Basic Info */}
                  <div className="bg-white rounded-xl border border-[#E0E0E0] p-5 space-y-4">
                    <h4 className="font-semibold text-[#212121]">Thông tin cơ bản</h4>
                    <div>
                      <label className="text-xs font-medium text-[#757575] mb-1 block">Tên sản phẩm *</label>
                      <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nhập tên sản phẩm..." className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-[#757575] mb-1 block">SKU *</label>
                        <input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="VD: IP15PM-256" className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#757575] mb-1 block">Danh mục</label>
                        <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] bg-white">
                          <option value="">Chọn danh mục...</option>
                          {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#757575] mb-1 block">Mô tả ngắn</label>
                      <textarea value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} rows={2} placeholder="Mô tả ngắn về sản phẩm..." className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] resize-none" />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-white rounded-xl border border-[#E0E0E0] p-5 space-y-4">
                    <h4 className="font-semibold text-[#212121]">Giá & Kho hàng</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-[#757575] mb-1 block">Giá bán *</label>
                        <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0" className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#757575] mb-1 block">Giá gốc</label>
                        <input type="number" value={formData.compare_price} onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })} placeholder="0" className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#757575] mb-1 block">Giá vốn</label>
                        <input type="number" value={formData.cost_price} onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })} placeholder="0" className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
                      </div>
                    </div>
                  </div>

                  {/* Status & Flags */}
                  <div className="bg-white rounded-xl border border-[#E0E0E0] p-5 space-y-4">
                    <h4 className="font-semibold text-[#212121]">Trạng thái & Phân loại</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-[#757575] mb-1 block">Trạng thái</label>
                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] bg-white">
                          <option value="draft">Nháp</option>
                          <option value="published">Đang bán</option>
                          <option value="out_of_stock">Hết hàng</option>
                          <option value="inactive">Ngừng bán</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#757575] mb-1 block">Thương hiệu</label>
                        <select value={formData.brand_id} onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] bg-white">
                          <option value="">Chọn thương hiệu...</option>
                          {brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {[
                        { key: "featured", label: "Nổi bật" },
                        { key: "best_seller", label: "Bán chạy" },
                        { key: "new_arrival", label: "Hàng mới" },
                      ].map(item => (
                        <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(formData as any)[item.key]}
                            onChange={(e) => setFormData((prev: any) => ({ ...prev, [item.key]: e.target.checked }))}
                            className="accent-[#1565C0] w-4 h-4"
                          />
                          <span className="text-sm text-[#212121]">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Variants */}
                  {drawerMode === "edit" && (
                    <div className="bg-white rounded-xl border border-[#E0E0E0] p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-[#212121]">Biến thể ({variants.length})</h4>
                        <button onClick={() => setVariantsExpanded(!variantsExpanded)} className="p-1 hover:bg-gray-100 rounded">
                          {variantsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                      {variantsExpanded && (
                        <>
                          {variants.length > 0 && (
                            <div className="space-y-2">
                              {variants.map((v: any) => (
                                <div key={v.variant_id} className="flex items-center gap-3 p-3 bg-[#F5F6FA] rounded-lg">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#212121] truncate">{v.name}</p>
                                    <p className="text-xs text-[#757575] truncate">{v.option1_value || ""}{v.option2_value ? ` / ${v.option2_value}` : ""}</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-sm font-semibold text-[#E53935]">{formatCurrency(v.price)}</p>
                                    <p className={`text-xs ${v.stock_quantity > 0 ? "text-[#2E7D32]" : "text-[#E53935]"}`}>{v.stock_quantity} sp</p>
                                  </div>
                                  <button onClick={() => handleDeleteVariant(v.variant_id)} className="p-1.5 hover:bg-red-50 text-[#E53935] rounded"><Trash2 size={13} /></button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="border border-dashed border-[#E0E0E0] rounded-lg p-3 space-y-2">
                            <p className="text-xs font-semibold text-[#757575]">Thêm biến thể</p>
                            <div className="grid grid-cols-4 gap-2">
                              <input value={newVariant.option1_value} onChange={(e) => setNewVariant({ ...newVariant, option1_value: e.target.value, name: `${newVariant.option1_value}${newVariant.option2_value ? ` / ${newVariant.option2_value}` : ""}` })} placeholder="Màu (VD: Đỏ)" className="border border-[#E0E0E0] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#1565C0]" />
                              <input value={newVariant.option2_value} onChange={(e) => setNewVariant({ ...newVariant, option2_value: e.target.value, name: `${newVariant.option1_value}${e.target.value ? ` / ${e.target.value}` : ""}` })} placeholder="Size (VD: M)" className="border border-[#E0E0E0] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#1565C0]" />
                              <input type="number" value={newVariant.price} onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })} placeholder="Giá" className="border border-[#E0E0E0] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#1565C0]" />
                              <input type="number" value={newVariant.stock_quantity} onChange={(e) => setNewVariant({ ...newVariant, stock_quantity: e.target.value })} placeholder="Tồn kho" className="border border-[#E0E0E0] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#1565C0]" />
                            </div>
                            <button onClick={handleAddVariant} disabled={!newVariant.option1_value || !newVariant.price || saving} className="w-full bg-[#2563EB] text-white py-2 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
                              + Thêm biến thể
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
