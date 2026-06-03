'use client'

import { useState } from "react";
import { Plus, Upload, Download, X, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { ProductFilterSection } from "@/components/Product/FilterSection";
import { TableDataTable } from "@/components/Table/DataTable";

const CATEGORY_TABS = ["Tất cả", "Thông tin sản phẩm", "FAQ", "Chính sách", "Hướng dẫn"];
const CATEGORY_COLORS: Record<string, string> = {
  "Thông tin sản phẩm": "bg-blue-100 text-[#1565C0]",
  "Chính sách": "bg-amber-100 text-amber-700",
  "FAQ": "bg-purple-100 text-purple-700",
  "Hướng dẫn": "bg-green-100 text-[#2E7D32]",
};

const INTENT_DATA = [
  { intent: "Đơn hàng", count: 892 }, { intent: "Sản phẩm", count: 678 }, { intent: "Đổi trả", count: 567 },
  { intent: "Vận chuyển", count: 445 }, { intent: "Thanh toán", count: 234 },
];

const FEEDBACK_TREND = [
  { day: "T2", positive: 45, negative: 3 }, { day: "T3", positive: 52, negative: 5 }, { day: "T4", positive: 38, negative: 2 },
  { day: "T5", positive: 61, negative: 4 }, { day: "T6", positive: 74, negative: 6 }, { day: "T7", positive: 89, negative: 3 }, { day: "CN", positive: 67, negative: 7 },
];

const LOW_CONFIDENCE_LOGS = [
  { question: "Khi nào thì sản phẩm về kho?", intent: "Kho hàng", score: 62, date: "16/01/2024" },
  { question: "Tôi có thể mua hàng ở đâu?", intent: "Địa điểm", score: 58, date: "16/01/2024" },
  { question: "Có voucher mới không?", intent: "Khuyến mãi", score: 65, date: "15/01/2024" },
];

type ActiveTab = "data" | "performance";

export default function AdminAITrainingPage() {
  const [activeMainTab, setActiveMainTab] = useState<ActiveTab>("data");
  const [activeCategoryTab, setActiveCategoryTab] = useState(0);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const KPI_METRICS = [
    { label: "Tổng câu hỏi", value: 0, icon: "📚", change: "+12", up: true },
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
            <button className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50"><Upload size={14} /> Import CSV</button>
            <button className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50"><Download size={14} /> Export</button>
            <button onClick={() => { setEditingEntry(null); setDrawerOpen(true); }} className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"><Plus size={14} /> Thêm câu hỏi</button>
          </>
        }
      />

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

      <div className="flex gap-1 border-b border-[#E0E0E0]">
        {(["data", "performance"] as ActiveTab[]).map((tab) => (
          <button key={tab} onClick={() => setActiveMainTab(tab)} className={`px-5 py-2.5 text-sm font-medium transition-colors ${activeMainTab === tab ? "text-[#1565C0] border-b-2 border-[#1565C0] -mb-px" : "text-[#757575] hover:text-[#212121]"}`}>
            {tab === "data" ? "Dữ liệu huấn luyện" : "Hiệu suất"}
          </button>
        ))}
      </div>

      {activeMainTab === "data" && (
        <>
          <ProductFilterSection search={search} onSearchChange={setSearch} searchPlaceholder="Tìm câu hỏi, câu trả lời..." tabs={CATEGORY_TABS} activeTab={activeCategoryTab} onTabChange={setActiveCategoryTab} />
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-8 text-center">
            <div className="text-5xl mb-3">📚</div>
            <p className="font-semibold text-[#212121] mb-2">Chưa có dữ liệu huấn luyện</p>
            <p className="text-sm text-[#757575] mb-4">Thêm câu hỏi và câu trả lời để cải thiện độ chính xác của AI</p>
            <button onClick={() => { setEditingEntry(null); setDrawerOpen(true); }} className="bg-[#2563EB] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Thêm câu hỏi đầu tiên</button>
          </div>
        </>
      )}

      {activeMainTab === "performance" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
              <h3 className="font-semibold text-[#212121] mb-5">Top 5 Intent phổ biến</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={INTENT_DATA} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#757575" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="intent" tick={{ fontSize: 12, fill: "#757575" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#1565C0" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
          <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E0E0E0]">
              <h3 className="font-semibold text-[#212121]">Câu hỏi độ tin cậy thấp (&lt;70%)</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[#F5F6FA]">
                <tr>{["Câu hỏi", "Intent dự đoán", "Điểm tin cậy", "Ngày"].map((h) => (<th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#757575]">{h}</th>))}</tr>
              </thead>
              <tbody className="divide-y divide-[#F5F6FA]">
                {LOW_CONFIDENCE_LOGS.map((log, i) => (
                  <tr key={i} className="hover:bg-[#F5F6FA]">
                    <td className="px-5 py-3 text-[#212121] text-sm">{log.question}</td>
                    <td className="px-5 py-3"><span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{log.intent}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-2"><div className="h-2 bg-amber-400 rounded-full" style={{ width: `${log.score}%` }} /></div>
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

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0]">
              <h3 className="font-bold text-[#212121]">{editingEntry ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}</h3>
              <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Danh mục *</label>
                <select className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] bg-white">
                  {CATEGORY_TABS.slice(1).map((cat) => <option key={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Câu hỏi *</label>
                <textarea rows={3} placeholder="Nhập câu hỏi..." className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Câu trả lời *</label>
                <textarea rows={4} placeholder="Nhập câu trả lời..." className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] resize-none" />
              </div>
              <div className="flex gap-3 pt-4 border-t border-[#E0E0E0]">
                <button onClick={() => setDrawerOpen(false)} className="flex-1 border border-[#E0E0E0] py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Hủy</button>
                <button onClick={() => setDrawerOpen(false)} className="flex-1 bg-[#E53935] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#C62828]">Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
