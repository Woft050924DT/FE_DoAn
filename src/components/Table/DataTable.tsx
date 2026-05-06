import { MoreVertical } from "lucide-react";

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
  emptyMessage = "Không tìm thấy dữ liệu",
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
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
              {renderRowActions && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F6FA]">
            {data.map((item, index) => (
              <tr
                key={String((item as any)[idKey]) || index}
                className={`hover:bg-[#F5F6FA] transition-colors ${
                  selectedIds.includes(String((item as any)[idKey])) ? "bg-blue-50/30" : ""
                }`}
              >
                <td className="px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(String((item as any)[idKey]))}
                    onChange={() => onToggleSelect(String((item as any)[idKey]))}
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
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical size={15} className="text-[#757575]" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">📋</p>
          <p className="font-medium text-[#212121]">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
