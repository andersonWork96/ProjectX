"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Home, PlusCircle, Bell, User, LayoutDashboard, MessageCircle, Shield, Camera, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { NotificationsDrawer } from "@/components/notifications-drawer";

export function TopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => { logout(); router.push("/login"); };

  useEffect(() => {
    if (!user) return;
    const fetchCount = () => {
      api.get<{ count: number }>("/api/notifications/unread-count")
        .then(res => setUnreadCount(res.count))
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <>
      <div className="flex-shrink-0 z-50">
        {/* Logo bar */}
        <header className="border-b border-white/[0.04] bg-background">
          <div className="flex items-center justify-center h-11">
            <Link href="/feed" className="flex items-center gap-1.5">
                            <span className="text-lg font-black tracking-tight gradient-brand-text">projectX</span>
            </Link>
          </div>
        </header>

        {/* Action bar */}
        <div className="border-b border-white/[0.04] bg-gradient-to-r from-card/40 via-card/60 to-card/40 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 h-11">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-white/[0.06]">
                    <span className="text-[10px] font-bold gradient-brand-text">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-white/70 font-medium">{user.name.split(" ")[0]}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Link href="/chat" className="w-9 h-9 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] hover:from-purple-500/15 hover:to-pink-500/10 flex items-center justify-center transition-all border border-white/[0.06] hover:border-purple-500/20 hover:shadow-md hover:shadow-purple-500/5">
                    <MessageCircle size={16} className="text-white/50 hover:text-white/80 transition" />
                  </Link>
                  <button onClick={() => { setShowNotifications(true); setUnreadCount(0); }} className="w-9 h-9 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] hover:from-purple-500/15 hover:to-pink-500/10 flex items-center justify-center transition-all border border-white/[0.06] hover:border-purple-500/20 hover:shadow-md hover:shadow-purple-500/5 relative">
                    <Bell size={16} className="text-white/50" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full gradient-hot text-white text-[9px] font-bold flex items-center justify-center px-1 animate-pulse-glow shadow-lg shadow-pink-500/30 ring-2 ring-[hsl(var(--background))]">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
                  <button onClick={handleLogout} className="w-9 h-9 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] hover:from-red-500/15 hover:to-red-500/5 flex items-center justify-center transition-all border border-white/[0.06] hover:border-red-500/20 group">
                    <LogOut size={15} className="text-white/30 group-hover:text-red-400 transition" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="text-[11px] text-white/30">Explore o feed</span>
                <div className="flex items-center gap-2">
                  <Link href="/login" className="text-[11px] text-white/50 hover:text-white/80 transition font-medium px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">Entrar</Link>
                  <Link href="/cadastro" className="text-[11px] gradient-brand text-white px-4 py-1.5 rounded-xl font-bold shadow-lg shadow-pink-500/10">Criar conta</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <NotificationsDrawer open={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
}

export function BottomBar() {
  const { user } = useAuth();
  const pathname = usePathname();
  if (!user) return null;

  const items = [
    { href: "/feed", icon: Home, label: "Início" },
    ...(user.isCreator ? [{ href: "/criador", icon: LayoutDashboard, label: "Painel" }] : []),
    ...(user.isAdmin ? [{ href: "/admin", icon: Shield, label: "Admin" }] : []),
    { href: "/novo-post", icon: PlusCircle, label: "" },
    { href: "/camera", icon: Camera, label: "Câmera" },
    { href: `/perfil/${user.id}`, icon: User, label: "Perfil" },
  ];

  return (
    <nav className="flex-shrink-0 border-t border-white/[0.04] bg-background z-50">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const isCreate = item.href === "/novo-post";

          if (isCreate) {
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 py-1 px-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? "gradient-brand shadow-lg shadow-pink-500/30" : "bg-gradient-to-br from-pink-500/30 to-purple-600/40 border border-pink-500/20 shadow-md shadow-purple-500/10"}`}>
                  <PlusCircle size={18} className="text-white" />
                </div>
                <span className={`text-[9px] ${isActive ? "text-[hsl(var(--accent))] font-semibold" : "text-white/35"}`}>Criar</span>
              </Link>
            );
          }

          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 py-1 px-3">
              <item.icon size={20} className={isActive ? "text-[hsl(var(--accent))]" : "text-white/25"} />
              {item.label && (
                <span className={`text-[9px] ${isActive ? "text-[hsl(var(--accent))] font-semibold" : "text-white/25"}`}>{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Navbar() {
  return (
    <>
      <TopBar />
      <BottomBar />
    </>
  );
}
