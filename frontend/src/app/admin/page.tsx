"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AdminStats } from "@/lib/types";
import { TopBar, BottomBar } from "@/components/navbar";
import { Shield, Users, Eye, UserPlus, Image, Crown, MapPin, Star } from "lucide-react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/admin-map"), { ssr: false });

interface MapUser {
  id: number;
  name: string;
  username: string;
  isCreator: boolean;
  city: string | null;
  latitude: number;
  longitude: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [mapUsers, setMapUsers] = useState<MapUser[]>([]);
  const [mapFilter, setMapFilter] = useState("all");
  const [loadingMap, setLoadingMap] = useState(true);

  useEffect(() => {
    if (!user?.isAdmin) { router.push("/feed"); return; }
    api.get<AdminStats>("/api/admin/stats").then(setStats).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    setLoadingMap(true);
    const param = mapFilter === "all" ? "" : `?filter=${mapFilter}`;
    api.get<MapUser[]>(`/api/admin/users-map${param}`)
      .then(setMapUsers)
      .catch(() => {})
      .finally(() => setLoadingMap(false));
  }, [user, mapFilter]);

  if (!user?.isAdmin) return null;

  return (
    <>
      <TopBar />
      <main className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-[hsl(var(--primary))]" />
          <h1 className="text-base font-bold">Painel Admin</h1>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <StatCard icon={<Eye size={14} />} label="Visitas s/ Conta" value={stats.anonymousVisitsToday} color="text-blue-400" />
            <StatCard icon={<Star size={14} />} label="Assinantes" value={stats.creatorSubscribers} color="text-yellow-400" />
            <StatCard icon={<UserPlus size={14} />} label="Novos Hoje" value={stats.newUsersToday} color="text-green-400" />
            <StatCard icon={<Users size={14} />} label="Usuários" value={stats.totalUsers} color="text-purple-400" />
            <StatCard icon={<Crown size={14} />} label="Criadores" value={stats.totalCreators} color="text-pink-400" />
            <StatCard icon={<Image size={14} />} label="Posts" value={stats.totalPosts} color="text-cyan-400" />
          </div>
        )}

        {/* Mapa */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-[hsl(var(--primary))]" />
              <span className="text-sm font-semibold">Mapa</span>
              <span className="text-[10px] text-muted-foreground">({mapUsers.length})</span>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-1.5 mb-2">
            {[
              { key: "all", label: "Todos" },
              { key: "creators", label: "Criadores" },
              { key: "today", label: "Hoje" },
            ].map(f => (
              <button key={f.key} onClick={() => setMapFilter(f.key)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition ${mapFilter === f.key ? "gradient-brand text-white" : "bg-card border border-border/50 text-muted-foreground"}`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Mapa */}
          <div className="rounded-xl overflow-hidden border border-border/50 glow-sm" style={{ height: "280px" }}>
            {loadingMap ? (
              <div className="w-full h-full bg-card flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <MapComponent users={mapUsers} />
            )}
          </div>

        </div>

        {/* Poderes */}
        <div className="bg-card rounded-xl p-3 border border-border/50 mb-4">
          <h2 className="font-semibold text-xs mb-1.5">Poderes admin:</h2>
          <ul className="text-[10px] text-muted-foreground space-y-1">
            <li>• Ver conteúdo exclusivo sem assinar</li>
            <li>• Deletar posts/conteúdo de qualquer usuário</li>
            <li>• Mensagens ilimitadas sem solicitação</li>
            <li>• Modo fantasma (invisível para todos)</li>
          </ul>
        </div>
      </main>
      <BottomBar />
    </>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-card rounded-xl p-2.5 border border-border/50">
      <div className={`${color} mb-0.5`}>{icon}</div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[9px] text-muted-foreground leading-tight">{label}</p>
    </div>
  );
}
