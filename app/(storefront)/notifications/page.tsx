"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Tag,
  AlertCircle,
  CheckCheck,
  Check,
  Bell,
  ChevronLeft,
} from "lucide-react";
import { notificationService } from "@/services/notificationService";
import { Notification } from "@/services/types";
import {
  formatNotificationTime,
  getNotificationTypeColor,
} from "@/utils/notificationUtils";
import { cn } from "@/components/UI/ui/utils";

type FilterType = "all" | "order" | "promotion" | "system";

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "order":
      return <ShoppingCart size={18} className="text-[#1565C0]" />;
    case "promotion":
      return <Tag size={18} className="text-[#E53935]" />;
    case "system":
    default:
      return <AlertCircle size={18} className="text-[#757575]" />;
  }
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClick: () => void;
}

function NotificationItem({
  notification: notif,
  onMarkAsRead,
  onClick,
}: NotificationItemProps) {
  const colors = getNotificationTypeColor(notif.type);

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-[#E0E0E0] p-4 hover:shadow-sm transition-all border-l-4 cursor-pointer",
        colors.border,
        !notif.is_read && "shadow-sm"
      )}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
            colors.bg
          )}
        >
          {getNotificationIcon(notif.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                "text-sm font-semibold leading-snug",
                !notif.is_read ? "text-[#212121]" : "text-[#616161]"
              )}
            >
              {notif.title}
            </h3>
            {!notif.is_read && (
              <span className="w-2 h-2 bg-[#E53935] rounded-full shrink-0 mt-1.5" />
            )}
          </div>
          <p
            className={cn(
              "text-xs mt-1 leading-relaxed",
              !notif.is_read ? "text-[#616161]" : "text-[#9E9E9E]"
            )}
          >
            {notif.message}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-[#BDBDBD]">
              {formatNotificationTime(notif.created_at)}
            </span>
            <div className="flex items-center gap-1">
              {!notif.is_read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notif.notification_id);
                  }}
                  className={cn(
                    "flex items-center gap-1 text-[11px] px-2 py-1 rounded-md hover:bg-gray-100 transition-colors",
                    colors.text
                  )}
                  title="Đánh dấu đã đọc"
                >
                  <Check size={11} />
                  <span>Đã đọc</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);

  const fetchNotifications = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      if (pageNum === 1) setIsLoading(true);
      try {
        const res = await notificationService.getNotifications({
          page: pageNum,
          limit: 20,
        });
        if (append) {
          setNotifications((prev) => [...prev, ...res.notifications]);
        } else {
          setNotifications(res.notifications);
        }
        setHasMore(res.pagination.page < res.pagination.totalPages);
      } catch (err) {
        console.error("[NotificationsPage] fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setTotalUnread(res.count);
    } catch (err) {
      console.error("[NotificationsPage] unread count error:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === id ? { ...n, is_read: true } : n
        )
      );
      setTotalUnread((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("[NotificationsPage] markAsRead error:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setTotalUnread(0);
    } catch (err) {
      console.error("[NotificationsPage] markAllAsRead error:", err);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === "all" ? true : n.type === filter
  );

  const unreadNotifications = notifications.filter((n) => !n.is_read);

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center gap-3 h-14">
            <button
              onClick={() => router.back()}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-[#212121]" />
            </button>
            <h1 className="text-lg font-bold text-[#212121] flex-1">
              Thông báo
              {totalUnread > 0 && (
                <span className="ml-2 text-xs bg-[#E53935] text-white rounded-full px-2 py-0.5 font-medium align-middle">
                  {totalUnread} chưa đọc
                </span>
              )}
            </h1>
            {unreadNotifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1.5 text-sm text-[#1565C0] hover:text-[#0D47A1] px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                <CheckCheck size={15} />
                <span className="hidden sm:inline">Đọc tất cả</span>
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 pb-3 overflow-x-auto">
            {(["all", "order", "promotion", "system"] as FilterType[]).map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                    filter === f
                      ? "bg-[#1565C0] text-white"
                      : "text-[#757575] hover:bg-gray-100"
                  )}
                >
                  {f === "all"
                    ? "Tất cả"
                    : f === "order"
                    ? "Đơn hàng"
                    : f === "promotion"
                    ? "Khuyến mãi"
                    : "Hệ thống"}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {isLoading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-3 border-[#1565C0] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[#757575]">Đang tải thông báo...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Bell size={32} className="text-[#BDBDBD]" />
            </div>
            <p className="text-base text-[#757575] font-medium">
              {filter === "all"
                ? "Chưa có thông báo nào"
                : `Không có thông báo "${filter === "order" ? "Đơn hàng" : filter === "promotion" ? "Khuyến mãi" : "Hệ thống"}"`}
            </p>
            <p className="text-sm text-[#BDBDBD]">
              {filter === "all"
                ? "Bạn sẽ nhận thông báo khi có cập nhật mới"
                : "Thử chọn danh mục khác"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Unread section */}
            {filter === "all" && unreadNotifications.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-[#9E9E9E] uppercase tracking-wider">
                    Chưa đọc
                  </span>
                  <div className="flex-1 h-px bg-[#E0E0E0]" />
                </div>
                {filteredNotifications
                  .filter((n) => !n.is_read)
                  .map((notif) => (
                    <NotificationItem
                      key={notif.notification_id}
                      notification={notif}
                      onMarkAsRead={handleMarkAsRead}
                      onClick={() => {
                        if (notif.action_url) router.push(notif.action_url);
                      }}
                    />
                  ))}
              </div>
            )}

            {/* Read section */}
            {filter === "all" &&
              notifications.some((n) => n.is_read) && (
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-[#9E9E9E] uppercase tracking-wider">
                      Đã đọc
                    </span>
                    <div className="flex-1 h-px bg-[#E0E0E0]" />
                  </div>
                  {filteredNotifications
                    .filter((n) => n.is_read)
                    .map((notif) => (
                      <NotificationItem
                        key={notif.notification_id}
                        notification={notif}
                        onMarkAsRead={handleMarkAsRead}
                        onClick={() => {
                          if (notif.action_url) router.push(notif.action_url);
                        }}
                      />
                    ))}
                </div>
              )}

            {/* No filter = show all without sections */}
            {filter !== "all" &&
              filteredNotifications.map((notif) => (
                <NotificationItem
                  key={notif.notification_id}
                  notification={notif}
                  onMarkAsRead={handleMarkAsRead}
                  onClick={() => {
                    if (notif.action_url) router.push(notif.action_url);
                  }}
                />
              ))}

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center pt-4 pb-6">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-2 text-sm text-[#1565C0] border border-[#1565C0] rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  Tải thêm
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
