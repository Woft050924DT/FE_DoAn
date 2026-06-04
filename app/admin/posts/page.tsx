'use client'

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Search, FileText, Eye } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { TableDataTable } from "@/components/Table/DataTable";
import { adminPostService, Post } from "@/services/adminService";

const TABS = ["Tất cả", "Đã xuất bản", "Nháp", "Đã lên lịch"];
const STATUS_MAP = ["published", "draft", "scheduled"];

const StatusBadge = ({ status }: { status: Post["status"] }) => {
  const map: Record<string, { label: string; cls: string }> = {
    published: { label: "Đã xuất bản", cls: "bg-green-100 text-[#2E7D32]" },
    draft: { label: "Nháp", cls: "bg-gray-100 text-[#757575]" },
    scheduled: { label: "Đã lên lịch", cls: "bg-blue-100 text-[#1565C0]" },
  };
  const s = map[status];
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.cls}`}>{s.label}</span>;
};

const formatViews = (n: number) => n > 0 ? n.toLocaleString("vi-VN") : "—";

export default function AdminPostsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = activeTab === 0 ? undefined : STATUS_MAP[activeTab - 1];
      const res = await adminPostService.getList({ search, status: statusParam });
      setPosts(Array.isArray(res.data) ? res.data : []);
      setTotal(res.pagination?.total ?? 0);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  }, [search, activeTab]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (postId: string) => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;
    try {
      setActionLoading(postId);
      await adminPostService.delete(postId);
      fetchPosts();
    } catch (err) {
      console.error("Delete post failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    if (selected.length === posts.length) setSelected([]);
    else setSelected(posts.map((p) => p.post_id));
  };

  const columns = [
    {
      key: "post",
      header: "Bài viết",
      render: (p: Post) => (
        <div className="flex items-center gap-3 max-w-sm">
          <div className="w-12 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            {p.thumbnail ? <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" /> : <FileText size={14} className="text-gray-400" />}
          </div>
          <div>
            <p className="font-medium text-[#212121] text-xs line-clamp-1">{p.title}</p>
            <p className="text-[#757575] text-[11px] line-clamp-1 mt-0.5">{p.excerpt}</p>
          </div>
        </div>
      ),
    },
    { key: "category", header: "Chuyên mục", render: (p: Post) => <span className="bg-gray-100 text-[#757575] text-xs px-2 py-0.5 rounded">{p.category}</span> },
    {
      key: "author",
      header: "Tác giả",
      render: (p: Post) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#1565C0] rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0">{p.author_avatar}</div>
          <span className="text-xs text-[#757575]">{p.author_name}</span>
        </div>
      ),
    },
    {
      key: "views",
      header: "Lượt xem",
      render: (p: Post) => <span className="text-[#757575] text-xs">{formatViews(p.views)}</span>,
    },
    { key: "status", header: "Trạng thái", render: (p: Post) => <StatusBadge status={p.status} /> },
    { key: "date", header: "Ngày", render: (p: Post) => <span className="text-[#757575] text-xs">{p.published_at || "—"}</span> },
  ];

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Quản lý bài viết"
        subtitle={`${total} bài viết`}
        actions={
          <button className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={14} /> Viết bài mới
          </button>
        }
      />
      <div className="bg-white rounded-xl border border-[#E0E0E0]">
        <div className="px-4 py-3 border-b border-[#E0E0E0] flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm bài viết..." className="pl-8 pr-4 py-2 border border-[#E0E0E0] rounded-lg text-sm w-full focus:outline-none focus:border-[#1565C0]" />
          </div>
          <div className="flex gap-1">
            {TABS.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === i ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-100"}`}>{tab}</button>
            ))}
          </div>
        </div>
        <TableDataTable
          data={posts}
          columns={columns}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
          idKey="post_id"
          onRowHover={setHoveredRow}
          renderRowActions={(p: Post) => (
            <div className={`flex items-center gap-1 transition-opacity ${hoveredRow === p.post_id ? "opacity-100" : "opacity-0"}`}>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Eye size={13} /></button>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Edit2 size={13} /></button>
              <button
                onClick={() => handleDelete(p.post_id)}
                disabled={actionLoading === p.post_id}
                className="p-1.5 rounded-lg hover:bg-red-50 text-[#E53935] disabled:opacity-50"
              >
                {actionLoading === p.post_id ? "..." : <Trash2 size={13} />}
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
