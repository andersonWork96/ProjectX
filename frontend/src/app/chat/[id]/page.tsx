"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Message } from "@/lib/types";
import { ArrowLeft, Send } from "lucide-react";

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
        const data = await api.get<Message[]>(
          `/api/chats/${chatId}/messages?page=1&pageSize=100`
        );
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
      setMessages((prev) => [...prev, msg]);
      setText("");
    } catch { /* ignore */ }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 h-14 border-b border-border">
        <button onClick={() => router.back()}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold">Chat</h1>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">Envie a primeira mensagem!</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  msg.senderId === user?.id
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary rounded-bl-sm"
                }`}
              >
                <p>{msg.text}</p>
                <p className="text-[10px] opacity-60 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-border">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite uma mensagem..."
          className="flex-1 px-4 py-2 bg-secondary rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
