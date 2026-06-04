'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, ShoppingBag, Users, MessageSquare, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { adminDashboardService } from "@/services";
import { OrderStatusBadge } from "@/components/Order/StatusBadge";
import type { DashboardResponse, DashboardKPIs, RevenueDataPoint, OrderStatusBreakdown, ConversationSummary } from "@/services/types";

const PIE_COLORS = ["#2E7D32", "#5C6BC0", "#1565C0", "#E65100", "#E53935"];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

export default function AdminDashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await adminDashboardService.getDashboard();
        setDashboard(data);
      } catch (err) {
        setError("Không thể tải dữ liệu tổng quan");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1565C0] mx-auto mb-4" />
          <p className="text-[#757575]">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error || "Không có dữ liệu"}</p>
          <button onClick={() => window.location.reload()} className="text-sm text-[#1565C0] underline">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const { kpis, revenue_7days, order_status_breakdown, recent_orders, open_conversations } = dashboard;

  const kpiCards: Array<{
    title: string;
    value: string;
    change: number;
    up: boolean;
    icon: typeof DollarSign;
    color: string;
    bg: string;
    iconBg: string;
  }> = [
    {
      title: "Doanh thu hôm nay",
      value: formatCurrency(kpis.today_revenue),
      change: kpis.revenue_change_percent,
      up: kpis.revenue_change_percent >= 0,
      icon: DollarSign,
      color: "text-[#2E7D32]",
      bg: "bg-green-50",
      iconBg: "bg-green-100",
    },
    {
      title: "Đơn hàng mới",
      value: kpis.new_orders_today.toLocaleString(),
      change: kpis.orders_change_percent,
      up: kpis.orders_change_percent >= 0,
      icon: ShoppingBag,
      color: "text-[#1565C0]",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
    },
    {
      title: "Người dùng",
      value: kpis.total_users.toLocaleString(),
      change: kpis.users_change_percent,
      up: kpis.users_change_percent >= 0,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
    },
    {
      title: "Chat đang mở",
      value: kpis.open_chats.toString(),
      change: kpis.chats_change_percent,
      up: kpis.chats_change_percent >= 0,
      icon: MessageSquare,
      color: "text-[#E65100]",
      bg: "bg-orange-50",
      iconBg: "bg-orange-100",
    },
  ];

  const pieData = order_status_breakdown.map((item: OrderStatusBreakdown, i: number) => ({
    name: item.status,
    value: item.count,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#212121]">Tổng quan</h1>
        <p className="text-sm text-[#757575] mt-0.5">Chào mừng trở lại! Đây là báo cáo hôm nay.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.title} className={`${kpi.bg} rounded-2xl p-5 border border-white`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`${kpi.iconBg} w-10 h-10 rounded-xl flex items-center justify-center`}>
                <kpi.icon size={18} className={kpi.color} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${kpi.up ? "text-[#2E7D32]" : "text-[#E53935]"}`}>
                {kpi.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {kpi.up ? "+" : ""}{kpi.change.toFixed(1)}%
              </div>
            </div>
            <p className="text-xl font-bold text-[#212121]">{kpi.value}</p>
            <p className="text-xs text-[#757575] mt-0.5">{kpi.title}</p>
            <p className="text-xs text-[#757575]">So với hôm qua</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E0E0E0] p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[#212121]">Doanh thu 7 ngày</h3>
            <span className="text-xs bg-green-100 text-[#2E7D32] px-2 py-1 rounded-full font-medium">
              {kpis.revenue_change_percent >= 0 ? "+" : ""}{kpis.revenue_change_percent.toFixed(1)}%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenue_7days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F6FA" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#757575" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v: number) => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 11, fill: "#757575" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value: number) => [formatCurrency(value), "Doanh thu"]} contentStyle={{ borderRadius: 10, border: "1px solid #E0E0E0", fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="#E53935" strokeWidth={2.5} dot={{ fill: "#E53935", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5">
          <h3 className="font-semibold text-[#212121] mb-5">Trạng thái đơn hàng</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {pieData.map((entry: { color: string }, i: number) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.map((d: { name: string; value: number; color: string }) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[#757575]">{d.name}</span>
                </div>
                <span className="font-semibold text-[#212121]">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0E0E0]">
            <h3 className="font-semibold text-[#212121]">Đơn hàng mới nhất</h3>
            <button onClick={() => router.push("/admin/orders")} className="text-sm text-[#1565C0] hover:underline">
              Xem tất cả
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F6FA]">
                <tr>
                  {["Đơn hàng", "Khách hàng", "Sản phẩm", "Tổng tiền", "Trạng thái", "Ngày"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-[#757575] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F6FA]">
                {recent_orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[#757575]">Chưa có đơn hàng</td>
                  </tr>
                ) : (
                  recent_orders.map((order) => {
                    const customerName = order.customer_name || "Khách hàng";
                    const initials = customerName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "NA";
                    const itemCount = order.order_items?.length || 0;
                    return (
                      <tr key={order.order_id} className="hover:bg-[#F5F6FA]">
                        <td className="px-4 py-3 font-medium text-[#1565C0] whitespace-nowrap">{order.order_number}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-[#1565C0] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">{initials}</div>
                            <span className="text-[#212121] text-xs whitespace-nowrap">{customerName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#757575]">{itemCount} sp</td>
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{formatCurrency(order.total_amount)}</td>
                        <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                        <td className="px-4 py-3 text-[#757575] whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString("vi-VN")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0E0E0]">
            <h3 className="font-semibold text-[#212121]">Chat đang mở</h3>
            <button onClick={() => router.push("/admin/chat")} className="text-sm text-[#1565C0] hover:underline">
              Xem tất cả
            </button>
          </div>
          <div className="divide-y divide-[#F5F6FA]">
            {open_conversations.length === 0 ? (
              <div className="px-4 py-8 text-center text-[#757575] text-sm">Không có hội thoại đang mở</div>
            ) : (
              open_conversations.map((conv: ConversationSummary) => {
                const customerName = conv.customer?.full_name || "Khách hàng";
                const initials = customerName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "NA";
                return (
                  <div key={conv.conversation_id} className="px-4 py-3 hover:bg-[#F5F6FA] cursor-pointer">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 bg-[#E53935] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">{initials}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-medium text-xs text-[#212121]">{customerName}</p>
                          <span className="text-[10px] text-[#757575] shrink-0">
                            {new Date(conv.last_message_at).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <p className="text-xs text-[#757575] truncate mt-0.5 capitalize">{conv.status}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-[#757575] capitalize">{conv.priority}</span>
                          <OrderStatusBadge status={conv.status} size="sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
