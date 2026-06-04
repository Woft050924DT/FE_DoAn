'use client'

import { useState, useEffect, useCallback } from "react";
import { Search, Star, CheckCircle, XCircle, Eye, RefreshCw, ThumbsUp } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { TableDataTable } from "@/components/Table/DataTable";
import { adminReviewService, Review } from "@/services/adminService";

const TABS = ["Tất cả", "Chờ duyệt", "Đã duyệt", "Từ chối"];
const RATINGS = [5, 4, 3, 2, 1];

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {RATINGS.map((r) => (
      <Star key={r} size={11} className={r <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
    ))}
  </div>
);

const ReviewStatusBadge = ({ approved }: { approved: boolean }) => (
  <span className={`px-2 py-0.5 rounded text-xs font-medium ${approved ? "bg-green-100 text-[#2E7D32]" : "bg-amber-100 text-[#E65100]"}`}>
    {approved ? "Đã duyệt" : "Chờ duyệt"}
  </span>
);

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let approvedParam: boolean | undefined;
      if (activeTab === 1) approvedParam = false;
      if (activeTab === 2) approvedParam = true;
      const res = await adminReviewService.getList({ search, approved: approvedParam, page, limit: 20 });
      setReviews(Array.isArray(res.data) ? res.data : []);
      setTotal(res.pagination?.total ?? 0);
    } catch (err: any) {
      setError(err?.response?.status === 404 ? "API chưa được implement." : "Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [search, activeTab, page]);

  useEffect(() => {
    fetchReviews();
    adminReviewService.getList({ approved: false, limit: 1 }).then(res => setPendingCount(res.pagination?.total ?? 0)).catch(() => {});
  }, [fetchReviews]);

  const handleApprove = async (reviewId: string) => {
    try {
      setActionLoading(reviewId);
      await adminReviewService.approve(reviewId);
      setReviews(prev => prev.map(r => r.review_id === reviewId ? { ...r, is_approved: true } : r));
    } catch (err) {
      console.error("Approve failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      setActionLoading(reviewId);
      await adminReviewService.reject(reviewId);
      setReviews(prev => prev.map(r => r.review_id === reviewId ? { ...r, is_approved: false } : r));
    } catch (err) {
      console.error("Reject failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    if (selected.length === reviews.length) setSelected([]);
    else setSelected(reviews.map((r) => r.review_id));
  };

  const columns = [
    {
      key: "review",
      header: "Đánh giá",
      render: (r: Review) => (
        <div className="flex items-start gap-3 max-w-sm">
          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            {r.product_image ? (
              <img src={r.product_image} alt={r.product_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] font-bold text-[#757575]">{r.product_name?.slice(0, 2)}</span>
            )}
          </div>
          <div>
            <p className="font-medium text-[#212121] text-xs line-clamp-1">{r.product_name}</p>
            <p className="text-[11px] text-[#757575] mt-0.5 line-clamp-2">{r.comment}</p>
          </div>
        </div>
      ),
    },
    {
      key: "user",
      header: "Người đánh giá",
      render: (r: Review) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#1565C0] rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            {r.user_avatar || (r.user_name?.slice(0, 2).toUpperCase())}
          </div>
          <div>
            <p className="text-xs font-medium text-[#212121]">{r.user_name}</p>
            {r.is_verified_purchase && <p className="text-[10px] text-[#2E7D32] flex items-center gap-0.5"><CheckCircle size={9} /> Đã mua hàng</p>}
          </div>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Sao",
      render: (r: Review) => (
        <div className="flex items-center gap-1.5">
          <RatingStars rating={r.rating} />
          <span className="text-xs font-semibold text-[#212121]">{r.rating}</span>
        </div>
      ),
    },
    {
      key: "helpful",
      header: "Hữu ích",
      render: (r: Review) => (
        <div className="flex items-center gap-1 text-[#757575] text-xs">
          <ThumbsUp size={11} /> {r.helpful_count}
        </div>
      ),
    },
    { key: "status", header: "Trạng thái", render: (r: Review) => <ReviewStatusBadge approved={r.is_approved} /> },
    { key: "date", header: "Ngày", render: (r: Review) => <span className="text-[#757575] text-xs">{r.created_at}</span> },
  ];

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Quản lý đánh giá"
        subtitle={`${total} đánh giá • ${pendingCount} chờ duyệt`}
        actions={
          <>
            <button className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50 text-[#2E7D32]">
              <CheckCircle size={14} /> Duyệt đã chọn ({selected.length})
            </button>
          </>
        }
      />
      <div className="bg-white rounded-xl border border-[#E0E0E0]">
        {error && (
          <div className="mx-4 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="px-4 py-3 border-b border-[#E0E0E0]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo sản phẩm, người dùng..."
                className="pl-8 pr-4 py-2 border border-[#E0E0E0] rounded-lg text-sm w-full focus:outline-none focus:border-[#1565C0]"
              />
            </div>
            <div className="flex gap-1">
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(i); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === i ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-100"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
        <TableDataTable
          data={reviews}
          columns={columns}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
          idKey="review_id"
          onRowHover={setHoveredRow}
          renderRowActions={(r: Review) => (
            <div className={`flex items-center gap-1 transition-opacity ${hoveredRow === r.review_id ? "opacity-100" : "opacity-0"}`}>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Eye size={13} /></button>
              {r.is_approved ? (
                <button
                  onClick={() => handleReject(r.review_id)}
                  disabled={actionLoading === r.review_id}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-[#E53935] disabled:opacity-50"
                >
                  {actionLoading === r.review_id ? <RefreshCw size={13} className="animate-spin" /> : <XCircle size={13} />}
                </button>
              ) : (
                <button
                  onClick={() => handleApprove(r.review_id)}
                  disabled={actionLoading === r.review_id}
                  className="p-1.5 rounded-lg hover:bg-green-50 text-[#2E7D32] disabled:opacity-50"
                >
                  {actionLoading === r.review_id ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                </button>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
}
