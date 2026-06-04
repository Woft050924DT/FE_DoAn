'use client'

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Send, Smile, Paperclip, MoreVertical, X, Bot, RefreshCw } from "lucide-react";
import { OrderStatusBadge } from "@/components/Order/StatusBadge";
import { adminChatService, adminSharedService } from "@/services/adminService";
import type {
  Conversation,
  ConversationMessage,
  ConversationDetail,
  StaffMember,
} from "@/services/types";

const FILTERS = ["Tất cả", "Đang mở", "Chờ", "Bot", "Đã đóng"];
const STATUS_MAP: Record<string, string> = { "Đang mở": "open", "Chờ": "waiting", "Bot": "bot", "Đã đóng": "closed" };
const CONV_TAGS = ["VIP", "Khiến nại", "Đổi trả", "Hỏi hàng"];

export default function AdminChatPage() {
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<ConversationMessage[]>([]);
  const [convDetail, setConvDetail] = useState<ConversationDetail | null>(null);
  const [input, setInput] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Assign state
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("normal");
  const [selectedStatus, setSelectedStatus] = useState("open");

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = STATUS_MAP[activeFilter];
      const res = await adminChatService.getConversations({
        status: statusParam,
        limit: 50,
      });
      setConversations(res.conversations);
      if (!activeConv && res.conversations.length > 0) {
        setActiveConv(res.conversations[0].conversation_id);
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, activeConv]);

  const fetchDetail = useCallback(async (convId: string) => {
    setDetailLoading(true);
    try {
      const detail = await adminChatService.getConversationDetail(convId);
      setConvDetail(detail);
      setCurrentMessages(detail.messages || []);
      setSelectedStaff(detail.conversation.assigned_to || "");
      setSelectedPriority(detail.conversation.priority || "normal");
      setSelectedStatus(detail.conversation.status || "open");
    } catch (err) {
      console.error("Failed to fetch conversation detail:", err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const fetchStaffAndReplies = useCallback(async () => {
    try {
      const [staffRes, repliesRes] = await Promise.all([
        adminSharedService.getStaff(),
        adminSharedService.getQuickReplies(),
      ]);
      setStaffList(staffRes);
      setQuickReplies(repliesRes.map(r => r.message));
    } catch (err) {
      console.error("Failed to fetch staff/replies:", err);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchStaffAndReplies();
  }, [fetchConversations, fetchStaffAndReplies]);

  useEffect(() => {
    if (activeConv) fetchDetail(activeConv);
  }, [activeConv, fetchDetail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const handleSend = async () => {
    if (!input.trim() || !activeConv || sending) return;
    setSending(true);
    try {
      const msg = await adminChatService.sendMessage(activeConv, { text: input });
      setCurrentMessages(prev => [...prev, msg]);
      setInput("");
      setShowQuickReplies(false);
      fetchConversations();
    } catch (err) {
      console.error("Send message failed:", err);
    } finally {
      setSending(false);
    }
  };

  const handleAssign = async () => {
    if (!activeConv) return;
    setAssignLoading(true);
    try {
      await adminChatService.updateConversation(activeConv, {
        assigned_to: selectedStaff || undefined,
        priority: selectedPriority,
        status: selectedStatus,
        tags: activeTags,
      });
      fetchConversations();
    } catch (err) {
      console.error("Assign failed:", err);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleClose = async () => {
    if (!activeConv) return;
    setAssignLoading(true);
    try {
      await adminChatService.updateConversation(activeConv, { status: "closed" });
      setSelectedStatus("closed");
      fetchConversations();
    } catch (err) {
      console.error("Close failed:", err);
    } finally {
      setAssignLoading(false);
    }
  };

  const currentConv = conversations.find(c => c.conversation_id === activeConv);

  const PRIORITIES = [
    { value: "urgent", label: "Khẩn cấp" },
    { value: "high", label: "Cao" },
    { value: "normal", label: "Bình thường" },
  ];

  return (
    <div className="flex bg-[#F5F6FA]" style={{ height: "calc(100vh - 64px)" }}>
      {/* Conversation List */}
      <div className="w-72 shrink-0 bg-white border-r border-[#E0E0E0] flex flex-col">
        <div className="p-4 border-b border-[#E0E0E0]">
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Tìm hội thoại..." className="w-full pl-8 pr-4 py-2 border border-[#E0E0E0] dark:border-[#374151] rounded-lg text-sm bg-[#F5F6FA] dark:bg-[#374151] text-[#212121] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]" />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${activeFilter === f ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-100"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#F5F6FA]">
          {loading ? (
            <div className="p-4 text-center text-[#757575] text-sm">Đang tải...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-[#757575] text-sm">Không có hội thoại</div>
          ) : (
            conversations.map((conv) => {
              const initials = conv.customer?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "NA";
              const priorityColor = conv.priority === "urgent" ? "bg-[#E53935]" : conv.priority === "high" ? "bg-amber-400" : "bg-green-400";
              return (
                <button
                  key={conv.conversation_id}
                  onClick={() => setActiveConv(conv.conversation_id)}
                  className={`w-full p-3.5 text-left hover:bg-[#F5F6FA] transition-colors ${activeConv === conv.conversation_id ? "bg-blue-50/60 border-r-2 border-[#1565C0]" : ""}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 bg-[#E53935] rounded-full flex items-center justify-center text-white text-sm font-bold">{initials}</div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${priorityColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-semibold text-xs text-[#212121] truncate">{conv.customer?.full_name || "Khách hàng"}</p>
                        <span className="text-[10px] text-[#757575] shrink-0">{conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString("vi-VN") : ""}</span>
                      </div>
                      <p className="text-xs text-[#757575] truncate mt-0.5">{conv.last_message || ""}</p>
                      <div className="flex items-center justify-between mt-1">
                        <OrderStatusBadge status={conv.status} size="sm" />
                        {conv.unread_count > 0 && (
                          <span className="w-4 h-4 bg-[#E53935] rounded-full text-white text-[9px] flex items-center justify-center font-bold">{conv.unread_count}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Active Chat */}
      <div className="flex-1 flex flex-col min-w-0 bg-white border-r border-[#E0E0E0]">
        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center text-[#757575]">Chọn một hội thoại để bắt đầu</div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-[#E0E0E0] flex items-center gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-[#212121]">{currentConv?.customer?.full_name || "Khách hàng"}</p>
                  {currentConv && <OrderStatusBadge status={currentConv.status} />}
                </div>
                <p className="text-xs text-[#757575]">{currentConv?.intent || ""}</p>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="text-xs border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-2 py-1.5 bg-white dark:bg-white text-[#212121] dark:text-[#212121] focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]"
                >
                  <option value="">Chưa gán</option>
                  {staffList.map(s => (
                    <option key={s.user_id} value={s.user_id}>{s.full_name}</option>
                  ))}
                </select>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="text-xs border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-2 py-1.5 bg-white dark:bg-white text-[#212121] dark:text-[#212121] focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA]"
                >
                  {PRIORITIES.map(p => (
                  {PRIORITIES.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <button
                  onClick={handleAssign}
                  disabled={assignLoading}
                  className="text-xs border border-[#E0E0E0] px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Gán
                </button>
                <button
                  onClick={handleClose}
                  disabled={assignLoading || selectedStatus === "closed"}
                  className="text-xs bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 px-3 py-1.5 rounded-lg hover:bg-green-100 disabled:opacity-50"
                >
                  Đóng
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg"><MoreVertical size={15} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F9FAFB]">
              {detailLoading ? (
                <div className="text-center text-[#757575] text-sm pt-8">Đang tải tin nhắn...</div>
              ) : currentMessages.length === 0 ? (
                <div className="text-center text-[#757575] text-sm pt-8">Chưa có tin nhắn</div>
              ) : (
                currentMessages.map((msg) => {
                  const isUser = msg.sender_type === "user";
                  const isSystem = msg.sender_type === "system";
                  const isBot = msg.sender_type === "bot";
                  const isStaff = msg.sender_type === "staff";
                  const isCustomer = msg.sender_type === "customer";
                  return (
                    <div key={msg.message_id} className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""} ${isSystem ? "justify-center" : ""}`}>
                      {isSystem ? (
                        <div className="flex items-center gap-2">
                          <div className="h-px bg-[#E0E0E0] w-16" />
                          <span className="text-xs text-[#757575] bg-white border border-[#E0E0E0] px-3 py-1.5 rounded-full">{msg.content}</span>
                          <div className="h-px bg-[#E0E0E0] w-16" />
                        </div>
                      ) : (
                        <>
                          {(isBot || isStaff || isCustomer) && (
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-auto text-white text-xs font-bold ${isBot ? "bg-purple-500" : "bg-[#2E7D32]"}`}>
                              {isBot ? <Bot size={13} /> : (isStaff ? "S" : "C")}
                            </div>
                          )}
                          <div className="max-w-[70%]">
                            <div className={`px-3 py-2 rounded-2xl text-sm ${isUser ? "bg-[#1565C0] text-white rounded-tr-sm" : isStaff ? "bg-[#2E7D32] text-white rounded-tl-sm" : "bg-white text-[#212121] rounded-tl-sm shadow-sm border border-[#E0E0E0]"}`}>
                              {msg.content}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5 px-1">
                              {msg.created_at ? new Date(msg.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : ""}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {showQuickReplies && (
              <div className="border-t border-[#E0E0E0] p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[#212121]">Trả lời nhanh</p>
                  <button onClick={() => setShowQuickReplies(false)}><X size={14} className="text-gray-400" /></button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quickReplies.map((qr, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(qr); setShowQuickReplies(false); }}
                      className="text-xs bg-[#F5F6FA] hover:bg-[#E0E0E0] px-2.5 py-1 rounded-full text-[#212121]"
                    >
                      {qr.length > 30 ? qr.slice(0, 30) + "..." : qr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 border-t border-[#E0E0E0] bg-white">
              <div className="flex items-center gap-2 bg-[#F5F6FA] rounded-xl px-3 py-2">
                <button className="text-gray-400 hover:text-gray-600"><Smile size={16} /></button>
                <button className="text-gray-400 hover:text-gray-600"><Paperclip size={16} /></button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
                <button
                  onClick={() => setShowQuickReplies(!showQuickReplies)}
                  className={`text-xs px-2 py-1 rounded-full transition-colors ${showQuickReplies ? "bg-[#1565C0] text-white" : "text-gray-400 hover:text-[#1565C0] hover:bg-blue-50"}`}
                  title="Trả lời nhanh"
                >
                  ⚡
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className="w-8 h-8 bg-[#1565C0] rounded-full flex items-center justify-center hover:bg-[#0D47A1] disabled:opacity-50"
                >
                  {sending ? <RefreshCw size={13} className="text-white animate-spin" /> : <Send size={13} className="text-white" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Customer Info */}
      <div className="w-72 shrink-0 bg-white overflow-y-auto hidden xl:block">
        <div className="p-5 border-b border-[#E0E0E0]">
          <div className="text-center">
            <div className="w-14 h-14 bg-[#E53935] rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
              {currentConv?.customer?.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "NA"}
            </div>
            <p className="font-semibold text-[#212121]">{currentConv?.customer?.full_name || "—"}</p>
            <p className="text-xs text-[#757575] mt-0.5">{currentConv?.customer?.email || ""}</p>
            <p className="text-xs text-[#757575]">{currentConv?.customer?.phone || ""}</p>
          </div>
        </div>
        <div className="p-4 border-b border-[#E0E0E0]">
          <p className="text-xs font-semibold text-[#212121] mb-3">Nhãn hội thoại</p>
          <div className="flex flex-wrap gap-1.5">
            {CONV_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${activeTags.includes(tag) ? "bg-[#1565C0] text-white border-[#1565C0]" : "border-[#E0E0E0] text-[#757575] hover:border-[#1565C0]"}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        {convDetail && (
          <div className="p-4 border-b border-[#E0E0E0]">
            <p className="text-xs font-semibold text-[#212121] mb-3">Phân tích AI</p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#757575] mb-1">Ý định</p>
                <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium">{convDetail.conversation?.intent || "—"}</span>
              </div>
              <div>
                <p className="text-xs text-[#757575] mb-1">Cảm xúc: {Math.round((convDetail.conversation?.sentiment || 0) * 100)}%</p>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      (convDetail.conversation?.sentiment || 0) > 0.6 ? "bg-[#2E7D32]" :
                      (convDetail.conversation?.sentiment || 0) > 0.3 ? "bg-amber-400" : "bg-[#E53935]"
                    }`}
                    style={{ width: `${(convDetail.conversation?.sentiment || 0) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="p-4">
          <p className="text-xs font-semibold text-[#212121] mb-2">Ghi chú nội bộ</p>
          <textarea
            rows={3}
            placeholder="Ghi chú (chỉ nhân viên thấy)..."
            className="w-full text-xs border border-[#E0E0E0] dark:border-[#374151] rounded-lg px-3 py-2 bg-white dark:bg-white text-[#212121] dark:text-[#212121] placeholder:text-gray-400 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0] dark:focus:border-[#60A5FA] resize-none"
            defaultValue={convDetail?.internal_notes || ""}
          />
        </div>
      </div>
    </div>
  );
}
