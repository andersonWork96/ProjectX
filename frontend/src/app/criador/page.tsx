"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { imgSrc } from "@/lib/image";
import { ChatRequestItem, UserProfile } from "@/lib/types";
import { TopBar, BottomBar } from "@/components/navbar";
import { ArrowLeft, ImagePlus, Check, X, User, Crown, Star, Sparkles, DollarSign, Inbox, Upload } from "lucide-react";

export default function CriadorPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<ChatRequestItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fanPrice, setFanPrice] = useState("");
  const [vipPrice, setVipPrice] = useState("");
  const [tab, setTab] = useState<"requests" | "content" | "plans">("requests");
  const [loading, setLoading] = useState(true);

  const [caption, setCaption] = useState("");
  const [minPlan, setMinPlan] = useState("fan");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  useEffect(() => {
    if (!user?.isCreator) { router.push("/feed"); return; }
    const load = async () => {
      try {
        const [profileData, requestsData] = await Promise.all([
          api.get<UserProfile>(`/api/profile/${user.id}`),
          api.get<ChatRequestItem[]>("/api/chats/requests/pending"),
        ]);
        setProfile(profileData);
        setRequests(requestsData);
        if (profileData.creatorPlan) {
          setFanPrice(profileData.creatorPlan.fanPrice.toString());
          setVipPrice(profileData.creatorPlan.vipPrice.toString());
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleRespond = async (requestId: number, accept: boolean) => {
    try {
      await api.post(`/api/chats/requests/${requestId}/respond?accept=${accept}`);
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch { /* ignore */ }
  };

  const handleSavePlans = async () => {
    try {
      await api.put("/api/profile/creator-plans", { fanPrice: parseFloat(fanPrice), vipPrice: parseFloat(vipPrice) });
      setSaved(true);
      setTimeout(() => router.push(`/perfil/${user?.id}`), 1500);
    } catch { /* ignore */ }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleUploadExclusive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      if (caption) formData.append("caption", caption);
      formData.append("mediaType", file.type.startsWith("video") ? "video" : "image");
      formData.append("minPlan", minPlan);
      formData.append("media", file);
      await api.post("/api/profile/exclusive", formData);
      setUploaded(true);
      setTimeout(() => {
        setCaption(""); setFile(null); setPreview(null); setMinPlan("fan"); setUploaded(false);
      }, 2000);
    } catch { /* ignore */ }
    setUploading(false);
  };

  if (loading) return null;

  return (
    <>
      <TopBar />
      <main className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4">
        <div className="flex items-center gap-2 mb-5">
          <button onClick={() => router.back()}><ArrowLeft size={20} /></button>
          <h1 className="text-base font-bold">Painel do Criador</h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-card rounded-2xl overflow-hidden mb-5 border border-white/[0.04]">
          {([
            { key: "requests" as const, label: "Solicitações", icon: Inbox, count: requests.length },
            { key: "content" as const, label: "Conteúdo", icon: Upload, count: 0 },
            { key: "plans" as const, label: "Planos", icon: DollarSign, count: 0 },
          ]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-[11px] font-medium text-center transition flex items-center justify-center gap-1 rounded-2xl ${tab === t.key ? "gradient-brand text-white" : "text-white/30"}`}>
              <t.icon size={13} />
              {t.label}
              {t.count > 0 && <span className="w-4 h-4 rounded-full bg-[hsl(var(--accent))] text-white text-[8px] font-bold flex items-center justify-center">{t.count}</span>}
            </button>
          ))}
        </div>

        {/* ===== SOLICITAÇÕES ===== */}
        {tab === "requests" && (
          requests.length === 0 ? (
            <div className="text-center py-16">
              <Inbox size={32} className="text-white/10 mx-auto mb-3" />
              <p className="text-sm text-white/30">Nenhuma solicitação</p>
              <p className="text-[10px] text-white/15 mt-1">Quando alguém quiser conversar, aparecerá aqui</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {requests.map(req => (
                <div key={req.id} className="bg-card border border-white/[0.04] rounded-2xl p-4 glow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    {req.fromUserAvatarUrl ? (
                      <img src={imgSrc(req.fromUserAvatarUrl)} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <User size={16} className="text-white/30" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{req.fromUserName}</p>
                      <p className="text-[10px] text-white/25">{new Date(req.createdAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-3 mb-3 border border-white/[0.04]">
                    <p className="text-xs text-white/60 leading-relaxed italic">"{req.message}"</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRespond(req.id, true)}
                      className="flex-1 py-2.5 bg-green-600/90 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1">
                      <Check size={14} /> Aceitar
                    </button>
                    <button onClick={() => handleRespond(req.id, false)}
                      className="flex-1 py-2.5 bg-white/[0.04] border border-white/[0.08] text-white/40 rounded-xl text-xs font-medium flex items-center justify-center gap-1">
                      <X size={14} /> Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ===== CONTEÚDO EXCLUSIVO ===== */}
        {tab === "content" && (
          uploaded ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4 glow-md animate-pulse-glow">
                <Sparkles size={28} className="text-white" />
              </div>
              <h2 className="text-lg font-bold mb-1">Publicado!</h2>
              <p className="text-sm text-white/40">Seu conteúdo exclusivo está no ar</p>
            </div>
          ) : (
            <form onSubmit={handleUploadExclusive} className="flex flex-col gap-4">
              {/* Preview ou upload */}
              {preview ? (
                <div className="relative rounded-2xl overflow-hidden">
                  {file?.type.startsWith("video") ? (
                    <video src={preview} className="w-full aspect-[3/4] object-cover" controls />
                  ) : (
                    <img src={preview} alt="" className="w-full aspect-[3/4] object-cover" />
                  )}
                  <button type="button" onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <X size={16} className="text-white" />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <span className="text-white text-[10px] font-medium">{file?.type.startsWith("video") ? "Vídeo" : "Foto"}</span>
                  </div>
                </div>
              ) : (
                <label className="w-full aspect-[3/4] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[hsl(var(--accent))]/30 hover:bg-white/[0.02] transition">
                  <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center mb-3 glow-sm">
                    <ImagePlus size={24} className="text-white" />
                  </div>
                  <p className="text-sm text-white/40 font-medium">Selecionar foto ou vídeo</p>
                  <p className="text-[10px] text-white/20 mt-1">Conteúdo exclusivo para assinantes</p>
                  <input type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
                </label>
              )}

              {/* Legenda */}
              <input type="text" placeholder="Legenda (opcional)" value={caption} onChange={(e) => setCaption(e.target.value)}
                className="px-4 py-3 bg-white/[0.04] rounded-xl border border-white/[0.06] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]/50 text-sm placeholder:text-white/20" />

              {/* Nível de acesso */}
              <div>
                <p className="text-[10px] text-white/30 mb-2 uppercase tracking-wider">Quem pode ver</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setMinPlan("fan")}
                    className={`flex-1 py-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${minPlan === "fan" ? "gradient-brand text-white glow-sm" : "bg-white/[0.04] border border-white/[0.06] text-white/30"}`}>
                    <Crown size={14} /> Assinante Fã
                  </button>
                  <button type="button" onClick={() => setMinPlan("vip")}
                    className={`flex-1 py-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${minPlan === "vip" ? "gradient-gold text-white glow-sm" : "bg-white/[0.04] border border-white/[0.06] text-white/30"}`}>
                    <Star size={14} /> Assinante VIP
                  </button>
                </div>
              </div>

              {/* Publicar */}
              <button type="submit" disabled={uploading || !file}
                className="w-full py-3.5 gradient-hot text-white rounded-xl font-bold disabled:opacity-30 glow-hot flex items-center justify-center gap-2">
                <Sparkles size={16} />
                {uploading ? "Publicando..." : "Publicar Exclusivo"}
              </button>
            </form>
          )
        )}

        {/* ===== PLANOS ===== */}
        {tab === "plans" && (
          <div className="flex flex-col gap-4">
            <p className="text-[10px] text-white/25 uppercase tracking-wider">Defina seus preços</p>

            {/* Plano Fã */}
            <div className="bg-card border border-white/[0.04] rounded-2xl p-4 glow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
                  <Crown size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold">Plano Fã</p>
                  <p className="text-[10px] text-white/25">Ver fotos e vídeos exclusivos</p>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-sm">R$</span>
                <input type="number" step="0.01" min="0" value={fanPrice} onChange={(e) => setFanPrice(e.target.value)}
                  className="w-full pl-10 pr-16 py-3 bg-white/[0.04] rounded-xl border border-white/[0.06] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]/50 text-lg font-bold" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/15 text-xs">/mês</span>
              </div>
            </div>

            {/* Plano VIP */}
            <div className="bg-card border border-yellow-500/10 rounded-2xl p-4 glow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 gradient-gold rounded-lg flex items-center justify-center">
                  <Star size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold">Plano VIP</p>
                  <p className="text-[10px] text-white/25">Tudo do Fã + chat livre + status</p>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-sm">R$</span>
                <input type="number" step="0.01" min="0" value={vipPrice} onChange={(e) => setVipPrice(e.target.value)}
                  className="w-full pl-10 pr-16 py-3 bg-white/[0.04] rounded-xl border border-white/[0.06] focus:outline-none focus:ring-1 focus:ring-yellow-500/50 text-lg font-bold" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/15 text-xs">/mês</span>
              </div>
            </div>

            {saved && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center py-2.5 rounded-xl">
                Planos salvos! Redirecionando...
              </div>
            )}

            <button onClick={handleSavePlans} disabled={saved}
              className="w-full py-3.5 gradient-hot text-white rounded-xl font-bold disabled:opacity-30 glow-hot">
              {saved ? "Salvo!" : "Salvar Planos"}
            </button>
          </div>
        )}
      </main>
      <BottomBar />
    </>
  );
}
