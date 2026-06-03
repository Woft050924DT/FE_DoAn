"use client";

import { useNotifications } from "@/contexts/NotificationContext";
import { Bell } from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";
import { useClickOutside } from "@/hooks/useClickOutside";

export function NotificationBell() {
  const { unreadCount, isOpen, setIsOpen } = useNotifications();

  const handleClose = () => setIsOpen(false);
  const containerRef = useClickOutside(handleClose, isOpen);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ""}`}
      >
        <Bell size={20} className="text-[#212121]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#E53935] rounded-full text-white text-[9px] flex items-center justify-center font-bold px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && <NotificationDropdown onClose={handleClose} />}
    </div>
  );
}
