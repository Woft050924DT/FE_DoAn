import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import {
  Package, AlertTriangle, TrendingDown, Boxes, Download,
  ArrowDownToLine, ArrowUpFromLine, PenLine, X, History, Truck, Plus,
} from "lucide-react";
import {
  inventoryService,
  catalogService,
  type InventoryItem,
  type InventorySummary,
  type InventoryTransaction,
} from '../../../services';
import type { Brand, Category } from '../../../services/types';
import { ImagePicker } from '../../../components/Media/ImagePicker';
import { toNumber } from '../../../utils/apiMappers';
import { UIPageHeader } from '../../../components/UI/PageHeader';
import { UIBusinessFlowSteps } from '../../../components/UI/BusinessFlowSteps';
import { UITablePagination } from '../../../components/UI/TablePagination';
import { ProductFilterSection } from '../../../components/Product/FilterSection';
import { TableDataTable } from '../../../components/Table/DataTable';

type InventoryListStatus = "all" | "low" | "out" | "in_stock";



const TABS = ["Tất cả", "Sắp hết hàng", "Hết hàng", "Còn hàng"];
const STATUS_MAP: Record<number, InventoryListStatus> = {
  0: "all",
  1: "low",
  2: "out",
  3: "in_stock",
};
type AdjustType = "in" | "out" | "set";
type ViewMode = "stock" | "history";

const parseMoney = (value: string) => Number(value.replace(/[^\d]/g, "")) || 0;

const emptyNewProductForm = () => ({
  name: "",
  sku: "",
  cost_price: "",
  quantity: "",
  category_id: "",
  brand_id: "",
  short_description: "",
  image_urls: [""] as string[],
  status: "published" as "draft" | "published",
  notes: "",
});

function formatVnd(value: number | string | null | undefined) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "—";
  return `${n.toLocaleString("vi-VN")}đ`;
}

const TX_LABELS: Record<string, string> = {
  stock_in: "Nhập hàng",
  stock_out: "Xuất kho",
  adjustment: "Điều chỉnh",
  sale: "Bán hàng",
};

const TX_COLORS: Record<string, string> = {
  stock_in: "bg-green-100 text-[#2E7D32]",
  stock_out: "bg-orange-100 text-[#E65100]",
  adjustment: "bg-blue-100 text-[#1565C0]",
  sale: "bg-purple-100 text-purple-700",
};

function getStockStatus(qty: number, threshold: number) {
  if (qty <= 0) return { label: "Hết hàng", className: "text-[#E53935]" };
  if (qty <= threshold) return { label: "Sắp hết", className: "text-[#E65100]" };
  return { label: "Còn hàng", className: "text-[#2E7D32]" };
}

function mapInventoryRow(item: InventoryItem, threshold: number) {
  const stock = item.stock_quantity ?? 0;
  const product = item.products;
  return {
    id: item.variant_id,
    variantId: item.variant_id,
    productId: item.product_id || product?.product_id,
    productName: product?.name || "—",
    variantName: item.name || "Mặc định",
    sku: item.sku || product?.sku || "—",
    brand: product?.brands?.name || "—",
    category: product?.categories?.name || "—",
    image:
      product?.product_images?.[0]?.image_url ||
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=80&q=80",
    stock,
    costPrice: toNumber(item.cost_price ?? product?.cost_price),
    sellPrice: toNumber(product?.price ?? item.price),
    status: getStockStatus(stock, threshold),
    raw: item,
  };
}

export function ScreensAdminInventory() {
  const [viewMode, setViewMode] = useState<ViewMode>("stock");
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [items, setItems] = useState<ReturnType<typeof mapInventoryRow>[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 6, total: 0, totalPages: 1 });
  const [txPagination, setTxPagination] = useState({ page: 1, limit: 6, total: 0, totalPages: 1 });

  const [adjustCost, setAdjustCost] = useState("");
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<ReturnType<typeof mapInventoryRow> | null>(null);
  const [adjustType, setAdjustType] = useState<AdjustType>("in");
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustNotes, setAdjustNotes] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustError, setAdjustError] = useState("");

  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receiveTarget, setReceiveTarget] = useState<ReturnType<typeof mapInventoryRow> | null>(null);
  const [receiveQty, setReceiveQty] = useState("");
  const [receiveCost, setReceiveCost] = useState("");
  const [receiveNotes, setReceiveNotes] = useState("");
  const [receiveLoading, setReceiveLoading] = useState(false);
  const [receiveError, setReceiveError] = useState("");

  const [receiveNewOpen, setReceiveNewOpen] = useState(false);
  const [newProduct, setNewProduct] = useState(emptyNewProductForm);
  const [receiveNewLoading, setReceiveNewLoading] = useState(false);
  const [receiveNewError, setReceiveNewError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const threshold = summary?.lowStockThreshold ?? 10;

  const loadSummary = useCallback(async () => {
    try {
      const data = await inventoryService.getSummary();
      setSummary(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getInventory({
        search: search || undefined,
        status: STATUS_MAP[activeTab],
        page: pagination.page,
        limit: pagination.limit,
      });
      setItems(data.items.map((i) => mapInventoryRow(i, threshold)));
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu kho hàng. Vui lòng đăng nhập và đảm bảo server đang chạy.");
    } finally {
      setLoading(false);
    }
  }, [search, activeTab, pagination.page, pagination.limit, threshold]);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getTransactions({
        page: txPagination.page,
        limit: txPagination.limit,
      });
      setTransactions(data.transactions);
      setTxPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch (err) {
      console.error(err);
      setError("Không thể tải lịch sử kho.");
    } finally {
      setLoading(false);
    }
  }, [txPagination.page, txPagination.limit]);

  useEffect(() => {
    loadSummary();
    catalogService.getCategories().then(setCategories).catch(console.error);
    catalogService.getBrands().then(setBrands).catch(console.error);
  }, [loadSummary]);

  useEffect(() => {
    if (viewMode === "stock") loadInventory();
    else loadTransactions();
  }, [viewMode, loadInventory, loadTransactions]);

  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [search, activeTab]);

  const openReceiveNew = () => {
    setNewProduct(emptyNewProductForm());
    setReceiveNewError("");
    setReceiveNewOpen(true);
  };

  const submitReceiveNew = async () => {
    const qty = Number(newProduct.quantity);
    const unitCost = parseMoney(newProduct.cost_price);

    if (!newProduct.name.trim()) {
      setReceiveNewError("Vui lòng nhập tên sản phẩm");
      return;
    }
    if (!newProduct.sku.trim()) {
      setReceiveNewError("Vui lòng nhập SKU");
      return;
    }
    if (unitCost <= 0) {
      setReceiveNewError("Giá nhập phải lớn hơn 0");
      return;
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      setReceiveNewError("Số lượng nhập phải lớn hơn 0");
      return;
    }

    setReceiveNewLoading(true);
    setReceiveNewError("");
    try {
      await inventoryService.receiveStock({
        quantity: qty,
        unit_cost: unitCost,
        notes: newProduct.notes.trim() || undefined,
        product: {
          name: newProduct.name.trim(),
          sku: newProduct.sku.trim(),
          category_id: newProduct.category_id || undefined,
          brand_id: newProduct.brand_id || undefined,
          short_description: newProduct.short_description.trim() || undefined,
          image_urls: newProduct.image_urls.map((u) => u.trim()).filter(Boolean),
          status: newProduct.status,
        },
      });
      setReceiveNewOpen(false);
      await Promise.all([loadSummary(), loadInventory()]);
    } catch (err: any) {
      const msg = err.response?.data?.error;
      setReceiveNewError(
        msg === "SKU already exists"
          ? "SKU đã tồn tại. Vui lòng dùng mã khác."
          : msg || "Nhập hàng mới thất bại"
      );
    } finally {
      setReceiveNewLoading(false);
    }
  };

  const openReceive = (row: ReturnType<typeof mapInventoryRow>) => {
    setReceiveTarget(row);
    setReceiveQty("");
    setReceiveCost(row.costPrice > 0 ? String(row.costPrice) : "");
    setReceiveNotes("");
    setReceiveError("");
    setReceiveOpen(true);
  };

  const submitReceive = async () => {
    if (!receiveTarget) return;
    const qty = Number(receiveQty);
    const unitCost = Number(receiveCost.replace(/\D/g, ""));
    if (!Number.isFinite(qty) || qty <= 0) {
      setReceiveError("Số lượng nhập phải lớn hơn 0");
      return;
    }
    if (!Number.isFinite(unitCost) || unitCost <= 0) {
      setReceiveError("Giá nhập phải lớn hơn 0");
      return;
    }
    setReceiveLoading(true);
    setReceiveError("");
    try {
      await inventoryService.receiveStock({
        variant_id: receiveTarget.variantId,
        quantity: qty,
        unit_cost: unitCost,
        notes: receiveNotes || undefined,
      });
      setReceiveOpen(false);
      await Promise.all([loadSummary(), loadInventory()]);
    } catch (err: any) {
      setReceiveError(err.response?.data?.error || "Nhập hàng thất bại");
    } finally {
      setReceiveLoading(false);
    }
  };

  const openAdjust = (row: ReturnType<typeof mapInventoryRow>, type: AdjustType) => {
    setAdjustTarget(row);
    setAdjustType(type);
    setAdjustQty(type === "set" ? String(row.stock) : "");
    setAdjustNotes("");
    setAdjustError("");
    setAdjustOpen(true);
    setAdjustCost(type === "in" ? String(row.costPrice || "") : "");
  };

 const submitAdjust = async () => {
  if (!adjustTarget) return;
  const qty = Number(adjustQty);
  if (!Number.isFinite(qty) || (adjustType !== "set" && qty <= 0)) {
    setAdjustError("Số lượng không hợp lệ");
    return;
  }
  if (adjustType === "set" && qty < 0) {
    setAdjustError("Tồn kho không được âm");
    return;
  }
  if (adjustType === "in") {
    const cost = Number(adjustCost.replace(/\D/g, ""));
    if (!Number.isFinite(cost) || cost <= 0) {
      setAdjustError("Giá nhập phải lớn hơn 0");
      return;
    }
  }

  setAdjustLoading(true);
  setAdjustError("");
  try {
    if (adjustType === "in") {
      await inventoryService.receiveStock({
        variant_id: adjustTarget.variantId,
        quantity: qty,
        unit_cost: Number(adjustCost.replace(/\D/g, "")),
        notes: adjustNotes || undefined,
      });
    } else {
      await inventoryService.adjustStock({
        variant_id: adjustTarget.variantId,
        type: adjustType,
        quantity: qty,
        notes: adjustNotes || undefined,
      });
    }
    setAdjustOpen(false);
    await Promise.all([loadSummary(), viewMode === "stock" ? loadInventory() : loadTransactions()]);
  } catch (err: any) {
    setAdjustError(err.response?.data?.error || "Cập nhật kho thất bại");
  } finally {
    setAdjustLoading(false);
  }
};

  const columns = [
    {
      key: "product",
      header: "Sản phẩm / Biến thể",
      render: (row: ReturnType<typeof mapInventoryRow>) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <img src={row.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          <div>
            <p className="font-medium text-[#212121] text-xs line-clamp-1">{row.productName}</p>
            <p className="text-[#757575] text-[11px]">{row.variantName}</p>
          </div>
        </div>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      render: (row: ReturnType<typeof mapInventoryRow>) => (
        <span className="text-xs text-[#757575] font-mono">{row.sku}</span>
      ),
    },
    {
      key: "category",
      header: "Danh mục",
      render: (row: ReturnType<typeof mapInventoryRow>) => (
        <span className="text-xs text-[#757575]">{row.category}</span>
      ),
    },
    {
      key: "brand",
      header: "Thương hiệu",
      render: (row: ReturnType<typeof mapInventoryRow>) => (
        <span className="text-xs font-medium text-[#757575]">{row.brand}</span>
      ),
    },
    {
      key: "costPrice",
      header: "Giá nhập",
      render: (row: ReturnType<typeof mapInventoryRow>) => (
        <span className="text-xs text-[#757575]">{formatVnd(row.costPrice)}</span>
      ),
    },
    {
      key: "stock",
      header: "Tồn kho",
      render: (row: ReturnType<typeof mapInventoryRow>) => (
        <span className={`text-sm font-bold ${row.status.className}`}>{row.stock}</span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row: ReturnType<typeof mapInventoryRow>) => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          row.stock <= 0
            ? "bg-red-100 text-[#E53935]"
            : row.stock <= threshold
              ? "bg-amber-100 text-[#E65100]"
              : "bg-green-100 text-[#2E7D32]"
        }`}>
          {row.status.label}
        </span>
      ),
    },
  ];

  const summaryCards = [
    {
      label: "Tổng SKU",
      value: summary?.totalSkus ?? "—",
      icon: Package,
      color: "bg-blue-50 text-[#1565C0]",
    },
    {
      label: "Tổng tồn kho",
      value: summary?.totalStock ?? "—",
      icon: Boxes,
      color: "bg-green-50 text-[#2E7D32]",
    },
    {
      label: "Sắp hết (≤10)",
      value: summary?.lowStock ?? "—",
      icon: AlertTriangle,
      color: "bg-amber-50 text-[#E65100]",
    },
    {
      label: "Hết hàng",
      value: summary?.outOfStock ?? "—",
      icon: TrendingDown,
      color: "bg-red-50 text-[#E53935]",
    },
  ];

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Quản lý kho hàng"
        actions={
          <>
            <Link
              to="/admin/products"
              className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              Tạo sản phẩm
            </Link>
            <button
              onClick={() => {
                if (viewMode === "stock") {
                  setTxPagination((p) => ({ ...p, page: 1 }));
                  setViewMode("history");
                } else {
                  setPagination((p) => ({ ...p, page: 1 }));
                  setViewMode("stock");
                }
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
                viewMode === "history"
                  ? "bg-[#1565C0] text-white border-[#1565C0]"
                  : "border-[#E0E0E0] bg-white hover:bg-gray-50"
              }`}
            >
              <History size={14} />
              {viewMode === "stock" ? "Lịch sử kho" : "Tồn kho"}
            </button>
            <button className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
              <Download size={14} /> Xuất
            </button>
          </>
        }
      />

      <UIBusinessFlowSteps current={2} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-[#E0E0E0] p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.color}`}>
              <card.icon size={20} />
            </div>
            <div>
              <p className="text-xs text-[#757575]">{card.label}</p>
              <p className="text-xl font-bold text-[#212121]">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {viewMode === "stock" ? (
        <>
          <ProductFilterSection
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Tìm SKU, tên sản phẩm, biến thể..."
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1565C0]" />
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-10 text-center">
              <p className="text-[#757575] mb-4">{error}</p>
              <button
                onClick={loadInventory}
                className="bg-[#1565C0] text-white px-5 py-2 rounded-lg text-sm"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
              <TableDataTable
                data={items}
                columns={columns}
                selectedIds={selectedIds}
                onToggleSelect={(id) =>
                  setSelectedIds((prev) =>
                    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                  )
                }
                onToggleAll={() => {
                  if (selectedIds.length === items.length) setSelectedIds([]);
                  else setSelectedIds(items.map((i) => i.id));
                }}
                idKey="id"
                renderRowActions={(row) => (
                  <div className="flex items-center gap-1">
                    <button
                     title="Nhập kho"
                      onClick={() => openReceive(row)}   // ← đổi từ openAdjust(row, "in")
                      className="p-1.5 hover:bg-green-50 rounded text-[#2E7D32] opacity-70"
                    >
                    <ArrowDownToLine size={15} />
                    </button>
                    <button
                      title="Xuất kho"
                      onClick={() => openAdjust(row, "out")}
                      className="p-1.5 hover:bg-orange-50 rounded text-[#E65100]"
                    >
                      <ArrowUpFromLine size={15} />
                    </button>
                    <button
                      title="Điều chỉnh"
                      onClick={() => openAdjust(row, "set")}
                      className="p-1.5 hover:bg-blue-50 rounded text-[#1565C0]"
                    >
                      <PenLine size={15} />
                    </button>
                  </div>
                )}
                emptyMessage="Không có dữ liệu tồn kho"
              />

              <UITablePagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={pagination.limit}
                itemLabel="biến thể"
                onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
              />
              </div>
            </>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1565C0]" />
            </div>
          ) : error ? (
            <p className="p-8 text-center text-[#757575]">{error}</p>
          ) : transactions.length === 0 ? (
            <p className="p-8 text-center text-[#757575]">Chưa có giao dịch kho</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F6FA] border-b border-[#E0E0E0]">
                  <tr>
                    {["Thời gian", "Loại", "Sản phẩm", "SKU", "SL", "Ghi chú", "Người thực hiện"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#757575] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F6FA]">
                  {transactions.map((tx) => (
                    <tr key={tx.transaction_id} className="hover:bg-[#F5F6FA]">
                      <td className="px-4 py-3 text-xs text-[#757575] whitespace-nowrap">
                        {tx.created_at
                          ? new Date(tx.created_at).toLocaleString("vi-VN")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          TX_COLORS[tx.transaction_type] || "bg-gray-100 text-gray-600"
                        }`}>
                          {TX_LABELS[tx.transaction_type] || tx.transaction_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#212121] max-w-[180px] truncate">
                        {tx.products?.name || tx.product_variants?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-[#757575]">
                        {tx.product_variants?.sku || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold">{tx.quantity}</td>
                      <td className="px-4 py-3 text-xs text-[#757575] max-w-[160px] truncate">
                        {tx.notes || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#757575]">
                        {tx.users?.full_name || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && !error && transactions.length > 0 && (
            <UITablePagination
              page={txPagination.page}
              totalPages={txPagination.totalPages}
              total={txPagination.total}
              limit={txPagination.limit}
              itemLabel="giao dịch"
              onPageChange={(page) => setTxPagination((p) => ({ ...p, page }))}
            />
          )}
        </div>
      )}

      {receiveNewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl my-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[#E0E0E0] sticky top-0 bg-white z-10">
              <h3 className="font-bold text-[#212121] flex items-center gap-2">
                <Plus size={18} className="text-[#2E7D32]" />
                Nhập hàng mới
              </h3>
              <button onClick={() => setReceiveNewOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-[#757575]">
                Tạo sản phẩm mới và nhập tồn kho trong một bước (không cần có sẵn trong danh sách).
              </p>

              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Tên sản phẩm *</label>
                <input
                  value={newProduct.name}
                  onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1565C0]"
                  placeholder="VD: Đồng hồ Casio MTP..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">SKU *</label>
                  <input
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct((p) => ({ ...p, sku: e.target.value }))}
                    className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#1565C0]"
                    placeholder="CASIO-MTP-001"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Số lượng nhập *</label>
                  <input
                    type="number"
                    min={1}
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct((p) => ({ ...p, quantity: e.target.value }))}
                    className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1565C0]"
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Giá nhập (đơn vị) *</label>
                  <input
                    value={newProduct.cost_price}
                    onChange={(e) => setNewProduct((p) => ({ ...p, cost_price: e.target.value }))}
                    className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1565C0]"
                    placeholder="3200000"
                  />
                </div>
                <p className="text-[11px] text-[#757575] mt-1 col-span-2">
                  Giá bán cập nhật sau tại Sản phẩm (tạo mới tạm dùng bằng giá nhập).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Danh mục</label>
                  <select
                    value={newProduct.category_id}
                    onChange={(e) => setNewProduct((p) => ({ ...p, category_id: e.target.value }))}
                    className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1565C0]"
                  >
                    <option value="">— Chọn —</option>
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Thương hiệu</label>
                  <select
                    value={newProduct.brand_id}
                    onChange={(e) => setNewProduct((p) => ({ ...p, brand_id: e.target.value }))}
                    className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1565C0]"
                  >
                    <option value="">— Chọn —</option>
                    {brands.map((b) => (
                      <option key={b.brand_id} value={b.brand_id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Trạng thái</label>
                <select
                  value={newProduct.status}
                  onChange={(e) =>
                    setNewProduct((p) => ({
                      ...p,
                      status: e.target.value as "draft" | "published",
                    }))
                  }
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1565C0]"
                >
                  <option value="published">Đang bán (hiện trên shop)</option>
                  <option value="draft">Nháp</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Mô tả ngắn</label>
                <input
                  value={newProduct.short_description}
                  onChange={(e) => setNewProduct((p) => ({ ...p, short_description: e.target.value }))}
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1565C0]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Ảnh sản phẩm</label>
                <ImagePicker
                  label=""
                  value={newProduct.image_urls[0] || ""}
                  onChange={(url) => setNewProduct((p) => ({ ...p, image_urls: [url] }))}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Ghi chú nhập hàng</label>
                <textarea
                  rows={2}
                  value={newProduct.notes}
                  onChange={(e) => setNewProduct((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#1565C0]"
                  placeholder="Nhà cung cấp, phiếu nhập..."
                />
              </div>

              {receiveNewError && <p className="text-sm text-[#E53935]">{receiveNewError}</p>}

              <div className="flex gap-2 pt-1 sticky bottom-0 bg-white pb-1">
                <button
                  onClick={() => setReceiveNewOpen(false)}
                  className="flex-1 border border-[#E0E0E0] py-2.5 rounded-lg text-sm hover:bg-gray-50"
                >
                  Huỷ
                </button>
                <button
                  onClick={submitReceiveNew}
                  disabled={receiveNewLoading}
                  className="flex-1 bg-[#2E7D32] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-60"
                >
                  {receiveNewLoading ? "Đang tạo..." : "Tạo & nhập kho"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {receiveOpen && receiveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-[#E0E0E0]">
              <h3 className="font-bold text-[#212121] flex items-center gap-2">
                <Truck size={18} className="text-[#2E7D32]" />
                Nhập kho (bước 2)
              </h3>
              <button onClick={() => setReceiveOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-[#F5F6FA] rounded-lg p-3 text-sm">
                <p className="font-medium text-[#212121]">{receiveTarget.productName}</p>
                <p className="text-[#757575] text-xs mt-0.5">
                  {receiveTarget.variantName} · SKU: {receiveTarget.sku}
                </p>
                <p className="text-xs mt-2 text-[#757575]">
                  Giá nhập hiện tại: <strong>{formatVnd(receiveTarget.costPrice)}</strong>
                </p>
                <p className="text-xs mt-1">
                  Tồn: <strong className={receiveTarget.status.className}>{receiveTarget.stock}</strong>
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Số lượng nhập *</label>
                <input
                  type="number"
                  min={1}
                  value={receiveQty}
                  onChange={(e) => setReceiveQty(e.target.value)}
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]"
                  placeholder="VD: 50"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Giá nhập (đơn vị) *</label>
                <input
                  value={receiveCost}
                  onChange={(e) => setReceiveCost(e.target.value)}
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]"
                  placeholder="VD: 3200000"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Ghi chú (tuỳ chọn)</label>
                <textarea
                  rows={2}
                  value={receiveNotes}
                  onChange={(e) => setReceiveNotes(e.target.value)}
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1565C0] resize-none"
                  placeholder="Nhà cung cấp, phiếu nhập..."
                />
              </div>

              {receiveError && <p className="text-sm text-[#E53935]">{receiveError}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setReceiveOpen(false)}
                  className="flex-1 border border-[#E0E0E0] py-2.5 rounded-lg text-sm hover:bg-gray-50"
                >
                  Huỷ
                </button>
                <button
                  onClick={submitReceive}
                  disabled={receiveLoading}
                  className="flex-1 bg-[#2E7D32] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-60"
                >
                  {receiveLoading ? "Đang nhập..." : "Xác nhận nhập"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {adjustOpen && adjustTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-[#E0E0E0]">
              <h3 className="font-bold text-[#212121]">
                {adjustType === "in" && "Nhập kho"}
                {adjustType === "out" && "Xuất kho"}
                {adjustType === "set" && "Điều chỉnh tồn kho"}
              </h3>
              <button onClick={() => setAdjustOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-[#F5F6FA] rounded-lg p-3 text-sm">
                <p className="font-medium text-[#212121]">{adjustTarget.productName}</p>
                <p className="text-[#757575] text-xs mt-0.5">{adjustTarget.variantName} · SKU: {adjustTarget.sku}</p>
                <p className="text-xs mt-2">
                  Tồn hiện tại: <strong className={adjustTarget.status.className}>{adjustTarget.stock}</strong>
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">
                  {adjustType === "set" ? "Tồn kho mới" : "Số lượng"}
                </label>
                <input
                  type="number"
                  min={0}
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]"
                  placeholder={adjustType === "set" ? "Nhập tồn mới" : "Nhập số lượng"}
                />
              </div>
              {adjustType === "in" && (
        <div>
              <label className="text-xs font-medium text-[#757575] mb-1 block">
              Giá nhập (đơn vị) *
              </label>
               <input
                value={adjustCost}
                onChange={(e) => setAdjustCost(e.target.value)}
                className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]"
                placeholder="VD: 3200000"
                />
              </div>
              )}


              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Ghi chú (tuỳ chọn)</label>
                <textarea
                  rows={2}
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1565C0] resize-none"
                  placeholder="Lý do nhập/xuất kho..."
                />
              </div>

              {adjustError && <p className="text-sm text-[#E53935]">{adjustError}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setAdjustOpen(false)}
                  className="flex-1 border border-[#E0E0E0] py-2.5 rounded-lg text-sm hover:bg-gray-50"
                >
                  Huỷ
                </button>
                <button
                  onClick={submitAdjust}
                  disabled={adjustLoading}
                  className="flex-1 bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                  {adjustLoading ? "Đang lưu..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
