'use client'

import { useState, useEffect, useCallback } from "react";
import { Download, ChevronDown, Calendar, Search, X, Eye, RefreshCw, Package, Truck, Phone, Mail, MapPin, FileText } from "lucide-react";
import { orderService } from "@/services";
import { OrderStatusBadge } from "@/components/Order/StatusBadge";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { ProductFilterSection } from "@/components/Product/FilterSection";
import { TableDataTable } from "@/components/Table/DataTable";
import type { Order, UpdateOrderRequest } from "@/services/types";

const TABS = ["Tất cả", "Chờ xử lý", "Đang xử lý", "Đang giao", "Đã giao", "Đã hủy"];
const STATUS_MAP: Record<string, string> = { "Chờ xử lý": "pending", "Đang xử lý": "processing", "Đang giao": "shipped", "Đã giao": "delivered", "Đã hủy": "cancelled" };
const PAYMENT_STATUS_MAP: Record<string, string> = { "pending": "Chờ thanh toán", "paid": "Đã thanh toán", "failed": "Thất bại", "refunded": "Đã hoàn tiền" };
const formatCurrency = (amount: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const transformOrder = (apiOrder: any): any => ({
  id: apiOrder.order_id || apiOrder.order_number,
  order_number: apiOrder.order_number,
  customer: {
    name: apiOrder.customer_name,
    email: apiOrder.customer_email,
    phone: apiOrder.customer_phone,
    avatar: apiOrder.customer_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "NA",
  },
  items: apiOrder.order_items?.length || 0,
  total: apiOrder.total_amount,
  status: apiOrder.status,
  payment_status: apiOrder.payment_status,
  shipping_status: apiOrder.shipping_status,
  paymentMethod: apiOrder.payment_method,
  shippingMethod: apiOrder.shipping_method,
  date: new Date(apiOrder.created_at).toLocaleDateString("vi-VN"),
  address: `${apiOrder.shipping_address_line1 || ""}${apiOrder.shipping_city ? `, ${apiOrder.shipping_city}` : ""}`,
  raw: apiOrder,
});

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];
const SHIPPING_OPTIONS = ["pending", "processing", "shipped", "delivered"];
const PAYMENT_STATUS_OPTIONS = ["pending", "paid", "failed", "refunded"];

const OrderStatusBadgeColor = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Chờ xử lý", cls: "bg-amber-100 text-amber-700" },
    processing: { label: "Đang xử lý", cls: "bg-blue-100 text-blue-700" },
    shipped: { label: "Đang giao", cls: "bg-purple-100 text-purple-700" },
    delivered: { label: "Đã giao", cls: "bg-green-100 text-green-700" },
    cancelled: { label: "Đã hủy", cls: "bg-red-100 text-red-700" },
  };
  const s = map[status] || { label: status, cls: "bg-gray-100 text-gray-700" };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.cls}`}>{s.label}</span>;
};

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  // Drawer state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [orderUpdate, setOrderUpdate] = useState<UpdateOrderRequest>({});

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statusParam = activeTab === 0 ? undefined : STATUS_MAP[TABS[activeTab]];
      const data = await orderService.getAdminOrders({
        page,
        limit: LIMIT,
        status: statusParam,
        search: search || undefined,
      });
      // Handle both response formats
      const ordersArray = data.orders || data.data || [];
      setOrders(ordersArray.map(transformOrder));
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err: any) {
      setError(err?.response?.status === 404 ? "API chưa được implement." : "Không thể tải danh sách đơn hàng.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openDetail = async (order: any) => {
    setSelectedOrder(order);
    setOrderUpdate({});
    // Try to fetch full order details
    try {
      setDrawerLoading(true);
      const fullOrder = await orderService.getOrderById(order.id);
      setSelectedOrder(transformOrder(fullOrder));
    } catch {
      // Use existing data if API fails
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      await orderService.updateOrder(selectedOrder.id, orderUpdate);
      await fetchOrders();
      // Refresh detail
      const full = await orderService.getOrderById(selectedOrder.id);
      setSelectedOrder(transformOrder(full));
      setOrderUpdate({});
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleExport = async () => {
    try {
      const data = await orderService.exportOrders({ status: activeTab === 0 ? undefined : STATUS_MAP[TABS[activeTab]] });
      const ordersData = Array.isArray(data) ? data : data.orders || data.data || [];
      const headers = ["Mã đơn", "Khách hàng", "Email", "Điện thoại", "Tổng tiền", "Trạng thái", "Thanh toán", "Ngày tạo"];
      const rows = ordersData.map((o: any) => [
        o.order_number, o.customer_name || o.customer?.full_name || "",
        o.customer_email || o.customer?.email || "",
        o.customer_phone || o.customer?.phone || "",
        o.total_amount,
        o.status, o.payment_status,
        new Date(o.created_at).toLocaleDateString("vi-VN"),
      ]);
      const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchTab = activeTab === 0 || o.status === STATUS_MAP[TABS[activeTab]];
    const matchSearch = !search || o.order_number?.toLowerCase().includes(search.toLowerCase()) || o.customer?.name?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const toggleSelect = (id: string) =>
    setSelectedOrders((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll = () => {
    if (selectedOrders.length === filteredOrders.length) setSelectedOrders([]);
    else setSelectedOrders(filteredOrders.map((o) => o.id));
  };

  const columns = [
    { key: "id", header: "Mã đơn", render: (order: any) => <span className="font-medium text-[#1565C0] hover:underline cursor-pointer" onClick={() => openDetail(order)}>{order.order_number || order.id}</span> },
    {
      key: "customer", header: "Khách hàng", render: (order: any) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#1565C0] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">{order.customer.avatar}</div>
          <div><p className="text-[#212121] font-medium text-xs whitespace-nowrap">{order.customer.name}</p><p className="text-[#757575] text-[11px]">{order.customer.email}</p></div>
        </div>
      )
    },
    { key: "items", header: "Sản phẩm", render: (order: any) => <span className="text-[#757575] text-xs">{order.items} sp</span> },
    { key: "total", header: "Tổng tiền", render: (order: any) => <span className="font-semibold whitespace-nowrap">{formatCurrency(order.total)}</span> },
    { key: "paymentMethod", header: "Thanh toán", render: (order: any) => <span className="text-xs bg-gray-100 text-[#757575] px-2 py-0.5 rounded capitalize">{order.paymentMethod}</span> },
    { key: "status", header: "Trạng thái", render: (order: any) => <OrderStatusBadgeColor status={order.status} /> },
    { key: "date", header: "Ngày đặt", render: (order: any) => <span className="text-[#757575] text-xs whitespace-nowrap">{order.date}</span> },
  ];

  const hasUpdates = Object.keys(orderUpdate).length > 0;

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
            <button onClick={handleExport} className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
              <Download size={14} /> Xuất Excel
            </button>
          </>
        }
      />
      <ProductFilterSection
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Tìm đơn hàng, khách hàng..."
        tabs={TABS.map((tab, i) => `${tab}${i === 0 ? ` (${pagination.total})` : ""}`)}
        activeTab={activeTab}
        onTabChange={(i) => { setActiveTab(i); setPage(1); }}
        extraContent={
          <button className="flex items-center gap-2 border border-[#E0E0E0] px-3 py-2 rounded-lg text-sm hover:bg-gray-50 text-[#757575]">
            <Calendar size={14} /> Chọn ngày
          </button>
        }
      />
      {error && (
        <div className="mx-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          {error}
        </div>
      )}
      <TableDataTable
        data={filteredOrders}
        columns={columns}
        selectedIds={selectedOrders}
        onToggleSelect={toggleSelect}
        onToggleAll={toggleAll}
        idKey="id"
        onRowHover={() => {}}
        emptyMessage="Không tìm thấy đơn hàng"
      />
      <div className="px-5 py-3 border-t border-[#E0E0E0] flex items-center justify-between text-sm text-[#757575]">
        <span>Hiển thị {filteredOrders.length}/{pagination.total} đơn hàng</span>
        <div className="flex gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-50">←</button>
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => i + 1).map((n) => (
            <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 flex items-center justify-center rounded-lg ${n === page ? "bg-[#1565C0] text-white" : "hover:bg-gray-100"}`}>{n}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-50">→</button>
        </div>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0] shrink-0">
              <div>
                <h3 className="font-bold text-[#212121]">{selectedOrder.order_number || selectedOrder.id}</h3>
                <p className="text-xs text-[#757575] mt-0.5">Ngày đặt: {selectedOrder.date}</p>
              </div>
              <div className="flex items-center gap-2">
                {hasUpdates && (
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updating}
                    className="flex items-center gap-1.5 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updating ? <RefreshCw size={13} className="animate-spin" /> : null}
                    {updating ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                )}
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
            </div>

            {drawerLoading ? (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1565C0] mx-auto mb-3" />
                  <p className="text-sm text-[#757575]">Đang tải chi tiết đơn hàng...</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <OrderStatusBadgeColor status={selectedOrder.status || selectedOrder.raw?.status} />
                    <span className="text-xs text-[#757575]">Đơn hàng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${selectedOrder.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {PAYMENT_STATUS_MAP[selectedOrder.payment_status] || selectedOrder.payment_status}
                    </span>
                    <span className="text-xs text-[#757575]">Thanh toán</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700`}>
                      {selectedOrder.shipping_status || "—"}
                    </span>
                    <span className="text-xs text-[#757575]">Vận chuyển</span>
                  </div>
                </div>

                {/* Status Controls */}
                <div className="bg-[#F5F6FA] rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-[#212121]">Cập nhật trạng thái</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-[#757575] mb-1 block">Đơn hàng</label>
                      <select
                        value={orderUpdate.status || selectedOrder.status || selectedOrder.raw?.status || ""}
                        onChange={(e) => setOrderUpdate(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]"
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_MAP_reverse?.[s] || s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#757575] mb-1 block">Vận chuyển</label>
                      <select
                        value={orderUpdate.shipping_status || selectedOrder.shipping_status || selectedOrder.raw?.shipping_status || ""}
                        onChange={(e) => setOrderUpdate(prev => ({ ...prev, shipping_status: e.target.value }))}
                        className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]"
                      >
                        {SHIPPING_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#757575] mb-1 block">Thanh toán</label>
                      <select
                        value={orderUpdate.payment_status || selectedOrder.payment_status || selectedOrder.raw?.payment_status || ""}
                        onChange={(e) => setOrderUpdate(prev => ({ ...prev, payment_status: e.target.value }))}
                        className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]"
                      >
                        {PAYMENT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{PAYMENT_STATUS_MAP[s] || s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#757575] mb-1 block">Mã vận đơn</label>
                    <input
                      type="text"
                      value={orderUpdate.tracking_number ?? selectedOrder.raw?.tracking_number ?? ""}
                      onChange={(e) => setOrderUpdate(prev => ({ ...prev, tracking_number: e.target.value }))}
                      placeholder="Nhập mã vận đơn..."
                      className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#757575] mb-1 block">Ghi chú nội bộ</label>
                    <textarea
                      rows={2}
                      value={orderUpdate.internal_notes ?? selectedOrder.raw?.internal_notes ?? ""}
                      onChange={(e) => setOrderUpdate(prev => ({ ...prev, internal_notes: e.target.value }))}
                      placeholder="Ghi chú (chỉ admin nhìn thấy)..."
                      className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA] resize-none"
                    />
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
                  <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2"><Package size={14} className="text-[#1565C0]" /> Thông tin khách hàng</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#1565C0] rounded-full flex items-center justify-center text-white text-xs font-bold">{selectedOrder.customer?.avatar}</div>
                      <div>
                        <p className="text-sm font-medium text-[#212121]">{selectedOrder.customer?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#757575]">
                      <Mail size={13} />{selectedOrder.customer?.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#757575]">
                      <Phone size={13} />{selectedOrder.customer?.phone || "—"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#757575]">
                      <Truck size={13} />{selectedOrder.shippingMethod || "—"}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 mt-3 text-sm text-[#757575]">
                    <MapPin size={13} className="mt-0.5 shrink-0" />
                    <span>{selectedOrder.address}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
                  <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2"><Package size={14} className="text-[#1565C0]" /> Sản phẩm đã đặt ({selectedOrder.items})</h4>
                  {selectedOrder.raw?.order_items && selectedOrder.raw.order_items.length > 0 ? (
                    <div className="space-y-3">
                      {selectedOrder.raw.order_items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 py-3 border-b border-[#F5F6FA] last:border-0">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                            <Package size={18} className="text-gray-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#212121] line-clamp-1">{item.product_name}</p>
                            {item.variant_name && <p className="text-xs text-[#757575]">{item.variant_name}</p>}
                            <p className="text-xs text-[#757575]">SKU: {item.sku}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-[#212121]">{formatCurrency(item.unit_price)}</p>
                            <p className="text-xs text-[#757575]">x{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#757575]">Không có thông tin chi tiết sản phẩm</p>
                  )}
                </div>

                {/* Order Summary */}
                {selectedOrder.raw && (
                  <div className="bg-white rounded-xl border border-[#E0E0E0] p-5">
                    <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2"><FileText size={14} className="text-[#1565C0]" /> Chi tiết thanh toán</h4>
                    <div className="space-y-2">
                      {[
                        { label: "Tạm tính", value: selectedOrder.raw.subtotal },
                        { label: "Phí vận chuyển", value: selectedOrder.raw.shipping_fee },
                        { label: "Thuế", value: selectedOrder.raw.tax_amount },
                        { label: "Giảm giá", value: selectedOrder.raw.discount_amount },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between text-sm">
                          <span className="text-[#757575]">{row.label}</span>
                          <span className={`font-medium ${row.value > 0 ? "text-[#212121]" : "text-[#2E7D32]"}`}>
                            {row.value > 0 ? formatCurrency(row.value) : formatCurrency(0)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm pt-2 border-t border-[#E0E0E0]">
                        <span className="font-semibold text-[#212121]">Tổng cộng</span>
                        <span className="font-bold text-[#E53935] text-lg">{formatCurrency(selectedOrder.raw.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const STATUS_MAP_reverse: Record<string, string> = {
  pending: "Chờ xử lý", processing: "Đang xử lý",
  shipped: "Đang giao", delivered: "Đã giao", cancelled: "Đã hủy",
};
