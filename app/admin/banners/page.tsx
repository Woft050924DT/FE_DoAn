'use client'

import { useState } from "react";
import { Plus, Edit2, Trash2, Search, Image, Eye, EyeOff, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";

interface Banner {
  id: string;
  title: string;
  image: string;
  link: string;
  position: string;
  device: "all" | "desktop" | "mobile";
  status: "active" | "inactive";
  startDate: string;
  endDate: string;
  order: number;
}

const MOCK_BANNERS: Banner[] = [
  { id: "1", title: "Flash Sale iPhone 15 Series", image: "", link: "/products?category=iphone", position: "Trang chủ - Hero", device: "all", status: "active", startDate: "01/01/2024", endDate: "31/12/2024", order: 1 },
  { id: "2", title: "Khuyến mãi mùa hè 2024", image: "", link: "/promotions/summer-2024", position: "Trang chủ - Banner 1", device: "all", status: "active", startDate: "01/06/2024", endDate: "31/08/2024", order: 2 },
  { id: "3", title: "MacBook Air M3 - Siêu sale", image: "", link: "/products/macbook-air-m3", position: "Trang chủ - Banner 2", device: "desktop", status: "active", startDate: "15/01/2024", endDate: "15/02/2024", order: 3 },
  { id: "4", title: "Phụ kiện chính hãng giảm 30%", image: "", link: "/collections/phu-kien", position: "Popup", device: "all", status: "inactive", startDate: "10/01/2024", endDate: "31/01/2024", order: 4 },
  { id: "5", title: "Samsung Galaxy S24 Launch", image: "", link: "/products/samsung-galaxy-s24", position: "Trang chủ - Hero", device: "mobile", status: "active", startDate: "17/01/2024", endDate: "01/03/2024", order: 5 },
  { id: "6", title: "Bộ sưu tập Laptop Gaming", image: "", link: "/collections/laptop-gaming", position: "Trang sản phẩm - Sidebar", device: "all", status: "active", startDate: "01/01/2024", endDate: "31/12/2024", order: 6 },
];

const StatusBadge = ({ status }: { status: "active" | "inactive" }) => (
  <span className={`px-2 py-0.5 rounded text-xs font-medium ${status === "active" ? "bg-green-100 text-[#2E7D32]" : "bg-gray-100 text-[#757575]"}`}>
    {status === "active" ? "Hoạt động" : "Tắt"}
  </span>
);

export default function AdminBannersPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);

  const filtered = MOCK_BANNERS.filter(
    (b) => b.title.toLowerCase().includes(search.toLowerCase()) || b.position.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((b) => b.id));
  };

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Quản lý Banner"
        subtitle={`${MOCK_BANNERS.length} banner`}
        actions={
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={14} /> Thêm Banner
          </button>
        }
      />
      <div className="bg-white rounded-xl border border-[#E0E0E0]">
        <div className="px-4 py-3 border-b border-[#E0E0E0]">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm banner..." className="pl-8 pr-4 py-2 border border-[#E0E0E0] rounded-lg text-sm w-full focus:outline-none focus:border-[#1565C0]" />
          </div>
        </div>
        {/* Banner Grid */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((banner) => (
              <div
                key={banner.id}
                className="border border-[#E0E0E0] rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-36 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                  {banner.image ? (
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Image size={32} className="mx-auto text-blue-300 mb-2" />
                      <p className="text-xs text-[#757575]">Chưa có hình ảnh</p>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={banner.status} />
                  </div>
                  <div className="absolute top-2 left-2">
                    <GripVertical size={14} className="text-gray-400 cursor-grab" />
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-medium text-[#212121] text-sm line-clamp-1">{banner.title}</p>
                  <p className="text-[11px] text-[#757575] mt-0.5">{banner.position}</p>
                  <p className="text-[10px] text-[#9E9E9E] mt-1">{banner.startDate} — {banner.endDate}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelected((prev) => prev.includes(banner.id) ? prev.filter((x) => x !== banner.id) : [...prev, banner.id])}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selected.includes(banner.id) ? "bg-[#1565C0] border-[#1565C0]" : "border-[#E0E0E0]"}`}
                      >
                        {selected.includes(banner.id) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </button>
                      <span className="text-[11px] text-[#757575] ml-1">#{banner.order}</span>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Eye size={13} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Edit2 size={13} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 text-[#E53935]"><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Mobile table fallback */}
        <div className="hidden md:block" />
      </div>
    </div>
  );
}
