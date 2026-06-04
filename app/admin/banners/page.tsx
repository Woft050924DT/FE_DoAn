'use client'

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Search, Image, Eye, EyeOff, GripVertical } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { adminBannerService, Banner } from "@/services/adminService";

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
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminBannerService.getList({ search, page, limit: 50 });
      setBanners(Array.isArray(res.data) ? res.data : []);
      setTotal(res.pagination?.total ?? 0);
    } catch (err) {
      console.error("Failed to fetch banners:", err);
      setBanners([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Quản lý Banner"
        subtitle={`${total} banner`}
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
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm banner..." className="pl-8 pr-4 py-2 border border-[#E0E0E0] rounded-lg text-sm w-full focus:outline-none focus:border-[#1565C0]" />
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-52 bg-gray-100 rounded-xl animate-pulse" />
              ))
            ) : banners.map((banner) => (
              <div
                key={banner.banner_id}
                className="border border-[#E0E0E0] rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-36 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                  {banner.image_url ? (
                    <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
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
                  <p className="text-[10px] text-[#9E9E9E] mt-1">{banner.start_date} — {banner.end_date}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelected((prev) => prev.includes(banner.banner_id) ? prev.filter((x) => x !== banner.banner_id) : [...prev, banner.banner_id])}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selected.includes(banner.banner_id) ? "bg-[#1565C0] border-[#1565C0]" : "border-[#E0E0E0]"}`}
                      >
                        {selected.includes(banner.banner_id) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </button>
                      <span className="text-[11px] text-[#757575] ml-1">#{banner.sort_order}</span>
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
        <div className="hidden md:block" />
      </div>
    </div>
  );
}
