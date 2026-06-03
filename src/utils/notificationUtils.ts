import { Notification } from "@/services/types";
import { formatDistanceToNow, format, isToday, isYesterday, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

export function formatNotificationTime(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) {
      return `Hôm nay, ${format(date, "HH:mm")}`;
    }
    if (isYesterday(date)) {
      return `Hôm qua, ${format(date, "HH:mm")}`;
    }
    return format(date, "dd/MM/yyyy, HH:mm");
  } catch {
    return dateStr;
  }
}

export function formatNotificationTimeRelative(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return formatDistanceToNow(date, { addSuffix: true, locale: vi });
  } catch {
    return dateStr;
  }
}

export function getNotificationTypeLabel(type: Notification["type"]): string {
  switch (type) {
    case "order":
      return "Đơn hàng";
    case "promotion":
      return "Khuyến mãi";
    case "system":
      return "Hệ thống";
    default:
      return "Thông báo";
  }
}

export function getNotificationTypeColor(type: Notification["type"]): {
  bg: string;
  text: string;
  border: string;
} {
  switch (type) {
    case "order":
      return { bg: "bg-blue-50", text: "text-[#1565C0]", border: "border-l-[#1565C0]" };
    case "promotion":
      return { bg: "bg-red-50", text: "text-[#E53935]", border: "border-l-[#E53935]" };
    case "system":
      return { bg: "bg-gray-50", text: "text-[#757575]", border: "border-l-[#757575]" };
    default:
      return { bg: "bg-gray-50", text: "text-[#757575]", border: "border-l-[#757575]" };
  }
}
