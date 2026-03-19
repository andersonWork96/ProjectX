"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { TopBar, BottomBar } from "@/components/navbar";
import { ArrowLeft, MapPin, Users, Crown, Download } from "lucide-react";
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
  lastLocationAt: string;
}

export default function MapaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<MapUser[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.isAdmin) { router.push("/feed"); return; }
    loadUsers(filter);
  }, [user, filter]);

  const loadUsers = async (f: string) => {
    setLoading(true);
    try {
      const param = f === "all" ? "" : `?filter=${f}`;
      const data = await api.get<MapUser[]>(`/api/admin/users-map${param}`);
      setUsers(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  if (!user?.isAdmin) return null;

  return (
    <>
      <TopBar />
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => router.back()}><ArrowLeft size={20} /></button>
            <MapPin size={18} className="text-[hsl(var(--primary))]" />
            <h1 className="text-base font-bold">Mapa de Usuários</h1>
            <span className="ml-auto text-xs text-muted-foreground">{users.length} no mapa</span>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 mb-3">
            {[
              { key: "all", label: "Todos", icon: Users },
              { key: "creators", label: "Criadores", icon: Crown },
              { key: "today", label: "Hoje", icon: MapPin },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`flex-1 py-2 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1 transition ${filter === f.key ? "gradient-brand text-white" : "bg-card border border-border/50 text-muted-foreground"}`}>
                <f.icon size={12} /> {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mapa */}
        <div className="mx-3 mb-4 rounded-2xl overflow-hidden border border-border/50 glow-sm" style={{ height: "400px" }}>
          {loading ? (
            <div className="w-full h-full bg-card flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <MapComponent users={users} />
          )}
        </div>

        {/* Lista resumida */}
        <div className="px-4 pb-4">
          <h2 className="text-sm font-semibold mb-2">Regiões ({users.length} usuários)</h2>
          <div className="flex flex-col gap-1">
            {Object.entries(
              users.reduce<Record<string, number>>((acc, u) => {
                const key = u.city || "Sem cidade";
                acc[key] = (acc[key] || 0) + 1;
                return acc;
              }, {})
            )
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([city, count]) => (
                <div key={city} className="flex items-center justify-between bg-card rounded-lg px-3 py-2">
                  <span className="text-xs">{city}</span>
                  <span className="text-xs font-bold gradient-brand-text">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </main>
      <BottomBar />
    </>
  );
}
