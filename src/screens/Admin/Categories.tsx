import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { catalogService } from "../../services";
import type { Category, CreateCategoryRequest } from "../../services/types";
import { UIPageHeader } from "../../components/UI/PageHeader";
import { ProductFilterSection } from "../../components/Product/FilterSection";
import { TableDataTable } from "../../components/Table/DataTable";

type CategoryFormState = {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  icon: string;
  display_order: string;
  parent_id: string;
  is_active: boolean;
};

const emptyForm = (): CategoryFormState => ({
  name: "",
  slug: "",
  description: "",
  image_url: "",
  icon: "",
  display_order: "0",
  parent_id: "",
  is_active: true,
});

export function ScreensAdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await catalogService.getCategoriesAdmin();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh mục. Vui lòng đăng nhập admin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.category_id, c.name])),
    [categories]
  );

  const parentOptions = useMemo(
    () => categories.filter((c) => c.category_id !== editingId),
    [categories, editingId]
  );

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (category: Category) => {
    setEditingId(category.category_id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image_url: category.image_url || "",
      icon: category.icon || "",
      display_order: String(category.display_order ?? 0),
      parent_id: category.parent_id || "",
      is_active: category.is_active !== false,
    });
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Vui lòng nhập tên danh mục");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const payload: CreateCategoryRequest = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim() || undefined,
        image_url: form.image_url.trim() || undefined,
        icon: form.icon.trim() || undefined,
        display_order: Number(form.display_order) || 0,
        parent_id: form.parent_id || null,
        is_active: form.is_active,
      };
      if (editingId) {
        await catalogService.updateCategory(editingId, payload);
      } else {
        await catalogService.createCategory(payload);
      }
      setShowForm(false);
      await loadCategories();
    } catch (err: any) {
      setFormError(err.response?.data?.error || "Không thể lưu danh mục");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category: Category) => {
    const productCount = category._count?.products ?? 0;
    const msg =
      productCount > 0
        ? `Danh mục "${category.name}" đang có ${productCount} sản phẩm. Hệ thống sẽ ẩn thay vì xóa. Tiếp tục?`
        : `Xóa danh mục "${category.name}"?`;
    if (!window.confirm(msg)) return;
    try {
      await catalogService.deleteCategory(category.category_id);
      await loadCategories();
    } catch (err: any) {
      alert(err.response?.data?.error || "Không thể xóa danh mục");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Danh mục",
      render: (row: Category) => (
        <div>
          <p className="font-medium text-[#212121]">{row.name}</p>
          <p className="text-xs text-[#757575]">{row.slug}</p>
        </div>
      ),
    },
    {
      key: "parent",
      header: "Danh mục cha",
      render: (row: Category) => (
        <span className="text-sm text-[#212121]">
          {row.parent_id ? categoryMap.get(row.parent_id) || "—" : "—"}
        </span>
      ),
    },
    {
      key: "order",
      header: "Thứ tự",
      render: (row: Category) => (
        <span className="text-sm text-[#212121]">{row.display_order ?? 0}</span>
      ),
    },
    {
      key: "products",
      header: "Sản phẩm",
      render: (row: Category) => (
        <span className="text-sm text-[#212121]">{row._count?.products ?? 0}</span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row: Category) => (
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
      render: (row: Category) => (
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
        title="Danh mục"
        subtitle="Quản lý danh mục sản phẩm — dữ liệu lưu trên cơ sở dữ liệu"
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1D4ED8]"
          >
            <Plus size={16} />
            Thêm danh mục
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
          data={filtered}
          selectedIds={selectedIds}
          onToggleSelect={(id) =>
            setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
          }
          onToggleAll={() =>
            setSelectedIds(
              selectedIds.length === filtered.length ? [] : filtered.map((c) => c.category_id)
            )
          }
          idKey="category_id"
          emptyMessage="Chưa có danh mục nào"
        />
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0]">
              <h3 className="font-semibold text-[#212121]">
                {editingId ? "Sửa danh mục" : "Thêm danh mục"}
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
                  placeholder="VD: Đồng hồ nam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-1">Slug (tùy chọn)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-1">Danh mục cha</label>
                <select
                  value={form.parent_id}
                  onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="">Không có (danh mục gốc)</option>
                  {parentOptions.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-1">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: e.target.value })}
                    className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-1">Icon</label>
                  <input
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                    placeholder="watch"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-1">Ảnh URL</label>
                <input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
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
