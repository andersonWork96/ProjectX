"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { imgSrc } from "@/lib/image";
import { ChatItem, ChatRequestItem } from "@/lib/types";
import { TopBar, BottomBar } from "@/components/navbar";
import { ArrowLeft, User, MessageCircle, Inbox, Check, X } from "lucide-react";
import Link from "next/link";

export default function ChatListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [requests, setRequests] = useState<ChatRequestItem[]>([]);
  const [tab, setTab] = useState<"chats" | "requests">("chats");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [chatsData, requestsData] = await Promise.all([
          api.get<ChatItem[]>("/api/chats"),
          user.isCreator ? api.get<ChatRequestItem[]>("/api/chats/requests/pending") : Promise.resolve([]),
        ]);
        setChats(chatsData);
        setRequests(requestsData);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleRespond = async (requestId: number, accept: boolean) => {
    try {
      await api.post(`/api/chats/requests/${requestId}/respond?accept=${accept}`);
      setRequests(prev => prev.filter(r => r.id !== requestId));
      if (accept) {
        const chatsData = await api.get<ChatItem[]>("/api/chats");
        setChats(chatsData);
      }
    } catch { /* ignore */ }
  };

  const timeAgo = (dateStr: string | null) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <>
      <TopBar />
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => router.push("/feed")}><ArrowLeft size={20} /></button>
            <h1 className="text-base font-bold">Mensagens</h1>
          </div>

          {/* Tabs */}
          {user?.isCreator && (
            <div className="flex bg-card rounded-xl overflow-hidden mb-4">
              <button onClick={() => setTab("chats")}
                className={`flex-1 py-2.5 text-xs font-medium text-center transition flex items-center justify-center gap-1.5 rounded-xl ${tab === "chats" ? "gradient-brand text-white" : "text-muted-foreground"}`}>
                <MessageCircle size={14} /> Conversas
              </button>
              <button onClick={() => setTab("requests")}
                className={`flex-1 py-2.5 text-xs font-medium text-center transition flex items-center justify-center gap-1.5 rounded-xl relative ${tab === "requests" ? "gradient-brand text-white" : "text-muted-foreground"}`}>
                <Inbox size={14} /> Solicitações
                {requests.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[hsl(var(--accent))] text-white text-[9px] font-bold flex items-center justify-center">
                    {requests.length}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-5 h-5 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === "chats" ? (
          chats.length === 0 ? (
            <div className="text-center py-10">
              <MessageCircle size={28} className="text-white/10 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma conversa ainda.</p>
            </div>
          ) : (
            <div className="px-2">
              {chats.map(chat => (
                <Link key={chat.id} href={`/chat/${chat.id}`}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-card transition">
                  {chat.otherUserAvatarUrl ? (
                    <img src={imgSrc(chat.otherUserAvatarUrl)} alt="" className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center">
                      <User size={18} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm truncate">{chat.otherUserName}</p>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">{timeAgo(chat.lastMessageAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{chat.lastMessage || "Nenhuma mensagem"}</p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full gradient-brand text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                      {chat.unreadCount}
                    </span>
                  )}
                  {chat.isVip && (
                    <span className="text-[8px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">VIP</span>
                  )}
                </Link>
              ))}
            </div>
          )
        ) : (
          requests.length === 0 ? (
            <div className="text-center py-10">
              <Inbox size={28} className="text-white/10 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma solicitação pendente.</p>
            </div>
          ) : (
            <div className="px-3 flex flex-col gap-2">
              {requests.map(req => (
                <div key={req.id} className="bg-card border border-border/50 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {req.fromUserAvatarUrl ? (
                      <img src={imgSrc(req.fromUserAvatarUrl)} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <User size={16} className="text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{req.fromUserName}</p>
                      <p className="text-[10px] text-muted-foreground">{timeAgo(req.createdAt)}</p>
                    </div>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-3 mb-3">
                    <p className="text-xs leading-relaxed">{req.message}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRespond(req.id, true)}
                      className="flex-1 py-2 bg-green-600 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1">
                      <Check size={14} /> Aceitar
                    </button>
                    <button onClick={() => handleRespond(req.id, false)}
                      className="flex-1 py-2 bg-card border border-border/50 text-muted-foreground rounded-xl text-xs font-medium flex items-center justify-center gap-1">
                      <X size={14} /> Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
      <BottomBar />
    </>
  );
}
