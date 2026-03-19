"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Home, PlusCircle, Bell, User, LayoutDashboard, MessageCircle, Shield, Camera } from "lucide-react";
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
        <div className="border-b border-white/[0.04] bg-card/30">
          <div className="flex items-center justify-between px-4 h-9">
            {user ? (
              <>
                <span className="text-[11px] text-white/30">Olá, <span className="text-white/70 font-medium">{user.name.split(" ")[0]}</span></span>
                <div className="flex items-center gap-0.5">
                  <Link href="/chat" className="p-2 rounded-full hover:bg-white/5 transition">
                    <MessageCircle size={15} className="text-white/40" />
                  </Link>
                  <button onClick={() => { setShowNotifications(true); setUnreadCount(0); }} className="p-2 rounded-full hover:bg-white/5 transition relative">
                    <Bell size={15} className="text-white/40" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 min-w-[14px] h-[14px] rounded-full gradient-hot text-white text-[8px] font-bold flex items-center justify-center px-0.5 animate-pulse-glow">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
                  <button onClick={handleLogout} className="text-[10px] text-white/25 ml-1 px-2 py-1 hover:text-white/50 transition">
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="text-[11px] text-white/30">Explore</span>
                <div className="flex items-center gap-2">
                  <Link href="/login" className="text-[11px] text-white/40 hover:text-white/70 transition">Entrar</Link>
                  <Link href="/cadastro" className="text-[11px] gradient-brand text-white px-3 py-1 rounded-full font-semibold">Criar conta</Link>
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
              <Link key={item.href} href={item.href} className="relative -mt-4">
                <div className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center glow-md">
                  <PlusCircle size={22} className="text-white" />
                </div>
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
