import { MoreVertical } from "lucide-react";
import { useState } from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  idKey: keyof T;
  renderRowActions?: (item: T) => React.ReactNode;
  onRowHover?: (id: string | null) => void;
  emptyMessage?: string;
}

export function TableDataTable<T>({
  data,
  columns,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  idKey,
  renderRowActions,
  onRowHover,
  emptyMessage = "Không tìm thấy dữ liệu",
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[#F5F6FA] border-b border-[#E0E0E0]">
          <tr>
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedIds.length === data.length && data.length > 0}
                onChange={onToggleAll}
                className="w-4 h-4 accent-[#1565C0]"
              />
            </th>
            {columns.map((col) => (
              <th key={col.key} className="text-left px-4 py-3 text-xs font-semibold text-[#757575] whitespace-nowrap">
                {col.header}
              </th>
            ))}
            {renderRowActions && <th className="px-4 py-3 w-24" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F5F6FA]">
          {data.map((item, index) => {
            const id = String((item as any)[idKey]);
            return (
              <tr
                key={id || index}
                className={`hover:bg-[#F5F6FA] transition-colors ${
                  selectedIds.includes(id) ? "bg-blue-50/30" : ""
                }`}
                onMouseEnter={() => onRowHover?.(id)}
                onMouseLeave={() => onRowHover?.(null)}
              >
                <td className="px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(id)}
                    onChange={() => onToggleSelect(id)}
                    className="w-4 h-4 accent-[#1565C0]"
                  />
                </td>
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3.5 ${col.className || ""}`}>
                    {col.render ? col.render(item, index) : String((item as any)[col.key])}
                  </td>
                ))}
                {renderRowActions && (
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end">
                      {renderRowActions(item)}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">📋</p>
          <p className="font-medium text-[#212121]">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
