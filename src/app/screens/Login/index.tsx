import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Watch } from "lucide-react";
import { authService } from "../../services/authService";
import { useApp } from "../../contexts/AppContext";
import { useLocation, Link } from "react-router";
import { isAdminUser } from "../../utils/roles";

export function ScreensLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshAuth } = useApp();
  const from = (location.state as { from?: string })?.from || "/account";
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authService.login({
        email: formData.email,
        password: formData.password,
      });
      await refreshAuth();
      if (isAdminUser(result.user)) {
        navigate(from.startsWith("/admin") ? from : "/admin", { replace: true });
      } else {
        navigate(from.startsWith("/admin") ? "/account" : from, { replace: true });
      }
    } catch (err) {
      setError("Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F6FA] to-[#E8EAF6] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1565C0] rounded-2xl mb-4 shadow-lg">
            <Watch size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#212121]">Chào mừng trở lại!</h1>
          <p className="text-sm text-[#757575] mt-1">Đăng nhập để tiếp tục mua sắm đồng hồ</p>
        </div>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-[#1565C0] text-left space-y-1">
          <p className="font-semibold text-[#212121]">Tài khoản demo</p>
          <p>Admin: <strong>admin@shopai.com</strong> / <strong>admin123</strong></p>
          <p>Khách hàng: <strong>customer@shopai.com</strong> / <strong>customer123</strong></p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-xl overflow-hidden">
          <div className="p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]"
                  />
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1565C0] focus:border-transparent transition-all text-sm"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1565C0] focus:border-transparent transition-all text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757575] hover:text-[#1565C0] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="w-4 h-4 rounded border-[#E0E0E0] text-[#1565C0] focus:ring-[#1565C0]"
                  />
                  <span className="text-sm text-[#757575]">Ghi nhớ đăng nhập</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-[#1565C0] hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E53935] hover:bg-[#C62828] text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-[#E0E0E0]" />
              <span className="text-xs text-[#757575]">hoặc</span>
              <div className="flex-1 h-px bg-[#E0E0E0]" />
            </div>

            {/* Social Login */}
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-3 py-3 border border-[#E0E0E0] rounded-xl hover:bg-[#F5F6FA] transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-[#212121]">Đăng nhập với Google</span>
              </button>
              <button className="w-full flex items-center justify-center gap-3 py-3 border border-[#E0E0E0] rounded-xl hover:bg-[#F5F6FA] transition-colors">
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium text-[#212121]">Đăng nhập với Facebook</span>
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="px-8 py-4 bg-[#F5F6FA] border-t border-[#E0E0E0] text-center">
            <p className="text-sm text-[#757575]">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-[#1565C0] font-semibold hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-[#757575] hover:text-[#1565C0] transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowRight size={14} className="rotate-180" />
            Quay lại trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
