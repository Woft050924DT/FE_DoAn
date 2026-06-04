'use client'

import { useState, useEffect, useCallback } from "react";
import { Search, Users, UserCheck, ShoppingBag, Star, Mail, Phone, Eye, Edit2, Ban } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { TableDataTable } from "@/components/Table/DataTable";
import { adminCustomerService, Customer } from "@/services/adminService";

const TABS = ["Tất cả", "Hoạt động", "Bị khóa"];
const formatCurrency = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export default function AdminCustomersPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      let statusParam: string | undefined;
      if (activeTab === 1) statusParam = "active";
      if (activeTab === 2) statusParam = "banned";
      const res = await adminCustomerService.getList({ search, status: statusParam });
      setCustomers(Array.isArray(res.data) ? res.data : []);
      setTotal(res.pagination?.total ?? 0);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setCustomers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, activeTab]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleToggleStatus = async (customerId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "banned" : "active";
    const action = newStatus === "banned" ? "khóa" : "mở khóa";
    if (!confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;
    try {
      setActionLoading(customerId);
      await adminCustomerService.updateStatus(customerId, newStatus);
      setCustomers(prev => prev.map(c => c.user_id === customerId ? { ...c, status: newStatus as "active" | "banned" } : c));
    } catch (err) {
      console.error("Toggle status failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    if (selected.length === customers.length) setSelected([]);
    else setSelected(customers.map((c) => c.user_id));
  };

  const totalSpent = customers.reduce((s, c) => s + c.total_spent, 0);
  const activeCount = customers.filter((c) => c.status === "active").length;
  const bannedCount = customers.filter((c) => c.status === "banned").length;

  const columns = [
    {
      key: "customer",
      header: "Khách hàng",
      render: (c: Customer) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${c.status === "banned" ? "bg-gray-400" : "bg-[#1565C0]"}`}>
            {c.avatar_url || (c.full_name?.slice(0, 2).toUpperCase())}
          </div>
          <div>
            <p className="font-medium text-[#212121] text-xs">{c.full_name}</p>
            <p className="text-[#757575] text-[11px] flex items-center gap-1"><Mail size={9} />{c.email}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Điện thoại", render: (c: Customer) => <span className="text-[#757575] text-xs flex items-center gap-1"><Phone size={10} />{c.phone}</span> },
    {
      key: "orders",
      header: "Đơn hàng",
      render: (c: Customer) => <span className="text-[#757575] text-xs font-medium flex items-center gap-1"><ShoppingBag size={10} />{c.total_orders}</span>,
    },
    {
      key: "spent",
      header: "Tổng chi tiêu",
      render: (c: Customer) => <span className="font-semibold text-[#212121] text-xs">{formatCurrency(c.total_spent)}</span>,
    },
    {
      key: "reviews",
      header: "Đánh giá",
      render: (c: Customer) => <span className="text-[#757575] text-xs flex items-center gap-1"><Star size={10} className="text-amber-400" />{c.total_reviews}</span>,
    },
    { key: "lastOrder", header: "Đơn cuối", render: (c: Customer) => <span className="text-[#757575] text-xs">{c.last_order_at}</span> },
    {
      key: "status",
      header: "Trạng thái",
      render: (c: Customer) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.status === "active" ? "bg-green-100 text-[#2E7D32]" : "bg-red-100 text-[#E53935]"}`}>
          {c.status === "active" ? "Hoạt động" : "Bị khóa"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Quản lý khách hàng"
        subtitle={`${total} khách hàng • ${totalSpent.toLocaleString("vi-VN")}đ tổng chi tiêu`}
        actions={
          <button className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
            <Users size={14} /> Xuất danh sách
          </button>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng khách hàng", value: total, icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "Hoạt động", value: activeCount, icon: UserCheck, color: "text-green-600 bg-green-50" },
          { label: "Đơn hàng TB", value: customers.length > 0 ? (customers.reduce((s, c) => s + c.total_orders, 0) / customers.length).toFixed(1) : "0", icon: ShoppingBag, color: "text-purple-600 bg-purple-50" },
          { label: "Bị khóa", value: bannedCount, icon: Ban, color: "text-red-600 bg-red-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#E0E0E0] p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon size={18} />
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
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm theo tên, email, số điện thoại..." className="pl-8 pr-4 py-2 border border-[#E0E0E0] dark:border-[#374151] rounded-lg text-sm w-full bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]" />
          </div>
          <div className="flex gap-1">
            {TABS.map((tab, i) => (
              <button key={tab} onClick={() => { setActiveTab(i); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeTab === i ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-100"}`}>{tab}</button>
            ))}
          </div>
        </div>
        <TableDataTable
          data={customers}
          columns={columns}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
          idKey="user_id"
          onRowHover={setHoveredRow}
          renderRowActions={(c: Customer) => (
            <div className={`flex items-center gap-1 transition-opacity ${hoveredRow === c.user_id ? "opacity-100" : "opacity-0"}`}>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Eye size={13} /></button>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Edit2 size={13} /></button>
              <button
                onClick={() => handleToggleStatus(c.user_id, c.status)}
                disabled={actionLoading === c.user_id}
                className={`p-1.5 rounded-lg ${c.status === "active" ? "hover:bg-red-50 text-[#E53935]" : "hover:bg-green-50 text-[#2E7D32]"} disabled:opacity-50`}
              >
                {actionLoading === c.user_id ? "..." : c.status === "active" ? <Ban size={13} /> : <UserCheck size={13} />}
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
