'use client'

import { useState } from "react";
import { Upload, Search, Download, Trash2, Eye, Copy, Grid, List, Image, Film, FileText, X, Check } from "lucide-react";
import { UIPageHeader } from "@/components/UI/PageHeader";

interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: "image" | "video" | "document";
  size: number;
  dimensions?: string;
  uploadedAt: string;
  folder: string;
}

const MOCK_FILES: MediaFile[] = [
  { id: "1", name: "iphone-15-hero.jpg", url: "", type: "image", size: 2450000, dimensions: "1920x1080", uploadedAt: "20/01/2024", folder: "Products" },
  { id: "2", name: "samsung-s24-banner.jpg", url: "", type: "image", size: 1830000, dimensions: "1200x628", uploadedAt: "19/01/2024", folder: "Banners" },
  { id: "3", name: "macbook-air-m3-review.mp4", url: "", type: "video", size: 45600000, uploadedAt: "18/01/2024", folder: "Videos" },
  { id: "4", name: "headphone-comparison.pdf", url: "", type: "document", size: 890000, uploadedAt: "17/01/2024", folder: "Documents" },
  { id: "5", name: "promotion-summer.jpg", url: "", type: "image", size: 3200000, dimensions: "1920x600", uploadedAt: "16/01/2024", folder: "Banners" },
  { id: "6", name: "airpods-pro-gallery-1.jpg", url: "", type: "image", size: 1560000, dimensions: "800x800", uploadedAt: "15/01/2024", folder: "Products" },
  { id: "7", name: "laptop-buying-guide.pdf", url: "", type: "document", size: 1200000, uploadedAt: "14/01/2024", folder: "Documents" },
  { id: "8", name: "tech-deal-banner.jpg", url: "", type: "image", size: 2100000, dimensions: "1200x628", uploadedAt: "13/01/2024", folder: "Banners" },
  { id: "9", name: "ipad-pro-review.mp4", url: "", type: "video", size: 67800000, uploadedAt: "12/01/2024", folder: "Videos" },
  { id: "10", name: "accessories-catalog.pdf", url: "", type: "document", size: 5400000, uploadedAt: "11/01/2024", folder: "Documents" },
  { id: "11", name: "brand-apple-logo.png", url: "", type: "image", size: 45000, dimensions: "256x256", uploadedAt: "10/01/2024", folder: "Brands" },
  { id: "12", name: "smartwatch-compare.jpg", url: "", type: "image", size: 1890000, dimensions: "1000x1000", uploadedAt: "09/01/2024", folder: "Products" },
];

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

  const filtered = MOCK_FILES.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || f.type === typeFilter;
    const matchFolder = folderFilter === "Tất cả" || f.folder === folderFilter;
    return matchSearch && matchType && matchFolder;
  });

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((f) => f.id));
  };

  return (
    <div className="p-6 space-y-5">
      <UIPageHeader
        title="Thư viện media"
        subtitle={`${MOCK_FILES.length} tệp • ${(MOCK_FILES.reduce((s, f) => s + f.size, 0) / 1000000).toFixed(1)} MB`}
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
        {/* Filters */}
        <div className="px-4 py-3 border-b border-[#E0E0E0] flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tệp..." className="pl-8 pr-4 py-2 border border-[#E0E0E0] rounded-lg text-sm w-full focus:outline-none focus:border-[#1565C0]" />
          </div>
          <div className="flex gap-1">
            {TYPE_FILTERS.map((f) => (
              <button key={f.value} onClick={() => setTypeFilter(f.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter === f.value ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-100"}`}>{f.label}</button>
            ))}
          </div>
          <div className="flex gap-1">
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-100"}`}><Grid size={14} /></button>
            <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-100"}`}><List size={14} /></button>
          </div>
        </div>

        {/* Folder tabs */}
        <div className="px-4 py-2 border-b border-[#E0E0E0] flex gap-2 overflow-x-auto">
          {FOLDERS.map((f) => (
            <button key={f} onClick={() => setFolderFilter(f)} className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${folderFilter === f ? "bg-[#2563EB] text-white" : "text-[#757575] hover:bg-gray-100"}`}>{f}</button>
          ))}
        </div>

        {/* Content */}
        {viewMode === "grid" ? (
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filtered.map((file) => (
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
                  <th className="text-left text-xs font-medium text-[#757575] pb-2 pl-2"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="accent-[#1565C0]" /></th>
                  <th className="text-left text-xs font-medium text-[#757575] pb-2">Tên tệp</th>
                  <th className="text-left text-xs font-medium text-[#757575] pb-2">Loại</th>
                  <th className="text-left text-xs font-medium text-[#757575] pb-2">Kích thước</th>
                  <th className="text-left text-xs font-medium text-[#757575] pb-2">Ngày tải lên</th>
                  <th className="text-right text-xs font-medium text-[#757575] pb-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((file) => (
                  <tr key={file.id} className="border-b border-[#E0E0E0]/50 hover:bg-gray-50">
                    <td className="py-2 pl-2"><input type="checkbox" checked={selected.includes(file.id)} onChange={() => toggleSelect(file.id)} className="accent-[#1565C0]" /></td>
                    <td className="py-2"><span className="text-xs font-medium text-[#212121]">{file.name}</span></td>
                    <td className="py-2"><span className="text-xs text-[#757575] capitalize">{file.type === "image" ? "Hình ảnh" : file.type === "video" ? "Video" : "Tài liệu"}</span></td>
                    <td className="py-2"><span className="text-xs text-[#757575]">{formatSize(file.size)}</span></td>
                    <td className="py-2"><span className="text-xs text-[#757575]">{file.uploadedAt}</span></td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Eye size={13} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#757575]"><Copy size={13} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 text-[#E53935]"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* File detail modal */}
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
                <div className="flex justify-between text-xs"><span className="text-[#757575]">Ngày tải lên:</span><span className="text-[#212121]">{selectedFile.uploadedAt}</span></div>
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
