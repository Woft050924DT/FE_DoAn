'use client'

import { useState } from "react";
import { Plus, Edit2, Trash2, Search, FileText, Eye, EyeOff } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { TableDataTable } from "@/components/Table/DataTable";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  authorAvatar: string;
  thumbnail: string;
  status: "published" | "draft" | "scheduled";
  publishedAt: string;
  views: number;
}

const MOCK_POSTS: Post[] = [
  { id: "1", title: "Top 10 điện thoại tốt nhất 2024 nên mua ngay", slug: "top-10-dien-thoai-tot-nhat-2024", excerpt: "Danh sách các dòng điện thoại được đánh giá cao nhất năm 2024, từ iPhone 15 đến Samsung Galaxy S24...", category: "Đánh giá", author: "Minh Tuấn", authorAvatar: "MT", thumbnail: "", status: "published", publishedAt: "20/01/2024", views: 4521 },
  { id: "2", title: "Hướng dẫn chọn laptop phù hợp cho sinh viên 2024", slug: "huong-dan-chon-laptop-sinh-vien-2024", excerpt: "Sinh viên cần laptop để học tập, làm bài tập và giải trí. Bài viết này giúp bạn chọn được chiếc laptop phù hợp...", category: "Hướng dẫn", author: "Thu Hà", authorAvatar: "TH", thumbnail: "", status: "published", publishedAt: "18/01/2024", views: 3210 },
  { id: "3", title: "So sánh iPhone 15 Pro Max vs Samsung S24 Ultra", slug: "so-sanh-iphone-15-pro-max-vs-samsung-s24-ultra", excerpt: "Hai flagship đắt nhất của Apple và Samsung, đâu mới là lựa chọn tốt hơn trong năm 2024?", category: "So sánh", author: "Minh Tuấn", authorAvatar: "MT", thumbnail: "", status: "published", publishedAt: "15/01/2024", views: 8934 },
  { id: "4", title: "Cách bảo quản và sạc pin đúng cách cho smartphone", slug: "cach-bao-quan-sac-pin-dung-cach", excerpt: "Sạc pin đúng cách giúp kéo dài tuổi thọ pin. Nhiều người vẫn mắc những sai lầm phổ biến khi sạc pin...", category: "Mẹo hay", author: "Lan Anh", authorAvatar: "LA", thumbnail: "", status: "draft", publishedAt: "", views: 0 },
  { id: "5", title: "Review chi tiết MacBook Air M3 - Laptop mỏng nhẹ đáng mua", slug: "review-macbook-air-m3", excerpt: "MacBook Air M3 với chip M3 thế hệ mới, hiệu năng vượt trội, pin 18 giờ. Đánh giá chi tiết từng khía cạnh.", category: "Đánh giá", author: "Minh Tuấn", authorAvatar: "MT", thumbnail: "", status: "scheduled", publishedAt: "25/01/2024", views: 0 },
  { id: "6", title: "Tai nghe không dây nào tốt nhất dưới 3 triệu?", slug: "tai-nghe-khong-day-tot-nhat-duoi-3-trieu", excerpt: "Với ngân sách 3 triệu, bạn có thể sở hữu những chiếc tai nghe không dây với chất lượng âm thanh tuyệt vời...", category: "Đánh giá", author: "Thu Hà", authorAvatar: "TH", thumbnail: "", status: "published", publishedAt: "10/01/2024", views: 2156 },
  { id: "7", title: "Cách reset iPhone khi bị treo logo đơn giản nhất", slug: "cach-reset-iphone-khi-bi-treo-logo", excerpt: "iPhone bị treo ở màn hình logo là lỗi phổ biến. Hướng dẫn chi tiết cách reset iPhone nhanh chóng...", category: "Hướng dẫn", author: "Lan Anh", authorAvatar: "LA", thumbnail: "", status: "published", publishedAt: "05/01/2024", views: 6789 },
  { id: "8", title: "5 sai lầm phổ biến khi mua laptop mới", slug: "5-sai-lam-pho-bien-khi-mua-laptop", excerpt: "Nhiều người mắc sai lầm khi mua laptop vì không hiểu rõ nhu cầu và các thông số kỹ thuật...", category: "Mẹo hay", author: "Minh Tuấn", authorAvatar: "MT", thumbnail: "", status: "draft", publishedAt: "", views: 0 },
];

const TABS = ["Tất cả", "Đã xuất bản", "Nháp", "Đã lên lịch"];

const StatusBadge = ({ status }: { status: Post["status"] }) => {
  const map: Record<string, { label: string; cls: string }> = {
    published: { label: "Đã xuất bản", cls: "bg-green-100 text-[#2E7D32]" },
    draft: { label: "Nháp", cls: "bg-gray-100 text-[#757575]" },
    scheduled: { label: "Đã lên lịch", cls: "bg-blue-100 text-[#1565C0]" },
  };
  const s = map[status];
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.cls}`}>{s.label}</span>;
};

export default function AdminPostsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const filtered = MOCK_POSTS.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 0) return matchSearch;
    return matchSearch && p.status === ["published", "draft", "scheduled"][activeTab - 1];
  });

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((p) => p.id));
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
          <div className="w-6 h-6 bg-[#1565C0] rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0">{p.authorAvatar}</div>
          <span className="text-xs text-[#757575]">{p.author}</span>
        </div>
      ),
    },
    {
      key: "views",
      header: "Lượt xem",
      render: (p: Post) => <span className="text-[#757575] text-xs">{p.views > 0 ? p.views.toLocaleString("vi-VN") : "—"}</span>,
    },
    { key: "status", header: "Trạng thái", render: (p: Post) => <StatusBadge status={p.status} /> },
    { key: "date", header: "Ngày", render: (p: Post) => <span className="text-[#757575] text-xs">{p.publishedAt || "—"}</span> },
  ];

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Quản lý bài viết"
        subtitle={`${MOCK_POSTS.length} bài viết`}
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
          data={filtered}
          columns={columns}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
          idKey="id"
          onRowHover={setHoveredRow}
          renderRowActions={(p: Post) => (
            <div className={`flex items-center gap-1 transition-opacity ${hoveredRow === p.id ? "opacity-100" : "opacity-0"}`}>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Eye size={13} /></button>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Edit2 size={13} /></button>
              <button className="p-1.5 rounded-lg hover:bg-red-50 text-[#E53935]"><Trash2 size={13} /></button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
