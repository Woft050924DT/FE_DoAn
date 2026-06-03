'use client'

import { useState } from "react";
import { Plus, Edit2, Trash2, Search, Reply, Copy } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { TableDataTable } from "@/components/Table/DataTable";

interface QuickReply {
  id: string;
  shortcut: string;
  content: string;
  category: string;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

const MOCK_QUICK_REPLIES: QuickReply[] = [
  { id: "1", shortcut: "/chào", content: "Xin chào! Cảm ơn bạn đã liên hệ với VietShop. Mình có thể giúp gì cho bạn hôm nay?", category: "Chào hỏi", usageCount: 1245, isActive: true, createdAt: "01/01/2024" },
  { id: "2", shortcut: "/cảm-ơn", content: "Cảm ơn bạn đã mua sắm tại VietShop! Nếu có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ lại nhé.", category: "Cảm ơn", usageCount: 876, isActive: true, createdAt: "01/01/2024" },
  { id: "3", shortcut: "/ship", content: "VietShop miễn phí giao hàng cho đơn từ 299K. Giao hàng nhanh 1-2 ngày cho nội thành HCM và HN.", category: "Vận chuyển", usageCount: 654, isActive: true, createdAt: "01/01/2024" },
  { id: "4", shortcut: "/doi-tra", content: "VietShop hỗ trợ đổi trả trong 7 ngày với điều kiện sản phẩm còn nguyên seal, chưa qua sử dụng và còn đầy đủ phụ kiện đi kèm.", category: "Đổi trả", usageCount: 543, isActive: true, createdAt: "01/01/2024" },
  { id: "5", shortcut: "/bh", content: "Tất cả sản phẩm tại VietShop được bảo hành chính hãng theo chính sách của nhà sản xuất. Thời gian bảo hành từ 12-24 tháng tùy sản phẩm.", category: "Bảo hành", usageCount: 432, isActive: true, createdAt: "01/01/2024" },
  { id: "6", shortcut: "/tt", content: "VietShop chấp nhận thanh toán qua: COD (nhận hàng trả tiền), Chuyển khoản ngân hàng, MoMo, VNPay, PayPal. Bạn muốn thanh toán qua hình thức nào?", category: "Thanh toán", usageCount: 321, isActive: true, createdAt: "01/01/2024" },
  { id: "7", shortcut: "/tg", content: "Thời gian phản hồi của VietShop: 8h-21h các ngày trong tuần (không nghỉ). Tin nhắn ngoài giờ sẽ được phản hồi vào sáng ngày làm việc tiếp theo.", category: "Giờ làm việc", usageCount: 210, isActive: true, createdAt: "01/01/2024" },
  { id: "8", shortcut: "/tksp", content: "Mình xin lỗi vì sự bất tiện này. Mình sẽ chuyển yêu cầu của bạn đến bộ phận liên quan để xử lý sớm nhất có thể.", category: "Xin lỗi", usageCount: 198, isActive: false, createdAt: "05/01/2024" },
];

const CATEGORIES = ["Tất cả", "Chào hỏi", "Cảm ơn", "Vận chuyển", "Đổi trả", "Bảo hành", "Thanh toán", "Giờ làm việc", "Xin lỗi"];

const TABS = ["Tất cả", "Đang dùng", "Tạm tắt"];

export default function AdminQuickRepliesPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [formData, setFormData] = useState({ shortcut: "", content: "", category: "Chào hỏi" });

  const filtered = MOCK_QUICK_REPLIES.filter((r) => {
    const matchSearch = r.shortcut.toLowerCase().includes(search.toLowerCase()) || r.content.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 0) return matchSearch;
    if (activeTab === 1) return matchSearch && r.isActive;
    return matchSearch && !r.isActive;
  });

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((r) => r.id));
  };

  const columns = [
    {
      key: "shortcut",
      header: "Shortcut",
      render: (r: QuickReply) => (
        <div className="flex items-center gap-2">
          <span className="font-mono bg-gray-100 text-[#1565C0] text-xs px-2 py-1 rounded font-semibold">{r.shortcut}</span>
          <button className="p-1 hover:bg-gray-100 rounded text-[#757575]"><Copy size={11} /></button>
        </div>
      ),
    },
    {
      key: "content",
      header: "Nội dung",
      render: (r: QuickReply) => (
        <p className="text-xs text-[#212121] line-clamp-2 max-w-sm">{r.content}</p>
      ),
    },
    { key: "category", header: "Danh mục", render: (r: QuickReply) => <span className="bg-gray-100 text-[#757575] text-xs px-2 py-0.5 rounded">{r.category}</span> },
    { key: "usageCount", header: "Sử dụng", render: (r: QuickReply) => <span className="text-[#757575] text-xs font-medium">{r.usageCount}</span> },
    {
      key: "status",
      header: "Trạng thái",
      render: (r: QuickReply) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.isActive ? "bg-green-100 text-[#2E7D32]" : "bg-gray-100 text-[#757575]"}`}>
          {r.isActive ? "Đang dùng" : "Tạm tắt"}
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
          <h1 className="text-lg font-bold text-[#212121]">Tạo trả lời nhanh</h1>
        </div>
        <div className="bg-white rounded-xl border border-[#E0E0E0] p-6 max-w-xl space-y-4">
          <div>
            <label className="text-xs font-medium text-[#757575] mb-1 block">Shortcut *</label>
            <input value={formData.shortcut} onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })} placeholder="VD: /chao" className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#1565C0]" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#757575] mb-1 block">Danh mục</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] bg-white">
              {CATEGORIES.filter((c) => c !== "Tất cả").map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[#757575] mb-1 block">Nội dung trả lời *</label>
            <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} placeholder="Nhập nội dung trả lời nhanh..." className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] resize-none" />
          </div>
          <div className="flex gap-3 pt-4 border-t border-[#E0E0E0]">
            <button onClick={() => setShowForm(false)} className="flex-1 border border-[#E0E0E0] py-2.5 rounded-lg text-sm hover:bg-gray-50">Hủy</button>
            <button className="flex-1 bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">Tạo trả lời nhanh</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Trả lời nhanh"
        subtitle={`${MOCK_QUICK_REPLIES.length} mẫu trả lời`}
        actions={
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={14} /> Tạo trả lời nhanh
          </button>
        }
      />
      <div className="bg-white rounded-xl border border-[#E0E0E0]">
        <div className="px-4 py-3 border-b border-[#E0E0E0] flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm shortcut, nội dung..." className="pl-8 pr-4 py-2 border border-[#E0E0E0] rounded-lg text-sm w-full focus:outline-none focus:border-[#1565C0]" />
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
          renderRowActions={(r: QuickReply) => (
            <div className={`flex items-center gap-1 transition-opacity ${hoveredRow === r.id ? "opacity-100" : "opacity-0"}`}>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Reply size={13} /></button>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Edit2 size={13} /></button>
              <button className="p-1.5 rounded-lg hover:bg-red-50 text-[#E53935]"><Trash2 size={13} /></button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
