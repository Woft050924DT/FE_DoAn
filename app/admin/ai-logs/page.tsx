'use client'

import { useState } from "react";
import { Search, Bot, ArrowDown, ArrowUp, ChevronRight, Download, Filter, MessageSquare } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { TableDataTable } from "@/components/Table/DataTable";

interface AILog {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  question: string;
  reply: string;
  intent: string;
  confidence: number;
  wasHelpful: boolean | null;
  handedOff: boolean;
  createdAt: string;
  duration: number;
}

const MOCK_LOGS: AILog[] = [
  { id: "1", sessionId: "sess-001", userId: "u1", userName: "Nguyễn Văn A", userEmail: "nvana@email.com", question: "Cho tôi hỏi iPhone 15 Pro có mấy màu?", reply: "iPhone 15 Pro có 4 màu: Titan tự nhiên, Titan xanh dương, Titan trắng, Titan đen. Bạn quan tâm màu nào nhất?", intent: "product_inquiry", confidence: 0.96, wasHelpful: true, handedOff: false, createdAt: "20/01/2024 14:32", duration: 2 },
  { id: "2", sessionId: "sess-002", userId: "u2", userName: "Trần Thị B", userEmail: "ttb@email.com", question: "Tôi muốn đổi sang Samsung Galaxy S24", reply: "Để đổi sản phẩm, bạn vui lòng liên hệ bộ phận chăm sóc khách hàng qua hotline 1900-xxxx...", intent: "order_inquiry", confidence: 0.91, wasHelpful: null, handedOff: true, createdAt: "20/01/2024 14:18", duration: 5 },
  { id: "3", sessionId: "sess-003", userId: "u3", userName: "Lê Minh C", userEmail: "lmc@email.com", question: "Chính sách đổi trả như thế nào?", reply: "VietShop cho phép đổi trả trong vòng 7 ngày nếu sản phẩm còn nguyên seal, bao bì. Điều kiện chi tiết...", intent: "return_policy", confidence: 0.99, wasHelpful: true, handedOff: false, createdAt: "20/01/2024 13:45", duration: 1 },
  { id: "4", sessionId: "sess-004", userId: "", userName: "Khách vãng lai", userEmail: "", question: "Có giao hàng vào Chủ nhật không?", reply: "Dạ VietShop có hỗ trợ giao hàng 7/7 kể cả Chủ nhật. Tuy nhiên phí giao hàng Chủ nhật sẽ cao hơn...", intent: "shipping_inquiry", confidence: 0.94, wasHelpful: false, handedOff: false, createdAt: "20/01/2024 12:20", duration: 3 },
  { id: "5", sessionId: "sess-005", userId: "u4", userName: "Phạm Thu D", userEmail: "ptd@email.com", question: "Hướng dẫn tôi cách đặt hàng trên website", reply: "Để đặt hàng, bạn chọn sản phẩm -> Thêm vào giỏ -> Điền thông tin giao hàng -> Chọn thanh toán...", intent: "how_to_order", confidence: 0.97, wasHelpful: true, handedOff: false, createdAt: "20/01/2024 11:55", duration: 1 },
  { id: "6", sessionId: "sess-006", userId: "", userName: "Khách vãng lai", userEmail: "", question: "MacBook Air M3 giá bao nhiêu?", reply: "MacBook Air M3 hiện có giá từ 28.9 triệu VNĐ. Bạn muốn xem thông tin chi tiết về cấu hình nào?", intent: "product_inquiry", confidence: 0.88, wasHelpful: null, handedOff: false, createdAt: "20/01/2024 10:30", duration: 2 },
  { id: "7", sessionId: "sess-007", userId: "u5", userName: "Hoàng Văn E", userEmail: "hve@email.com", question: "Tôi chưa nhận được đơn hàng đã đặt 3 ngày trước", reply: "", intent: "order_inquiry", confidence: 0.72, wasHelpful: null, handedOff: true, createdAt: "19/01/2024 16:42", duration: 0 },
  { id: "8", sessionId: "sess-008", userId: "u6", userName: "Vũ Thị F", userEmail: "vtf@email.com", question: "Mã giảm giá NEWUSER có còn không?", reply: "Dạ mã NEWUSER vẫn còn hiệu lực. Bạn sẽ được giảm 50K cho đơn hàng đầu tiên. Áp dụng tại bước thanh toán.", intent: "coupon_inquiry", confidence: 0.98, wasHelpful: true, handedOff: false, createdAt: "19/01/2024 15:10", duration: 1 },
];

const TABS = ["Tất cả", "Hữu ích", "Không hữu ích", "Chuyển nhân viên", "Độ confidence thấp"];

const IntentBadge = ({ intent }: { intent: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    product_inquiry: { label: "Hỏi sản phẩm", cls: "bg-blue-100 text-[#1565C0]" },
    order_inquiry: { label: "Hỏi đơn hàng", cls: "bg-purple-100 text-purple-700" },
    return_policy: { label: "Chính sách đổi trả", cls: "bg-green-100 text-[#2E7D32]" },
    shipping_inquiry: { label: "Hỏi vận chuyển", cls: "bg-amber-100 text-[#E65100]" },
    how_to_order: { label: "Hướng dẫn đặt hàng", cls: "bg-teal-100 text-teal-700" },
    coupon_inquiry: { label: "Hỏi mã giảm giá", cls: "bg-rose-100 text-rose-700" },
    unknown: { label: "Không xác định", cls: "bg-gray-100 text-gray-500" },
  };
  const s = map[intent] || map.unknown;
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.cls}`}>{s.label}</span>;
};

const ConfidenceBar = ({ confidence }: { confidence: number }) => (
  <div className="flex items-center gap-2">
    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${confidence >= 0.9 ? "bg-green-500" : confidence >= 0.7 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${confidence * 100}%` }} />
    </div>
    <span className={`text-xs font-semibold ${confidence >= 0.9 ? "text-[#2E7D32]" : confidence >= 0.7 ? "text-[#E65100]" : "text-[#E53935]"}`}>{(confidence * 100).toFixed(0)}%</span>
  </div>
);

export default function AdminAILogsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const filtered = MOCK_LOGS.filter((log) => {
    const matchSearch = log.question.toLowerCase().includes(search.toLowerCase()) || log.userName.toLowerCase().includes(search.toLowerCase()) || log.reply.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 0) return matchSearch;
    if (activeTab === 1) return matchSearch && log.wasHelpful === true;
    if (activeTab === 2) return matchSearch && log.wasHelpful === false;
    if (activeTab === 3) return matchSearch && log.handedOff;
    if (activeTab === 4) return matchSearch && log.confidence < 0.8;
    return matchSearch;
  });

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((l) => l.id));
  };

  const columns = [
    {
      key: "question",
      header: "Câu hỏi / Phản hồi",
      render: (log: AILog) => (
        <div className="max-w-sm">
          <div className="bg-blue-50 rounded-lg p-2 mb-1.5">
            <p className="text-xs font-medium text-[#1565C0]">❓ {log.question}</p>
          </div>
          {expandedLog === log.id ? (
            <div className="bg-green-50 rounded-lg p-2">
              <p className="text-xs text-[#2E7D32]">✅ {log.reply}</p>
            </div>
          ) : log.reply && (
            <p className="text-[11px] text-[#757575] line-clamp-1">✅ {log.reply}</p>
          )}
        </div>
      ),
    },
    { key: "intent", header: "Intent", render: (log: AILog) => <IntentBadge intent={log.intent} /> },
    { key: "confidence", header: "Confidence", render: (log: AILog) => <ConfidenceBar confidence={log.confidence} /> },
    {
      key: "user",
      header: "Người dùng",
      render: (log: AILog) => (
        <div>
          <p className="text-xs font-medium text-[#212121]">{log.userName}</p>
          {log.userEmail && <p className="text-[10px] text-[#757575]">{log.userEmail}</p>}
        </div>
      ),
    },
    {
      key: "handoff",
      header: "Chuyển",
      render: (log: AILog) => log.handedOff ? (
        <span className="text-xs bg-amber-100 text-[#E65100] px-2 py-0.5 rounded font-medium">Có</span>
      ) : <span className="text-xs text-[#9E9E9E]">—</span>,
    },
    { key: "date", header: "Thời gian", render: (log: AILog) => <span className="text-[#757575] text-xs">{log.createdAt}</span> },
  ];

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="AI Chat Logs"
        subtitle={`${MOCK_LOGS.length} cuộc hội thoại • ${MOCK_LOGS.filter((l) => l.confidence < 0.8).length} confidence thấp`}
        actions={
          <>
            <button className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
              <Download size={14} /> Export
            </button>
          </>
        }
      />
      <div className="bg-white rounded-xl border border-[#E0E0E0]">
        <div className="px-4 py-3 border-b border-[#E0E0E0]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm câu hỏi, phản hồi..." className="pl-8 pr-4 py-2 border border-[#E0E0E0] rounded-lg text-sm w-full focus:outline-none focus:border-[#1565C0]" />
            </div>
            <div className="flex gap-1">
              {TABS.map((tab, i) => (
                <button key={tab} onClick={() => setActiveTab(i)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === i ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-100"}`}>{tab}</button>
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
          renderRowActions={(log: AILog) => (
            <div className={`flex items-center gap-1 transition-opacity ${hoveredRow === log.id ? "opacity-100" : "opacity-0"}`}>
              <button onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]">
                {expandedLog === log.id ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
              </button>
              {log.handedOff && <Bot size={13} className="text-amber-500" />}
            </div>
          )}
        />
      </div>
    </div>
  );
}
