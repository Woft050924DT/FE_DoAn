interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  pending: { label: "Chờ xử lý", classes: "bg-amber-100 text-amber-700" },
  processing: { label: "Đang xử lý", classes: "bg-blue-100 text-blue-700" },
  shipped: { label: "Đang giao", classes: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "Đã giao", classes: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy", classes: "bg-red-100 text-red-700" },
  active: { label: "Đang bán", classes: "bg-green-100 text-green-700" },
  draft: { label: "Nháp", classes: "bg-gray-100 text-gray-600" },
  out_of_stock: { label: "Hết hàng", classes: "bg-red-100 text-red-700" },
  open: { label: "Đang mở", classes: "bg-blue-100 text-blue-700" },
  waiting: { label: "Chờ", classes: "bg-amber-100 text-amber-700" },
  bot: { label: "Bot", classes: "bg-purple-100 text-purple-700" },
  closed: { label: "Đã đóng", classes: "bg-gray-100 text-gray-600" },
};

export function OrderStatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { label: status, classes: "bg-gray-100 text-gray-600" };
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.classes} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      {config.label}
    </span>
  );
}
