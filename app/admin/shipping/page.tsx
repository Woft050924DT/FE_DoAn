'use client'

import { useState, useEffect } from "react";
import { Save, Truck, MapPin, Clock, Package, Check, X, RefreshCw } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { adminShippingService, ShippingMethodConfig } from "@/services/adminService";

const ALL_CITIES = ["Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Hải Phòng", "Biên Hòa", "Nha Trang", "Huế", "Quảng Ngãi", "Vinh", "Bình Dương", "Đắk Lắk", "Thanh Hóa", "Hạ Long"];

const formatCurrency = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export default function AdminShippingPage() {
  const [methods, setMethods] = useState<ShippingMethodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchMethods = async () => {
      setLoading(true);
      try {
        const data = await adminShippingService.getShippingMethods();
        setMethods(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch shipping methods:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMethods();
  }, []);

  const toggleMethod = async (id: string) => {
    const method = methods.find(m => m.id === id);
    if (!method) return;
    try {
      await adminShippingService.updateShippingMethod(id, { enabled: !method.enabled });
      setMethods(methods.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(methods.map(m => adminShippingService.updateShippingMethod(m.id, {
        base_price: m.base_price,
        free_threshold: m.free_threshold,
        max_weight: m.max_weight,
        available_cities: m.available_cities,
        enabled: m.enabled,
      })));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const updateMethod = (id: string, field: string, value: any) => {
    setMethods(methods.map((m) => m.id === id ? { ...m, [field]: value } : m));
  };

  return (
    <div className="p-6 space-y-6">
      <UIPageHeader
        title="Cài đặt vận chuyển"
        subtitle="Quản lý phương thức vận chuyển, phí ship và khu vực giao hàng"
        actions={
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${saved ? "bg-green-500 text-white" : "bg-[#2563EB] text-white hover:bg-blue-700"} disabled:opacity-50`}
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Đang lưu..." : saved ? "Đã lưu!" : "Lưu thay đổi"}
          </button>
        }
      />

      {/* Shipping methods */}
      <div className="space-y-4">
        <h3 className="font-semibold text-[#212121] flex items-center gap-2"><Truck size={16} className="text-[#1565C0]" /> Phương thức vận chuyển</h3>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : methods.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-8 text-center text-[#757575]">Chưa có phương thức vận chuyển nào</div>
        ) : methods.map((method) => (
          <div key={method.id} className={`bg-white rounded-xl border ${method.enabled ? "border-[#2563EB]/30" : "border-[#E0E0E0]"} overflow-hidden`}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Truck size={20} className="text-[#1565C0]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-[#212121] text-sm">{method.name}</h4>
                      <span className="bg-blue-100 text-[#1565C0] text-[10px] px-2 py-0.5 rounded-full font-medium">{method.courier}</span>
                      {method.enabled && <span className="bg-green-100 text-[#2E7D32] text-[10px] px-2 py-0.5 rounded-full font-medium">Đang bật</span>}
                    </div>
                    <div className="flex gap-4 text-xs text-[#757575] mb-2">
                      <span className="flex items-center gap-1"><Clock size={11} />{method.eta}</span>
                      <span className="flex items-center gap-1"><Package size={11} />Tối đa {method.max_weight}kg</span>
                      <span className="flex items-center gap-1"><MapPin size={11} />{method.available_cities?.length || 0} thành phố</span>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <span>Phí cơ bản: <strong className="text-[#212121]">{formatCurrency(method.base_price)}</strong></span>
                      <span>Miễn phí từ: <strong className="text-[#212121]">{method.free_threshold > 0 ? formatCurrency(method.free_threshold) : "Không"}</strong></span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setExpanded(expanded === method.id ? null : method.id)}
                    className="text-xs text-[#1565C0] hover:underline"
                  >
                    {expanded === method.id ? "Thu gọn" : "Cấu hình"}
                  </button>
                  <button
                    onClick={() => toggleMethod(method.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${method.enabled ? "bg-[#E53935]/10 text-[#E53935]" : "bg-green-100 text-[#2E7D32]"}`}
                  >
                    {method.enabled ? <><X size={12} />Tắt</> : <><Check size={12} />Bật</>}
                  </button>
                </div>
              </div>

              {expanded === method.id && (
                <div className="mt-4 pt-4 border-t border-[#E0E0E0] grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#757575] mb-1 block">Phí vận chuyển cơ bản (VNĐ)</label>
                    <input
                      type="number"
                      value={method.base_price}
                      onChange={(e) => updateMethod(method.id, "base_price", Number(e.target.value))}
                      className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#757575] mb-1 block">Miễn phí từ (VNĐ)</label>
                    <input
                      type="number"
                      value={method.free_threshold}
                      onChange={(e) => updateMethod(method.id, "free_threshold", Number(e.target.value))}
                      className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#757575] mb-1 block">Trọng lượng tối đa (kg)</label>
                    <input
                      type="number"
                      value={method.max_weight}
                      onChange={(e) => updateMethod(method.id, "max_weight", Number(e.target.value))}
                      className="w-full border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2 text-sm bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs font-medium text-[#757575] mb-2 block">Khu vực giao hàng</label>
                    <div className="flex flex-wrap gap-2">
                      {ALL_CITIES.map((city) => (
                        <label key={city} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${method.available_cities?.includes(city) ? "bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/30" : "bg-gray-50 text-[#757575] border border-[#E0E0E0]"}`}>
                          <input
                            type="checkbox"
                            checked={method.available_cities?.includes(city) || false}
                            onChange={() => {
                              const cities = method.available_cities?.includes(city)
                                ? method.available_cities.filter((c) => c !== city)
                                : [...(method.available_cities || []), city];
                              updateMethod(method.id, "available_cities", cities);
                            }}
                            className="accent-[#1565C0]"
                          />
                          {city}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Shipping rules */}
      <div className="bg-white rounded-xl border border-[#E0E0E0] p-6">
        <h3 className="font-semibold text-[#212121] mb-4">Quy tắc vận chuyển</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Phí giao hàng ngoại thành", value: "15.000đ", desc: "Phụ phí cho khu vực ngoại thành, vùng sâu vùng xa" },
            { label: "Phí giao hàng hải đảo", value: "50.000đ", desc: "Phụ phí cho các huyện đảo và vùng xa" },
            { label: "Giao giờ hành chính", value: "8h - 17h", desc: "Khung giờ giao hàng tiêu chuẩn" },
            { label: "Giữ hàng tối đa", value: "7 ngày", desc: "Thời gian giữ đơn tại kho trước khi hủy" },
          ].map((rule) => (
            <div key={rule.label} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-[#212121]">{rule.label}</p>
                <p className="text-xs text-[#757575] mt-0.5">{rule.desc}</p>
              </div>
              <span className="font-semibold text-[#1565C0] text-sm shrink-0 ml-4">{rule.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
