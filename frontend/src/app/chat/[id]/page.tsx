"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { imgSrc } from "@/lib/image";
import { Message } from "@/lib/types";
import { ArrowLeft, Send, Heart } from "lucide-react";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const chatId = Number(params.id);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const data = await api.get<Message[]>(`/api/chats/${chatId}/messages?page=1&pageSize=100`);
        setMessages(data.reverse());
        await api.post(`/api/chats/${chatId}/read`);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [user, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const msg = await api.post<Message>(`/api/chats/${chatId}/messages`, { text });
      setMessages(prev => [...prev, msg]);
      setText("");
    } catch { /* ignore */ }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 h-13 border-b border-white/[0.04] flex-shrink-0 bg-card/30">
        <button onClick={() => router.push("/chat")} className="p-1">
          <ArrowLeft size={20} className="text-white/50" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-sm">Chat</h1>
          <p className="text-[10px] text-white/25">Conversa privada</p>
        </div>
        <Heart size={16} className="text-[hsl(var(--accent))]/40" />
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4 chat-bg">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-5 h-5 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 gradient-brand rounded-full flex items-center justify-center mx-auto mb-3 opacity-20">
              <Heart size={24} className="text-white" />
            </div>
            <p className="text-sm text-white/20">Envie a primeira mensagem</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => {
              const isMine = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    isMine
                      ? "gradient-brand text-white rounded-[18px] rounded-br-[4px]"
                      : "bg-white/[0.06] text-white/80 rounded-[18px] rounded-bl-[4px] border border-white/[0.04]"
                  }`}>
                    {!isMine && (
                      <p className="text-[10px] font-semibold gradient-brand-text mb-0.5">{msg.senderName}</p>
                    )}
                    <p>{msg.text}</p>
                    <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
                      <p className={`text-[9px] ${isMine ? "text-white/50" : "text-white/20"}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                      {msg.readAt && isMine && (
                        <span className="text-[9px] text-white/50">✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-3 border-t border-white/[0.04] bg-card/30 flex-shrink-0">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite algo..."
          className="flex-1 px-4 py-2.5 bg-white/[0.04] rounded-full border border-white/[0.06] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]/50 text-sm placeholder:text-white/15"
        />
        <button type="submit" disabled={!text.trim()}
          className="w-10 h-10 gradient-hot rounded-full flex items-center justify-center disabled:opacity-20 glow-hot transition">
          <Send size={16} className="text-white ml-0.5" />
        </button>
      </form>
    </div>
  );
}
