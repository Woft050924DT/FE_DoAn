import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Mail, Lock, Eye, EyeOff, User, Phone, Watch, ArrowRight } from "lucide-react";
import { authService } from "../../services/authService";
import { useApp } from "../../contexts/AppContext";

export function ScreensRegister() {
  const navigate = useNavigate();
  const { refreshAuth } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || undefined,
      });
      await refreshAuth();
      navigate("/account", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F6FA] to-[#E8EAF6] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1565C0] rounded-2xl mb-4 shadow-lg">
            <Watch size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#212121]">Tạo tài khoản</h1>
          <p className="text-sm text-[#757575] mt-1">Đăng ký để mua sắm đồng hồ tại VietWatch</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-xl overflow-hidden">
          <div className="p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">Họ và tên *</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-xl text-sm focus:outline-none focus:border-[#1565C0]"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">Email *</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-xl text-sm focus:outline-none focus:border-[#1565C0]"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">Số điện thoại</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-xl text-sm focus:outline-none focus:border-[#1565C0]"
                    placeholder="0901234567"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">Mật khẩu *</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-[#E0E0E0] rounded-xl text-sm focus:outline-none focus:border-[#1565C0]"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757575]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">Xác nhận mật khẩu *</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-xl text-sm focus:outline-none focus:border-[#1565C0]"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1565C0] text-white py-3 rounded-xl font-semibold hover:bg-[#0D47A1] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? "Đang đăng ký..." : "Đăng ký"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          </div>
          <div className="px-8 py-4 bg-[#F5F6FA] border-t border-[#E0E0E0] text-center">
            <p className="text-sm text-[#757575]">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-[#1565C0] font-semibold hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
