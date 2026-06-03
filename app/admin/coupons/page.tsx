'use client'

import { useState } from "react";
import { Plus, Edit2, Trash2, Search, Percent, Copy, Eye, ToggleLeft, ToggleRight } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { TableDataTable } from "@/components/Table/DataTable";

interface Coupon {
  id: string;
  code: string;
  title: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrder: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: "active" | "scheduled" | "expired" | "disabled";
  isFeatured: boolean;
}

const MOCK_COUPONS: Coupon[] = [
  { id: "1", code: "SUMMER2024", title: "Khuyến mãi mùa hè 2024", discountType: "percentage", discountValue: 15, minOrder: 500000, maxDiscount: 200000, usageLimit: 1000, usedCount: 423, startDate: "01/06/2024", endDate: "31/08/2024", status: "active", isFeatured: true },
  { id: "2", code: "NEWUSER", title: "Giảm 50K cho đơn hàng đầu tiên", discountType: "fixed", discountValue: 50000, minOrder: 200000, maxDiscount: 0, usageLimit: 5000, usedCount: 1823, startDate: "01/01/2024", endDate: "31/12/2024", status: "active", isFeatured: true },
  { id: "3", code: "FREESHIP", title: "Miễn phí vận chuyển", discountType: "fixed", discountValue: 0, minOrder: 300000, maxDiscount: 0, usageLimit: 9999, usedCount: 5421, startDate: "01/01/2024", endDate: "31/12/2024", status: "active", isFeatured: false },
  { id: "4", code: "TECH20", title: "Giảm 20% cho sản phẩm công nghệ", discountType: "percentage", discountValue: 20, minOrder: 1000000, maxDiscount: 500000, usageLimit: 500, usedCount: 234, startDate: "15/01/2024", endDate: "15/02/2024", status: "expired", isFeatured: false },
  { id: "5", code: "WEEKEND50", title: "Cuối tuần giảm 50K", discountType: "fixed", discountValue: 50000, minOrder: 0, maxDiscount: 0, usageLimit: 200, usedCount: 87, startDate: "01/02/2024", endDate: "28/02/2024", status: "scheduled", isFeatured: false },
  { id: "6", code: "FLASH30", title: "Flash sale 30%", discountType: "percentage", discountValue: 30, minOrder: 0, maxDiscount: 150000, usageLimit: 100, usedCount: 100, startDate: "20/01/2024", endDate: "21/01/2024", status: "expired", isFeatured: false },
];

const formatCurrency = (n: number) => n > 0 ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n) : "0đ";

const StatusBadge = ({ status }: { status: Coupon["status"] }) => {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "Hoạt động", cls: "bg-green-100 text-[#2E7D32]" },
    scheduled: { label: "Sắp diễn ra", cls: "bg-blue-100 text-[#1565C0]" },
    expired: { label: "Hết hạn", cls: "bg-gray-100 text-[#757575]" },
    disabled: { label: "Tắt", cls: "bg-red-100 text-[#E53935]" },
  };
  const s = map[status];
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.cls}`}>{s.label}</span>;
};

const TABS = ["Tất cả", "Hoạt động", "Sắp diễn ra", "Hết hạn", "Tắt"];

export default function AdminCouponsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "", title: "", discountType: "percentage" as "percentage" | "fixed",
    discountValue: 10, minOrder: 0, maxDiscount: 0, usageLimit: 100, startDate: "", endDate: ""
  });

  const filtered = MOCK_COUPONS.filter((c) => {
    const matchSearch = c.code.toLowerCase().includes(search.toLowerCase()) || c.title.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 0) return matchSearch;
    return matchSearch && c.status === ["active", "scheduled", "expired", "disabled"][activeTab - 1];
  });

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((c) => c.id));
  };

  const columns = [
    {
      key: "coupon",
      header: "Mã giảm giá",
      render: (c: Coupon) => (
        <div className="flex items-center gap-2">
          <Percent size={14} className="text-[#1565C0] shrink-0" />
          <div>
            <p className="font-mono font-bold text-[#1565C0] text-xs">{c.code}</p>
            <p className="text-[#757575] text-[11px] line-clamp-1">{c.title}</p>
          </div>
        </div>
      ),
    },
    {
      key: "discount",
      header: "Giảm giá",
      render: (c: Coupon) => (
        <span className="font-semibold text-[#E53935] text-xs">
          {c.discountType === "percentage" ? `${c.discountValue}%` : formatCurrency(c.discountValue)}
          {c.discountType === "percentage" && c.maxDiscount > 0 && <span className="text-[#757575] font-normal text-[10px] ml-1"> (tối đa {formatCurrency(c.maxDiscount)})</span>}
        </span>
      ),
    },
    { key: "minOrder", header: "Đơn tối thiểu", render: (c: Coupon) => <span className="text-[#757575] text-xs">{c.minOrder > 0 ? formatCurrency(c.minOrder) : "—"}</span> },
    {
      key: "usage",
      header: "Sử dụng",
      render: (c: Coupon) => (
        <div>
          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
            <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${Math.min(100, (c.usedCount / c.usageLimit) * 100)}%` }} />
          </div>
          <span className="text-[11px] text-[#757575]">{c.usedCount}/{c.usageLimit}</span>
        </div>
      ),
    },
    { key: "date", header: "Thời gian", render: (c: Coupon) => <span className="text-[#757575] text-xs">{c.startDate} — {c.endDate}</span> },
    { key: "status", header: "Trạng thái", render: (c: Coupon) => <StatusBadge status={c.status} /> },
  ];

  if (showForm) {
    return (
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowForm(false)} className="text-sm text-[#1565C0] hover:underline">← Quay lại</button>
          <span className="text-[#757575]">/</span>
          <h1 className="text-lg font-bold text-[#212121]">Tạo mã giảm giá</h1>
        </div>
        <div className="flex flex-col xl:flex-row gap-5 max-w-3xl">
          <div className="flex-1 bg-white rounded-xl border border-[#E0E0E0] p-6 space-y-4">
            <h3 className="font-semibold text-[#212121]">Thông tin mã giảm giá</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Mã giảm giá *</label>
                <div className="flex gap-2">
                  <input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, "") })}
                    placeholder="VD: SUMMER2024"
                    className="flex-1 border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm font-mono font-bold focus:outline-none focus:border-[#1565C0]"
                  />
                  <button className="border border-[#E0E0E0] px-3 rounded-lg hover:bg-gray-50 text-[#757575]"><Copy size={14} /></button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Tên khuyến mãi</label>
                <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="VD: Khuyến mãi mùa hè" className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Loại giảm giá</label>
                  <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] bg-white">
                    <option value="percentage">Theo phần trăm (%)</option>
                    <option value="fixed">Theo số tiền (VNĐ)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Giá trị giảm *</label>
                  <input type="number" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Đơn hàng tối thiểu</label>
                  <input type="number" value={formData.minOrder} onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) })} placeholder="0" className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Giảm tối đa</label>
                  <input type="number" value={formData.maxDiscount} onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })} placeholder="0 = không giới hạn" className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Ngày bắt đầu</label>
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Ngày kết thúc</label>
                  <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Số lần sử dụng tối đa</label>
                <input type="number" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
              </div>
            </div>
          </div>
          <div className="w-full xl:w-72">
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
              <h3 className="font-semibold text-[#212121] mb-4">Xem trước</h3>
              <div className="border-2 border-dashed border-[#E0E0E0] rounded-xl p-4 text-center">
                <p className="font-mono font-bold text-[#1565C0] text-lg">{formData.code || "MÃ_CODE"}</p>
                <p className="text-xs text-[#757575] mt-1">
                  {formData.discountType === "percentage" ? `Giảm ${formData.discountValue}%` : `Giảm ${formatCurrency(formData.discountValue)}`}
                </p>
                {formData.minOrder > 0 && <p className="text-[10px] text-[#757575] mt-1">Đơn tối thiểu: {formatCurrency(formData.minOrder)}</p>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 max-w-3xl">
          <button onClick={() => setShowForm(false)} className="flex-1 border border-[#E0E0E0] py-2.5 rounded-lg text-sm hover:bg-gray-50 bg-white">Hủy</button>
          <button className="flex-1 bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">Tạo mã giảm giá</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Quản lý mã giảm giá"
        subtitle={`${MOCK_COUPONS.length} mã giảm giá`}
        actions={
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={14} /> Tạo mã giảm giá
          </button>
        }
      />
      <div className="bg-white rounded-xl border border-[#E0E0E0]">
        <div className="px-4 py-3 border-b border-[#E0E0E0] flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm mã giảm giá..." className="pl-8 pr-4 py-2 border border-[#E0E0E0] rounded-lg text-sm w-full focus:outline-none focus:border-[#1565C0]" />
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
          renderRowActions={(c: Coupon) => (
            <div className={`flex items-center gap-1 transition-opacity ${hoveredRow === c.id ? "opacity-100" : "opacity-0"}`}>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Copy size={13} /></button>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Edit2 size={13} /></button>
              <button className="p-1.5 rounded-lg hover:bg-red-50 text-[#E53935]"><Trash2 size={13} /></button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
