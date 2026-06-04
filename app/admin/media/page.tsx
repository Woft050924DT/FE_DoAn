'use client'

import { useState, useEffect, useCallback } from "react";
import { Upload, Search, Download, Trash2, Eye, Copy, Grid, List, Image, Film, FileText, X, Check } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";
import { adminMediaService, MediaFile } from "@/services/adminService";

const TYPE_FILTERS = [
  { label: "Tất cả", value: "all" },
  { label: "Hình ảnh", value: "image" },
  { label: "Video", value: "video" },
  { label: "Tài liệu", value: "document" },
];

const FOLDERS = ["Tất cả", "Products", "Banners", "Videos", "Documents", "Brands"];

const formatSize = (bytes: number) => {
  if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
  if (bytes >= 1000) return `${(bytes / 1000).toFixed(0)} KB`;
  return `${bytes} B`;
};

const TypeIcon = ({ type }: { type: MediaFile["type"] }) => {
  if (type === "video") return <Film size={16} className="text-purple-500" />;
  if (type === "document") return <FileText size={16} className="text-orange-500" />;
  return <Image size={16} className="text-blue-500" />;
};

export default function AdminMediaPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [folderFilter, setFolderFilter] = useState("Tất cả");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalSizeMB, setTotalSizeMB] = useState(0);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminMediaService.getList({
        search,
        type: typeFilter === "all" ? undefined : typeFilter,
        folder: folderFilter === "Tất cả" ? undefined : folderFilter,
        page,
        limit: 100,
      });
      setFiles(Array.isArray(res.data) ? res.data : []);
      setTotal(res.pagination?.total ?? 0);
      setTotalSizeMB(res.total_size_mb ?? 0);
    } catch (err) {
      console.error("Failed to fetch media:", err);
      setFiles([]);
      setTotal(0);
      setTotalSizeMB(0);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, folderFilter, page]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleDelete = async (fileId: string) => {
    if (!confirm("Bạn có chắc muốn xóa tệp này?")) return;
    try {
      setActionLoading(fileId);
      await adminMediaService.delete(fileId);
      fetchFiles();
    } catch (err) {
      console.error("Delete file failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    if (selected.length === files.length) setSelected([]);
    else setSelected(files.map((f) => f.id));
  };

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Thư viện media"
        subtitle={`${total} tệp • ${totalSizeMB.toFixed(1)} MB`}
        actions={
          <>
            <button className="flex items-center gap-2 border border-[#E0E0E0] bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
              <Download size={14} /> Tải xuống
            </button>
            <button className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              <Upload size={14} /> Tải lên
            </button>
          </>
        }
      />
      <div className="bg-white rounded-xl border border-[#E0E0E0]">
        <div className="px-4 py-3 border-b border-[#E0E0E0] flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm tệp..." className="pl-8 pr-4 py-2 border border-[#E0E0E0] rounded-lg text-sm w-full focus:outline-none focus:border-[#1565C0]" />
          </div>
          <div className="flex gap-1">
            {TYPE_FILTERS.map((f) => (
              <button key={f.value} onClick={() => { setTypeFilter(f.value); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter === f.value ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-100"}`}>{f.label}</button>
            ))}
          </div>
          <div className="flex gap-1">
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-100"}`}><Grid size={14} /></button>
            <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-100"}`}><List size={14} /></button>
          </div>
        </div>

        <div className="px-4 py-2 border-b border-[#E0E0E0] flex gap-2 overflow-x-auto">
          {FOLDERS.map((f) => (
            <button key={f} onClick={() => { setFolderFilter(f); setPage(1); }} className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${folderFilter === f ? "bg-[#2563EB] text-white" : "text-[#757575] hover:bg-gray-100"}`}>{f}</button>
          ))}
        </div>

        {viewMode === "grid" ? (
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {loading ? (
                Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />)
              ) : files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`relative group cursor-pointer rounded-xl border overflow-hidden transition-all ${selected.includes(file.id) ? "border-[#1565C0] ring-2 ring-[#1565C0]/20" : "border-[#E0E0E0] hover:border-[#1565C0]"}`}
                >
                  <div className={`aspect-square flex items-center justify-center bg-gradient-to-br ${file.type === "video" ? "from-purple-100 to-purple-50" : file.type === "document" ? "from-orange-100 to-orange-50" : "from-blue-100 to-blue-50"}`}>
                    {file.type === "image" ? (
                      file.url ? <img src={file.url} alt={file.name} className="w-full h-full object-cover" /> : <Image size={24} className="text-blue-300" />
                    ) : <TypeIcon type={file.type} />}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelect(file.id); }}
                    className={`absolute top-1.5 left-1.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selected.includes(file.id) ? "bg-[#1565C0] border-[#1565C0]" : "bg-white/80 border-[#E0E0E0] opacity-0 group-hover:opacity-100"}`}
                  >
                    {selected.includes(file.id) && <Check size={10} className="text-white" />}
                  </button>
                  <div className="p-2">
                    <p className="text-[11px] font-medium text-[#212121] line-clamp-1">{file.name}</p>
                    <p className="text-[10px] text-[#9E9E9E]">{formatSize(file.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E0E0E0]">
                  <th className="text-left text-xs font-medium text-[#757575] pb-2 pl-2"><input type="checkbox" checked={selected.length === files.length && files.length > 0} onChange={toggleAll} className="accent-[#1565C0]" /></th>
                  <th className="text-left text-xs font-medium text-[#757575] pb-2">Tên tệp</th>
                  <th className="text-left text-xs font-medium text-[#757575] pb-2">Loại</th>
                  <th className="text-left text-xs font-medium text-[#757575] pb-2">Kích thước</th>
                  <th className="text-left text-xs font-medium text-[#757575] pb-2">Ngày tải lên</th>
                  <th className="text-right text-xs font-medium text-[#757575] pb-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="border-b border-[#E0E0E0]/50 hover:bg-gray-50">
                    <td className="py-2 pl-2"><input type="checkbox" checked={selected.includes(file.id)} onChange={() => toggleSelect(file.id)} className="accent-[#1565C0]" /></td>
                    <td className="py-2"><span className="text-xs font-medium text-[#212121]">{file.name}</span></td>
                    <td className="py-2"><span className="text-xs text-[#757575] capitalize">{file.type === "image" ? "Hình ảnh" : file.type === "video" ? "Video" : "Tài liệu"}</span></td>
                    <td className="py-2"><span className="text-xs text-[#757575]">{formatSize(file.size)}</span></td>
                    <td className="py-2"><span className="text-xs text-[#757575]">{file.uploaded_at}</span></td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Eye size={13} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Copy size={13} /></button>
                        <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                        disabled={actionLoading === file.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#E53935] disabled:opacity-50"
                      >
                        {actionLoading === file.id ? "..." : <Trash2 size={13} />}
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedFile(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#E0E0E0]">
              <h3 className="font-semibold text-[#212121]">Chi tiết tệp</h3>
              <button onClick={() => setSelectedFile(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="p-4 space-y-3">
              <div className={`aspect-video rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50 ${selectedFile.type === "video" ? "from-purple-100" : ""} ${selectedFile.type === "document" ? "from-orange-100" : ""}`}>
                {selectedFile.type === "image" ? <Image size={48} className="text-blue-300" /> : <TypeIcon type={selectedFile.type} />}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-[#757575]">Tên:</span><span className="font-medium text-[#212121]">{selectedFile.name}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#757575]">Kích thước:</span><span className="text-[#212121]">{formatSize(selectedFile.size)}</span></div>
                {selectedFile.dimensions && <div className="flex justify-between text-xs"><span className="text-[#757575]">Kích thước ảnh:</span><span className="text-[#212121]">{selectedFile.dimensions}</span></div>}
                <div className="flex justify-between text-xs"><span className="text-[#757575]">Ngày tải lên:</span><span className="text-[#212121]">{selectedFile.uploaded_at}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[#757575]">Thư mục:</span><span className="text-[#212121]">{selectedFile.folder}</span></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 border border-[#E0E0E0] py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center gap-2"><Copy size={13} /> Sao chép URL</button>
                <button className="flex-1 bg-[#2563EB] text-white py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center gap-2"><Download size={13} /> Tải xuống</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
