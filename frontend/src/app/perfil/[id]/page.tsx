"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { imgSrc } from "@/lib/image";
import { UserProfile, ExclusiveContent } from "@/lib/types";
import { TopBar, BottomBar } from "@/components/navbar";
import { ArrowLeft, User, MessageCircle, Lock, Crown, Star, Image, Film, Sparkles, Pencil, Camera, Trash2, GripVertical } from "lucide-react";
import Link from "next/link";

export default function PerfilPage() {
  const params = useParams();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const userId = Number(params.id);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [exclusive, setExclusive] = useState<ExclusiveContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [tab, setTab] = useState<"fotos" | "videos">("fotos");

  const isMe = authUser?.id === userId;
  const isAdmin = authUser?.isAdmin;
  const [dragId, setDragId] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);

  const handleDragStart = (id: number) => { setDragId(id); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = async (targetId: number) => {
    if (dragId === null || dragId === targetId) return;
    const items = [...exclusive];
    const fromIdx = items.findIndex(i => i.id === dragId);
    const toIdx = items.findIndex(i => i.id === targetId);
    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);
    setExclusive(items);
    setDragId(null);

    // Salvar ordem no backend
    try {
      await api.put("/api/profile/exclusive/reorder", items.map(i => i.id));
    } catch { /* ignore */ }
  };

  const handleDeleteExclusive = async (contentId: number) => {
    if (!confirm("Remover conteúdo por violação? O criador será notificado.")) return;
    try {
      await api.delete(`/api/admin/exclusive/${contentId}`);
      setExclusive(prev => prev.filter(e => e.id !== contentId));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const profileData = await api.get<UserProfile>(`/api/profile/${userId}`);
        setProfile(profileData);
        setIsFollowing(profileData.isFollowedByMe);
        if (profileData.isCreator) {
          const exclusiveData = await api.get<ExclusiveContent[]>(`/api/profile/${userId}/exclusive`);
          setExclusive(exclusiveData);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [userId]);

  const handleFollow = async () => {
    try {
      const res = await api.post<{ followed: boolean }>(`/api/users/${userId}/follow`);
      setIsFollowing(res.followed);
      setProfile(prev => prev ? { ...prev, followersCount: prev.followersCount + (res.followed ? 1 : -1) } : prev);
    } catch { /* ignore */ }
  };

  const handleMessage = () => {
    if (!profile) return;
    if (profile.mySubscriptionPlan === "vip") {
      api.post<{ id: number }>(`/api/chats/vip/${userId}`)
        .then(res => router.push(`/chat/${res.id}`))
        .catch(() => {});
    } else {
      router.push(`/chat/solicitar/${userId}`);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Perfil não encontrado.</p>
      </div>
    );
  }

  const fotos = exclusive.filter(e => e.mediaType === "image");
  const videos = exclusive.filter(e => e.mediaType === "video");
  const currentItems = tab === "fotos" ? fotos : videos;

  return (
    <>
      <TopBar />
      <main className="flex-1 overflow-y-auto scrollbar-hide">

        {/* Header do perfil */}
        <div className="relative">
          {/* Banner com gradiente */}
          {isMe ? (
            <button onClick={() => router.push("/perfil/editar")} className="w-full h-28 relative group">
              <div className="absolute inset-0 gradient-brand opacity-30" />
              {profile.bannerUrl && (
                <img src={imgSrc(profile.bannerUrl)} alt="" className="absolute inset-0 w-full h-28 object-cover" />
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Camera size={20} className="text-white" />
              </div>
            </button>
          ) : (
            <>
              <div className="h-28 gradient-brand opacity-30" />
              {profile.bannerUrl && (
                <img src={imgSrc(profile.bannerUrl)} alt="" className="absolute inset-0 w-full h-28 object-cover" />
              )}
            </>
          )}
          <button onClick={() => router.back()} className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm rounded-full p-1.5 z-10">
            <ArrowLeft size={16} className="text-white" />
          </button>
        </div>

        {/* Perfil info card */}
        <div className="mx-3 -mt-10 relative z-10 bg-card rounded-2xl p-4 glow-sm">
          {/* Lápis para editar (próprio perfil) */}
          {isMe && (
            <button onClick={() => router.push("/perfil/editar")}
              className="absolute top-3 right-3 bg-secondary hover:bg-muted rounded-full p-1.5 transition z-10">
              <Pencil size={12} className="text-muted-foreground" />
            </button>
          )}

          <div className="flex items-start gap-3">
            {/* Avatar */}
            {isMe ? (
              <button onClick={() => router.push("/perfil/editar")} className="relative group flex-shrink-0">
                {profile.avatarUrl ? (
                  <img src={imgSrc(profile.avatarUrl)} alt="" className="w-16 h-16 rounded-2xl object-cover gradient-border" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center gradient-border">
                    <User size={24} className="text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Camera size={14} className="text-white" />
                </div>
              </button>
            ) : (
              profile.avatarUrl ? (
                <img src={imgSrc(profile.avatarUrl)} alt="" className="w-16 h-16 rounded-2xl object-cover gradient-border" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center gradient-border">
                  <User size={24} className="text-muted-foreground" />
                </div>
              )
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold truncate">{profile.name}</h1>
                {profile.isCreator && <Crown size={14} className="text-[hsl(var(--primary))] flex-shrink-0" />}
              </div>
              {profile.city && <p className="text-[11px] text-muted-foreground">{profile.city}</p>}
              {profile.bio && <p className="text-xs text-foreground/70 mt-1 line-clamp-2">{profile.bio}</p>}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-3 mt-4 pt-3 border-t border-border/50">
            <div className="flex-1 text-center">
              <p className="text-lg font-bold gradient-brand-text">{profile.followersCount}</p>
              <p className="text-[10px] text-muted-foreground">Seguidores</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-lg font-bold">{profile.followingCount}</p>
              <p className="text-[10px] text-muted-foreground">Seguindo</p>
            </div>
            {profile.isCreator && (
              <>
              <div className="flex-1 text-center">
                <p className="text-lg font-bold gradient-brand-text">{profile.exclusiveCount}</p>
                <p className="text-[10px] text-muted-foreground">Conteúdos</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-lg font-bold text-yellow-400">{profile.subscribersCount}</p>
                <p className="text-[10px] text-muted-foreground">Assinantes</p>
              </div>
              </>
            )}
          </div>

          {/* Actions */}
          {!isMe && authUser && (
            <div className="flex gap-2 mt-3">
              <button onClick={handleFollow}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${isFollowing ? "bg-secondary text-foreground" : "gradient-brand text-white"}`}>
                {isFollowing ? "Seguindo" : "Seguir"}
              </button>
              {profile.isCreator && (
                <button onClick={handleMessage} className="py-2 px-4 rounded-xl bg-secondary text-foreground text-sm flex items-center gap-1.5">
                  <MessageCircle size={14} /> Msg
                </button>
              )}
            </div>
          )}
        </div>

        {/* Assinatura / CTA para assinar */}
        {!isMe && profile.isCreator && authUser && (
          <div className="mx-3 mt-3">
            {profile.mySubscriptionPlan ? (
              <div className={`rounded-xl p-3 flex items-center gap-2 ${profile.mySubscriptionPlan === "vip" ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20"}`}>
                <Crown size={16} className={profile.mySubscriptionPlan === "vip" ? "text-yellow-400" : "text-[hsl(var(--primary))]"} />
                <span className="text-sm font-medium">Assinante {profile.mySubscriptionPlan === "vip" ? "VIP" : "Fã"}</span>
              </div>
            ) : profile.creatorPlan && (
              <Link href={`/perfil/${userId}/assinar`}
                className="block rounded-xl gradient-brand p-3 text-center glow-md">
                <div className="flex items-center justify-center gap-2 text-white">
                  <Sparkles size={16} />
                  <span className="text-sm font-semibold">Assinar — a partir de R${profile.creatorPlan.fanPrice.toFixed(2)}/mês</span>
                </div>
                <p className="text-white/60 text-[10px] mt-0.5">Desbloqueie fotos e vídeos exclusivos</p>
              </Link>
            )}
          </div>
        )}

        {/* Conteúdo do criador */}
        {profile.isCreator && (
          <>
            {/* Atalho de upload (próprio perfil) */}
            {isMe && (
              <div className="flex gap-2 mx-3 mt-4">
                <Link href="/criador?tab=content" className="flex-1 py-2.5 bg-card border border-border/50 rounded-xl text-xs font-medium text-center flex items-center justify-center gap-1.5 hover:bg-secondary transition">
                  <Image size={14} className="text-[hsl(var(--primary))]" /> Adicionar Foto
                </Link>
                <Link href="/criador?tab=content" className="flex-1 py-2.5 bg-card border border-border/50 rounded-xl text-xs font-medium text-center flex items-center justify-center gap-1.5 hover:bg-secondary transition">
                  <Film size={14} className="text-[hsl(var(--accent))]" /> Adicionar Vídeo
                </Link>
              </div>
            )}

            {/* Tabs */}
            <div className="flex mx-3 mt-4 bg-card rounded-xl overflow-hidden">
              <button onClick={() => setTab("fotos")}
                className={`flex-1 py-2.5 text-xs font-medium text-center transition flex items-center justify-center gap-1.5 rounded-xl ${tab === "fotos" ? "gradient-brand text-white" : "text-muted-foreground"}`}>
                <Image size={14} /> Fotos ({fotos.length})
              </button>
              <button onClick={() => setTab("videos")}
                className={`flex-1 py-2.5 text-xs font-medium text-center transition flex items-center justify-center gap-1.5 rounded-xl ${tab === "videos" ? "gradient-brand text-white" : "text-muted-foreground"}`}>
                <Film size={14} /> Vídeos ({videos.length})
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-1 mx-3 mt-3 mb-4">
              {currentItems.length === 0 ? (
                <p className="col-span-3 text-center text-muted-foreground py-10 text-sm">
                  Nenhum {tab === "fotos" ? "foto" : "vídeo"} ainda.
                </p>
              ) : (
                currentItems.map(item => (
                  <div key={item.id}
                    draggable={isMe}
                    onDragStart={isMe ? () => handleDragStart(item.id) : undefined}
                    onDragOver={isMe ? handleDragOver : undefined}
                    onDrop={isMe ? () => handleDrop(item.id) : undefined}
                    className={`relative aspect-square rounded-lg overflow-hidden transition-all ${item.minPlan === "vip" ? "ring-1 ring-yellow-500/40" : "ring-1 ring-purple-500/40"} ${dragId === item.id ? "opacity-40 scale-95" : ""} ${isMe ? "cursor-grab active:cursor-grabbing" : ""}`}>
                    {/* Controles (owner/admin) */}
                    {(isAdmin || isMe) && (
                      <div className="absolute top-1 right-1 z-20 flex gap-0.5">
                        {isMe && (
                          <div className="bg-black/60 backdrop-blur-sm rounded-full p-1">
                            <GripVertical size={10} className="text-white/60" />
                          </div>
                        )}
                        <button onClick={() => handleDeleteExclusive(item.id)}
                          className="bg-black/60 backdrop-blur-sm rounded-full p-1 hover:bg-red-500/80 transition">
                          <Trash2 size={10} className="text-white" />
                        </button>
                      </div>
                    )}
                    {item.isLocked ? (
                      /* Imagem borrada com badge de plano */
                      <div className="relative w-full h-full">
                        <img src={imgSrc(item.mediaUrl)} alt="" className="w-full h-full object-cover blur-xl scale-110" />
                        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
                          <Lock size={16} className="text-white/80 mb-1" />
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.minPlan === "vip" ? "bg-yellow-500/20 text-yellow-400" : "bg-purple-500/20 text-purple-400"}`}>
                            {item.minPlan === "vip" ? "VIP" : "FÃ"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      item.mediaType === "video" ? (
                        <div className="relative w-full h-full">
                          <video src={imgSrc(item.mediaUrl)} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Film size={20} className="text-white drop-shadow" />
                          </div>
                        </div>
                      ) : (
                        <img src={imgSrc(item.mediaUrl)} alt="" className="w-full h-full object-cover" />
                      )
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Perfil de usuário comum */}
        {!profile.isCreator && (
          <div className="mx-3 mt-4 mb-4">
            <div className="bg-card rounded-2xl p-6 text-center">
              <User size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Perfil de usuário</p>
            </div>
          </div>
        )}

      </main>
      <BottomBar />
    </>
  );
}
