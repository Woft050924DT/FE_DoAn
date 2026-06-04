import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  TrendingUp, TrendingDown, ShoppingBag, Users, Package, DollarSign
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { statsService } from "../../services";
import { OrderStatusBadge } from "../../components/Order/StatusBadge";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const formatRevenueLabel = (value: number) => `${(value / 1000000).toFixed(0)}M`;

const formatChange = (value: number) => {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
};

export function ScreensAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof statsService.getDashboard>> | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await statsService.getDashboard();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const kpis = stats
    ? [
        {
          title: "Doanh thu hôm nay",
          value: formatCurrency(stats.kpis.todayRevenue),
          change: stats.kpis.revenueChange,
          up: stats.kpis.revenueChange >= 0,
          icon: DollarSign,
          color: "text-[#2E7D32]",
          bg: "bg-green-50",
          iconBg: "bg-green-100",
        },
        {
          title: "Đơn hàng mới hôm nay",
          value: String(stats.kpis.todayOrders),
          change: stats.kpis.ordersChange,
          up: stats.kpis.ordersChange >= 0,
          icon: ShoppingBag,
          color: "text-[#1565C0]",
          bg: "bg-blue-50",
          iconBg: "bg-blue-100",
        },
        {
          title: "Khách hàng",
          value: stats.kpis.totalUsers.toLocaleString("vi-VN"),
          change: 0,
          up: true,
          icon: Users,
          color: "text-purple-600",
          bg: "bg-purple-50",
          iconBg: "bg-purple-100",
          hideChange: true,
        },
        {
          title: "Sản phẩm đang bán",
          value: String(stats.kpis.publishedProducts),
          change: 0,
          up: true,
          icon: Package,
          color: "text-[#E65100]",
          bg: "bg-orange-50",
          iconBg: "bg-orange-100",
          hideChange: true,
        },
      ]
    : [];

  const recentOrders = (stats?.recentOrders || []).map((o: any) => ({
    id: o.order_number,
    customer: {
      name: o.customer_name,
      avatar:
        o.customer_name
          ?.split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "NA",
    },
    items: o.order_items?.length || 0,
    total: Number(o.total_amount),
    status: o.status,
    date: new Date(o.created_at).toLocaleDateString("vi-VN"),
  }));

  const revenueData = stats?.revenueByDay || [];
  const orderStatusData = stats?.orderStatusChart || [];
  const weekRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#212121]">Tổng quan</h1>
        <p className="text-sm text-[#757575] mt-0.5">Dữ liệu thật từ cơ sở dữ liệu ShopAI</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1565C0]" />
        </div>
      ) : error ? (
        <p className="text-center text-[#E53935] py-10">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <div key={kpi.title} className={`${kpi.bg} rounded-2xl p-5 border border-white`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`${kpi.iconBg} w-10 h-10 rounded-xl flex items-center justify-center`}>
                    <kpi.icon size={18} className={kpi.color} />
                  </div>
                  {!kpi.hideChange && (
                    <div
                      className={`flex items-center gap-1 text-xs font-semibold ${
                        kpi.up ? "text-[#2E7D32]" : "text-[#E53935]"
                      }`}
                    >
                      {kpi.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      {formatChange(kpi.change)}
                    </div>
                  )}
                </div>
                <p className="text-xl font-bold text-[#212121]">{kpi.value}</p>
                <p className="text-xs text-[#757575] mt-0.5">{kpi.title}</p>
                {!kpi.hideChange && <p className="text-xs text-[#757575]">So với hôm qua</p>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E0E0E0] p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-[#212121]">Doanh thu 7 ngày</h3>
                <span className="text-xs text-[#757575]">{formatCurrency(weekRevenue)}</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F6FA" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#757575" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={formatRevenueLabel}
                    tick={{ fontSize: 11, fill: "#757575" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Doanh thu"]}
                    contentStyle={{ borderRadius: 10, border: "1px solid #E0E0E0", fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#E53935"
                    strokeWidth={2.5}
                    dot={{ fill: "#E53935", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5">
              <h3 className="font-semibold text-[#212121] mb-5">Trạng thái đơn hàng</h3>
              {orderStatusData.length === 0 ? (
                <p className="text-sm text-[#757575] text-center py-16">Chưa có đơn hàng</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        dataKey="value"
                        paddingAngle={3}
                      >
                        {orderStatusData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {orderStatusData.map((d) => (
                      <div key={d.status} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-[#757575]">{d.name}</span>
                        </div>
                        <span className="font-semibold text-[#212121]">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0E0E0]">
              <h3 className="font-semibold text-[#212121]">Đơn hàng mới nhất</h3>
              <button
                onClick={() => navigate("/admin/orders")}
                className="text-sm text-[#1565C0] hover:underline"
              >
                Xem tất cả
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F6FA]">
                  <tr>
                    {["Đơn hàng", "Khách hàng", "Sản phẩm", "Tổng tiền", "Trạng thái", "Ngày"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-2.5 text-xs font-semibold text-[#757575] whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F6FA]">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[#757575]">
                        Chưa có đơn hàng
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#F5F6FA]">
                        <td className="px-4 py-3 font-medium text-[#1565C0] whitespace-nowrap">{order.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-[#1565C0] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {order.customer.avatar}
                            </div>
                            <span className="text-[#212121] text-xs whitespace-nowrap">{order.customer.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#757575]">{order.items} sp</td>
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{formatCurrency(order.total)}</td>
                        <td className="px-4 py-3">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-[#757575] whitespace-nowrap">{order.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
