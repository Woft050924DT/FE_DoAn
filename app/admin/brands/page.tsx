'use client'

import { useState } from "react";
import { Plus, Edit2, Trash2, Search, Star, MoreHorizontal, Image as ImageIcon } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { TableDataTable } from "@/components/Table/DataTable";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  productCount: number;
  featured: boolean;
  status: "active" | "inactive";
}

const MOCK_BRANDS: Brand[] = [
  { id: "1", name: "Apple", slug: "apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", productCount: 45, featured: true, status: "active" },
  { id: "2", name: "Samsung", slug: "samsung", logo: "", productCount: 78, featured: true, status: "active" },
  { id: "3", name: "Sony", slug: "sony", logo: "", productCount: 34, featured: false, status: "active" },
  { id: "4", name: "Xiaomi", slug: "xiaomi", logo: "", productCount: 112, featured: true, status: "active" },
  { id: "5", name: "OPPO", slug: "oppo", logo: "", productCount: 56, featured: false, status: "active" },
  { id: "6", name: "Vivo", slug: "vivo", logo: "", productCount: 23, featured: false, status: "active" },
  { id: "7", name: "JBL", slug: "jbl", logo: "", productCount: 89, featured: true, status: "active" },
  { id: "8", name: "Anker", slug: "anker", logo: "", productCount: 201, featured: true, status: "active" },
  { id: "9", name: "Logitech", slug: "logitech", logo: "", productCount: 67, featured: false, status: "inactive" },
  { id: "10", name: "Bose", slug: "bose", logo: "", productCount: 12, featured: false, status: "active" },
];

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
  const [formData, setFormData] = useState({ name: "", slug: "", featured: false, status: "active" as "active" | "inactive" });

  const filtered = MOCK_BRANDS.filter(
    (b) => b.name.toLowerCase().includes(search.toLowerCase()) || b.slug.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((b) => b.id));
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

  const columns = [
    {
      key: "brand",
      header: "Thương hiệu",
      render: (b: Brand) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            {b.logo ? (
              <img src={b.logo} alt={b.name} className="w-full h-full object-contain p-1" />
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
    { key: "productCount", header: "Sản phẩm", render: (b: Brand) => <span className="text-[#757575] text-xs font-medium">{b.productCount}</span> },
    { key: "status", header: "Trạng thái", render: (b: Brand) => <StatusBadge status={b.status} /> },
    {
      key: "featured",
      header: "Nổi bật",
      render: (b: Brand) => (
        <button onClick={() => {}} className={`text-lg ${b.featured ? "text-amber-400" : "text-gray-200 hover:text-amber-200"}`}>
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
            <button className="flex-1 bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
              {editItem ? "Lưu thay đổi" : "Tạo thương hiệu"}
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
        subtitle={`Tổng ${MOCK_BRANDS.length} thương hiệu`}
        actions={
          <button onClick={openAdd} className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={14} /> Thêm thương hiệu
          </button>
        }
      />
      <div className="bg-white rounded-xl border border-[#E0E0E0]">
        <div className="px-4 py-3 border-b border-[#E0E0E0]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm thương hiệu..."
              className="pl-8 pr-4 py-2 border border-[#E0E0E0] rounded-lg text-sm w-72 focus:outline-none focus:border-[#1565C0]"
            />
          </div>
        </div>
        <TableDataTable
          data={filtered}
          columns={columns}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
          idKey="id"
          onRowHover={setHoveredRow}
          renderRowActions={(b: Brand) => (
            <div className={`flex items-center gap-1 transition-opacity ${hoveredRow === b.id ? "opacity-100" : "opacity-0"}`}>
              <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Edit2 size={13} /></button>
              <button className="p-1.5 rounded-lg hover:bg-red-50 text-[#E53935]"><Trash2 size={13} /></button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
