import { useEffect, useState } from "react";
import { FolderOpen, X, Image as ImageIcon } from "lucide-react";
import { mediaService } from '../../services/mediaService';

type ImagePickerProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
};

export function ImagePicker({ label, value, onChange, placeholder }: ImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<{ filename: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadFiles = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await mediaService.listFiles();
      setFiles(list);
      if (list.length === 0) {
        setError("Thư mục uploads trống. Hãy thêm ảnh vào BE_DoAn/uploads/");
      }
    } catch (err: any) {
      const status = err.response?.status;
      const apiMsg = err.response?.data?.error;
      if (status === 404) {
        setError("API thư viện ảnh chưa có. Hãy khởi động lại backend (npm run dev trong BE_DoAn).");
      } else if (status === 403) {
        setError("Tài khoản không có quyền admin. Đăng nhập: admin@shopai.com / admin123");
      } else if (status === 401) {
        setError("Phiên đăng nhập hết hạn. Đăng xuất và đăng nhập lại bằng tài khoản admin.");
      } else {
        setError(apiMsg || "Không tải được thư viện ảnh. Kiểm tra backend đang chạy port 3000.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadFiles();
  }, [open]);

  return (
    <div>
      <label className="block text-sm font-medium text-[#212121] mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border border-[#E0E0E0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]"
          placeholder={placeholder || "URL ảnh hoặc chọn từ thư mục"}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm text-[#1565C0] hover:bg-[#E3F2FD]"
        >
          <FolderOpen size={16} />
          Chọn ảnh
        </button>
      </div>
      {value && (
        <img
          src={mediaService.resolveUrl(value)}
          alt=""
          className="mt-2 h-20 w-20 object-cover rounded-lg border border-[#E0E0E0]"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0E0E0]">
              <h3 className="font-semibold text-[#212121] flex items-center gap-2">
                <ImageIcon size={18} />
                Thư viện ảnh (uploads/)
              </h3>
              <button type="button" onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {loading && <p className="text-center text-[#757575] py-8">Đang tải...</p>}
              {error && !loading && (
                <p className="text-center text-amber-700 bg-amber-50 p-4 rounded-lg text-sm">{error}</p>
              )}
              {!loading && !error && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {files.map((file) => (
                    <button
                      key={file.filename}
                      type="button"
                      onClick={() => {
                        onChange(file.url);
                        setOpen(false);
                      }}
                      className={`rounded-lg border overflow-hidden hover:ring-2 hover:ring-[#2563EB] ${
                        value === file.url ? "ring-2 ring-[#2563EB]" : "border-[#E0E0E0]"
                      }`}
                    >
                      <img src={file.url} alt={file.filename} className="w-full aspect-square object-cover" />
                      <p className="text-[10px] text-[#757575] truncate px-1 py-1">{file.filename}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
