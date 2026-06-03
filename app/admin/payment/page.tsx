'use client'

import { useState } from "react";
import { Save, CreditCard, Check, ToggleLeft, ToggleRight } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
  fee: string;
  minAmount: number;
  maxAmount: number;
  instructions?: string;
}

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "cod", name: "Thanh toán khi nhận hàng (COD)", icon: "💵", description: "Khách hàng thanh toán trực tiếp khi nhận được hàng", enabled: true, fee: "Miễn phí", minAmount: 0, maxAmount: 50000000 },
  { id: "bank", name: "Chuyển khoản ngân hàng", icon: "🏦", description: "Chuyển khoản trực tiếp vào tài khoản ngân hàng của cửa hàng", enabled: true, fee: "Miễn phí", minAmount: 10000, maxAmount: 500000000, instructions: "STK: 123456789 - Ngân hàng Vietcombank - CTY TNHH VietShop" },
  { id: "momo", name: "Ví MoMo", icon: "🔴", description: "Thanh toán qua ứng dụng MoMo", enabled: true, fee: "1%", minAmount: 10000, maxAmount: 50000000 },
  { id: "vnpay", name: "VNPay QR", icon: "💳", description: "Thanh toán qua mã QR VNPay", enabled: false, fee: "1.5%", minAmount: 10000, maxAmount: 50000000 },
  { id: "paypal", name: "PayPal", icon: "🅿️", description: "Thanh toán quốc tế qua PayPal", enabled: false, fee: "3.5%", minAmount: 100000, maxAmount: 100000000 },
];

const formatCurrency = (n: number) => n > 0 ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n) : "Không giới hạn";

export default function AdminPaymentPage() {
  const [methods, setMethods] = useState(MOCK_PAYMENT_METHODS);
  const [saved, setSaved] = useState(false);

  const toggleMethod = (id: string) => {
    setMethods(methods.map((m) => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#212121]">Cài đặt thanh toán</h1>
          <p className="text-sm text-[#757575] mt-0.5">Quản lý phương thức thanh toán và cấu hình cổng thanh toán</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${saved ? "bg-green-500 text-white" : "bg-[#2563EB] text-white hover:bg-blue-700"}`}
        >
          <Save size={14} /> {saved ? "Đã lưu!" : "Lưu thay đổi"}
        </button>
      </div>

      {/* Payment methods */}
      <div className="space-y-4">
        <h3 className="font-semibold text-[#212121] flex items-center gap-2"><CreditCard size={16} className="text-[#1565C0]" /> Phương thức thanh toán</h3>
        {methods.map((method) => (
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
                    <span>Tối thiểu: <strong className="text-[#212121]">{formatCurrency(method.minAmount)}</strong></span>
                    <span>Tối đa: <strong className="text-[#212121]">{formatCurrency(method.maxAmount)}</strong></span>
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
            { label: "MoMo Partner Code", placeholder: "MOMO_PARTNER_CODE" },
            { label: "MoMo Access Key", placeholder: "MOMO_ACCESS_KEY" },
            { label: "VNPay TmnCode", placeholder: "VNPAY_TMN_CODE" },
            { label: "VNPay Hash Secret", placeholder: "VNPAY_HASH_SECRET" },
            { label: "PayPal Client ID", placeholder: "PayPal Client ID" },
            { label: "PayPal Secret", placeholder: "PayPal Secret" },
          ].map((field) => (
            <div key={field.label}>
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
            <select className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] bg-white">
              <option>15 phút</option>
              <option>30 phút</option>
              <option>1 giờ</option>
              <option>24 giờ</option>
            </select>
            <p className="text-[10px] text-[#9E9E9E] mt-1">Thời gian chờ thanh toán trước khi hủy đơn</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[#757575] mb-1 block">Tự động xác nhận</label>
            <select className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] bg-white">
              <option>Khi thanh toán thành công</option>
              <option>Thủ công</option>
            </select>
            <p className="text-[10px] text-[#9E9E9E] mt-1">Xác nhận đơn hàng khi nhận thanh toán</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[#757575] mb-1 block">Ghi log giao dịch</label>
            <select className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] bg-white">
              <option>Tất cả giao dịch</option>
              <option>Chỉ giao dịch thất bại</option>
              <option>Tắt</option>
            </select>
            <p className="text-[10px] text-[#9E9E9E] mt-1">Ghi lại lịch sử thanh toán</p>
          </div>
        </div>
      </div>
    </div>
  );
}
