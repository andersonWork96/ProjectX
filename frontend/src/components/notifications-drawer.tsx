"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Notification } from "@/lib/types";
import { X, Heart, MessageCircle, UserPlus, Star, AlertTriangle, Bell } from "lucide-react";

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
}

const iconMap: Record<string, { icon: React.ReactNode; color: string }> = {
  like: { icon: <Heart size={12} className="fill-current" />, color: "text-red-400" },
  comment: { icon: <MessageCircle size={12} />, color: "text-blue-400" },
  follow: { icon: <UserPlus size={12} />, color: "text-green-400" },
  interest: { icon: <Star size={12} className="fill-current" />, color: "text-yellow-400" },
  message: { icon: <MessageCircle size={12} />, color: "text-purple-400" },
  chat_request: { icon: <MessageCircle size={12} />, color: "text-purple-400" },
  chat_accepted: { icon: <MessageCircle size={12} />, color: "text-green-400" },
  chat_rejected: { icon: <X size={12} />, color: "text-red-400" },
  content_removed: { icon: <AlertTriangle size={12} />, color: "text-orange-400" },
};

export function NotificationsDrawer({ open, onClose }: NotificationsDrawerProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const handleClick = (n: Notification) => {
    onClose();
    // Tipos que abrem chat
    if ((n.type === "message" || n.type === "chat_accepted" || n.type === "chat_request") && n.referenceId) {
      router.push(`/chat/${n.referenceId}`);
    }
    // Follow -> perfil
    else if (n.type === "follow" && n.referenceId) {
      router.push(`/perfil/${n.referenceId}`);
    }
  };

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.get<Notification[]>("/api/notifications?page=1&pageSize=30")
      .then(data => {
        setNotifications(data);
        api.post("/api/notifications/read").catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  const timeAgo = (dateStr: string) => {
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
      {/* Backdrop com blur bonito */}
      <div
        className={`fixed inset-0 z-[90] transition-all duration-500 ${open ? "opacity-100 backdrop-blur-md bg-black/30" : "opacity-0 pointer-events-none backdrop-blur-none"}`}
        onClick={onClose}
      />

      {/* Painel descendo do topo */}
      <div
        className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[95] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
      >
        <div className="mx-2 mt-2 rounded-2xl bg-background/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-500/10 max-h-[330px] flex flex-col overflow-hidden">
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold gradient-brand-text">Notificações</span>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="w-5 h-5 rounded-full gradient-brand text-white text-[9px] font-bold flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition">
              <X size={14} className="text-white/60" />
            </button>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Lista */}
          <div className="overflow-y-auto scrollbar-hide flex-1 py-2">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-5 h-5 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell size={28} className="text-white/10 mx-auto mb-2" />
                <p className="text-xs text-white/30">Sem notificações</p>
              </div>
            ) : (
              notifications.map((n, i) => {
                const style = iconMap[n.type] || { icon: <Bell size={12} />, color: "text-white/40" };
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className="flex items-start gap-3 px-4 py-2.5 hover:bg-white/5 transition w-full text-left"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className={`mt-0.5 ${style.color}`}>
                      {style.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-white/80 leading-snug">{n.message}</p>
                      <p className="text-[10px] text-white/25 mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && (
                      <div className="w-1.5 h-1.5 rounded-full gradient-brand mt-1.5 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
