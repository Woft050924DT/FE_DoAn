'use client'

import { useState } from "react";
import { Search, Star, CheckCircle, XCircle, ThumbsUp, ThumbsDown, Eye } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { TableDataTable } from "@/components/Table/DataTable";

interface Review {
  id: string;
  productName: string;
  productImage: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  comment: string;
  isVerified: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: string;
}

const MOCK_REVIEWS: Review[] = [
  { id: "1", productName: "iPhone 15 Pro Max", productImage: "", userName: "Nguyễn Văn A", userAvatar: "NA", rating: 5, title: "Sản phẩm tuyệt vời", comment: "Điện thoại rất đẹp, camera chụp ảnh sắc nét, pin trâu. Mình rất hài lòng với sản phẩm này.", isVerified: true, isApproved: true, helpfulCount: 24, createdAt: "15/01/2024" },
  { id: "2", productName: "Samsung Galaxy S24 Ultra", productImage: "", userName: "Trần Thị B", userAvatar: "TB", rating: 4, title: "Tốt nhưng hơi đắt", comment: "Sản phẩm tốt, màn hình đẹp, nhưng giá hơi cao so với các dòng khác.", isVerified: true, isApproved: true, helpfulCount: 12, createdAt: "14/01/2024" },
  { id: "3", productName: "MacBook Air M3", productImage: "", userName: "Lê Minh C", userAvatar: "LC", rating: 5, title: "Máy tính xứng đáng", comment: "Mình dùng cho công việc lập trình, máy chạy rất mượt, pin 10 tiếng không phải nói quá.", isVerified: true, isApproved: true, helpfulCount: 45, createdAt: "13/01/2024" },
  { id: "4", productName: "AirPods Pro 2", productImage: "", userName: "Phạm Thu D", userAvatar: "PD", rating: 3, title: "Chất lượng âm thanh OK", comment: "Âm thanh ổn, nhưng đeo hơi đau tai sau 2 tiếng sử dụng.", isVerified: false, isApproved: false, helpfulCount: 3, createdAt: "12/01/2024" },
  { id: "5", productName: "iPad Pro 12.9", productImage: "", userName: "Hoàng Văn E", userAvatar: "HE", rating: 5, title: "Đáng đồng tiền", comment: "Màn hình Liquid Retina XDR quá đẹp, dùng để vẽ và xem phim là tuyệt vời.", isVerified: true, isApproved: true, helpfulCount: 31, createdAt: "11/01/2024" },
  { id: "6", productName: "Sony WH-1000XM5", productImage: "", userName: "Vũ Thị F", userAvatar: "VF", rating: 4, title: "Tai nghe chống ồn tốt", comment: "Chống ồn rất hiệu quả, âm bass mạnh, nhưng giá hơi cao.", isVerified: true, isApproved: false, helpfulCount: 8, createdAt: "10/01/2024" },
  { id: "7", productName: "Xiaomi Redmi Note 13", productImage: "", userName: "Đặng Văn G", userAvatar: "DG", rating: 5, title: "Pin trâu, giá hợp lý", comment: "Dưới 8 triệu mà có cấu hình tốt, pin 5000mAh dùng thoải mái cả ngày.", isVerified: true, isApproved: true, helpfulCount: 56, createdAt: "09/01/2024" },
  { id: "8", productName: "Logitech MX Master 3S", productImage: "", userName: "Bùi Thị H", userAvatar: "BH", rating: 5, title: "Chuột văn phòng tốt nhất", comment: "Scroll wheel siêu mượt, kết nối được 3 thiết bị cùng lúc rất tiện.", isVerified: true, isApproved: true, helpfulCount: 19, createdAt: "08/01/2024" },
];

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
  const [selected, setSelected] = useState<string[]>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const filtered = MOCK_REVIEWS.filter((r) => {
    const matchSearch =
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 0) return matchSearch;
    if (activeTab === 1) return matchSearch && !r.isApproved;
    if (activeTab === 2) return matchSearch && r.isApproved;
    return matchSearch;
  });

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((r) => r.id));
  };

  const columns = [
    {
      key: "review",
      header: "Đánh giá",
      render: (r: Review) => (
        <div className="flex items-start gap-3 max-w-sm">
          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            {r.productImage ? (
              <img src={r.productImage} alt={r.productName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] font-bold text-[#757575]">{r.productName.slice(0, 2)}</span>
            )}
          </div>
          <div>
            <p className="font-medium text-[#212121] text-xs line-clamp-1">{r.productName}</p>
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
          <div className="w-6 h-6 bg-[#1565C0] rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0">{r.userAvatar}</div>
          <div>
            <p className="text-xs font-medium text-[#212121]">{r.userName}</p>
            {r.isVerified && <p className="text-[10px] text-[#2E7D32] flex items-center gap-0.5"><CheckCircle size={9} /> Đã mua hàng</p>}
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
          <ThumbsUp size={11} /> {r.helpfulCount}
        </div>
      ),
    },
    { key: "status", header: "Trạng thái", render: (r: Review) => <ReviewStatusBadge approved={r.isApproved} /> },
    { key: "date", header: "Ngày", render: (r: Review) => <span className="text-[#757575] text-xs">{r.createdAt}</span> },
  ];

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Quản lý đánh giá"
        subtitle={`${MOCK_REVIEWS.length} đánh giá • ${MOCK_REVIEWS.filter((r) => !r.isApproved).length} chờ duyệt`}
        actions={
          <>
            <button className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50 text-[#2E7D32]">
              <CheckCircle size={14} /> Duyệt đã chọn ({selected.length})
            </button>
          </>
        }
      />
      <div className="bg-white rounded-xl border border-[#E0E0E0]">
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
                  onClick={() => setActiveTab(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === i ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-100"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
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
          renderRowActions={(r: Review) => (
            <div className={`flex items-center gap-1 transition-opacity ${hoveredRow === r.id ? "opacity-100" : "opacity-0"}`}>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Eye size={13} /></button>
              <button className="p-1.5 rounded-lg hover:bg-green-50 text-[#2E7D32]"><CheckCircle size={13} /></button>
              <button className="p-1.5 rounded-lg hover:bg-red-50 text-[#E53935]"><XCircle size={13} /></button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
