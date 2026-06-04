'use client'

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Search, Image as ImageIcon } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { TableDataTable } from "@/components/Table/DataTable";
import { adminBrandService, Brand } from "@/services/adminService";

const StatusBadge = ({ status }: { status: "active" | "inactive" }) => (
  <span className={`px-2 py-0.5 rounded text-xs font-medium ${status === "active" ? "bg-green-100 text-[#2E7D32]" : "bg-gray-100 text-[#757575]"}`}>
    {status === "active" ? "Hoạt động" : "Tắt"}
  </span>
);

export default function AdminBrandsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Brand | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", featured: false, status: "active" as "active" | "inactive" });
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminBrandService.getList({ search, page, limit: 50 });
      setBrands(Array.isArray(res.data) ? res.data : []);
      setTotal(res.pagination?.total ?? 0);
    } catch (err: any) {
      setError(err?.response?.status === 404 ? "API chưa được implement." : "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    if (selected.length === brands.length) setSelected([]);
    else setSelected(brands.map((b) => b.brand_id));
  };

  const openAdd = () => {
    setEditItem(null);
    setFormData({ name: "", slug: "", featured: false, status: "active" });
    setShowForm(true);
  };
  const openEdit = (item: Brand) => {
    setEditItem(item);
    setFormData({ name: item.name, slug: item.slug, featured: item.featured, status: item.status });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name) return;
    setSubmitting(true);
    try {
      if (editItem) {
        await adminBrandService.update(editItem.brand_id, { name: formData.name, slug: formData.slug, featured: formData.featured, status: formData.status });
      } else {
        await adminBrandService.create({ name: formData.name, slug: formData.slug, featured: formData.featured, status: formData.status });
      }
      setShowForm(false);
      fetchBrands();
    } catch (err) {
      console.error("Save brand failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFeatured = async (brandId: string) => {
    try {
      setActionLoading(brandId);
      await adminBrandService.toggleFeatured(brandId);
      fetchBrands();
    } catch (err) {
      console.error("Toggle featured failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (brandId: string) => {
    if (!confirm("Bạn có chắc muốn xóa thương hiệu này?")) return;
    try {
      setActionLoading(brandId);
      await adminBrandService.delete(brandId);
      fetchBrands();
    } catch (err) {
      console.error("Delete brand failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      key: "brand",
      header: "Thương hiệu",
      render: (b: Brand) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            {b.logo_url ? (
              <img src={b.logo_url} alt={b.name} className="w-full h-full object-contain p-1" />
            ) : (
              <ImageIcon size={16} className="text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-[#212121] text-xs">{b.name}</p>
            <p className="text-[#757575] text-[11px]">/{b.slug}</p>
          </div>
        </div>
      ),
    },
    { key: "productCount", header: "Sản phẩm", render: (b: Brand) => <span className="text-[#757575] text-xs font-medium">{b.product_count}</span> },
    { key: "status", header: "Trạng thái", render: (b: Brand) => <StatusBadge status={b.status} /> },
    {
      key: "featured",
      header: "Nổi bật",
      render: (b: Brand) => (
        <button
          onClick={() => handleToggleFeatured(b.brand_id)}
          disabled={actionLoading === b.brand_id}
          className={`text-lg disabled:opacity-50 ${b.featured ? "text-amber-400" : "text-gray-200 hover:text-amber-200"}`}
        >
          ★
        </button>
      ),
    },
  ];

  if (showForm) {
    return (
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowForm(false)} className="text-sm text-[#1565C0] hover:underline">← Quay lại</button>
          <span className="text-[#757575]">/</span>
          <h1 className="text-lg font-bold text-[#212121]">{editItem ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu mới"}</h1>
        </div>
        <div className="bg-white rounded-xl border border-[#E0E0E0] p-6 max-w-xl space-y-4">
          <div>
            <label className="text-xs font-medium text-[#757575] mb-1 block">Tên thương hiệu *</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
              placeholder="VD: Apple"
              className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#757575] mb-1 block">Slug</label>
            <input
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="apple"
              className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#757575] mb-1 block">Logo</label>
            <div className="border-2 border-dashed border-[#E0E0E0] rounded-xl p-6 text-center hover:border-[#1565C0] transition-colors cursor-pointer">
              <ImageIcon size={24} className="mx-auto text-gray-300 mb-2" />
              <p className="text-xs text-[#757575]">Kéo thả file hoặc nhấn để tải lên</p>
              <p className="text-[11px] text-[#9E9E9E] mt-1">PNG, JPG (tối đa 2MB)</p>
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="accent-[#1565C0] w-4 h-4"
              />
              <span className="text-sm text-[#212121]">Hiển thị nổi bật</span>
            </label>
            <div className="flex gap-4">
              {(["active", "inactive"] as const).map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="brand-status"
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
          <div className="flex gap-3 mt-6 pt-4 border-t border-[#E0E0E0]">
            <button onClick={() => setShowForm(false)} className="flex-1 border border-[#E0E0E0] py-2.5 rounded-lg text-sm hover:bg-gray-50">Hủy</button>
            <button
              onClick={handleSave}
              disabled={submitting || !formData.name}
              className="flex-1 bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Đang lưu..." : editItem ? "Lưu thay đổi" : "Tạo thương hiệu"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Quản lý thương hiệu"
        subtitle={`Tổng ${total} thương hiệu`}
        actions={
          <button onClick={openAdd} className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={14} /> Thêm thương hiệu
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
              placeholder="Tìm kiếm thương hiệu..."
              className="pl-8 pr-4 py-2 border border-[#E0E0E0] rounded-lg text-sm w-72 focus:outline-none focus:border-[#1565C0]"
            />
          </div>
        </div>
        <TableDataTable
          data={brands}
          columns={columns}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
          idKey="brand_id"
          onRowHover={setHoveredRow}
          renderRowActions={(b: Brand) => (
            <div className={`flex items-center gap-1 transition-opacity ${hoveredRow === b.brand_id ? "opacity-100" : "opacity-0"}`}>
              <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Edit2 size={13} /></button>
              <button
                onClick={() => handleDelete(b.brand_id)}
                disabled={actionLoading === b.brand_id}
                className="p-1.5 rounded-lg hover:bg-red-50 text-[#E53935] disabled:opacity-50"
              >
                {actionLoading === b.brand_id ? "..." : <Trash2 size={13} />}
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
