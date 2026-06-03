'use client'

import { useState } from "react";
import { Plus, Edit2, Trash2, Search, FolderTree, ChevronRight, MoreHorizontal, ChevronDown } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { TableDataTable } from "@/components/Table/DataTable";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent?: string;
  parentId?: string;
  productCount: number;
  status: "active" | "inactive";
  order: number;
}

const MOCK_CATEGORIES: Category[] = [
  { id: "1", name: "Điện thoại", slug: "dien-thoai", productCount: 124, status: "active", order: 1 },
  { id: "2", name: "Laptop", slug: "laptop", productCount: 89, status: "active", order: 2 },
  { id: "3", name: "Tablet", slug: "tablet", productCount: 45, status: "active", order: 3 },
  { id: "4", name: "Phụ kiện", slug: "phu-kien", productCount: 312, status: "active", order: 4 },
  { id: "5", name: "Đồng hồ thông minh", slug: "dong-ho-thong-minh", productCount: 67, status: "active", order: 5 },
  { id: "6", name: "Máy ảnh", slug: "may-anh", productCount: 23, status: "inactive", order: 6 },
  { id: "7", name: "Tai nghe", slug: "tai-nghe", productCount: 156, status: "active", order: 7 },
  { id: "8", name: "Loa bluetooth", slug: "loa-bluetooth", productCount: 78, status: "active", order: 8 },
  { id: "9", name: "Sạc dự phòng", slug: "sac-du-phong", productCount: 201, status: "active", order: 9 },
  { id: "10", name: "Cáp sạc", slug: "cap-sac", productCount: 334, status: "active", order: 10 },
  { id: "11", name: "Camera hành trình", slug: "camera-hanh-trinh", productCount: 34, status: "inactive", order: 11 },
  { id: "12", name: "Máy chơi game", slug: "may-choi-game", productCount: 56, status: "active", order: 12 },
];

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
  const [formData, setFormData] = useState({ name: "", slug: "", parentId: "", status: "active" as "active" | "inactive" });

  const filtered = MOCK_CATEGORIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((c) => c.id));
  };

  const openAdd = () => {
    setEditItem(null);
    setFormData({ name: "", slug: "", parentId: "", status: "active" });
    setShowForm(true);
  };
  const openEdit = (item: Category) => {
    setEditItem(item);
    setFormData({ name: item.name, slug: item.slug, parentId: item.parentId || "", status: item.status });
    setShowForm(true);
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
    { key: "productCount", header: "Sản phẩm", render: (c: Category) => <span className="text-[#757575] text-xs font-medium">{c.productCount}</span> },
    { key: "status", header: "Trạng thái", render: (c: Category) => <StatusBadge status={c.status} /> },
    {
      key: "order",
      header: "Thứ tự",
      render: (c: Category) => (
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-gray-100 rounded"><ChevronDown size={12} className="text-[#757575]" /></button>
          <span className="text-xs font-medium w-5 text-center">{c.order}</span>
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
                {MOCK_CATEGORIES.filter((c) => c.id !== editItem?.id).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
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
            <button className="flex-1 bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
              {editItem ? "Lưu thay đổi" : "Tạo danh mục"}
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
        subtitle={`Tổng ${MOCK_CATEGORIES.length} danh mục`}
        actions={
          <button onClick={openAdd} className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={14} /> Thêm danh mục
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
              placeholder="Tìm kiếm danh mục..."
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
          renderRowActions={(c: Category) => (
            <div className={`flex items-center gap-1 transition-opacity ${hoveredRow === c.id ? "opacity-100" : "opacity-0"}`}>
              <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Edit2 size={13} /></button>
              <button className="p-1.5 rounded-lg hover:bg-red-50 text-[#E53935]"><Trash2 size={13} /></button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
