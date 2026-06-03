import { ChevronLeft, ChevronRight } from "lucide-react";

type TablePaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  className?: string;
};

function getPageNumbers(current: number, total: number, maxVisible = 5): number[] {
  if (total <= 1) return [1];
  const pages = Math.min(maxVisible, total);
  let start = Math.max(1, current - Math.floor(pages / 2));
  let end = start + pages - 1;
  if (end > total) {
    end = total;
    start = Math.max(1, end - pages + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function UITablePagination({
  page,
  totalPages,
  total,
  limit,
  itemLabel = "mục",
  onPageChange,
  className = "",
}: TablePaginationProps) {
  if (total <= 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pages = getPageNumbers(page, totalPages);

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-[#E0E0E0] bg-white text-sm text-[#757575] ${className}`}
    >
      <span>
        Hiển thị <strong className="text-[#212121]">{from}–{to}</strong> /{" "}
        <strong className="text-[#212121]">{total}</strong> {itemLabel}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E0E0E0] hover:bg-[#F5F6FA] disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Trang trước"
        >
          <ChevronLeft size={16} />
        </button>
        {pages[0] > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="min-w-8 h-8 px-1 rounded-lg hover:bg-[#F5F6FA] text-[#757575]"
            >
              1
            </button>
            {pages[0] > 2 && <span className="px-1 text-[#BDBDBD]">…</span>}
          </>
        )}
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`min-w-8 h-8 px-1 rounded-lg font-medium ${
              p === page ? "bg-[#1565C0] text-white" : "hover:bg-[#F5F6FA] text-[#212121]"
            }`}
          >
            {p}
          </button>
        ))}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="px-1 text-[#BDBDBD]">…</span>
            )}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="min-w-8 h-8 px-1 rounded-lg hover:bg-[#F5F6FA] text-[#757575]"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E0E0E0] hover:bg-[#F5F6FA] disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Trang sau"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
