import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { catalogService } from "../../services";
import type { Brand, CreateBrandRequest } from "../../services/types";
import { UIPageHeader } from "../../components/UI/PageHeader";
import { ProductFilterSection } from "../../components/Product/FilterSection";
import { TableDataTable } from "../../components/Table/DataTable";
import { ImagePicker } from "../../components/Media/ImagePicker";

type BrandFormState = {
  name: string;
  slug: string;
  logo_url: string;
  description: string;
  website: string;
  is_active: boolean;
};

const emptyForm = (): BrandFormState => ({
  name: "",
  slug: "",
  logo_url: "",
  description: "",
  website: "",
  is_active: true,
});

export function ScreensAdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BrandFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await catalogService.getBrandsAdmin();
      setBrands(data);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách thương hiệu. Vui lòng đăng nhập admin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  const filtered = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.slug.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (brand: Brand) => {
    setEditingId(brand.brand_id);
    setForm({
      name: brand.name,
      slug: brand.slug,
      logo_url: brand.logo_url || "",
      description: brand.description || "",
      website: brand.website || "",
      is_active: brand.is_active !== false,
    });
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Vui lòng nhập tên thương hiệu");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const payload: CreateBrandRequest = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        logo_url: form.logo_url.trim() || undefined,
        description: form.description.trim() || undefined,
        website: form.website.trim() || undefined,
        is_active: form.is_active,
      };
      if (editingId) {
        await catalogService.updateBrand(editingId, payload);
      } else {
        await catalogService.createBrand(payload);
      }
      setShowForm(false);
      await loadBrands();
    } catch (err: any) {
      setFormError(err.response?.data?.error || "Không thể lưu thương hiệu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (brand: Brand) => {
    const productCount = brand._count?.products ?? 0;
    const msg =
      productCount > 0
        ? `Thương hiệu "${brand.name}" đang có ${productCount} sản phẩm. Hệ thống sẽ ẩn (ngừng hoạt động) thay vì xóa. Tiếp tục?`
        : `Xóa thương hiệu "${brand.name}"?`;
    if (!window.confirm(msg)) return;
    try {
      await catalogService.deleteBrand(brand.brand_id);
      await loadBrands();
    } catch (err: any) {
      alert(err.response?.data?.error || "Không thể xóa thương hiệu");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Thương hiệu",
      render: (row: Brand) => (
        <div className="flex items-center gap-3">
          {row.logo_url ? (
            <img src={row.logo_url} alt="" className="w-8 h-8 rounded object-contain bg-gray-50" />
          ) : (
            <div className="w-8 h-8 rounded bg-[#E3F2FD] flex items-center justify-center text-[#1565C0] text-xs font-bold">
              {row.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium text-[#212121]">{row.name}</p>
            <p className="text-xs text-[#757575]">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "website",
      header: "Website",
      render: (row: Brand) =>
        row.website ? (
          <a href={row.website} target="_blank" rel="noreferrer" className="text-sm text-[#1565C0] hover:underline truncate max-w-[180px] block">
            {row.website}
          </a>
        ) : (
          <span className="text-[#BDBDBD]">—</span>
        ),
    },
    {
      key: "products",
      header: "Sản phẩm",
      render: (row: Brand) => (
        <span className="text-sm text-[#212121]">{row._count?.products ?? 0}</span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row: Brand) => (
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            row.is_active !== false ? "bg-green-100 text-[#2E7D32]" : "bg-gray-100 text-[#757575]"
          }`}
        >
          {row.is_active !== false ? "Hoạt động" : "Ẩn"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row: Brand) => (
        <div className="flex items-center gap-1 justify-end">
          <button
            type="button"
            onClick={() => openEdit(row)}
            className="p-1.5 rounded-lg hover:bg-[#E3F2FD] text-[#1565C0]"
            title="Sửa"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-[#E53935]"
            title="Xóa"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <UIPageHeader
        title="Thương hiệu"
        subtitle="Quản lý thương hiệu đồng hồ — dữ liệu lưu trên cơ sở dữ liệu"
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1D4ED8]"
          >
            <Plus size={16} />
            Thêm thương hiệu
          </button>
        }
      />

      <ProductFilterSection
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên hoặc slug..."
        tabs={["Tất cả"]}
        activeTab={0}
        onTabChange={() => {}}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-[#E0E0E0] p-12 text-center text-[#757575]">Đang tải...</div>
      ) : (
        <TableDataTable
          columns={columns}
          data={filtered.slice(0, 6)}
          selectedIds={selectedIds}
          onToggleSelect={(id) =>
            setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
          }
          onToggleAll={() =>
            setSelectedIds(
              selectedIds.length === filtered.length ? [] : filtered.map((b) => b.brand_id)
            )
          }
          idKey="brand_id"
          emptyMessage="Chưa có thương hiệu nào"
        />
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0]">
              <h3 className="font-semibold text-[#212121]">
                {editingId ? "Sửa thương hiệu" : "Thêm thương hiệu"}
              </h3>
              <button type="button" onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
              )}
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-1">Tên *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                  placeholder="VD: Casio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-1">Slug (tùy chọn)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                  placeholder="Tự tạo từ tên nếu để trống"
                />
              </div>
              <ImagePicker
                label="Logo"
                value={form.logo_url}
                onChange={(url) => setForm({ ...form, logo_url: url })}
                placeholder="URL hoặc chọn từ thư mục uploads/"
              />
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-1">Website</label>
                <input
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-1">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="accent-[#2563EB]"
                />
                <span className="text-sm text-[#212121]">Đang hoạt động</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#1D4ED8] disabled:opacity-60"
                >
                  {submitting ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo mới"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 border border-[#E0E0E0] rounded-lg text-sm text-[#757575] hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
