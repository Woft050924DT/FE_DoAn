'use client'

import { useState } from "react";
import { Search, Users, UserCheck, ShoppingBag, Star, Mail, Phone, Eye, Edit2, Ban } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { TableDataTable } from "@/components/Table/DataTable";

interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  reviews: number;
  joinedAt: string;
  status: "active" | "banned";
}

const MOCK_CUSTOMERS: Customer[] = [
  { id: "1", fullName: "Nguyễn Văn A", email: "nvana@email.com", phone: "0901234567", avatar: "NA", totalOrders: 12, totalSpent: 45600000, lastOrder: "18/01/2024", reviews: 5, joinedAt: "10/03/2023", status: "active" },
  { id: "2", fullName: "Trần Thị B", email: "ttb@email.com", phone: "0912345678", avatar: "TB", totalOrders: 8, totalSpent: 23400000, lastOrder: "15/01/2024", reviews: 3, joinedAt: "05/05/2023", status: "active" },
  { id: "3", fullName: "Lê Minh C", email: "lmc@email.com", phone: "0923456789", avatar: "LC", totalOrders: 23, totalSpent: 98700000, lastOrder: "20/01/2024", reviews: 12, joinedAt: "01/01/2023", status: "active" },
  { id: "4", fullName: "Phạm Thu D", email: "ptd@email.com", phone: "0934567890", avatar: "PD", totalOrders: 3, totalSpent: 8900000, lastOrder: "02/01/2024", reviews: 1, joinedAt: "15/11/2023", status: "active" },
  { id: "5", fullName: "Hoàng Văn E", email: "hve@email.com", phone: "0945678901", avatar: "HE", totalOrders: 17, totalSpent: 67800000, lastOrder: "19/01/2024", reviews: 8, joinedAt: "20/02/2023", status: "active" },
  { id: "6", fullName: "Vũ Thị F", email: "vtf@email.com", phone: "0956789012", avatar: "VF", totalOrders: 5, totalSpent: 15600000, lastOrder: "10/01/2024", reviews: 2, joinedAt: "08/07/2023", status: "banned" },
  { id: "7", fullName: "Đặng Văn G", email: "dvg@email.com", phone: "0967890123", avatar: "DG", totalOrders: 31, totalSpent: 145000000, lastOrder: "21/01/2024", reviews: 18, joinedAt: "15/04/2022", status: "active" },
  { id: "8", fullName: "Bùi Thị H", email: "bth@email.com", phone: "0978901234", avatar: "BH", totalOrders: 6, totalSpent: 21200000, lastOrder: "12/01/2024", reviews: 4, joinedAt: "03/09/2023", status: "active" },
];

const TABS = ["Tất cả", "Hoạt động", "Bị khóa"];
const formatCurrency = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export default function AdminCustomersPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const filtered = MOCK_CUSTOMERS.filter((c) => {
    const matchSearch = c.fullName.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    if (activeTab === 0) return matchSearch;
    if (activeTab === 1) return matchSearch && c.status === "active";
    return matchSearch && c.status === "banned";
  });

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((c) => c.id));
  };

  const columns = [
    {
      key: "customer",
      header: "Khách hàng",
      render: (c: Customer) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${c.status === "banned" ? "bg-gray-400" : "bg-[#1565C0]"}`}>{c.avatar}</div>
          <div>
            <p className="font-medium text-[#212121] text-xs">{c.fullName}</p>
            <p className="text-[#757575] text-[11px] flex items-center gap-1"><Mail size={9} />{c.email}</p>
          </div>
        </div>
      ),
    },
    { key: "phone", header: "Điện thoại", render: (c: Customer) => <span className="text-[#757575] text-xs flex items-center gap-1"><Phone size={10} />{c.phone}</span> },
    {
      key: "orders",
      header: "Đơn hàng",
      render: (c: Customer) => <span className="text-[#757575] text-xs font-medium flex items-center gap-1"><ShoppingBag size={10} />{c.totalOrders}</span>,
    },
    {
      key: "spent",
      header: "Tổng chi tiêu",
      render: (c: Customer) => <span className="font-semibold text-[#212121] text-xs">{formatCurrency(c.totalSpent)}</span>,
    },
    {
      key: "reviews",
      header: "Đánh giá",
      render: (c: Customer) => <span className="text-[#757575] text-xs flex items-center gap-1"><Star size={10} className="text-amber-400" />{c.reviews}</span>,
    },
    { key: "lastOrder", header: "Đơn cuối", render: (c: Customer) => <span className="text-[#757575] text-xs">{c.lastOrder}</span> },
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
        subtitle={`${MOCK_CUSTOMERS.length} khách hàng • ${MOCK_CUSTOMERS.reduce((s, c) => s + c.totalSpent, 0).toLocaleString("vi-VN")}đ tổng chi tiêu`}
        actions={
          <button className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
            <Users size={14} /> Xuất danh sách
          </button>
        }
      />
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng khách hàng", value: MOCK_CUSTOMERS.length, icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "Hoạt động", value: MOCK_CUSTOMERS.filter((c) => c.status === "active").length, icon: UserCheck, color: "text-green-600 bg-green-50" },
          { label: "Đơn hàng TB", value: (MOCK_CUSTOMERS.reduce((s, c) => s + c.totalOrders, 0) / MOCK_CUSTOMERS.length).toFixed(1), icon: ShoppingBag, color: "text-purple-600 bg-purple-50" },
          { label: "Bị khóa", value: MOCK_CUSTOMERS.filter((c) => c.status === "banned").length, icon: Ban, color: "text-red-600 bg-red-50" },
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
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên, email, số điện thoại..." className="pl-8 pr-4 py-2 border border-[#E0E0E0] rounded-lg text-sm w-full focus:outline-none focus:border-[#1565C0]" />
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
          renderRowActions={(c: Customer) => (
            <div className={`flex items-center gap-1 transition-opacity ${hoveredRow === c.id ? "opacity-100" : "opacity-0"}`}>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Eye size={13} /></button>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Edit2 size={13} /></button>
              <button className={`p-1.5 rounded-lg ${c.status === "active" ? "hover:bg-red-50 text-[#E53935]" : "hover:bg-green-50 text-[#2E7D32]"}`}>
                {c.status === "active" ? <Ban size={13} /> : <UserCheck size={13} />}
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
