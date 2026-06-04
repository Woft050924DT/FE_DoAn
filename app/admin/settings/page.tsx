'use client'

import { useState, useEffect } from "react";
import { Save, Building2, MapPin, Phone, Mail, Globe, FileText, Bell, Shield, RefreshCw } from "lucide-react";
import { adminSettingsService } from "@/services/adminService";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
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

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await adminSettingsService.getList("general");
        const data = Array.isArray(res?.data) ? res.data : [];
        const settingMap: Record<string, string> = {};
        for (const s of data) {
          settingMap[s.key] = s.value;
        }
        setSettings(settingMap);
        setFormData(prev => ({
          ...prev,
          storeName: settingMap["store_name"] || prev.storeName,
          storeEmail: settingMap["store_email"] || prev.storeEmail,
          storePhone: settingMap["store_phone"] || prev.storePhone,
          storeAddress: settingMap["store_address"] || prev.storeAddress,
          storeTaxId: settingMap["store_tax_id"] || prev.storeTaxId,
          storeDescription: settingMap["store_description"] || prev.storeDescription,
          maintenanceMode: settingMap["maintenance_mode"] === "true",
          allowRegistration: settingMap["allow_registration"] !== "false",
          requireEmailVerification: settingMap["require_email_verification"] !== "false",
          enableReviews: settingMap["enable_reviews"] !== "false",
          enableCoupons: settingMap["enable_coupons"] !== "false",
        }));
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const promises = [
        adminSettingsService.upsert({ category: "general", key: "store_name", value: formData.storeName, data_type: "string", description: "Tên cửa hàng", is_public: true }),
        adminSettingsService.upsert({ category: "general", key: "store_email", value: formData.storeEmail, data_type: "string", description: "Email liên hệ", is_public: true }),
        adminSettingsService.upsert({ category: "general", key: "store_phone", value: formData.storePhone, data_type: "string", description: "Số điện thoại", is_public: true }),
        adminSettingsService.upsert({ category: "general", key: "store_address", value: formData.storeAddress, data_type: "string", description: "Địa chỉ cửa hàng", is_public: true }),
        adminSettingsService.upsert({ category: "general", key: "store_tax_id", value: formData.storeTaxId, data_type: "string", description: "Mã số thuế", is_public: false }),
        adminSettingsService.upsert({ category: "general", key: "store_description", value: formData.storeDescription, data_type: "string", description: "Mô tả cửa hàng", is_public: true }),
        adminSettingsService.upsert({ category: "general", key: "currency", value: formData.currency, data_type: "string", description: "Đơn vị tiền tệ", is_public: true }),
        adminSettingsService.upsert({ category: "general", key: "timezone", value: formData.timezone, data_type: "string", description: "Múi giờ", is_public: false }),
        adminSettingsService.upsert({ category: "general", key: "maintenance_mode", value: String(formData.maintenanceMode), data_type: "boolean", description: "Chế độ bảo trì", is_public: false }),
        adminSettingsService.upsert({ category: "general", key: "allow_registration", value: String(formData.allowRegistration), data_type: "boolean", description: "Cho phép đăng ký", is_public: false }),
        adminSettingsService.upsert({ category: "general", key: "require_email_verification", value: String(formData.requireEmailVerification), data_type: "boolean", description: "Yêu cầu xác thực email", is_public: false }),
        adminSettingsService.upsert({ category: "general", key: "enable_reviews", value: String(formData.enableReviews), data_type: "boolean", description: "Cho phép đánh giá", is_public: false }),
        adminSettingsService.upsert({ category: "general", key: "enable_coupons", value: String(formData.enableCoupons), data_type: "boolean", description: "Cho phép mã giảm giá", is_public: false }),
      ];
      await Promise.all(promises);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Save settings failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors relative ${checked ? "bg-[#2563EB]" : "bg-gray-300"}`}
      aria-label={label}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#212121]">Cài đặt chung</h1>
          <p className="text-sm text-[#757575] mt-0.5">Quản lý thông tin cửa hàng và cấu hình hệ thống</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${saved ? "bg-green-500 text-white" : "bg-[#2563EB] text-white hover:bg-blue-700"} disabled:opacity-50`}
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Đang lưu..." : saved ? "Đã lưu!" : "Lưu thay đổi"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1565C0] mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Main settings */}
          <div className="xl:col-span-2 space-y-5">
            {/* Store Info */}
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
              <h3 className="font-semibold text-[#212121] mb-4 flex items-center gap-2"><Building2 size={16} className="text-[#1565C0]" /> Thông tin cửa hàng</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Tên cửa hàng *</label>
                  <input value={formData.storeName} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#757575] mb-1 block">Email liên hệ</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={formData.storeEmail} onChange={(e) => setFormData({ ...formData, storeEmail: e.target.value })} className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#757575] mb-1 block">Số điện thoại</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={formData.storePhone} onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })} className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Địa chỉ cửa hàng</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={formData.storeAddress} onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })} className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Mã số thuế</label>
                  <input value={formData.storeTaxId} onChange={(e) => setFormData({ ...formData, storeTaxId: e.target.value })} className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Mô tả cửa hàng</label>
                  <textarea value={formData.storeDescription} onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })} rows={3} className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA] resize-none" />
                </div>
              </div>
            </div>

            {/* Regional Settings */}
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
              <h3 className="font-semibold text-[#212121] mb-4 flex items-center gap-2"><Globe size={16} className="text-[#1565C0]" /> Khu vực & Ngôn ngữ</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Đơn vị tiền tệ</label>
                  <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]">
                    <option value="VND">VND - Đồng Việt Nam</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#757575] mb-1 block">Múi giờ</label>
                  <select value={formData.timezone} onChange={(e) => setFormData({ ...formData, timezone: e.target.value })} className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]">
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
                    <Toggle
                      checked={(formData as any)[item.key]}
                      onChange={() => setFormData((prev: any) => ({ ...prev, [item.key]: !prev[item.key] }))}
                      label={item.label}
                    />
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
                <p>Mã giảm giá: <span className="font-medium text-[#212121]">{formData.enableCoupons ? "Bật" : "Tắt"}</span></p>
                <p>Chế độ bảo trì: <span className="font-medium text-[#212121]">{formData.maintenanceMode ? "Bật ⚠️" : "Tắt"}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
