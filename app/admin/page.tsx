'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, ShoppingBag, Users, MessageSquare, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { orderService } from "@/services";
import { OrderStatusBadge } from "@/components/Order/StatusBadge";

const CHAT_CONVERSATIONS = [
  { id: "1", customer: { name: "Nguyễn Văn An", email: "an.nguyen@gmail.com", avatar: "NA", phone: "0901234567" }, status: "open", priority: "urgent", lastMessage: "Tôi muốn hỏi về chính sách đổi trả...", time: "2 phút", unread: 3, assignedStaff: "Minh Tuấn", intent: "Đổi trả hàng", sentiment: 0.35 },
  { id: "2", customer: { name: "Trần Thị Bình", email: "binh.tran@gmail.com", avatar: "TB", phone: "0912345678" }, status: "waiting", priority: "high", lastMessage: "Đơn hàng của tôi chưa nhận được", time: "15 phút", unread: 1, assignedStaff: "Chưa gán", intent: "Kiểm tra đơn hàng", sentiment: 0.2 },
  { id: "3", customer: { name: "Lê Minh Châu", email: "chau.le@gmail.com", avatar: "LC", phone: "0923456789" }, status: "bot", priority: "normal", lastMessage: "Cho tôi xem các sản phẩm iPhone", time: "32 phút", unread: 0, assignedStaff: "Bot AI", intent: "Tư vấn sản phẩm", sentiment: 0.75 },
];

const REVENUE_DATA = [
  { day: "T2", revenue: 45000000 }, { day: "T3", revenue: 52000000 }, { day: "T4", revenue: 38000000 },
  { day: "T5", revenue: 68000000 }, { day: "T6", revenue: 75000000 }, { day: "T7", revenue: 92000000 }, { day: "CN", revenue: 61000000 },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const transformOrder = (apiOrder: any) => ({
  id: apiOrder.order_number,
  customer: { name: apiOrder.customer_name, email: apiOrder.customer_email, avatar: apiOrder.customer_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "NA" },
  items: apiOrder.order_items?.length || 0,
  total: apiOrder.total_amount,
  status: apiOrder.status,
  paymentMethod: apiOrder.payment_method,
  date: new Date(apiOrder.created_at).toLocaleDateString("vi-VN"),
  address: `${apiOrder.shipping_address_line1}, ${apiOrder.shipping_city}`
});

const ORDER_STATUS_DATA = [
  { name: "Đã giao", value: 245, color: "#2E7D32" },
  { name: "Đang giao", value: 67, color: "#5C6BC0" },
  { name: "Đang xử lý", value: 43, color: "#1565C0" },
  { name: "Chờ xử lý", value: 28, color: "#E65100" },
  { name: "Đã hủy", value: 12, color: "#E53935" },
];

const KPI_CARDS = [
  { title: "Doanh thu hôm nay", value: "61.000.000đ", change: 12.5, up: true, icon: DollarSign, color: "text-[#2E7D32]", bg: "bg-green-50", iconBg: "bg-green-100" },
  { title: "Đơn hàng mới", value: "128", change: 8.3, up: true, icon: ShoppingBag, color: "text-[#1565C0]", bg: "bg-blue-50", iconBg: "bg-blue-100" },
  { title: "Người dùng", value: "2.847", change: 5.2, up: false, icon: Users, color: "text-purple-600", bg: "bg-purple-50", iconBg: "bg-purple-100" },
  { title: "Chat đang mở", value: "23", change: 18.9, up: true, icon: MessageSquare, color: "text-[#E65100]", bg: "bg-orange-50", iconBg: "bg-orange-100" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrders({ page: 1, limit: 5 });
        setOrders(data.orders.map(transformOrder));
      } catch (err) {
        setError("Không thể tải dữ liệu");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#212121]">Tổng quan</h1>
        <p className="text-sm text-[#757575] mt-0.5">Chào mừng trở lại, Minh Tuấn! Đây là báo cáo hôm nay.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi) => (
          <div key={kpi.title} className={`${kpi.bg} rounded-2xl p-5 border border-white`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`${kpi.iconBg} w-10 h-10 rounded-xl flex items-center justify-center`}>
                <kpi.icon size={18} className={kpi.color} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${kpi.up ? "text-[#2E7D32]" : "text-[#E53935]"}`}>
                {kpi.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {kpi.up ? "+" : ""}{kpi.change}%
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
            <span className="text-xs bg-green-100 text-[#2E7D32] px-2 py-1 rounded-full font-medium">+12.5%</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F6FA" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#757575" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 11, fill: "#757575" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value: number) => [formatCurrency(value), "Doanh thu"]} contentStyle={{ borderRadius: 10, border: "1px solid #E0E0E0", fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="#E53935" strokeWidth={2.5} dot={{ fill: "#E53935", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5">
          <h3 className="font-semibold text-[#212121] mb-5">Trạng thái đơn hàng</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={ORDER_STATUS_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {ORDER_STATUS_DATA.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {ORDER_STATUS_DATA.map((d) => (
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
            <button onClick={() => router.push("/admin/orders")} className="text-sm text-[#1565C0] hover:underline">Xem tất cả</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F6FA]">
                <tr>{["Đơn hàng", "Khách hàng", "Sản phẩm", "Tổng tiền", "Trạng thái", "Ngày"].map((h) => (<th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-[#757575] whitespace-nowrap">{h}</th>))}</tr>
              </thead>
              <tbody className="divide-y divide-[#F5F6FA]">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-[#757575]">Đang tải...</td></tr>
                ) : error ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-red-500">{error}</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-[#757575]">Chưa có đơn hàng</td></tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#F5F6FA]">
                      <td className="px-4 py-3 font-medium text-[#1565C0] whitespace-nowrap">{order.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-[#1565C0] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">{order.customer.avatar}</div>
                          <span className="text-[#212121] text-xs whitespace-nowrap">{order.customer.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#757575]">{order.items} sp</td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{formatCurrency(order.total)}</td>
                      <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-[#757575] whitespace-nowrap">{order.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0E0E0]">
            <h3 className="font-semibold text-[#212121]">Chat đang mở</h3>
            <button onClick={() => router.push("/admin/chat")} className="text-sm text-[#1565C0] hover:underline">Xem tất cả</button>
          </div>
          <div className="divide-y divide-[#F5F6FA]">
            {CHAT_CONVERSATIONS.map((conv) => (
              <div key={conv.id} className="px-4 py-3 hover:bg-[#F5F6FA] cursor-pointer">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 bg-[#E53935] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">{conv.customer.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-medium text-xs text-[#212121]">{conv.customer.name}</p>
                      <span className="text-[10px] text-[#757575] shrink-0">{conv.time}</span>
                    </div>
                    <p className="text-xs text-[#757575] truncate mt-0.5">{conv.lastMessage}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-[#757575]">{conv.assignedStaff}</span>
                      {conv.unread > 0 && (
                        <span className="w-4 h-4 bg-[#E53935] rounded-full text-white text-[9px] flex items-center justify-center font-bold">{conv.unread}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
