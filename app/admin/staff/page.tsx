'use client'

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit2, Trash2, Shield, Mail, Phone, Eye } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { TableDataTable } from "@/components/Table/DataTable";
import { adminStaffService, AdminStaffMember } from "@/services/adminService";

const TABS = ["Tất cả", "Hoạt động", "Nghỉ"];

const RoleBadge = ({ role }: { role: string }) => (
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
  const [staff, setStaff] = useState<AdminStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({ fullName: "", email: "", phone: "", role: "staff" as "admin" | "staff" });

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      let statusParam: string | undefined;
      if (activeTab === 1) statusParam = "active";
      if (activeTab === 2) statusParam = "inactive";
      const res = await adminStaffService.getList({ search, status: statusParam, page, limit: 50 });
      setStaff(Array.isArray(res.data) ? res.data : []);
      setTotal(res.pagination?.total ?? 0);
    } catch (err) {
      console.error("Failed to fetch staff:", err);
      setStaff([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, activeTab, page]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    adminStaffService.getList({ status: "active", limit: 100 }).then(res => {
      setOnlineCount(Array.isArray(res.data) ? res.data.filter((s: any) => s.is_online).length : 0);
    }).catch(() => {});
  }, [activeTab]);

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    if (selected.length === staff.length) setSelected([]);
    else setSelected(staff.map((s) => s.user_id));
  };

  const columns = [
    {
      key: "staff",
      header: "Nhân viên",
      render: (s: AdminStaffMember) => (
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${s.role === "admin" ? "bg-purple-500" : "bg-[#1565C0]"}`}>
              {s.avatar_url ? <img src={s.avatar_url} alt={s.full_name} className="w-full h-full rounded-full object-cover" /> : s.full_name?.slice(0, 2).toUpperCase()}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${s.is_online ? "bg-green-500" : "bg-gray-400"}`} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-[#212121] text-xs">{s.full_name}</p>
              <RoleBadge role={s.role} />
            </div>
            <p className="text-[#757575] text-[11px] flex items-center gap-1"><Mail size={9} />{s.email}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Điện thoại", render: (s: AdminStaffMember) => <span className="text-[#757575] text-xs flex items-center gap-1"><Phone size={10} />{s.phone}</span> },
    {
      key: "stats",
      header: "Hội thoại",
      render: (s: AdminStaffMember) => <span className="text-[#757575] text-xs font-medium">{s.conversations_handled}</span>,
    },
    {
      key: "response",
      header: "Phản hồi TB",
      render: (s: AdminStaffMember) => <span className="text-[#757575] text-xs">{s.avg_response_time}</span>,
    },
    { key: "lastActive", header: "Hoạt động", render: (s: AdminStaffMember) => <span className="text-[#757575] text-xs">{s.last_active}</span> },
    {
      key: "status",
      header: "Trạng thái",
      render: (s: AdminStaffMember) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.is_online ? "bg-green-100 text-[#2E7D32]" : "bg-gray-100 text-[#757575]"}`}>
          {s.is_online ? "Hoạt động" : "Nghỉ"}
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

  const activeStaff = staff.filter(s => s.is_online).length;
  const adminCount = staff.filter(s => s.role === "admin").length;

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Quản lý nhân viên"
        subtitle={`${total} nhân viên • ${onlineCount} đang online`}
        actions={
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={14} /> Thêm nhân viên
          </button>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng nhân viên", value: total, color: "text-blue-600 bg-blue-50" },
          { label: "Đang online", value: onlineCount, color: "text-green-600 bg-green-50" },
          { label: "Quản trị viên", value: adminCount, color: "text-purple-600 bg-purple-50" },
          { label: "Đang nghỉ", value: total - onlineCount, color: "text-gray-600 bg-gray-50" },
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
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm nhân viên..." className="pl-8 pr-4 py-2 border border-[#E0E0E0] rounded-lg text-sm w-full focus:outline-none focus:border-[#1565C0]" />
          </div>
          <div className="flex gap-1">
            {TABS.map((tab, i) => (
              <button key={tab} onClick={() => { setActiveTab(i); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === i ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-100"}`}>{tab}</button>
            ))}
          </div>
        </div>
        <TableDataTable
          data={staff}
          columns={columns}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
          idKey="user_id"
          onRowHover={setHoveredRow}
          renderRowActions={(s: AdminStaffMember) => (
            <div className={`flex items-center gap-1 transition-opacity ${hoveredRow === s.user_id ? "opacity-100" : "opacity-0"}`}>
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
