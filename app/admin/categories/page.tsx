'use client'

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Search, FolderTree, ChevronRight, MoreHorizontal, ChevronDown } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { TableDataTable } from "@/components/Table/DataTable";
import { adminCategoryService, Category } from "@/services/adminService";

const StatusBadge = ({ status }: { status: "active" | "inactive" }) => (
  <span className={`px-2 py-0.5 rounded text-xs font-medium ${status === "active" ? "bg-green-100 text-[#2E7D32]" : "bg-gray-100 text-[#757575]"}`}>
    {status === "active" ? "Hoạt động" : "Tắt"}
  </span>
);

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", parentId: "", status: "active" as "active" | "inactive" });
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminCategoryService.getList({ search, page, limit: 50 });
      setCategories(Array.isArray(res.data) ? res.data : []);
      setTotal(res.pagination?.total ?? 0);
    } catch (err: any) {
      setError(err?.response?.status === 404 ? "API chưa được implement." : "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    if (selected.length === categories.length) setSelected([]);
    else setSelected(categories.map((c) => c.category_id));
  };

  const openAdd = () => {
    setEditItem(null);
    setFormData({ name: "", slug: "", parentId: "", status: "active" });
    setShowForm(true);
  };
  const openEdit = (item: Category) => {
    setEditItem(item);
    setFormData({ name: item.name, slug: item.slug, parentId: item.parent_id || "", status: item.status });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name) return;
    setSubmitting(true);
    try {
      if (editItem) {
        await adminCategoryService.update(editItem.category_id, { name: formData.name, slug: formData.slug, parent_id: formData.parentId || null, status: formData.status });
      } else {
        await adminCategoryService.create({ name: formData.name, slug: formData.slug, parent_id: formData.parentId || null, status: formData.status });
      }
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      console.error("Save category failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    try {
      setActionLoading(categoryId);
      await adminCategoryService.delete(categoryId);
      fetchCategories();
    } catch (err) {
      console.error("Delete category failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      key: "category",
      header: "Danh mục",
      render: (c: Category) => (
        <div className="flex items-center gap-2">
          <FolderTree size={14} className="text-[#1565C0] shrink-0" />
          <div>
            <p className="font-medium text-[#212121] text-xs">{c.name}</p>
            <p className="text-[#757575] text-[11px]">/{c.slug}</p>
          </div>
        </div>
      ),
    },
    { key: "productCount", header: "Sản phẩm", render: (c: Category) => <span className="text-[#757575] text-xs font-medium">{c.product_count}</span> },
    { key: "status", header: "Trạng thái", render: (c: Category) => <StatusBadge status={c.status} /> },
    {
      key: "order",
      header: "Thứ tự",
      render: (c: Category) => (
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-gray-100 rounded"><ChevronDown size={12} className="text-[#757575]" /></button>
          <span className="text-xs font-medium w-5 text-center">{c.sort_order}</span>
          <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={12} className="text-[#757575]" /></button>
        </div>
      ),
    },
  ];

  if (showForm) {
    return (
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowForm(false)} className="text-sm text-[#1565C0] hover:underline">← Quay lại</button>
          <span className="text-[#757575]">/</span>
          <h1 className="text-lg font-bold text-[#212121]">{editItem ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</h1>
        </div>
        <div className="bg-white rounded-xl border border-[#E0E0E0] p-6 max-w-xl">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#757575] mb-1 block">Tên danh mục *</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                placeholder="VD: Điện thoại"
                className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#757575] mb-1 block">Slug</label>
              <input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="dien-thoai"
                className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#757575] mb-1 block">Danh mục cha</label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] bg-white"
              >
                <option value="">Không có (Danh mục gốc)</option>
                {categories.filter((c) => c.category_id !== editItem?.category_id).map((c) => (
                  <option key={c.category_id} value={c.category_id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#757575] mb-1 block">Trạng thái</label>
              <div className="flex gap-4">
                {(["active", "inactive"] as const).map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cat-status"
                      value={s}
                      checked={formData.status === s}
                      onChange={() => setFormData({ ...formData, status: s })}
                      className="accent-[#1565C0]"
                    />
                    <span className="text-sm text-[#212121]">{s === "active" ? "Hoạt động" : "Tắt"}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6 pt-4 border-t border-[#E0E0E0]">
            <button onClick={() => setShowForm(false)} className="flex-1 border border-[#E0E0E0] py-2.5 rounded-lg text-sm hover:bg-gray-50">Hủy</button>
            <button
              onClick={handleSave}
              disabled={submitting || !formData.name}
              className="flex-1 bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Đang lưu..." : editItem ? "Lưu thay đổi" : "Tạo danh mục"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Quản lý danh mục"
        subtitle={`Tổng ${total} danh mục`}
        actions={
          <button onClick={openAdd} className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={14} /> Thêm danh mục
          </button>
        }
      />
      {error && (
        <div className="mx-4 mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          {error}
        </div>
      )}
      <div className="bg-white rounded-xl border border-[#E0E0E0]">
        <div className="px-4 py-3 border-b border-[#E0E0E0]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm kiếm danh mục..."
              className="pl-8 pr-4 py-2 border border-[#E0E0E0] rounded-lg text-sm w-72 focus:outline-none focus:border-[#1565C0]"
            />
          </div>
        </div>
        <TableDataTable
          data={categories}
          columns={columns}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
          idKey="category_id"
          onRowHover={setHoveredRow}
          renderRowActions={(c: Category) => (
            <div className={`flex items-center gap-1 transition-opacity ${hoveredRow === c.category_id ? "opacity-100" : "opacity-0"}`}>
              <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Edit2 size={13} /></button>
              <button
                onClick={() => handleDelete(c.category_id)}
                disabled={actionLoading === c.category_id}
                className="p-1.5 rounded-lg hover:bg-red-50 text-[#E53935] disabled:opacity-50"
              >
                {actionLoading === c.category_id ? "..." : <Trash2 size={13} />}
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
