"use client";

import { useRouter } from "next/navigation";
import { useNotifications } from "@/contexts/NotificationContext";
import { Notification } from "@/services/types";
import {
  Bell,
  ShoppingCart,
  Tag,
  AlertCircle,
  CheckCheck,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/components/UI/ui/utils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return formatDistanceToNow(date, { addSuffix: true, locale: vi });
  } catch {
    return dateStr;
  }
}

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "order":
      return <ShoppingCart size={16} className="text-[#1565C0]" />;
    case "promotion":
      return <Tag size={16} className="text-[#E53935]" />;
    case "system":
    default:
      return <AlertCircle size={16} className="text-[#757575]" />;
  }
}

function getNotificationBg(type: Notification["type"]): string {
  switch (type) {
    case "order":
      return "bg-blue-50";
    case "promotion":
      return "bg-red-50";
    case "system":
    default:
      return "bg-gray-50";
  }
}

interface NotificationDropdownProps {
  onClose?: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleItemClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await markAsRead(notif.notification_id);
    }
    if (onClose) onClose();
    if (notif.action_url) {
      router.push(notif.action_url);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Dropdown panel */}
      <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-[#E0E0E0] z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F0F0]">
          <h3 className="font-semibold text-[#212121] text-base">
            Thông báo
            {unreadCount > 0 && (
              <span className="ml-2 text-xs bg-[#E53935] text-white rounded-full px-2 py-0.5 font-medium">
                {unreadCount} mới
              </span>
            )}
          </h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-[#1565C0] hover:text-[#0D47A1] px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                title="Đánh dấu tất cả đã đọc"
              >
                <CheckCheck size={13} />
                <span>Đọc hết</span>
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Đóng"
              >
                <X size={16} className="text-[#757575]" />
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="max-h-[420px] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-2 border-[#1565C0] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-[#757575]">Đang tải...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-14 h-14 bg-[#F5F6FA] rounded-full flex items-center justify-center">
                <Bell size={24} className="text-[#BDBDBD]" />
              </div>
              <p className="text-sm text-[#757575] font-medium">
                Không có thông báo nào
              </p>
              <p className="text-xs text-[#BDBDBD]">
                Bạn sẽ nhận thông báo khi có cập nhật mới
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#F0F0F0]">
              {notifications.map((notif) => (
                <li key={notif.notification_id}>
                  <button
                    onClick={() => handleItemClick(notif)}
                    className={cn(
                      "w-full text-left px-4 py-3 hover:bg-[#F5F6FA] transition-colors group flex gap-3 items-start",
                      !notif.is_read && getNotificationBg(notif.type)
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        getNotificationBg(notif.type)
                      )}
                    >
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm font-medium leading-snug",
                            !notif.is_read
                              ? "text-[#212121]"
                              : "text-[#757575]"
                          )}
                        >
                          {notif.title}
                        </p>
                        {!notif.is_read && (
                          <span className="w-2 h-2 bg-[#E53935] rounded-full shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p
                        className={cn(
                          "text-xs mt-0.5 line-clamp-2",
                          !notif.is_read
                            ? "text-[#616161]"
                            : "text-[#9E9E9E]"
                        )}
                      >
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-[#BDBDBD]">
                          {formatTime(notif.created_at)}
                        </span>
                        {notif.action_url && (
                          <ExternalLink
                            size={11}
                            className="text-[#BDBDBD] group-hover:text-[#1565C0] transition-colors"
                          />
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-[#F0F0F0] px-4 py-2.5 text-center">
            <button
              onClick={() => {
                if (onClose) onClose();
                router.push("/notifications");
              }}
              className="text-xs text-[#1565C0] hover:text-[#0D47A1] font-medium hover:underline transition-colors"
            >
              Xem tất cả thông báo
            </button>
          </div>
        )}
      </div>
    </>
  );
}
