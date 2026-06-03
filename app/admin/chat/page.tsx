'use client'

import { useState, useRef, useEffect } from "react";
import { Search, Send, Smile, Paperclip, MoreVertical, X, Bot } from "lucide-react";
import { OrderStatusBadge } from "@/components/Order/StatusBadge";

const CHAT_CONVERSATIONS = [
  { id: "1", customer: { name: "Nguyễn Văn An", email: "an.nguyen@gmail.com", avatar: "NA", phone: "0901234567" }, status: "open", priority: "urgent", lastMessage: "Tôi muốn hỏi về chính sách đổi trả...", time: "2 phút", unread: 3, assignedStaff: "Minh Tuấn", intent: "Đổi trả hàng", sentiment: 0.35 },
  { id: "2", customer: { name: "Trần Thị Bình", email: "binh.tran@gmail.com", avatar: "TB", phone: "0912345678" }, status: "waiting", priority: "high", lastMessage: "Đơn hàng của tôi chưa nhận được", time: "15 phút", unread: 1, assignedStaff: "Chưa gán", intent: "Kiểm tra đơn hàng", sentiment: 0.2 },
  { id: "3", customer: { name: "Lê Minh Châu", email: "chau.le@gmail.com", avatar: "LC", phone: "0923456789" }, status: "bot", priority: "normal", lastMessage: "Cho tôi xem các sản phẩm iPhone", time: "32 phút", unread: 0, assignedStaff: "Bot AI", intent: "Tư vấn sản phẩm", sentiment: 0.75 },
];

const QUICK_REPLIES_LIST = [
  "Xin chào! Tôi có thể giúp gì cho bạn?",
  "Vui lòng cho tôi biết mã đơn hàng của bạn.",
  "Đơn hàng của bạn đang được xử lý.",
  "Chúng tôi xin lỗi vì sự bất tiện này.",
  "Cảm ơn bạn đã liên hệ với VietShop!",
];

const MESSAGES: Record<string, Array<{ id: string; type: "user" | "bot" | "staff" | "system"; text: string; time: string }>> = {
  "1": [
    { id: "m1", type: "bot", text: "Xin chào! Tôi có thể giúp gì cho bạn?", time: "14:30" },
    { id: "m2", type: "user", text: "Tôi muốn hỏi về chính sách đổi trả sản phẩm", time: "14:31" },
    { id: "m3", type: "bot", text: "Chúng tôi hỗ trợ đổi trả trong 7 ngày...", time: "14:31" },
    { id: "m4", type: "user", text: "Tôi muốn đổi trả đơn hàng #DH2024001", time: "14:32" },
    { id: "m5", type: "system", text: "AI chuyển cho nhân viên lúc 14:32", time: "14:32" },
    { id: "m6", type: "staff", text: "Xin chào! Tôi là Minh Tuấn, nhân viên hỗ trợ. Tôi sẽ giúp bạn xử lý yêu cầu đổi trả.", time: "14:33" },
  ],
  "2": [
    { id: "m1", type: "bot", text: "Chào bạn! Bạn cần hỗ trợ gì?", time: "13:45" },
    { id: "m2", type: "user", text: "Đơn hàng của tôi chưa nhận được sau 7 ngày", time: "13:46" },
    { id: "m3", type: "system", text: "Chờ kết nối nhân viên", time: "13:46" },
  ],
  "3": [
    { id: "m1", type: "bot", text: "Xin chào! Bạn muốn xem sản phẩm nào?", time: "13:15" },
    { id: "m2", type: "user", text: "Cho tôi xem các sản phẩm iPhone", time: "13:16" },
    { id: "m3", type: "bot", text: "Hiện tại chúng tôi có các mẫu iPhone mới nhất...", time: "13:16" },
  ],
};

const CONV_TAGS = ["VIP", "Khiếu nại", "Đổi trả", "Hỏi hàng"];

export default function AdminChatPage() {
  const [activeConv, setActiveConv] = useState("1");
  const [input, setInput] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [messages, setMessages] = useState(MESSAGES);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeConv, messages]);

  const currentConv = CHAT_CONVERSATIONS.find((c) => c.id === activeConv)!;
  const currentMessages = messages[activeConv] || [];

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now().toString(), type: "staff" as const, text: input, time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) };
    setMessages((prev) => ({ ...prev, [activeConv]: [...(prev[activeConv] || []), newMsg] }));
    setInput("");
    setShowQuickReplies(false);
  };

  const FILTERS = ["Tất cả", "Đang mở", "Chờ", "Bot", "Đã đóng"];
  const PRIORITIES = [{ value: "urgent", label: "🔴 Khẩn cấp" }, { value: "high", label: "🟡 Cao" }, { value: "normal", label: "🟢 Bình thường" }];

  return (
    <div className="flex bg-[#F5F6FA]" style={{ height: "calc(100vh - 64px)" }}>
      {/* Conversation List */}
      <div className="w-72 shrink-0 bg-white border-r border-[#E0E0E0] flex flex-col">
        <div className="p-4 border-b border-[#E0E0E0]">
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Tìm hội thoại..." className="w-full pl-8 pr-4 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:border-[#1565C0] bg-[#F5F6FA]" />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)} className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${activeFilter === f ? "bg-[#1565C0] text-white" : "text-[#757575] hover:bg-gray-100"}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-[#F5F6FA]">
          {CHAT_CONVERSATIONS.map((conv) => (
            <button key={conv.id} onClick={() => setActiveConv(conv.id)} className={`w-full p-3.5 text-left hover:bg-[#F5F6FA] transition-colors ${activeConv === conv.id ? "bg-blue-50/60 border-r-2 border-[#1565C0]" : ""}`}>
              <div className="flex items-start gap-2.5">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 bg-[#E53935] rounded-full flex items-center justify-center text-white text-sm font-bold">{conv.customer.avatar}</div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${conv.priority === "urgent" ? "bg-[#E53935]" : conv.priority === "high" ? "bg-amber-400" : "bg-green-400"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-semibold text-xs text-[#212121] truncate">{conv.customer.name}</p>
                    <span className="text-[10px] text-[#757575] shrink-0">{conv.time}</span>
                  </div>
                  <p className="text-xs text-[#757575] truncate mt-0.5">{conv.lastMessage}</p>
                  <div className="flex items-center justify-between mt-1">
                    <OrderStatusBadge status={conv.status} size="sm" />
                    {conv.unread > 0 && <span className="w-4 h-4 bg-[#E53935] rounded-full text-white text-[9px] flex items-center justify-center font-bold">{conv.unread}</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Chat */}
      <div className="flex-1 flex flex-col min-w-0 bg-white border-r border-[#E0E0E0]">
        <div className="px-4 py-3 border-b border-[#E0E0E0] flex items-center gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm text-[#212121]">{currentConv?.customer.name}</p>
              <OrderStatusBadge status={currentConv?.status} />
            </div>
            <p className="text-xs text-[#757575]">{currentConv?.intent}</p>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2 flex-wrap">
            <select className="text-xs border border-[#E0E0E0] rounded-lg px-2 py-1.5 focus:outline-none bg-white">
              <option>Minh Tuấn</option><option>Bot AI</option><option>Lan Phương</option>
            </select>
            <select className="text-xs border border-[#E0E0E0] rounded-lg px-2 py-1.5 focus:outline-none bg-white">
              {PRIORITIES.map((p) => <option key={p.value}>{p.label}</option>)}
            </select>
            <button className="text-xs border border-[#E0E0E0] px-3 py-1.5 rounded-lg hover:bg-gray-50">Chuyển</button>
            <button className="text-xs bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 px-3 py-1.5 rounded-lg hover:bg-green-100">Đóng</button>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg"><MoreVertical size={15} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F9FAFB]">
          {currentMessages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 ${msg.type === "user" ? "flex-row-reverse" : ""} ${msg.type === "system" ? "justify-center" : ""}`}>
              {msg.type === "system" ? (
                <div className="flex items-center gap-2">
                  <div className="h-px bg-[#E0E0E0] w-16" />
                  <span className="text-xs text-[#757575] bg-white border border-[#E0E0E0] px-3 py-1 rounded-full">{msg.text}</span>
                  <div className="h-px bg-[#E0E0E0] w-16" />
                </div>
              ) : (
                <>
                  {(msg.type === "bot" || msg.type === "staff") && (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-auto text-white text-xs font-bold ${msg.type === "bot" ? "bg-purple-500" : "bg-[#2E7D32]"}`}>
                      {msg.type === "bot" ? <Bot size={13} /> : "MT"}
                    </div>
                  )}
                  <div className="max-w-[70%]">
                    <div className={`px-3 py-2 rounded-2xl text-sm ${msg.type === "user" ? "bg-[#1565C0] text-white rounded-tr-sm" : msg.type === "staff" ? "bg-[#2E7D32] text-white rounded-tl-sm" : "bg-white text-[#212121] rounded-tl-sm shadow-sm border border-[#E0E0E0]"}`}>
                      {msg.text}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 px-1">{msg.time}</p>
                  </div>
                </>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {showQuickReplies && (
          <div className="border-t border-[#E0E0E0] p-3 bg-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-[#212121]">Trả lời nhanh</p>
              <button onClick={() => setShowQuickReplies(false)}><X size={14} className="text-gray-400" /></button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REPLIES_LIST.map((qr) => (
                <button key={qr} onClick={() => { setInput(qr); setShowQuickReplies(false); }} className="text-xs bg-[#F5F6FA] hover:bg-[#E0E0E0] px-2.5 py-1 rounded-full text-[#212121]">{qr.slice(0, 30)}{qr.length > 30 ? "..." : ""}</button>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 border-t border-[#E0E0E0] bg-white">
          <div className="flex items-center gap-2 bg-[#F5F6FA] rounded-xl px-3 py-2">
            <button className="text-gray-400 hover:text-gray-600"><Smile size={16} /></button>
            <button className="text-gray-400 hover:text-gray-600"><Paperclip size={16} /></button>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Nhập tin nhắn..." className="flex-1 bg-transparent text-sm focus:outline-none" />
            <button onClick={() => setShowQuickReplies(!showQuickReplies)} className={`text-xs px-2 py-1 rounded-full transition-colors ${showQuickReplies ? "bg-[#1565C0] text-white" : "text-gray-400 hover:text-[#1565C0] hover:bg-blue-50"}`} title="Trả lời nhanh">⚡</button>
            <button onClick={sendMessage} className="w-8 h-8 bg-[#1565C0] rounded-full flex items-center justify-center hover:bg-[#0D47A1]"><Send size={13} className="text-white" /></button>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="w-72 shrink-0 bg-white overflow-y-auto hidden xl:block">
        <div className="p-5 border-b border-[#E0E0E0]">
          <div className="text-center">
            <div className="w-14 h-14 bg-[#E53935] rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">{currentConv?.customer.avatar}</div>
            <p className="font-semibold text-[#212121]">{currentConv?.customer.name}</p>
            <p className="text-xs text-[#757575] mt-0.5">{currentConv?.customer.email}</p>
            <p className="text-xs text-[#757575]">{currentConv?.customer.phone}</p>
            <button className="mt-2 text-xs text-[#1565C0] hover:underline">Xem hồ sơ →</button>
          </div>
        </div>
        <div className="p-4 border-b border-[#E0E0E0]">
          <p className="text-xs font-semibold text-[#212121] mb-3">Nhãn hội thoại</p>
          <div className="flex flex-wrap gap-1.5">
            {CONV_TAGS.map((tag) => (
              <button key={tag} onClick={() => setActiveTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])} className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${activeTags.includes(tag) ? "bg-[#1565C0] text-white border-[#1565C0]" : "border-[#E0E0E0] text-[#757575] hover:border-[#1565C0]"}`}>{tag}</button>
            ))}
          </div>
        </div>
        <div className="p-4 border-b border-[#E0E0E0]">
          <p className="text-xs font-semibold text-[#212121] mb-3">Phân tích AI</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[#757575] mb-1">Ý định</p>
              <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium">{currentConv?.intent}</span>
            </div>
            <div>
              <p className="text-xs text-[#757575] mb-1">Cảm xúc: {Math.round((currentConv?.sentiment || 0) * 100)}%</p>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`h-2 rounded-full ${ (currentConv?.sentiment || 0) > 0.6 ? "bg-[#2E7D32]" : (currentConv?.sentiment || 0) > 0.3 ? "bg-amber-400" : "bg-[#E53935]"}`} style={{ width: `${(currentConv?.sentiment || 0) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold text-[#212121] mb-2">Ghi chú nội bộ</p>
          <textarea rows={3} placeholder="Ghi chú (chỉ nhân viên thấy)..." className="w-full text-xs border border-[#E0E0E0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#1565C0] resize-none" />
        </div>
      </div>
    </div>
  );
}
