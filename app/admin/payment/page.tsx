'use client'

import { useState, useEffect } from "react";
import { Save, CreditCard, Check, RefreshCw, Download, Search } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { adminPaymentService, PaymentMethodConfig, adminPaymentsService, PaymentRecord } from "@/services/adminService";

const formatCurrency = (n: number) => n > 0 ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n) : "Không giới hạn";

type Tab = "methods" | "transactions";

const PAYMENT_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: "Chờ thanh toán", cls: "bg-amber-100 text-amber-700" },
  completed: { label: "Hoàn thành", cls: "bg-green-100 text-green-700" },
  failed: { label: "Thất bại", cls: "bg-red-100 text-red-700" },
  refunded: { label: "Đã hoàn", cls: "bg-purple-100 text-purple-700" },
};

export default function AdminPaymentPage() {
  const [tab, setTab] = useState<Tab>("methods");
  const [methods, setMethods] = useState<PaymentMethodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Transactions state
  const [transactions, setTransactions] = useState<PaymentRecord[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txTotal, setTxTotal] = useState(0);
  const [txPage, setTxPage] = useState(1);
  const [txSearch, setTxSearch] = useState("");
  const [txStatus, setTxStatus] = useState("all");
  const [refundModal, setRefundModal] = useState<PaymentRecord | null>(null);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refunding, setRefunding] = useState(false);

  // Payment config
  const [config, setConfig] = useState({
    payment_timeout: "30",
    auto_confirm: "on_payment_success",
    log_level: "all",
  });

  useEffect(() => {
    const fetchMethods = async () => {
      setLoading(true);
      try {
        const data = await adminPaymentService.getPaymentMethods();
        setMethods(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch payment methods:", err);
        setMethods([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMethods();
  }, []);

  useEffect(() => {
    if (tab === "transactions") {
      fetchTransactions();
    }
  }, [tab, txPage, txSearch, txStatus]);

  const fetchTransactions = async () => {
    setTxLoading(true);
    try {
      const params: any = { page: txPage, limit: 20 };
      if (txSearch) params.search = txSearch;
      if (txStatus !== "all") params.payment_status = txStatus;
      const res = await adminPaymentsService.getList(params);
      setTransactions(Array.isArray(res.data) ? res.data : []);
      setTxTotal(res.pagination?.total ?? 0);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setTransactions([]);
      setTxTotal(0);
    } finally {
      setTxLoading(false);
    }
  };

  const toggleMethod = (id: string) => {
    setMethods(methods.map((m) => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const handleSaveMethods = async () => {
    setSaving(true);
    try {
      await Promise.all(methods.map(m => adminPaymentService.updatePaymentMethod(m.id, { enabled: m.enabled })));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await adminPaymentService.updatePaymentSettings(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Save config failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRefund = async () => {
    if (!refundModal) return;
    setRefunding(true);
    try {
      await adminPaymentsService.refund(refundModal.payment_id, refundAmount > 0 ? refundAmount : undefined);
      setRefundModal(null);
      fetchTransactions();
    } catch (err) {
      console.error("Refund failed:", err);
    } finally {
      setRefunding(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <UIPageHeader
        title="Cài đặt thanh toán"
        subtitle="Quản lý phương thức thanh toán và cấu hình cổng thanh toán"
        actions={
          <>
            <button
              onClick={tab === "methods" ? handleSaveMethods : handleSaveConfig}
              disabled={saving}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${saved ? "bg-green-500 text-white" : "bg-[#2563EB] text-white hover:bg-blue-700"} disabled:opacity-50`}
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Đang lưu..." : saved ? "Đã lưu!" : "Lưu thay đổi"}
            </button>
          </>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E0E0E0]">
        {(["methods", "transactions"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 text-sm font-medium transition-colors ${tab === t ? "text-[#1565C0] border-b-2 border-[#1565C0] -mb-px" : "text-[#757575] hover:text-[#212121]"}`}>
            {t === "methods" ? "Phương thức" : "Lịch sử giao dịch"}
          </button>
        ))}
      </div>

      {tab === "methods" ? (
        <>
          {/* Payment methods */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#212121] flex items-center gap-2"><CreditCard size={16} className="text-[#1565C0]" /> Phương thức thanh toán</h3>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : methods.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E0E0E0] p-8 text-center text-[#757575]">Chưa có phương thức thanh toán nào</div>
            ) : methods.map((method) => (
              <div key={method.id} className={`bg-white rounded-xl border ${method.enabled ? "border-[#2563EB]/30" : "border-[#E0E0E0]"} p-5`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl shrink-0">{method.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-[#212121] text-sm">{method.name}</h4>
                        {method.enabled && <span className="bg-green-100 text-[#2E7D32] text-[10px] px-2 py-0.5 rounded-full font-medium">Đang bật</span>}
                      </div>
                      <p className="text-xs text-[#757575] mb-2">{method.description}</p>
                      <div className="flex gap-4 text-xs text-[#757575]">
                        <span>Phí: <strong className="text-[#212121]">{method.fee}</strong></span>
                        <span>Tối thiểu: <strong className="text-[#212121]">{formatCurrency(method.min_amount)}</strong></span>
                        <span>Tối đa: <strong className="text-[#212121]">{formatCurrency(method.max_amount)}</strong></span>
                      </div>
                      {method.instructions && method.enabled && (
                        <div className="mt-2 bg-blue-50 rounded-lg p-2">
                          <p className="text-[11px] text-[#1565C0]">📋 Thông tin tài khoản: {method.instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleMethod(method.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${method.enabled ? "bg-[#2E7D32]/10 text-[#2E7D32]" : "bg-gray-100 text-[#757575]"}`}
                  >
                    {method.enabled ? <Check size={13} /> : null}
                    {method.enabled ? "Bật" : "Tắt"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Payment gateway config */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
            <h3 className="font-semibold text-[#212121] mb-4">Cấu hình cổng thanh toán</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "MoMo Partner Code", placeholder: "MOMO_PARTNER_CODE", key: "momo_partner_code" },
                { label: "MoMo Access Key", placeholder: "MOMO_ACCESS_KEY", key: "momo_access_key" },
                { label: "VNPay TmnCode", placeholder: "VNPAY_TMN_CODE", key: "vnpay_tmn_code" },
                { label: "VNPay Hash Secret", placeholder: "VNPAY_HASH_SECRET", key: "vnpay_hash_secret" },
                { label: "PayPal Client ID", placeholder: "PayPal Client ID", key: "paypal_client_id" },
                { label: "PayPal Secret", placeholder: "PayPal Secret", key: "paypal_secret" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">{field.label}</label>
                  <input type="password" placeholder={field.placeholder} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
                </div>
              ))}
            </div>
          </div>

          {/* Transaction settings */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
            <h3 className="font-semibold text-[#212121] mb-4">Cài đặt giao dịch</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Thời gian thanh toán</label>
                <select
                  value={config.payment_timeout}
                  onChange={(e) => setConfig({ ...config, payment_timeout: e.target.value })}
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] bg-white"
                >
                  <option value="15">15 phút</option>
                  <option value="30">30 phút</option>
                  <option value="60">1 giờ</option>
                  <option value="1440">24 giờ</option>
                </select>
                <p className="text-[10px] text-[#9E9E9E] mt-1">Thời gian chờ thanh toán trước khi hủy đơn</p>
              </div>
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Tự động xác nhận</label>
                <select
                  value={config.auto_confirm}
                  onChange={(e) => setConfig({ ...config, auto_confirm: e.target.value })}
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] bg-white"
                >
                  <option value="on_payment_success">Khi thanh toán thành công</option>
                  <option value="manual">Thủ công</option>
                </select>
                <p className="text-[10px] text-[#9E9E9E] mt-1">Xác nhận đơn hàng khi nhận thanh toán</p>
              </div>
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Ghi log giao dịch</label>
                <select
                  value={config.log_level}
                  onChange={(e) => setConfig({ ...config, log_level: e.target.value })}
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] bg-white"
                >
                  <option value="all">Tất cả giao dịch</option>
                  <option value="failed_only">Chỉ giao dịch thất bại</option>
                  <option value="none">Tắt</option>
                </select>
                <p className="text-[10px] text-[#9E9E9E] mt-1">Ghi lại lịch sử thanh toán</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Transactions Tab */
        <>
          {/* Filter bar */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={txSearch} onChange={(e) => { setTxSearch(e.target.value); setTxPage(1); }} placeholder="Tìm mã giao dịch, khách hàng..." className="pl-8 pr-4 py-2 border border-[#E0E0E0] rounded-lg text-sm w-full focus:outline-none focus:border-[#1565C0]" />
            </div>
            <div className="flex gap-1">
              {["all", "pending", "completed", "failed", "refunded"].map((s) => (
                <button key={s} onClick={() => { setTxStatus(s); setTxPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${txStatus === s ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-100"}`}>
                  {s === "all" ? "Tất cả" : PAYMENT_STATUS_MAP[s]?.label || s}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions table */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F6FA]">
                  <tr>
                    {["Mã GD", "Đơn hàng", "Khách hàng", "Phương thức", "Số tiền", "Trạng thái", "Ngày", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#757575] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F6FA]">
                  {txLoading ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-[#757575]">Đang tải...</td></tr>
                  ) : transactions.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-[#757575]">Không có giao dịch nào</td></tr>
                  ) : transactions.map((tx) => {
                    const s = PAYMENT_STATUS_MAP[tx.status] || { label: tx.status, cls: "bg-gray-100 text-gray-700" };
                    return (
                      <tr key={tx.payment_id} className="hover:bg-[#F5F6FA]">
                        <td className="px-4 py-3 text-xs font-mono font-medium text-[#1565C0]">{tx.transaction_id || tx.payment_id.slice(0, 8)}</td>
                        <td className="px-4 py-3 text-xs font-medium text-[#212121]">{tx.order_number || tx.order_id?.slice(0, 8)}</td>
                        <td className="px-4 py-3 text-xs">
                          <p className="font-medium text-[#212121]">{tx.customer_name}</p>
                          <p className="text-[#757575] text-[11px]">{tx.customer_email}</p>
                        </td>
                        <td className="px-4 py-3 text-xs capitalize text-[#757575]">{tx.payment_method}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-[#212121] whitespace-nowrap">{formatCurrency(tx.amount)}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${s.cls}`}>{s.label}</span></td>
                        <td className="px-4 py-3 text-xs text-[#757575] whitespace-nowrap">{new Date(tx.created_at).toLocaleDateString("vi-VN")}</td>
                        <td className="px-4 py-3">
                          {tx.status === "completed" && (
                            <button
                              onClick={() => { setRefundModal(tx); setRefundAmount(tx.amount); }}
                              className="text-xs text-[#E53935] hover:underline"
                            >
                              Hoàn tiền
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-[#E0E0E0] flex items-center justify-between text-sm text-[#757575]">
              <span>Hiển thị {transactions.length}/{txTotal} giao dịch</span>
              <div className="flex gap-1">
                <button onClick={() => setTxPage(p => Math.max(1, p - 1))} disabled={txPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-50">←</button>
                <button onClick={() => setTxPage(p => p + 1)} disabled={transactions.length < 20} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-50">→</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Refund Modal */}
      {refundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-bold text-[#212121] mb-1">Hoàn tiền giao dịch</h3>
            <p className="text-sm text-[#757575] mb-4">Hoàn tiền cho đơn hàng {refundModal.order_number}</p>
            <div className="bg-[#F5F6FA] rounded-xl p-4 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#757575]">Số tiền gốc:</span>
                <span className="font-semibold text-[#212121]">{formatCurrency(refundModal.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#757575]">Đã hoàn:</span>
                <span className="font-semibold text-[#757575]">{formatCurrency(refundModal.refund_amount)}</span>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium text-[#757575] mb-1 block">Số tiền hoàn (để trống = toàn bộ)</label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                max={refundModal.amount - refundModal.refund_amount}
                className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]"
              />
              <p className="text-[11px] text-[#9E9E9E] mt-1">Tối đa: {formatCurrency(refundModal.amount - refundModal.refund_amount)}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRefundModal(null)} className="flex-1 border border-[#E0E0E0] py-2.5 rounded-lg text-sm hover:bg-gray-50">Hủy</button>
              <button
                onClick={handleRefund}
                disabled={refunding}
                className="flex-1 bg-[#E53935] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {refunding ? "Đang xử lý..." : "Hoàn tiền"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
