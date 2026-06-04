'use client'

import { useState, useEffect, useCallback } from "react";
import { Plus, Upload, Download, X, TrendingUp, TrendingDown, Trash2, Edit2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { ProductFilterSection } from "@/components/Product/FilterSection";
import { adminAITrainingService } from "@/services/adminService";
import type { AITrainingRecord, AITrainingMetrics } from "@/services/types";

const CATEGORY_TABS = ["Tất cả", "Thông tin sản phẩm", "FAQ", "Chính sách", "Hướng dẫn"];
const CATEGORY_COLORS: Record<string, string> = {
  "Thông tin sản phẩm": "bg-blue-100 text-[#1565C0]",
  "Chính sách": "bg-amber-100 text-amber-700",
  "FAQ": "bg-purple-100 text-purple-700",
  "Hướng dẫn": "bg-green-100 text-[#2E7D32]",
};

type ActiveTab = "data" | "performance";

export default function AdminAITrainingPage() {
  const [activeMainTab, setActiveMainTab] = useState<ActiveTab>("data");
  const [activeCategoryTab, setActiveCategoryTab] = useState(0);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AITrainingRecord | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [records, setRecords] = useState<AITrainingRecord[]>([]);
  const [metrics, setMetrics] = useState<AITrainingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: "FAQ",
    question: "",
    answer: "",
    keywords: "",
    intent: "",
    is_active: true,
  });

  const CATEGORY_MAP: Record<number, string | undefined> = {
    0: undefined,
    1: "Thông tin sản phẩm",
    2: "FAQ",
    3: "Chính sách",
    4: "Hướng dẫn",
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let dataRes: any = null;
      let metricsRes: any = null;
      try {
        dataRes = await adminAITrainingService.getTrainingList({
          search,
          category: CATEGORY_MAP[activeCategoryTab],
          page: 1,
          limit: 50,
        });
      } catch {}
      try {
        metricsRes = await adminAITrainingService.getMetrics();
      } catch {}
      setRecords(dataRes && Array.isArray(dataRes.data) ? dataRes.data : []);
      setMetrics(metricsRes ?? null);
    } catch (err) {
      console.error("Failed to fetch AI training data:", err);
      setRecords([]);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [search, activeCategoryTab]);

  useEffect(() => {
    if (activeMainTab === "data") fetchData();
  }, [fetchData, activeMainTab]);

  useEffect(() => {
    if (activeMainTab === "performance") {
      adminAITrainingService.getMetrics().then(setMetrics).catch(() => setMetrics(null));
    }
  }, [activeMainTab]);

  const openAdd = () => {
    setEditingEntry(null);
    setFormData({ category: "FAQ", question: "", answer: "", keywords: "", intent: "", is_active: true });
    setDrawerOpen(true);
  };

  const openEdit = (entry: AITrainingRecord) => {
    setEditingEntry(entry);
    setFormData({
      category: entry.category,
      question: entry.question,
      answer: entry.answer,
      keywords: Array.isArray(entry.keywords) ? entry.keywords.join(", ") : "",
      intent: entry.intent || "",
      is_active: entry.is_active,
    });
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!formData.question || !formData.answer) return;
    setSubmitting(true);
    try {
      const payload = {
        category: formData.category,
        question: formData.question,
        answer: formData.answer,
        keywords: (formData.keywords || "").split(",").map(k => k.trim()).filter(Boolean),
        intent: formData.intent || "",
        is_active: formData.is_active,
      };
      if (editingEntry) {
        await adminAITrainingService.updateTraining(editingEntry.training_id, payload);
      } else {
        await adminAITrainingService.createTraining(payload);
      }
      setDrawerOpen(false);
      fetchData();
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa bản ghi này?")) return;
    setActionLoading(id);
    try {
      await adminAITrainingService.deleteTraining(id);
      fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = async () => {
    try {
      const data = await adminAITrainingService.exportTraining();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ai-training-data.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const kpiMetrics = metrics ? [
    { label: "Tổng câu hỏi", value: metrics.total_questions.toLocaleString(), icon: "📚", change: "", up: true },
    { label: "Độ chính xác TB", value: `${(metrics.avg_accuracy * 100).toFixed(1)}%`, icon: "🎯", change: "", up: true },
    { label: "Intent phổ biến", value: metrics.top_intents[0]?.intent || "—", icon: "🔥", change: metrics.top_intents[0]?.count ? `${metrics.top_intents[0].count} lần` : "", up: true },
    { label: "Phản hồi tiêu cực", value: "—", icon: "👎", change: "", up: false },
  ] : [
    { label: "Tổng câu hỏi", value: "—", icon: "📚", change: "", up: true },
    { label: "Độ chính xác TB", value: "—", icon: "🎯", change: "", up: true },
    { label: "Intent phổ biến", value: "—", icon: "🔥", change: "", up: true },
    { label: "Phản hồi tiêu cực", value: "—", icon: "👎", change: "", up: false },
  ];

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Dữ liệu huấn luyện AI"
        subtitle="Quản lý câu hỏi & câu trả lời cho AI Chatbot"
        actions={
          <>
            <button onClick={handleExport} className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
              <Download size={14} /> Export
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              <Plus size={14} /> Thêm câu hỏi
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiMetrics.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-[#E0E0E0] p-4">
            <div className="flex items-start justify-between">
              <span className="text-2xl">{kpi.icon}</span>
              {kpi.change && (
                <div className={`flex items-center gap-1 text-xs font-medium ${kpi.up ? "text-[#2E7D32]" : "text-[#E53935]"}`}>
                  {kpi.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {kpi.change}
                </div>
              )}
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
          <ProductFilterSection
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Tìm câu hỏi, câu trả lời..."
            tabs={CATEGORY_TABS}
            activeTab={activeCategoryTab}
            onTabChange={setActiveCategoryTab}
          />
          {loading ? (
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-8 text-center text-[#757575]">Đang tải...</div>
          ) : records.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-8 text-center">
              <div className="text-5xl mb-3">📚</div>
              <p className="font-semibold text-[#212121] mb-2">Chưa có dữ liệu huấn luyện</p>
              <p className="text-sm text-[#757575] mb-4">Thêm câu hỏi và câu trả lời để cải thiện độ chính xác của AI</p>
              <button onClick={openAdd} className="bg-[#2563EB] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                Thêm câu hỏi đầu tiên
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F6FA]">
                  <tr>
                    {["Câu hỏi", "Câu trả lời", "Danh mục", "Intent", "Lần sử dụng", "Trạng thái", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#757575] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F6FA]">
                  {records.map((record) => (
                    <tr key={record.training_id} className="hover:bg-[#F5F6FA]">
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-xs font-medium text-[#212121] line-clamp-2">{record.question}</p>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-xs text-[#757575] line-clamp-2">{record.answer}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${CATEGORY_COLORS[record.category] || "bg-gray-100 text-gray-600"}`}>
                          {record.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 text-[#757575] px-2 py-0.5 rounded">{record.intent || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[#757575]">{record.usage_count}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${record.is_active ? "bg-green-100 text-[#2E7D32]" : "bg-gray-100 text-[#757575]"}`}>
                          {record.is_active ? "Hoạt động" : "Tắt"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(record)} className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]">
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(record.training_id)}
                            disabled={actionLoading === record.training_id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[#E53935] disabled:opacity-50"
                          >
                            {actionLoading === record.training_id ? "..." : <Trash2 size={13} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeMainTab === "performance" && metrics && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
              <h3 className="font-semibold text-[#212121] mb-5">Top 5 Intent phổ biến</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={metrics.top_intents.slice(0, 5)} layout="vertical" margin={{ left: 20 }}>
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
              {metrics.feedback_trend_7days && metrics.feedback_trend_7days.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={metrics.feedback_trend_7days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5F6FA" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#757575" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#757575" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="positive" stroke="#2E7D32" strokeWidth={2} dot={{ r: 3 }} name="Tích cực" />
                    <Line type="monotone" dataKey="negative" stroke="#E53935" strokeWidth={2} dot={{ r: 3 }} name="Tiêu cực" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-52 text-[#757575] text-sm">Chưa có dữ liệu xu hướng</div>
              )}
            </div>
          </div>
          {metrics.low_confidence_logs && metrics.low_confidence_logs.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E0E0E0]">
                <h3 className="font-semibold text-[#212121]">Câu hỏi độ tin cậy thấp (&lt;70%)</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-[#F5F6FA]">
                  <tr>{["Câu hỏi", "Intent dự đoán", "Điểm tin cậy", "Ngày"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#757575]">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-[#F5F6FA]">
                  {metrics.low_confidence_logs.map((log, i) => (
                    <tr key={i} className="hover:bg-[#F5F6FA]">
                      <td className="px-5 py-3 text-sm text-[#212121]">{log.question}</td>
                      <td className="px-5 py-3"><span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{log.predicted_intent}</span></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-100 rounded-full h-2"><div className="h-2 bg-amber-400 rounded-full" style={{ width: `${log.confidence_score * 100}%` }} /></div>
                          <span className="text-xs font-medium text-amber-600">{(log.confidence_score * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-[#757575]">{new Date(log.created_at).toLocaleDateString("vi-VN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]"
                >
                  {CATEGORY_TABS.slice(1).map(cat => <option key={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Intent</label>
                <input
                  value={formData.intent}
                  onChange={e => setFormData({ ...formData, intent: e.target.value })}
                  placeholder="VD: return_policy"
                  className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Câu hỏi *</label>
                <textarea
                  rows={3}
                  value={formData.question}
                  onChange={e => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Nhập câu hỏi..."
                  className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA] resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Câu trả lời *</label>
                <textarea
                  rows={4}
                  value={formData.answer}
                  onChange={e => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Nhập câu trả lời..."
                  className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA] resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Từ khóa</label>
                <input
                  value={formData.keywords}
                  onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="đổi trả, hoàn, trả lại"
                  className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-[#E0E0E0]">
                <button onClick={() => setDrawerOpen(false)} className="flex-1 border border-[#E0E0E0] py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Hủy</button>
                <button
                  onClick={handleSave}
                  disabled={submitting || !formData.question || !formData.answer}
                  className="flex-1 bg-[#2563EB] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
