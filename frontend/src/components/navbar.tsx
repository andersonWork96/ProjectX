"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Home, PlusSquare, Bell, MessageCircle, User, LogOut } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
          <Link href="/feed" className="text-xl font-bold text-primary">
            ProjectX
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/notificacoes">
              <Bell size={22} />
            </Link>
            <Link href="/chat">
              <MessageCircle size={22} />
            </Link>
            <button onClick={logout}>
              <LogOut size={22} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom tab bar (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="max-w-lg mx-auto flex items-center justify-around h-14">
          <Link href="/feed" className="flex flex-col items-center">
            <Home size={22} />
          </Link>
          <Link href="/novo-post" className="flex flex-col items-center">
            <PlusSquare size={22} />
          </Link>
          <Link href={`/perfil/${user.id}`} className="flex flex-col items-center">
            <User size={22} />
          </Link>
        </div>
      </nav>
    </>
  );
}
