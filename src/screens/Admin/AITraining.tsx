import { useState } from "react";
import { Plus, Upload, Download, MoreVertical, X, TrendingUp, TrendingDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import { UIPageHeader } from "../../components/UI/PageHeader";
import { ProductFilterSection } from "../../components/Product/FilterSection";
import { TableDataTable } from "../../components/Table/DataTable";

const AI_TRAINING_DATA: any[] = [];

const CATEGORY_TABS = ["Tất cả", "Thông tin sản phẩm", "FAQ", "Chính sách", "Hướng dẫn"];
const CATEGORY_COLORS: Record<string, string> = {
  "Thông tin sản phẩm": "bg-blue-100 text-[#1565C0]",
  "Chính sách": "bg-amber-100 text-amber-700",
  "FAQ": "bg-purple-100 text-purple-700",
  "Hướng dẫn": "bg-green-100 text-[#2E7D32]",
};

const INTENT_DATA = [
  { intent: "Đơn hàng", count: 892 },
  { intent: "Sản phẩm", count: 678 },
  { intent: "Đổi trả", count: 567 },
  { intent: "Vận chuyển", count: 445 },
  { intent: "Thanh toán", count: 234 },
];

const FEEDBACK_TREND = [
  { day: "T2", positive: 45, negative: 3 },
  { day: "T3", positive: 52, negative: 5 },
  { day: "T4", positive: 38, negative: 2 },
  { day: "T5", positive: 61, negative: 4 },
  { day: "T6", positive: 74, negative: 6 },
  { day: "T7", positive: 89, negative: 3 },
  { day: "CN", positive: 67, negative: 7 },
];

const LOW_CONFIDENCE_LOGS = [
  { question: "Khi nào thì sản phẩm về kho?", intent: "Kho hàng", score: 62, date: "16/01/2024" },
  { question: "Tôi có thể mua hàng ở đâu?", intent: "Địa điểm", score: 58, date: "16/01/2024" },
  { question: "Có voucher mới không?", intent: "Khuyến mãi", score: 65, date: "15/01/2024" },
];

type ActiveTab = "data" | "performance";

export function ScreensAdminAITraining() {
  const [activeMainTab, setActiveMainTab] = useState<ActiveTab>("data");
  const [activeCategoryTab, setActiveCategoryTab] = useState(0);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeOnlyFilter, setActiveOnlyFilter] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const filteredData = AI_TRAINING_DATA.filter((item) => {
    const matchCat = activeCategoryTab === 0 || item.category === CATEGORY_TABS[activeCategoryTab];
    const matchSearch = item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase());
    const matchActive = !activeOnlyFilter || item.active;
    return matchCat && matchSearch && matchActive;
  });

  const toggleSelect = (id: string) =>
    setSelectedItems((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleAll = () => {
    if (selectedItems.length === filteredData.length) setSelectedItems([]);
    else setSelectedItems(filteredData.map((item) => item.id));
  };

  const KPI_METRICS = [
    { label: "Tổng câu hỏi", value: AI_TRAINING_DATA.length || 0, icon: "📚", change: "+12", up: true },
    { label: "Độ chính xác TB", value: "87%", icon: "🎯", change: "+3.2%", up: true },
    { label: "Intent phổ biến", value: "Đơn hàng", icon: "🔥", change: "892 lần", up: true },
    { label: "Phản hồi tiêu cực", value: "3.8%", icon: "👎", change: "-0.5%", up: false },
  ];

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Dữ liệu huấn luyện AI"
        subtitle="Quản lý câu hỏi & câu trả lời cho AI Chatbot"
        actions={
          <>
            <button className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
              <Upload size={14} /> Import CSV
            </button>
            <button className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
              <Download size={14} /> Export
            </button>
            <button
              onClick={() => { setEditingEntry(null); setDrawerOpen(true); }}
              className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <Plus size={14} /> Thêm câu hỏi
            </button>
          </>
        }
      />

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_METRICS.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-[#E0E0E0] p-4">
            <div className="flex items-start justify-between">
              <span className="text-2xl">{kpi.icon}</span>
              <div className={`flex items-center gap-1 text-xs font-medium ${kpi.up ? "text-[#2E7D32]" : "text-[#E53935]"}`}>
                {kpi.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {kpi.change}
              </div>
            </div>
            <p className="text-xl font-bold text-[#212121] mt-2">{kpi.value}</p>
            <p className="text-xs text-[#757575]">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Main Tabs */}
      <div className="flex gap-1 border-b border-[#E0E0E0]">
        {(["data", "performance"] as ActiveTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveMainTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              activeMainTab === tab
                ? "text-[#1565C0] border-b-2 border-[#1565C0] -mb-px"
                : "text-[#757575] hover:text-[#212121]"
            }`}
          >
            {tab === "data" ? "Dữ liệu huấn luyện" : "Hiệu suất"}
          </button>
        ))}
      </div>

      {activeMainTab === "data" && (
        <>
          <ProductFilterSection
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Tìm câu hỏi, câu trả lời..."
            tabs={CATEGORY_TABS}
            activeTab={activeCategoryTab}
            onTabChange={setActiveCategoryTab}
            extraContent={
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeOnlyFilter}
                  onChange={(e) => setActiveOnlyFilter(e.target.checked)}
                  className="w-4 h-4 accent-[#1565C0]"
                />
                <span className="text-sm text-[#757575]">Chỉ hiện đang hoạt động</span>
              </label>
            }
          />

          <TableDataTable
            data={filteredData}
            columns={[
              {
                key: "index",
                header: "#",
                render: (_: any, idx: number) => <span className="text-[#757575] text-xs">{idx + 1}</span>,
              },
              {
                key: "category",
                header: "Danh mục",
                render: (item: any) => (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[item.category] || "bg-gray-100 text-[#757575]"}`}>
                    {item.category}
                  </span>
                ),
              },
              {
                key: "question",
                header: "Câu hỏi",
                render: (item: any) => (
                  <p className="text-[#212121] text-xs line-clamp-2 max-w-48">{item.question}</p>
                ),
              },
              {
                key: "answer",
                header: "Câu trả lời",
                render: (item: any) => (
                  <p className="text-[#757575] text-xs line-clamp-2 max-w-48">{item.answer}</p>
                ),
              },
              {
                key: "keywords",
                header: "Từ khóa",
                render: (item: any) => (
                  <div className="flex flex-wrap gap-1">
                    {item.keywords.slice(0, 2).map((kw: string) => (
                      <span key={kw} className="text-[10px] bg-gray-100 text-[#757575] px-1.5 py-0.5 rounded">{kw}</span>
                    ))}
                  </div>
                ),
              },
              {
                key: "usage",
                header: "Sử dụng",
                render: (item: any) => <span className="text-[#757575] text-xs">{item.usage}</span>,
              },
              {
                key: "feedback",
                header: "Phản hồi",
                render: (item: any) => (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[#2E7D32] font-medium">▲{item.feedback.positive}</span>
                    <span className="text-[#E53935] font-medium">▼{item.feedback.negative}</span>
                  </div>
                ),
              },
              {
                key: "active",
                header: "Kích hoạt",
                render: (item: any) => (
                  <div className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${item.active ? "bg-[#2E7D32]" : "bg-gray-200"}`}>
                    <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${item.active ? "left-4" : "left-0.5"}`} />
                  </div>
                ),
              },
            ]}
            selectedIds={selectedItems}
            onToggleSelect={toggleSelect}
            onToggleAll={toggleAll}
            idKey="id"
            renderRowActions={(item: any) => (
              <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                <button className="text-xs text-[#1565C0] hover:underline px-1">Sửa</button>
                <button className="text-xs text-[#E53935] hover:underline px-1">Xóa</button>
              </div>
            )}
          />
        </>
      )}

      {activeMainTab === "performance" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Top Intents Chart */}
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
              <h3 className="font-semibold text-[#212121] mb-5">Top 5 Intent phổ biến</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={INTENT_DATA} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#757575" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="intent" tick={{ fontSize: 12, fill: "#757575" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#1565C0" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 11, fill: "#757575" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Feedback Trend */}
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
              <h3 className="font-semibold text-[#212121] mb-5">Xu hướng phản hồi (7 ngày)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={FEEDBACK_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F6FA" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#757575" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#757575" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="positive" stroke="#2E7D32" strokeWidth={2} dot={{ r: 3 }} name="Tích cực" />
                  <Line type="monotone" dataKey="negative" stroke="#E53935" strokeWidth={2} dot={{ r: 3 }} name="Tiêu cực" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Low Confidence Logs */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E0E0E0]">
              <h3 className="font-semibold text-[#212121]">Câu hỏi độ tin cậy thấp (&lt;70%)</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[#F5F6FA]">
                <tr>
                  {["Câu hỏi", "Intent dự đoán", "Điểm tin cậy", "Ngày"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#757575]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F6FA]">
                {LOW_CONFIDENCE_LOGS.map((log, i) => (
                  <tr key={i} className="hover:bg-[#F5F6FA]">
                    <td className="px-5 py-3 text-[#212121] text-sm">{log.question}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{log.intent}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-2">
                          <div className="h-2 bg-amber-400 rounded-full" style={{ width: `${log.score}%` }} />
                        </div>
                        <span className="text-xs font-medium text-amber-600">{log.score}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#757575]">{log.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0]">
              <h3 className="font-bold text-[#212121]">{editingEntry ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}</h3>
              <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Danh mục *</label>
                <select className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] bg-white"
                  defaultValue={editingEntry?.category}>
                  {CATEGORY_TABS.slice(1).map((cat) => <option key={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Câu hỏi *</label>
                <textarea
                  rows={3}
                  defaultValue={editingEntry?.question}
                  placeholder="Nhập câu hỏi..."
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Câu trả lời *</label>
                <div className="border border-[#E0E0E0] rounded-lg overflow-hidden">
                  <div className="bg-[#F5F6FA] px-3 py-2 border-b border-[#E0E0E0] flex gap-2">
                    {["B", "I", "List"].map((t) => (
                      <button key={t} className="text-xs px-2 py-0.5 hover:bg-white rounded font-medium text-[#757575]">{t}</button>
                    ))}
                  </div>
                  <textarea
                    rows={4}
                    defaultValue={editingEntry?.answer}
                    placeholder="Nhập câu trả lời..."
                    className="w-full px-3 py-2.5 text-sm focus:outline-none resize-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Từ khóa</label>
                <div className="flex flex-wrap gap-2 p-2 border border-[#E0E0E0] rounded-lg min-h-10">
                  {(editingEntry?.keywords || []).map((kw) => (
                    <span key={kw} className="flex items-center gap-1 text-xs bg-[#1565C0]/10 text-[#1565C0] px-2 py-0.5 rounded-full">
                      {kw} <X size={10} className="cursor-pointer" />
                    </span>
                  ))}
                  <input placeholder="Thêm từ khóa..." className="text-sm focus:outline-none flex-1 min-w-20" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-[#757575]">Kích hoạt</label>
                <div className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${editingEntry?.active !== false ? "bg-[#2E7D32]" : "bg-gray-200"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${editingEntry?.active !== false ? "left-5" : "left-0.5"}`} />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-[#E0E0E0]">
                <button onClick={() => setDrawerOpen(false)} className="flex-1 border border-[#E0E0E0] py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                  Hủy
                </button>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 bg-[#E53935] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#C62828]"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
