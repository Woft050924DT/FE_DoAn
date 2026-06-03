import { useState, useRef, useEffect } from "react";
import {
  MessageCircle, X, Minus, Send, Smile, Paperclip, Bot,
  Package, ChevronRight, Loader
} from "lucide-react";

type ChatState = "collapsed" | "welcome" | "active" | "handoff";

interface Message {
  id: string;
  type: "bot" | "user" | "system";
  text?: string;
  time: string;
  typing?: boolean;
  productCard?: { name: string; price: string; image: string };
  orderCard?: { id: string; status: string };
}

const QUICK_REPLIES = [
  "Kiểm tra đơn hàng",
  "Tư vấn sản phẩm",
  "Chính sách đổi trả",
  "Khuyến mãi",
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    type: "bot",
    text: "Xin chào! 👋 Tôi là trợ lý AI của VietShop. Tôi có thể giúp gì cho bạn hôm nay?",
    time: "Vừa xong",
  },
];

export function ChatWidget() {
  const [state, setState] = useState<ChatState>("collapsed");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [unread] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      text: input,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: "Cảm ơn bạn đã liên hệ! Tôi đang tra cứu thông tin cho bạn. Vui lòng chờ trong giây lát...",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1500);
  };

  const handleQuickReply = (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      text,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setState("active");
    setIsTyping(true);

    if (text === "Kiểm tra đơn hàng") {
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: "bot",
            text: "Tôi tìm thấy đơn hàng gần nhất của bạn:",
            time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          },
          {
            id: (Date.now() + 2).toString(),
            type: "bot",
            orderCard: { id: "#DH2024003", status: "Đang giao hàng" },
            time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }, 1500);
    } else if (text === "Tư vấn sản phẩm") {
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: "bot",
            text: "Sản phẩm nổi bật đang được nhiều khách hàng quan tâm:",
            time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          },
          {
            id: (Date.now() + 2).toString(),
            type: "bot",
            productCard: {
              name: "iPhone 15 Pro Max 256GB",
              price: "28.990.000đ",
              image: "https://images.unsplash.com/photo-1673718424091-5fb734062c05?w=80&q=80",
            },
            time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }, 1500);
    } else {
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: "bot",
            text:
              text === "Chính sách đổi trả"
                ? "Chúng tôi hỗ trợ đổi trả trong 7 ngày nếu sản phẩm còn nguyên vẹn. Vui lòng giữ lại hóa đơn mua hàng."
                : "Hiện tại VietShop đang có nhiều chương trình khuyến mãi hấp dẫn! Flash Sale mỗi ngày lúc 12:00 và 20:00.",
            time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }, 1500);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      {state !== "collapsed" && (
        <div className="w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
          style={{ height: "500px" }}>
          {/* Header */}
          <div className="bg-[#E53935] px-4 py-3 flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#E53935]" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Hỗ trợ trực tuyến</p>
              <p className="text-white/70 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                Đang hoạt động
              </p>
            </div>
            <button onClick={() => setState("collapsed")} className="text-white/70 hover:text-white p-1">
              <Minus size={16} />
            </button>
            <button onClick={() => setState("collapsed")} className="text-white/70 hover:text-white p-1">
              <X size={16} />
            </button>
          </div>

          {/* Welcome or Active */}
          {state === "welcome" ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-[#E53935]/10 rounded-full flex items-center justify-center mb-4">
                <Bot size={28} className="text-[#E53935]" />
              </div>
              <p className="text-[#212121] font-semibold mb-1">Xin chào! 👋</p>
              <p className="text-[#757575] text-sm mb-5">Chúng tôi luôn sẵn sàng hỗ trợ bạn!</p>

              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr}
                    onClick={() => handleQuickReply(qr)}
                    className="text-xs bg-gray-100 hover:bg-[#E53935]/10 hover:text-[#E53935] text-[#212121] px-3 py-1.5 rounded-full transition-colors border border-gray-200"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setState("active")}
                className="w-full bg-[#E53935] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#C62828] transition-colors"
              >
                Bắt đầu cuộc trò chuyện
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F5F6FA]">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.type === "user" ? "flex-row-reverse" : ""} ${msg.type === "system" ? "justify-center" : ""}`}>
                    {msg.type === "bot" && (
                      <div className="w-7 h-7 bg-[#E53935] rounded-full flex items-center justify-center shrink-0 mt-auto">
                        <Bot size={13} className="text-white" />
                      </div>
                    )}
                    <div className={`max-w-[75%] ${msg.type === "system" ? "w-full" : ""}`}>
                      {msg.type === "system" ? (
                        <div className="text-center">
                          <span className="text-xs bg-gray-200 text-gray-500 px-3 py-1 rounded-full">{msg.text}</span>
                        </div>
                      ) : msg.productCard ? (
                        <div className="bg-white rounded-xl p-3 border border-[#E0E0E0] shadow-sm">
                          <div className="flex gap-2">
                            <img src={msg.productCard.image || null} alt="" className="w-12 h-12 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-[#212121] line-clamp-2">{msg.productCard.name}</p>
                              <p className="text-sm text-[#E53935] font-semibold mt-1">{msg.productCard.price}</p>
                            </div>
                          </div>
                          <button className="mt-2 w-full text-xs text-[#1565C0] flex items-center justify-center gap-1 hover:underline">
                            Xem chi tiết <ChevronRight size={11} />
                          </button>
                        </div>
                      ) : msg.orderCard ? (
                        <div className="bg-white rounded-xl p-3 border border-[#E0E0E0] shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <Package size={14} className="text-[#1565C0]" />
                            <p className="text-xs font-semibold text-[#212121]">{msg.orderCard.id}</p>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                            <div className="bg-indigo-500 h-1.5 rounded-full w-2/3" />
                          </div>
                          <p className="text-xs text-indigo-600 font-medium">{msg.orderCard.status}</p>
                        </div>
                      ) : (
                        <div
                          className={`px-3 py-2 rounded-2xl text-sm ${
                            msg.type === "user"
                              ? "bg-[#E53935] text-white rounded-tr-sm"
                              : "bg-white text-[#212121] rounded-tl-sm shadow-sm border border-gray-100"
                          }`}
                        >
                          {msg.text}
                        </div>
                      )}
                      {msg.type !== "system" && (
                        <p className="text-[10px] text-gray-400 mt-0.5 px-1">{msg.time}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 bg-[#E53935] rounded-full flex items-center justify-center shrink-0">
                      <Bot size={13} className="text-white" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                      <div className="flex gap-1 items-center">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 150}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Handoff */}
                {state === "handoff" && (
                  <div className="text-center space-y-1">
                    <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full inline-block">
                      Đang kết nối với nhân viên...
                    </span>
                    <p className="text-xs text-gray-500">Bạn đang ở vị trí #2</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick replies */}
              <div className="flex gap-1.5 px-3 py-2 overflow-x-auto border-t border-gray-100 bg-white">
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr}
                    onClick={() => handleQuickReply(qr)}
                    className="text-[11px] whitespace-nowrap bg-gray-100 hover:bg-[#E53935]/10 text-gray-600 hover:text-[#E53935] px-2.5 py-1 rounded-full transition-colors shrink-0"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="p-3 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2 bg-[#F5F6FA] rounded-xl px-3 py-2">
                  <button className="text-gray-400 hover:text-gray-600"><Smile size={16} /></button>
                  <button className="text-gray-400 hover:text-gray-600"><Paperclip size={16} /></button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 bg-transparent text-sm focus:outline-none text-[#212121] placeholder-gray-400"
                  />
                  <button
                    onClick={sendMessage}
                    className="w-7 h-7 bg-[#E53935] rounded-full flex items-center justify-center hover:bg-[#C62828] transition-colors"
                  >
                    <Send size={13} className="text-white" />
                  </button>
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-1.5">Powered by AI ✨</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setState(state === "collapsed" ? "welcome" : "collapsed")}
        className="relative w-14 h-14 bg-[#E53935] rounded-full flex items-center justify-center shadow-xl hover:bg-[#C62828] transition-all hover:scale-110 group"
        title="Chat với chúng tôi"
      >
        {state === "collapsed" ? (
          <MessageCircle size={24} className="text-white" />
        ) : (
          <X size={24} className="text-white" />
        )}
        {state === "collapsed" && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full text-[#212121] text-xs font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
        <div className="absolute right-16 bg-[#212121] text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Chat với chúng tôi
        </div>
      </button>
    </div>
  );
}
