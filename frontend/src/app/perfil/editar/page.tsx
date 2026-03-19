"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { imgSrc } from "@/lib/image";
import { UserProfile } from "@/lib/types";
import { ArrowLeft, Camera, User } from "lucide-react";
import { BottomBar } from "@/components/navbar";

export default function EditarPerfilPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    api.get<UserProfile>(`/api/profile/${user.id}`).then(data => {
      setProfile(data);
      setName(data.name);
      setBio(data.bio || "");
      setCity(data.city || "");
      setGender(data.gender || "");
    }).catch(() => {});
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await api.post<{ avatarUrl: string }>("/api/profile/avatar", formData);
      setProfile(prev => prev ? { ...prev, avatarUrl: res.avatarUrl } : prev);
    } catch { /* ignore */ }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("banner", file);
    try {
      const res = await api.post<{ bannerUrl: string }>("/api/profile/banner", formData);
      setProfile(prev => prev ? { ...prev, bannerUrl: res.bannerUrl } : prev);
    } catch { /* ignore */ }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/api/profile", { name, bio, city, gender, phone });
      setSaved(true);
      setTimeout(() => router.push(`/perfil/${user?.id}`), 1000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  if (!profile) return null;

  return (
    <>
      <header className="flex items-center justify-between px-4 h-12 border-b border-border/50 flex-shrink-0">
        <button onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <h1 className="font-bold text-sm">Editar Perfil</h1>
        <button onClick={handleSave} disabled={saving}
          className="text-sm font-semibold gradient-brand-text disabled:opacity-50">
          {saved ? "Salvo!" : saving ? "..." : "Salvar"}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Banner */}
        <button onClick={() => bannerInputRef.current?.click()} className="relative w-full h-28 gradient-brand opacity-40 group">
          {profile.bannerUrl && (
            <img src={imgSrc(profile.bannerUrl)} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <Camera size={20} className="text-white" />
          </div>
          <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
        </button>

        {/* Avatar */}
        <div className="flex justify-center -mt-10 relative z-10">
          <button onClick={() => avatarInputRef.current?.click()} className="relative group">
            {profile.avatarUrl ? (
              <img src={imgSrc(profile.avatarUrl)} alt="" className="w-20 h-20 rounded-2xl object-cover border-4 border-background gradient-border" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-card border-4 border-background flex items-center justify-center gradient-border">
                <User size={28} className="text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <Camera size={16} className="text-white" />
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </button>
        </div>

        {/* Form */}
        <div className="px-4 mt-4 flex flex-col gap-3 pb-6">
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Nome</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-card rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={500}
              className="w-full px-3 py-2.5 bg-card rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm resize-none" />
            <p className="text-[10px] text-muted-foreground text-right">{bio.length}/500</p>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Cidade</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2.5 bg-card rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Gênero</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2.5 bg-card rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm">
              <option value="">Selecionar</option>
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Telefone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 bg-card rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm" />
          </div>

          {saved && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center py-2 rounded-xl">
              Perfil salvo! Redirecionando...
            </div>
          )}
        </div>
      </main>
      <BottomBar />
    </>
  );
}
