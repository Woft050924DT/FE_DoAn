'use client'

import { useState, useEffect, useCallback } from "react";
import { Search, Bot, ArrowDown, ArrowUp, Download } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { TableDataTable } from "@/components/Table/DataTable";
import { adminAILogService, AILog } from "@/services/adminService";

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
  const [logs, setLogs] = useState<AILog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [lowConfCount, setLowConfCount] = useState(0);
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const handleExport = async () => {
    try {
      const data = await adminAILogService.export();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ai-logs.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let helpfulParam: boolean | undefined;
      let handedOffParam: boolean | undefined;
      let lowConfParam: boolean | undefined;
      if (activeTab === 1) helpfulParam = true;
      if (activeTab === 2) helpfulParam = false;
      if (activeTab === 3) handedOffParam = true;
      if (activeTab === 4) lowConfParam = true;
      const res = await adminAILogService.getList({
        search,
        helpful: helpfulParam,
        handed_off: handedOffParam,
        low_confidence: lowConfParam,
        page,
        limit: LIMIT,
      });
      setLogs(Array.isArray(res.data) ? res.data : []);
      setTotal(res.pagination?.total ?? 0);
    } catch (err) {
      console.error("Failed to fetch AI logs:", err);
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, activeTab, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    adminAILogService.getList({ low_confidence: true, limit: 1 })
      .then(res => setLowConfCount(res.pagination?.total ?? 0))
      .catch(() => {});
  }, [activeTab]);

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    if (selected.length === logs.length) setSelected([]);
    else setSelected(logs.map((l) => l.id));
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
          <p className="text-xs font-medium text-[#212121]">{log.user_name}</p>
          {log.user_email && <p className="text-[10px] text-[#757575]">{log.user_email}</p>}
        </div>
      ),
    },
    {
      key: "handoff",
      header: "Chuyển",
      render: (log: AILog) => log.handed_off ? (
        <span className="text-xs bg-amber-100 text-[#E65100] px-2 py-0.5 rounded font-medium">Có</span>
      ) : <span className="text-xs text-[#9E9E9E]">—</span>,
    },
    { key: "date", header: "Thời gian", render: (log: AILog) => <span className="text-[#757575] text-xs">{log.created_at}</span> },
  ];

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="AI Chat Logs"
        subtitle={`${total} cuộc hội thoại • ${lowConfCount} confidence thấp`}
        actions={
          <>
            <button onClick={handleExport} className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
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
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm câu hỏi, phản hồi..." className="pl-8 pr-4 py-2 border border-[#E0E0E0] rounded-lg text-sm w-full focus:outline-none focus:border-[#1565C0]" />
            </div>
            <div className="flex gap-1">
              {TABS.map((tab, i) => (
                <button key={tab} onClick={() => { setActiveTab(i); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === i ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-100"}`}>{tab}</button>
              ))}
            </div>
          </div>
        </div>
        <TableDataTable
          data={logs}
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
              {log.handed_off && <Bot size={13} className="text-amber-500" />}
            </div>
          )}
        />
      </div>
    </div>
  );
}
