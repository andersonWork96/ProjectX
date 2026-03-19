"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { UserProfile } from "@/lib/types";
import { ArrowLeft, Crown, Eye, MessageCircle, Check, Sparkles } from "lucide-react";
import { BottomBar } from "@/components/navbar";

export default function AssinarPage() {
  const params = useParams();
  const router = useRouter();
  const creatorId = Number(params.id);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selected, setSelected] = useState<"fan" | "vip">("fan");

  useEffect(() => {
    api.get<UserProfile>(`/api/profile/${creatorId}`).then(setProfile).catch(() => {});
  }, [creatorId]);

  if (!profile || !profile.creatorPlan) return null;

  return (
    <>
      <header className="flex items-center gap-3 px-4 h-12 border-b border-border/50 flex-shrink-0">
        <button onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <h1 className="font-bold text-sm">Assinar {profile.name}</h1>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide px-4 py-6">
        <div className="flex flex-col gap-3">
          {/* Plano Fã */}
          <button onClick={() => setSelected("fan")}
            className={`p-4 rounded-2xl border-2 text-left transition glow-sm ${selected === "fan" ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5" : "border-border bg-card"}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold flex items-center gap-2"><Crown size={16} className="text-[hsl(var(--primary))]" /> Plano Fã</span>
              <span className="text-lg font-bold gradient-brand-text">R${profile.creatorPlan.fanPrice.toFixed(2)}<span className="text-[10px] text-muted-foreground">/mês</span></span>
            </div>
            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-2"><Check size={12} className="text-green-500" /> Ver fotos e vídeos exclusivos</span>
              <span className="flex items-center gap-2"><Check size={12} className="text-green-500" /> Selo nos comentários</span>
              <span className="flex items-center gap-2"><Eye size={12} /> Acesso completo ao perfil</span>
            </div>
          </button>

          {/* Plano VIP */}
          <button onClick={() => setSelected("vip")}
            className={`p-4 rounded-2xl border-2 text-left transition relative glow-sm ${selected === "vip" ? "border-yellow-500 bg-yellow-500/5" : "border-border bg-card"}`}>
            <div className="absolute -top-2 right-3 gradient-brand text-[9px] font-bold px-2.5 py-0.5 rounded-full text-white">POPULAR</div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold flex items-center gap-2"><Crown size={16} className="text-yellow-500" /> Plano VIP</span>
              <span className="text-lg font-bold text-yellow-400">R${profile.creatorPlan.vipPrice.toFixed(2)}<span className="text-[10px] text-muted-foreground">/mês</span></span>
            </div>
            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-2"><Check size={12} className="text-green-500" /> Tudo do Plano Fã</span>
              <span className="flex items-center gap-2"><Check size={12} className="text-green-500" /> Chat livre e direto</span>
              <span className="flex items-center gap-2"><Check size={12} className="text-green-500" /> Ver online/digitando</span>
              <span className="flex items-center gap-2"><MessageCircle size={12} className="text-yellow-500" /> Selo gold nos comentários</span>
            </div>
          </button>
        </div>

        <button className="w-full mt-6 py-3.5 gradient-brand text-white rounded-xl font-semibold flex items-center justify-center gap-2 glow-md">
          <Sparkles size={16} /> Assinar — Em breve
        </button>
        <p className="text-center text-[10px] text-muted-foreground mt-2">Pagamento será integrado em breve</p>
      </main>
      <BottomBar />
    </>
  );
}
