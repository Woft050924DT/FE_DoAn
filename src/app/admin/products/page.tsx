import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { Plus, Download, Star, Eye, Edit2, Copy, Trash2, Package } from "lucide-react";
import { productService, catalogService } from '../../../services';
import type { Brand, Category, CreateProductRequest } from '../../../services/types';
import { OrderStatusBadge } from '../../../components/Order/StatusBadge';
import { UIPageHeader } from '../../../components/UI/PageHeader';
import { UIBusinessFlowSteps } from '../../../components/UI/BusinessFlowSteps';
import { ProductFilterSection } from '../../../components/Product/FilterSection';
import { TableDataTable } from '../../../components/Table/DataTable';
import { ImagePicker } from '../../../components/Media/ImagePicker';
import { toNumber } from '../../../utils/apiMappers';
import { UITablePagination } from '../../../components/UI/TablePagination';


const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const parseMoney = (value: string) => Number(value.replace(/[^\d]/g, "")) || 0;

const STATUS_OPTIONS = [
  { label: "Nháp", value: "draft" },
  { label: "Đang bán", value: "published" },
  { label: "Ngừng bán", value: "archived" },
] as const;

const TABS = ["Tất cả", "Đang bán", "Nháp", "Hết hàng", "Ngừng bán"];

const transformProduct = (apiProduct: any) => ({
  id: apiProduct.product_id,
  name: apiProduct.name,
  brand: apiProduct.brands?.name || "",
  category: apiProduct.categories?.name || "",
  sku: apiProduct.sku,
  price: toNumber(apiProduct.price),
  comparePrice: toNumber(apiProduct.compare_price),
  image:
    apiProduct.product_images?.find((img: any) => img.is_primary)?.image_url ||
    apiProduct.product_images?.[0]?.image_url ||
    "",
  rating:
    apiProduct.product_reviews?.length > 0
      ? apiProduct.product_reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        apiProduct.product_reviews.length
      : 4.5,
  reviewCount: apiProduct.product_reviews?.length || 0,
  sold: apiProduct.view_count || 0,
  stock:
    apiProduct.product_variants?.reduce(
      (sum: number, v: any) => sum + (v.stock_quantity || 0),
      0
    ) || 0,
  featured: apiProduct.featured,
  status: apiProduct.status,
});

type ProductFormState = {
  name: string;
  sku: string;
  brand_id: string;
  category_id: string;
  short_description: string;
  description: string;
  price: string;
  compare_price: string;
  cost_price: string;
  status: NonNullable<CreateProductRequest["status"]>;
  image_urls: string[];
};

const emptyForm = (): ProductFormState => ({
  name: "",
  sku: "",
  brand_id: "",
  category_id: "",
  short_description: "",
  description: "",
  price: "",
  compare_price: "",
  cost_price: "",
  status: "draft",
  image_urls: [""],
});

export function ScreensAdminProducts() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [displayStock, setDisplayStock] = useState<number | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 6, total: 0, totalPages: 1 });
  const [txPagination, setTxPagination] = useState({ page: 1, limit: 6, total: 0, totalPages: 1 });
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts({ admin: true, limit: 100 });
      setProducts(data.products.map(transformProduct));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCatalog = useCallback(async () => {
    try {
      const [brandList, categoryList] = await Promise.all([
        catalogService.getBrands(),
        catalogService.getCategories(),
      ]);
      setBrands(brandList);
      setCategories(categoryList);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (showForm) loadCatalog();
  }, [showForm, loadCatalog]);

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (activeTab === 0) return true;
    if (activeTab === 1) return p.status === "published";
    if (activeTab === 2) return p.status === "draft";
    if (activeTab === 3) return p.stock === 0;
    if (activeTab === 4) return p.status === "archived";
    return true;
  });
  const totalPages = Math.ceil(filteredProducts.length / pagination.limit);

  const paginatedProducts = filteredProducts.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  const updateForm = (field: keyof Omit<ProductFormState, "image_urls">, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateImageUrl = (index: number, url: string) => {
    setForm((prev) => {
      const image_urls = [...prev.image_urls];
      image_urls[index] = url;
      return { ...prev, image_urls };
    });
  };

  const addImageRow = () => {
    setForm((prev) => ({ ...prev, image_urls: [...prev.image_urls, ""] }));
  };

  const removeImageRow = (index: number) => {
    setForm((prev) => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (publish = false) => {
    setFormError("");
    if (!form.name.trim()) {
      setFormError("Vui lòng nhập tên sản phẩm");
      return;
    }
    if (!form.sku.trim()) {
      setFormError("Vui lòng nhập SKU");
      return;
    }
    const price = parseMoney(form.price);
    const costPrice = parseMoney(form.cost_price);
    if (price <= 0) {
      setFormError("Giá bán phải lớn hơn 0");
      return;
    }
    if (costPrice > 0 && price < costPrice) {
      setFormError("Giá bán không được thấp hơn giá nhập");
      return;
    }
    if (publish && !editingId) {
      setFormError("Chưa nhập kho — lưu nháp, vào Kho hàng nhập hàng rồi mới đăng bán.");
      return;
    }
    if (publish && editingId && (displayStock ?? 0) <= 0) {
      setFormError("Sản phẩm chưa có tồn kho. Vào Kho hàng → Nhập hàng trước khi đăng bán.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateProductRequest = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        price,
        compare_price: parseMoney(form.compare_price) || undefined,
        cost_price: parseMoney(form.cost_price) || undefined,
        short_description: form.short_description.trim() || undefined,
        description: form.description.trim() || undefined,
        brand_id: form.brand_id || undefined,
        category_id: form.category_id || undefined,
        status: publish ? "published" : form.status,
        image_urls: form.image_urls.map((u) => u.trim()).filter(Boolean),
      };

      if (editingId) {
        await productService.updateProduct(editingId, payload);
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm());
        setDisplayStock(null);
      } else {
        await productService.createProduct({ ...payload, status: "draft" });
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm());
        setDisplayStock(null);
        await loadProducts();
        navigate("/admin/inventory");
        return;
      }
      await loadProducts();
    } catch (err: any) {
      setFormError(
        err.response?.data?.error ||
          (editingId
            ? "Không thể cập nhật sản phẩm. Vui lòng đăng nhập admin và thử lại."
            : "Không thể tạo sản phẩm. Vui lòng đăng nhập admin và thử lại.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDisplayStock(0);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = async (productId: string) => {
    try {
      const p = await productService.getProductById(productId);
      const variant = p.product_variants?.[0];
      const images = (p.product_images || [])
        .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((img: any) => img.image_url)
        .filter(Boolean);
      setEditingId(productId);
      setDisplayStock(
        p.product_variants?.reduce((sum: number, v: any) => sum + (v.stock_quantity || 0), 0) ?? 0
      );
      setForm({
        name: p.name,
        sku: p.sku,
        brand_id: p.brands?.brand_id || "",
        category_id: p.categories?.category_id || "",
        short_description: p.short_description || "",
        description: p.description || "",
        price: String(toNumber(p.price)),
        compare_price: p.compare_price ? String(toNumber(p.compare_price)) : "",
        cost_price: p.cost_price ? String(toNumber(p.cost_price)) : "",
        status: (p.status as ProductFormState["status"]) || "draft",
        image_urls: images.length > 0 ? images : [""],
      });
      setFormError("");
      setShowForm(true);
      loadCatalog();
    } catch (err) {
      console.error(err);
      alert("Không thể tải sản phẩm để sửa");
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (
      !window.confirm(
        `Xóa sản phẩm "${productName}"?\n\n• Nếu chưa có trong đơn hàng: xóa vĩnh viễn.\n• Nếu đã có đơn: chuyển sang "Ngừng bán".`
      )
    ) {
      return;
    }
    try {
      const result = await productService.deleteProduct(productId);
      if (result.deleted) {
        alert("Đã xóa sản phẩm thành công.");
        setSelectedProducts((prev) => prev.filter((id) => id !== productId));
      } else if (result.archived) {
        alert("Sản phẩm đã có trong đơn hàng — đã chuyển sang Ngừng bán (không xóa hẳn).");
        setActiveTab(4);
      }
      await loadProducts();
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401) {
        alert("Vui lòng đăng nhập tài khoản admin để xóa sản phẩm.");
      } else {
        alert(err.response?.data?.error || "Không thể xóa sản phẩm. Kiểm tra quyền admin và server BE.");
      }
    }
  };

  const toggleSelect = (id: string) =>
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleAll = () => {
    if (selectedProducts.length === filteredProducts.length) setSelectedProducts([]);
    else setSelectedProducts(filteredProducts.map((p) => p.id));
  };

  if (showForm) {
    return (
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => {
              setShowForm(false);
              setEditingId(null);
              setForm(emptyForm());
              setFormError("");
            }}
            className="text-sm text-[#1565C0] hover:underline"
          >
            ← Quay lại
          </button>
          <span className="text-[#757575]">/</span>
          <h1 className="text-lg font-bold text-[#212121]">
            {editingId ? "Sửa sản phẩm" : "Tạo sản phẩm"}
          </h1>
        </div>

        <UIBusinessFlowSteps current={editingId && (displayStock ?? 0) > 0 ? 3 : 1} />

        <div className="flex flex-col xl:flex-row gap-5">
          <div className="flex-1 space-y-4">
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
              <h3 className="font-semibold text-[#212121] mb-4">Thông tin cơ bản</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Tên sản phẩm *</label>
                  <input
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    placeholder="VD: Citizen Eco-Drive BM8180"
                    className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#757575] mb-1 block">SKU *</label>
                    <input
                      value={form.sku}
                      onChange={(e) => updateForm("sku", e.target.value.toUpperCase())}
                      placeholder="VD: CITIZEN-BM8180"
                      className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#757575] mb-1 block">Thương hiệu</label>
                    <select
                      value={form.brand_id}
                      onChange={(e) => updateForm("brand_id", e.target.value)}
                      className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] bg-white"
                    >
                      <option value="">Chọn thương hiệu...</option>
                      {brands.map((b) => (
                        <option key={b.brand_id} value={b.brand_id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Mô tả ngắn</label>
                  <textarea
                    rows={2}
                    value={form.short_description}
                    onChange={(e) => updateForm("short_description", e.target.value)}
                    placeholder="Mô tả ngắn gọn về sản phẩm..."
                    className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Mô tả chi tiết</label>
                  <textarea
                    rows={5}
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    placeholder="Mô tả đầy đủ về sản phẩm..."
                    className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] resize-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-[#757575]">Ảnh sản phẩm (nhiều ảnh)</label>
                    <button type="button" onClick={addImageRow} className="text-xs text-[#1565C0] hover:underline">
                      + Thêm ảnh
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.image_urls.map((url, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <ImagePicker
                            label={index === 0 ? "Ảnh chính" : `Ảnh ${index + 1}`}
                            value={url}
                            onChange={(v) => updateImageUrl(index, v)}
                            placeholder="URL hoặc chọn từ uploads/"
                          />
                        </div>
                        {form.image_urls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageRow(index)}
                            className="mt-6 text-xs text-[#E53935] hover:underline shrink-0"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#757575] mt-1">
                    Ảnh đầu tiên là ảnh chính. Để trống tất cả sẽ dùng ảnh mặc định.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
              <h3 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                <Package size={16} className="text-[#1565C0]" />
                Tồn kho
              </h3>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-[#212121]">{displayStock ?? 0}</p>
                {(displayStock ?? 0) <= 0 ? (
                  <>
                    <p className="text-xs text-[#E65100] font-medium">
                      Chưa có tồn — cần nhập kho trước khi bán.
                    </p>
                    <Link
                      to="/admin/inventory"
                      className="inline-flex text-sm text-[#1565C0] hover:underline font-medium"
                    >
                    </Link>
                  </>
                ) : (
                  <p className="text-xs text-[#2E7D32]">
                    Bước 3 hoàn tất — có thể bán trên shop (nếu đang đăng bán).
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="w-full xl:w-72 space-y-4">
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
              <h3 className="font-semibold text-[#212121] mb-4">Xuất bản</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Trạng thái</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      updateForm("status", e.target.value as ProductFormState["status"])
                    }
                    className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1565C0] bg-white"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {formError && <p className="text-sm text-[#E53935] mt-3">{formError}</p>}
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit(false)}
                  className="flex-1 border border-[#E0E0E0] py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-60"
                >
                  {submitting ? "Đang lưu..." : "Lưu nháp"}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit(true)}
                  className="flex-1 bg-[#2563EB] text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {submitting ? "Đang đăng..." : "Đăng bán"}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
              <h3 className="font-semibold text-[#212121] mb-4">Giá bán</h3>
              <div className="space-y-3">
                {[
                  { key: "cost_price" as const, label: "Giá nhập", placeholder: "3200000" },
                  { key: "price" as const, label: "Giá bán *", placeholder: "4590000" },
                  { key: "compare_price" as const, label: "Giá gốc", placeholder: "5290000" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs font-medium text-[#757575] mb-1 block">{f.label}</label>
                    <input
                      value={form[f.key]}
                      onChange={(e) => updateForm(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1565C0]"
                    />
                  </div>
                ))}
                <p className="text-xs text-[#757575]">Giá bán phải lớn hơn hoặc bằng giá nhập.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
              <h3 className="font-semibold text-[#212121] mb-3">Danh mục</h3>
              <select
                value={form.category_id}
                onChange={(e) => updateForm("category_id", e.target.value)}
                className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1565C0] bg-white"
              >
                <option value="">Chọn danh mục...</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.name}
                  </option>
                ))}
              </select>
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
          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
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
          {product.comparePrice > 0 && (
            <p className="text-[#757575] text-[11px] line-through">{formatCurrency(product.comparePrice)}</p>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Tồn kho",
      render: (product: any) => (
        <span
          className={`text-xs font-medium ${
            product.stock === 0 ? "text-[#E53935]" : product.stock <= 10 ? "text-[#E65100]" : "text-[#2E7D32]"
          }`}
        >
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
        <button className={`text-xl ${product.featured ? "text-amber-400" : "text-gray-200"}`}>★</button>
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
            <Link
              to="/admin/inventory"
              className="flex items-center gap-2 border border-[#2E7D32] text-[#2E7D32] px-3 py-2 rounded-lg text-sm hover:bg-green-50"
            >
              <Package size={14} /> Nhập kho
            </Link>
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <Plus size={14} /> Tạo sản phẩm
            </button>
          </>
        }
      />

      <UIBusinessFlowSteps current={1} />

      <ProductFilterSection
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm sản phẩm, SKU..."
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1565C0]" />
        </div>
      ) : (
        <TableDataTable
          data={paginatedProducts}
          columns={columns}
          selectedIds={selectedProducts}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
          idKey="id"
          renderRowActions={(product: any) => (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => window.open(`/products/${product.id}`, "_blank")}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"
                title="Xem"
              >
                <Eye size={13} />
              </button>
              <button
                type="button"
                onClick={() => openEdit(product.id)}
                className="p-1.5 rounded-lg hover:bg-[#E3F2FD] text-[#1565C0]"
                title="Sửa"
              >
                <Edit2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(product.id, product.name)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-[#E53935]"
                title="Xóa"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        />
      )}

      <UITablePagination
      page={pagination.page}
      totalPages={totalPages}
      total={filteredProducts.length}
      limit={pagination.limit}
      itemLabel="sản phẩm"
      onPageChange={(page) =>
      setPagination((prev) => ({
      ...prev,
      page,
    }))
  }
/>
    </div>
  );
}
