'use client'

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Shield, Mail, Phone, Eye } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { TableDataTable } from "@/components/Table/DataTable";

interface StaffMember {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "admin" | "staff";
  avatar: string;
  isOnline: boolean;
  joinedAt: string;
  lastActive: string;
  conversationsHandled: number;
  avgResponseTime: string;
  status: "active" | "inactive";
}

const MOCK_STAFF: StaffMember[] = [
  { id: "1", fullName: "Minh Tuấn", email: "minhtuan@vietshop.com", phone: "0901234567", role: "admin", avatar: "MT", isOnline: true, joinedAt: "01/01/2023", lastActive: "Online", conversationsHandled: 452, avgResponseTime: "2 phút", status: "active" },
  { id: "2", fullName: "Thu Hà", email: "thuha@vietshop.com", phone: "0912345678", role: "staff", avatar: "TH", isOnline: true, joinedAt: "15/03/2023", lastActive: "Online", conversationsHandled: 324, avgResponseTime: "3 phút", status: "active" },
  { id: "3", fullName: "Lan Anh", email: "lananh@vietshop.com", phone: "0923456789", role: "staff", avatar: "LA", isOnline: false, joinedAt: "10/06/2023", lastActive: "2 giờ trước", conversationsHandled: 189, avgResponseTime: "5 phút", status: "active" },
  { id: "4", fullName: "Hoàng Nam", email: "hoangnam@vietshop.com", phone: "0934567890", role: "staff", avatar: "HN", isOnline: true, joinedAt: "20/08/2023", lastActive: "Online", conversationsHandled: 276, avgResponseTime: "4 phút", status: "active" },
  { id: "5", fullName: "Thanh Mai", email: "thanhmai@vietshop.com", phone: "0945678901", role: "staff", avatar: "TM", isOnline: false, joinedAt: "05/10/2023", lastActive: "1 ngày trước", conversationsHandled: 98, avgResponseTime: "6 phút", status: "inactive" },
  { id: "6", fullName: "Quang Huy", email: "quanghuy@vietshop.com", phone: "0956789012", role: "staff", avatar: "QH", isOnline: true, joinedAt: "01/11/2023", lastActive: "Online", conversationsHandled: 156, avgResponseTime: "3 phút", status: "active" },
];

const TABS = ["Tất cả", "Hoạt động", "Nghỉ"];

const RoleBadge = ({ role }: { role: "admin" | "staff" }) => (
  <span className={`px-2 py-0.5 rounded text-xs font-medium ${role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-[#1565C0]"}`}>
    {role === "admin" ? "Quản trị" : "Nhân viên"}
  </span>
);

export default function AdminStaffPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [formData, setFormData] = useState({ fullName: "", email: "", phone: "", role: "staff" as "admin" | "staff" });

  const filtered = MOCK_STAFF.filter((s) => {
    const matchSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 0) return matchSearch;
    if (activeTab === 1) return matchSearch && s.status === "active";
    return matchSearch && s.status === "inactive";
  });

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((s) => s.id));
  };

  const columns = [
    {
      key: "staff",
      header: "Nhân viên",
      render: (s: StaffMember) => (
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${s.role === "admin" ? "bg-purple-500" : "bg-[#1565C0]"}`}>{s.avatar}</div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${s.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-[#212121] text-xs">{s.fullName}</p>
              <RoleBadge role={s.role} />
            </div>
            <p className="text-[#757575] text-[11px] flex items-center gap-1"><Mail size={9} />{s.email}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Điện thoại", render: (s: StaffMember) => <span className="text-[#757575] text-xs flex items-center gap-1"><Phone size={10} />{s.phone}</span> },
    {
      key: "stats",
      header: "Hội thoại",
      render: (s: StaffMember) => <span className="text-[#757575] text-xs font-medium">{s.conversationsHandled}</span>,
    },
    {
      key: "response",
      header: "Phản hồi TB",
      render: (s: StaffMember) => <span className="text-[#757575] text-xs">{s.avgResponseTime}</span>,
    },
    { key: "lastActive", header: "Hoạt động", render: (s: StaffMember) => <span className="text-[#757575] text-xs">{s.lastActive}</span> },
    {
      key: "status",
      header: "Trạng thái",
      render: (s: StaffMember) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.status === "active" ? "bg-green-100 text-[#2E7D32]" : "bg-gray-100 text-[#757575]"}`}>
          {s.status === "active" ? "Hoạt động" : "Nghỉ"}
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
          <h1 className="text-lg font-bold text-[#212121]">Thêm nhân viên</h1>
        </div>
        <div className="bg-white rounded-xl border border-[#E0E0E0] p-6 max-w-xl space-y-4">
          <div>
            <label className="text-xs font-medium text-[#757575] mb-1 block">Họ tên *</label>
            <input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Nhập họ tên..." className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#757575] mb-1 block">Email *</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@vietshop.com" className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#757575] mb-1 block">Số điện thoại</label>
            <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="0901234567" className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#757575] mb-1 block">Vai trò</label>
            <div className="flex gap-4">
              {(["staff", "admin"] as const).map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="staff-role" value={r} checked={formData.role === r} onChange={() => setFormData({ ...formData, role: r })} className="accent-[#1565C0]" />
                  <span className="text-sm text-[#212121]">{r === "admin" ? "Quản trị viên" : "Nhân viên"}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-[#E0E0E0]">
            <button onClick={() => setShowForm(false)} className="flex-1 border border-[#E0E0E0] py-2.5 rounded-lg text-sm hover:bg-gray-50">Hủy</button>
            <button className="flex-1 bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">Thêm nhân viên</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Quản lý nhân viên"
        subtitle={`${MOCK_STAFF.length} nhân viên • ${MOCK_STAFF.filter((s) => s.isOnline).length} đang online`}
        actions={
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={14} /> Thêm nhân viên
          </button>
        }
      />
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng nhân viên", value: MOCK_STAFF.length, color: "text-blue-600 bg-blue-50" },
          { label: "Đang online", value: MOCK_STAFF.filter((s) => s.isOnline).length, color: "text-green-600 bg-green-50" },
          { label: "Quản trị viên", value: MOCK_STAFF.filter((s) => s.role === "admin").length, color: "text-purple-600 bg-purple-50" },
          { label: "Đang nghỉ", value: MOCK_STAFF.filter((s) => s.status === "inactive").length, color: "text-gray-600 bg-gray-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#E0E0E0] p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <Shield size={18} />
              </div>
              <div>
                <p className="text-xl font-bold text-[#212121]">{stat.value}</p>
                <p className="text-xs text-[#757575]">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-[#E0E0E0]">
        <div className="px-4 py-3 border-b border-[#E0E0E0] flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm nhân viên..." className="pl-8 pr-4 py-2 border border-[#E0E0E0] rounded-lg text-sm w-full focus:outline-none focus:border-[#1565C0]" />
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
          renderRowActions={(s: StaffMember) => (
            <div className={`flex items-center gap-1 transition-opacity ${hoveredRow === s.id ? "opacity-100" : "opacity-0"}`}>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Eye size={13} /></button>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Edit2 size={13} /></button>
              <button className="p-1.5 rounded-lg hover:bg-red-50 text-[#E53935]"><Trash2 size={13} /></button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
