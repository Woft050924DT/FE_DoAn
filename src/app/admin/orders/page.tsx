import { useState, useEffect, useCallback } from "react";
import { Download, ChevronDown, Calendar, X, Edit2 } from "lucide-react";
import { orderService } from '../../../services';
import { OrderStatusBadge } from '../../../components/Order/StatusBadge';
import { UIPageHeader } from '../../../components/UI/PageHeader';
import { ProductFilterSection } from '../../../components/Product/FilterSection';
import { TableDataTable } from '../../../components/Table/DataTable';

const TABS = ["Tất cả", "Chờ xử lý", "Đang xử lý", "Đang giao", "Đã giao", "Đã hủy"];
const STATUS_MAP: Record<string, string> = {
  "Chờ xử lý": "pending",
  "Đang xử lý": "processing",
  "Đang giao": "shipped",
  "Đã giao": "delivered",
  "Đã hủy": "cancelled",
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "processing", label: "Đang xử lý" },
  { value: "shipped", label: "Đang giao" },
  { value: "delivered", label: "Đã giao (trừ kho)" },
  { value: "cancelled", label: "Đã hủy" },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const transformOrder = (apiOrder: any) => ({
  orderId: apiOrder.order_id,
  id: apiOrder.order_number,
  customer: {
    name: apiOrder.customer_name,
    email: apiOrder.customer_email,
    avatar:
      apiOrder.customer_name
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "NA",
  },
  items: apiOrder.order_items?.length || 0,
  itemDetails: apiOrder.order_items || [],
  total: Number(apiOrder.total_amount),
  status: apiOrder.status,
  paymentMethod: apiOrder.payment_method,
  date: new Date(apiOrder.created_at).toLocaleDateString("vi-VN"),
  address: `${apiOrder.shipping_address_line1}, ${apiOrder.shipping_city}`,
  notes: apiOrder.notes || "",
  tracking_number: apiOrder.tracking_number || "",
});

export function ScreensAdminOrders() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [orders, setOrders] = useState<ReturnType<typeof transformOrder>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [editOrder, setEditOrder] = useState<ReturnType<typeof transformOrder> | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editTracking, setEditTracking] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrders({ page: pagination.page, limit: pagination.limit });
      setOrders(data.orders.map(transformOrder));
      setPagination(data.pagination);
    } catch (err) {
      setError("Không thể tải danh sách đơn hàng");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.filter((o) => {
    const matchTab = activeTab === 0 || o.status === STATUS_MAP[TABS[activeTab]];
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const openEdit = (order: ReturnType<typeof transformOrder>) => {
    setEditOrder(order);
    setEditStatus(order.status);
    setEditNotes(order.notes);
    setEditTracking(order.tracking_number);
    setSaveError("");
  };

  const handleSaveOrder = async () => {
    if (!editOrder) return;
    setSaving(true);
    setSaveError("");
    try {
      await orderService.updateOrder(editOrder.orderId, {
        status: editStatus,
        notes: editNotes,
        tracking_number: editTracking,
        status_note: `Admin cập nhật trạng thái`,
      });
      setEditOrder(null);
      await loadOrders();
    } catch (err: any) {
      setSaveError(err.response?.data?.error || "Không thể cập nhật đơn hàng");
    } finally {
      setSaving(false);
    }
  };

  const toggleSelect = (id: string) =>
    setSelectedOrders((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleAll = () => {
    if (selectedOrders.length === filteredOrders.length) setSelectedOrders([]);
    else setSelectedOrders(filteredOrders.map((o) => o.id));
  };

  const columns = [
    {
      key: "id",
      header: "Mã đơn",
      render: (order: ReturnType<typeof transformOrder>) => (
        <button
          type="button"
          onClick={() => openEdit(order)}
          className="font-medium text-[#1565C0] hover:underline"
        >
          {order.id}
        </button>
      ),
    },
    {
      key: "customer",
      header: "Khách hàng",
      render: (order: ReturnType<typeof transformOrder>) => (
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
      render: (order: ReturnType<typeof transformOrder>) => (
        <span className="text-[#757575] text-xs">{order.items} sp</span>
      ),
    },
    {
      key: "total",
      header: "Tổng tiền",
      render: (order: ReturnType<typeof transformOrder>) => (
        <span className="font-semibold whitespace-nowrap">{formatCurrency(order.total)}</span>
      ),
    },
    {
      key: "paymentMethod",
      header: "Thanh toán",
      render: (order: ReturnType<typeof transformOrder>) => (
        <span className="text-xs bg-gray-100 text-[#757575] px-2 py-0.5 rounded">{order.paymentMethod}</span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (order: ReturnType<typeof transformOrder>) => <OrderStatusBadge status={order.status} />,
    },
    {
      key: "date",
      header: "Ngày đặt",
      render: (order: ReturnType<typeof transformOrder>) => (
        <span className="text-[#757575] text-xs whitespace-nowrap">{order.date}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (order: ReturnType<typeof transformOrder>) => (
        <button
          type="button"
          onClick={() => openEdit(order)}
          className="p-1.5 rounded-lg hover:bg-[#E3F2FD] text-[#1565C0]"
          title="Sửa đơn"
        >
          <Edit2 size={14} />
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1565C0] mx-auto mb-4" />
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
              onClick={loadOrders}
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
        subtitle={`Tổng ${pagination.total} đơn — chuyển "Đã giao" sẽ trừ tồn kho`}
        actions={
          <button className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
            <Download size={14} /> Xuất Excel
          </button>
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
        <span>
          Hiển thị {filteredOrders.length}/{pagination.total} đơn hàng
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            ←
          </button>
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                  pageNum === pagination.page ? "bg-[#1565C0] text-white" : "hover:bg-gray-100"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))
            }
            disabled={pagination.page === pagination.totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            →
          </button>
        </div>
      </div>

      {editOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0]">
              <h3 className="font-semibold text-[#212121]">Sửa đơn {editOrder.id}</h3>
              <button type="button" onClick={() => setEditOrder(null)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {saveError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>
              )}
              <div className="text-sm text-[#757575] space-y-1">
                <p>
                  <strong>Khách:</strong> {editOrder.customer.name} ({editOrder.customer.email})
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {editOrder.address}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#757575] mb-2">Sản phẩm trong đơn</p>
                <ul className="text-sm space-y-1 bg-[#F5F6FA] rounded-lg p-3">
                  {editOrder.itemDetails.map((item: any) => (
                    <li key={item.order_item_id} className="flex justify-between gap-2">
                      <span className="line-clamp-1">{item.product_name}</span>
                      <span className="shrink-0 text-[#757575]">x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-1">Trạng thái *</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {editStatus === "delivered" && (
                  <p className="text-xs text-amber-700 mt-1">
                    Khi lưu "Đã giao", hệ thống trừ tồn kho theo số lượng từng sản phẩm trong đơn.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-1">Mã vận đơn</label>
                <input
                  value={editTracking}
                  onChange={(e) => setEditTracking(e.target.value)}
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-1">Ghi chú</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveOrder}
                  disabled={saving}
                  className="flex-1 bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#1D4ED8] disabled:opacity-60"
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditOrder(null)}
                  className="px-4 py-2.5 border border-[#E0E0E0] rounded-lg text-sm text-[#757575]"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
