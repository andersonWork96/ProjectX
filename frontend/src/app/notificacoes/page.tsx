"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Notification } from "@/lib/types";
import { Navbar } from "@/components/navbar";
import { ArrowLeft, Heart, MessageCircle, UserPlus, Star } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  like: <Heart size={16} className="text-red-500" />,
  comment: <MessageCircle size={16} className="text-blue-500" />,
  follow: <UserPlus size={16} className="text-green-500" />,
  interest: <Star size={16} className="text-yellow-500" />,
  message: <MessageCircle size={16} className="text-primary" />,
};

export default function NotificacoesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const data = await api.get<Notification[]>("/api/notifications?page=1&pageSize=50");
        setNotifications(data);
        await api.post("/api/notifications/read");
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [user]);

  const timeAgo = (dateStr: string) => {
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
          <h1 className="text-xl font-bold">Notificações</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">Nenhuma notificação.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  !n.read ? "bg-secondary" : ""
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  {iconMap[n.type] || <Heart size={16} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
