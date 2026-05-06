import { useState, useEffect } from "react";
import { Download, ChevronDown, Calendar, Search, MoreVertical } from "lucide-react";
import { orderService } from "../../services";
import { OrderStatusBadge } from "../../components/Order/StatusBadge";
import { UIPageHeader } from "../../components/UI/PageHeader";
import { ProductFilterSection } from "../../components/Product/FilterSection";
import { TableDataTable } from "../../components/Table/DataTable";

const TABS = ["Tất cả", "Chờ xử lý", "Đang xử lý", "Đang giao", "Đã giao", "Đã hủy"];
const STATUS_MAP: Record<string, string> = {
  "Chờ xử lý": "pending",
  "Đang xử lý": "processing",
  "Đang giao": "shipped",
  "Đã giao": "delivered",
  "Đã hủy": "cancelled",
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const transformOrder = (apiOrder: any) => ({
  id: apiOrder.order_number,
  customer: {
    name: apiOrder.customer_name,
    email: apiOrder.customer_email,
    avatar: apiOrder.customer_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "NA"
  },
  items: apiOrder.order_items?.length || 0,
  total: apiOrder.total_amount,
  status: apiOrder.status,
  paymentMethod: apiOrder.payment_method,
  date: new Date(apiOrder.created_at).toLocaleDateString("vi-VN"),
  address: `${apiOrder.shipping_address_line1}, ${apiOrder.shipping_city}`
});

export function ScreensAdminOrders() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrders({ page: pagination.page, limit: pagination.limit });
        setOrders(data.orders.map(transformOrder));
        setPagination(data.pagination);
      } catch (err) {
        setError("Không thể tải danh sách đơn hàng");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [pagination.page, pagination.limit]);

  const filteredOrders = orders.filter((o) => {
    const matchTab = activeTab === 0 || o.status === STATUS_MAP[TABS[activeTab]];
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const toggleSelect = (id: string) =>
    setSelectedOrders((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleAll = () => {
    if (selectedOrders.length === filteredOrders.length) setSelectedOrders([]);
    else setSelectedOrders(filteredOrders.map((o) => o.id));
  };

  const columns = [
    {
      key: "id",
      header: "Mã đơn",
      render: (order: any) => (
        <span className="font-medium text-[#1565C0] hover:underline cursor-pointer">{order.id}</span>
      ),
    },
    {
      key: "customer",
      header: "Khách hàng",
      render: (order: any) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#1565C0] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {order.customer.avatar}
          </div>
          <div>
            <p className="text-[#212121] font-medium text-xs whitespace-nowrap">{order.customer.name}</p>
            <p className="text-[#757575] text-[11px]">{order.customer.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "items",
      header: "Sản phẩm",
      render: (order: any) => <span className="text-[#757575] text-xs">{order.items} sp</span>,
    },
    {
      key: "total",
      header: "Tổng tiền",
      render: (order: any) => <span className="font-semibold whitespace-nowrap">{formatCurrency(order.total)}</span>,
    },
    {
      key: "paymentMethod",
      header: "Thanh toán",
      render: (order: any) => (
        <span className="text-xs bg-gray-100 text-[#757575] px-2 py-0.5 rounded">{order.paymentMethod}</span>
      ),
    },
    {
      key: "status",
      header: "Vận chuyển",
      render: (order: any) => <OrderStatusBadge status={order.status} />,
    },
    {
      key: "date",
      header: "Ngày đặt",
      render: (order: any) => <span className="text-[#757575] text-xs whitespace-nowrap">{order.date}</span>,
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1565C0] mx-auto mb-4"></div>
            <p className="text-[#757575]">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-[#212121] mb-2">Lỗi</h3>
            <p className="text-[#757575] mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#1565C0] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#0D47A1]"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Quản lý đơn hàng"
        subtitle={`Tổng ${pagination.total} đơn hàng`}
        actions={
          <>
            {selectedOrders.length > 0 && (
              <button className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
                Hành động ({selectedOrders.length}) <ChevronDown size={14} />
              </button>
            )}
            <button className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
              <Download size={14} /> Xuất Excel
            </button>
          </>
        }
      />

      <ProductFilterSection
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm đơn hàng, khách hàng..."
        tabs={TABS.map((tab, i) => `${tab}${i === 0 ? ` (${pagination.total})` : ""}`)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        extraContent={
          <button className="flex items-center gap-2 border border-[#E0E0E0] px-3 py-2 rounded-lg text-sm hover:bg-gray-50 text-[#757575]">
            <Calendar size={14} /> Chọn ngày
          </button>
        }
      />

      <TableDataTable
        data={filteredOrders}
        columns={columns}
        selectedIds={selectedOrders}
        onToggleSelect={toggleSelect}
        onToggleAll={toggleAll}
        idKey="id"
        emptyMessage="Không tìm thấy đơn hàng"
      />

      <div className="px-5 py-3 border-t border-[#E0E0E0] flex items-center justify-between text-sm text-[#757575]">
        <span>Hiển thị {filteredOrders.length}/{pagination.total} đơn hàng</span>
        <div className="flex gap-1">
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ←
          </button>
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                  pageNum === pagination.page ? "bg-[#1565C0] text-white" : "hover:bg-gray-100"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
            disabled={pagination.page === pagination.totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
