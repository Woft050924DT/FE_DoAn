'use client'

import { useState } from "react";
import { Save, Building2, MapPin, Phone, Mail, Globe, FileText, Bell, Shield } from "lucide-react";

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    storeName: "VietShop",
    storeEmail: "contact@vietshop.com",
    storePhone: "1900-1234",
    storeAddress: "123 Nguyễn Trãi, Quận 1, TP.HCM",
    storeTaxId: "0123456789",
    storeDescription: "Cửa hàng công nghệ hàng đầu Việt Nam với các sản phẩm chính hãng 100%.",
    currency: "VND",
    timezone: "Asia/Ho_Chi_Minh",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    enableReviews: true,
    enableCoupons: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#212121]">Cài đặt chung</h1>
          <p className="text-sm text-[#757575] mt-0.5">Quản lý thông tin cửa hàng và cấu hình hệ thống</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${saved ? "bg-green-500 text-white" : "bg-[#2563EB] text-white hover:bg-blue-700"}`}
        >
          <Save size={14} /> {saved ? "Đã lưu!" : "Lưu thay đổi"}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Main settings */}
        <div className="xl:col-span-2 space-y-5">
          {/* Store Info */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
            <h3 className="font-semibold text-[#212121] mb-4 flex items-center gap-2"><Building2 size={16} className="text-[#1565C0]" /> Thông tin cửa hàng</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Tên cửa hàng *</label>
                <input value={formData.storeName} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Email liên hệ</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={formData.storeEmail} onChange={(e) => setFormData({ ...formData, storeEmail: e.target.value })} className="w-full border border-[#E0E0E0] rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Số điện thoại</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={formData.storePhone} onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })} className="w-full border border-[#E0E0E0] rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Địa chỉ cửa hàng</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={formData.storeAddress} onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })} className="w-full border border-[#E0E0E0] rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Mã số thuế</label>
                <input value={formData.storeTaxId} onChange={(e) => setFormData({ ...formData, storeTaxId: e.target.value })} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0]" />
              </div>
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Mô tả cửa hàng</label>
                <textarea value={formData.storeDescription} onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })} rows={3} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] resize-none" />
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
            <h3 className="font-semibold text-[#212121] mb-4 flex items-center gap-2"><Globe size={16} className="text-[#1565C0]" /> Khu vực & Ngôn ngữ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Đơn vị tiền tệ</label>
                <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] bg-white">
                  <option value="VND">VND - Đồng Việt Nam</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#757575] mb-1 block">Múi giờ</label>
                <select value={formData.timezone} onChange={(e) => setFormData({ ...formData, timezone: e.target.value })} className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1565C0] bg-white">
                  <option value="Asia/Ho_Chi_Minh">GMT+7 - Hồ Chí Minh</option>
                  <option value="Asia/Hanoi">GMT+7 - Hà Nội</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
            <h3 className="font-semibold text-[#212121] mb-4 flex items-center gap-2"><Shield size={16} className="text-[#1565C0]" /> Bảo trì & Tính năng</h3>
            <div className="space-y-4">
              {[
                { key: "maintenanceMode", label: "Chế độ bảo trì", desc: "Tắt website, chỉ admin truy cập được" },
                { key: "allowRegistration", label: "Cho phép đăng ký", desc: "Người mới có thể tạo tài khoản" },
                { key: "requireEmailVerification", label: "Yêu cầu xác thực email", desc: "Tài khoản cần xác thực email trước khi sử dụng" },
                { key: "enableReviews", label: "Cho phép đánh giá", desc: "Khách hàng có thể đánh giá sản phẩm" },
                { key: "enableCoupons", label: "Cho phép mã giảm giá", desc: "Kích hoạt hệ thống mã khuyến mãi" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2 border-b border-[#E0E0E0] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#212121]">{item.label}</p>
                    <p className="text-xs text-[#757575]">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, [item.key]: !formData[item.key as keyof typeof formData] })}
                    className={`w-11 h-6 rounded-full transition-colors relative ${(formData as any)[item.key] ? "bg-[#2563EB]" : "bg-gray-300"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(formData as any)[item.key] ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
            <h3 className="font-semibold text-[#212121] mb-4">Trạng thái hệ thống</h3>
            <div className="space-y-3">
              {[
                { label: "Trạng thái", value: formData.maintenanceMode ? "Bảo trì" : "Hoạt động", cls: formData.maintenanceMode ? "bg-amber-100 text-[#E65100]" : "bg-green-100 text-[#2E7D32]" },
                { label: "Phiên bản", value: "1.0.0", cls: "bg-blue-100 text-[#1565C0]" },
                { label: "Ngày cập nhật", value: new Date().toLocaleDateString("vi-VN"), cls: "bg-gray-100 text-[#757575]" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-[#757575]">{item.label}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.cls}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
            <h3 className="font-semibold text-[#212121] mb-4">Thông tin nhanh</h3>
            <div className="space-y-3 text-xs text-[#757575]">
              <p>VietShop đang hoạt động ổn định với phiên bản 1.0.0.</p>
              <p>Đăng ký tài khoản mới: <span className="font-medium text-[#212121]">{formData.allowRegistration ? "Bật" : "Tắt"}</span></p>
              <p>Xác thực email: <span className="font-medium text-[#212121]">{formData.requireEmailVerification ? "Bật" : "Tắt"}</span></p>
              <p>Đánh giá sản phẩm: <span className="font-medium text-[#212121]">{formData.enableReviews ? "Bật" : "Tắt"}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
