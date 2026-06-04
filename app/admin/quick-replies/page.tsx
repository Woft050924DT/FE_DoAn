'use client'

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Search, Reply, Copy, X } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { TableDataTable } from "@/components/Table/DataTable";
import { adminQuickReplyService, QuickReplyConfig } from "@/services/adminService";

const CATEGORIES = ["Tất cả", "Chào hỏi", "Cảm ơn", "Vận chuyển", "Đổi trả", "Bảo hành", "Thanh toán", "Giờ làm việc", "Xin lỗi"];
const TABS_CAT = ["Tất cả", "Đang dùng", "Tạm tắt"];

const CATEGORY_COLORS: Record<string, string> = {
  "Chào hỏi": "bg-blue-100 text-blue-700",
  "Cảm ơn": "bg-green-100 text-green-700",
  "Vận chuyển": "bg-purple-100 text-purple-700",
  "Đổi trả": "bg-amber-100 text-amber-700",
  "Bảo hành": "bg-teal-100 text-teal-700",
  "Thanh toán": "bg-rose-100 text-rose-700",
  "Giờ làm việc": "bg-orange-100 text-orange-700",
  "Xin lỗi": "bg-gray-100 text-gray-700",
};

export default function AdminQuickRepliesPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [replies, setReplies] = useState<QuickReplyConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ shortcut: "", title: "", message: "", category: "Chào hỏi", is_active: true });
  const [editItem, setEditItem] = useState<QuickReplyConfig | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReplies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let isActiveParam: boolean | undefined;
      if (activeTab === 1) isActiveParam = true;
      if (activeTab === 2) isActiveParam = false;
      const res = await adminQuickReplyService.getList({ search, is_active: isActiveParam, page, limit: 50 });
      setReplies(res.data);
      setTotal(res.pagination.total);
    } catch (err: any) {
      setError(err?.response?.status === 404 ? "API chưa được implement." : "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [search, activeTab, page]);

  useEffect(() => { fetchReplies(); }, [fetchReplies]);

  const openAdd = () => {
    setEditItem(null);
    setFormData({ shortcut: "", title: "", message: "", category: "Chào hỏi", is_active: true });
    setShowForm(true);
  };

  const openEdit = (item: QuickReplyConfig) => {
    setEditItem(item);
    setFormData({ shortcut: item.shortcut, title: item.title || item.shortcut, message: item.message, category: item.category, is_active: item.is_active });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.shortcut || !formData.message) return;
    setSubmitting(true);
    try {
      if (editItem) {
        await adminQuickReplyService.update(editItem.reply_id, {
          shortcut: formData.shortcut,
          title: formData.title,
          message: formData.message,
          category: formData.category,
          is_active: formData.is_active,
        });
      } else {
        await adminQuickReplyService.create({
          shortcut: formData.shortcut,
          title: formData.title,
          message: formData.message,
          category: formData.category,
          is_active: formData.is_active,
        });
      }
      setShowForm(false);
      fetchReplies();
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (replyId: string) => {
    if (!confirm("Xóa mẫu trả lời nhanh này?")) return;
    try {
      setActionLoading(replyId);
      await adminQuickReplyService.delete(replyId);
      fetchReplies();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    if (selected.length === replies.length) setSelected([]);
    else setSelected(replies.map((r) => r.reply_id));
  };

  const columns = [
    {
      key: "shortcut",
      header: "Shortcut",
      render: (r: QuickReplyConfig) => (
        <div className="flex items-center gap-2">
          <span className="font-mono bg-gray-100 text-[#1565C0] text-xs px-2 py-1 rounded font-semibold">{r.shortcut}</span>
          <button className="p-1 hover:bg-gray-100 rounded text-[#757575]" onClick={() => navigator.clipboard.writeText(r.shortcut)}><Copy size={11} /></button>
        </div>
      ),
    },
    {
      key: "content",
      header: "Nội dung",
      render: (r: QuickReplyConfig) => (
        <div className="max-w-sm">
          <p className="text-xs font-medium text-[#212121] line-clamp-1">{r.title || "—"}</p>
          <p className="text-[11px] text-[#757575] line-clamp-2 mt-0.5">{r.message}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Danh mục",
      render: (r: QuickReplyConfig) => (
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${CATEGORY_COLORS[r.category] || "bg-gray-100 text-gray-700"}`}>
          {r.category}
        </span>
      ),
    },
    { key: "usageCount", header: "Sử dụng", render: (r: QuickReplyConfig) => <span className="text-[#757575] text-xs font-medium">{r.usage_count}</span> },
    {
      key: "status",
      header: "Trạng thái",
      render: (r: QuickReplyConfig) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.is_active ? "bg-green-100 text-[#2E7D32]" : "bg-gray-100 text-[#757575]"}`}>
          {r.is_active ? "Đang dùng" : "Tạm tắt"}
        </span>
      ),
    },
  ];

  if (showForm) {
    return (
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowForm(false)} className="text-sm text-[#1565C0] hover:underline">← Quay lại</button>
          <span className="text-[#757575]">/</span>
          <h1 className="text-lg font-bold text-[#212121]">{editItem ? "Chỉnh sửa trả lời nhanh" : "Tạo trả lời nhanh"}</h1>
        </div>
        <div className="bg-white rounded-xl border border-[#E0E0E0] p-6 max-w-xl space-y-4">
          <div>
            <label className="text-xs font-medium text-[#757575] mb-1 block">Shortcut *</label>
            <div className="flex items-center gap-2">
              <input
                value={formData.shortcut}
                onChange={(e) => setFormData({ ...formData, shortcut: e.target.value.startsWith("/") ? e.target.value : "/" + e.target.value.replace(/^\//, "") })}
                placeholder="VD: /chao"
                className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]"
              />
              <button className="p-2 border border-[#E0E0E0] rounded-lg hover:bg-gray-50 text-[#757575]" onClick={() => setFormData({ ...formData, shortcut: "/" + Math.random().toString(36).slice(2, 6) })} title="Tạo ngẫu nhiên">🎲</button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[#757575] mb-1 block">Tiêu đề</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Chào hỏi khách hàng"
              className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#757575] mb-1 block">Danh mục</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]"
            >
              {CATEGORIES.filter((c) => c !== "Tất cả").map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[#757575] mb-1 block">Nội dung trả lời *</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              placeholder="Nhập nội dung trả lời nhanh..."
              className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA] resize-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
              className={`w-11 h-6 rounded-full transition-colors relative ${formData.is_active ? "bg-[#2563EB]" : "bg-gray-300"}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <span className="text-sm text-[#212121]">Kích hoạt</span>
          </div>
          <div className="flex gap-3 pt-4 border-t border-[#E0E0E0]">
            <button onClick={() => setShowForm(false)} className="flex-1 border border-[#E0E0E0] py-2.5 rounded-lg text-sm hover:bg-gray-50">Hủy</button>
            <button
              onClick={handleSave}
              disabled={submitting || !formData.shortcut || !formData.message}
              className="flex-1 bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Đang lưu..." : editItem ? "Lưu thay đổi" : "Tạo trả lời nhanh"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Trả lời nhanh"
        subtitle={`${total} mẫu trả lời`}
        actions={
          <button onClick={openAdd} className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={14} /> Tạo trả lời nhanh
          </button>
        }
      />
      {error && (
        <div className="mx-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          {error}
        </div>
      )}
      <div className="bg-white rounded-xl border border-[#E0E0E0]">
        <div className="px-4 py-3 border-b border-[#E0E0E0] flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm shortcut, nội dung..." className="pl-8 pr-4 py-2 border border-[#E0E0E0] dark:border-[#374151] rounded-lg text-sm w-full bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]" />
          </div>
          <div className="flex gap-1">
            {CATEGORIES.filter((c) => c !== "Tất cả").map((cat) => (
              <button
                key={cat}
                onClick={() => setSearch(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${search === cat ? "bg-[#2563EB] text-white" : "text-[#757575] hover:bg-gray-100"}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {TABS_CAT.map((tab, i) => (
              <button key={tab} onClick={() => { setActiveTab(i); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === i ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-100"}`}>{tab}</button>
            ))}
          </div>
        </div>
        <TableDataTable
          data={replies}
          columns={columns}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
          idKey="reply_id"
          onRowHover={setHoveredRow}
          renderRowActions={(r: QuickReplyConfig) => (
            <div className={`flex items-center gap-1 transition-opacity ${hoveredRow === r.reply_id ? "opacity-100" : "opacity-0"}`}>
              <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Edit2 size={13} /></button>
              <button
                onClick={() => handleDelete(r.reply_id)}
                disabled={actionLoading === r.reply_id}
                className="p-1.5 rounded-lg hover:bg-red-50 text-[#E53935] disabled:opacity-50"
              >
                {actionLoading === r.reply_id ? "..." : <Trash2 size={13} />}
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
