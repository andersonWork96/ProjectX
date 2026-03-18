"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ChatItem } from "@/lib/types";
import { Navbar } from "@/components/navbar";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5010";

export default function ChatListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const data = await api.get<ChatItem[]>("/api/chats");
        setChats(data);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [user]);

  const timeAgo = (dateStr: string | null) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-lg mx-auto pt-16 pb-20 px-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Mensagens</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : chats.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">Nenhuma conversa.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition"
              >
                {chat.otherUserAvatarUrl ? (
                  <img
                    src={`${API_URL}${chat.otherUserAvatarUrl}`}
                    alt={chat.otherUserName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <User size={20} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{chat.otherUserName}</p>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(chat.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage || "Nenhuma mensagem ainda"}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {chat.unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
