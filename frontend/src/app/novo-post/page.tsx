"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { imgSrc } from "@/lib/image";
import { Post } from "@/lib/types";
import { TopBar, BottomBar } from "@/components/navbar";
import { Camera, X, Sparkles, Type, ChevronRight, User } from "lucide-react";

export default function NovoPostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"media" | "details">("media");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selected]);
    selected.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    setLoading(true);
    try {
      const formData = new FormData();
      if (caption) formData.append("caption", caption);
      files.forEach(file => formData.append("images", file));
      await api.post<Post>("/api/posts", formData);
      router.push("/feed");
    } catch { /* ignore */ }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <>
      <TopBar />
      <main className="flex-1 overflow-y-auto scrollbar-hide">

        {step === "media" ? (
          /* ===== STEP 1: Selecionar mídia ===== */
          <div className="px-4 py-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Camera size={24} className="text-white" />
              </div>
              <h1 className="text-lg font-bold">Nova Publicação</h1>
              <p className="text-xs text-muted-foreground mt-1">Selecione fotos para compartilhar no feed</p>
            </div>

            {/* Preview grid */}
            {previews.length > 0 && (
              <div className="mb-4">
                {/* Imagem principal */}
                <div className="relative rounded-2xl overflow-hidden mb-2">
                  <img src={previews[0]} alt="" className="w-full aspect-[4/5] object-cover" />
                  <button type="button" onClick={() => removeImage(0)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <X size={14} className="text-white" />
                  </button>
                  {previews.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      <span className="text-white text-[10px] font-medium">1/{previews.length}</span>
                    </div>
                  )}
                </div>

                {/* Thumbnails extras */}
                {previews.length > 1 && (
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                    {previews.slice(1).map((preview, i) => (
                      <div key={i + 1} className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden">
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(i + 1)}
                          className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center">
                          <X size={8} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Botão adicionar fotos */}
            <label className={`block w-full border-2 border-dashed rounded-2xl cursor-pointer transition hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5 ${previews.length === 0 ? "border-border/50 py-16" : "border-border/30 py-4"}`}>
              <div className="text-center">
                <Camera size={previews.length === 0 ? 32 : 20} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  {previews.length === 0 ? "Toque para selecionar fotos" : "Adicionar mais fotos"}
                </p>
              </div>
              <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            </label>

            {/* Botão próximo */}
            {previews.length > 0 && (
              <button onClick={() => setStep("details")}
                className="w-full mt-4 py-3.5 gradient-brand text-white rounded-xl font-semibold flex items-center justify-center gap-2 glow-md">
                Continuar <ChevronRight size={18} />
              </button>
            )}
          </div>
        ) : (
          /* ===== STEP 2: Legenda e publicar ===== */
          <div className="px-4 py-4">
            {/* Preview compacto */}
            <div className="flex items-center gap-3 mb-5 bg-card rounded-xl p-3 border border-border/50">
              <img src={previews[0]} alt="" className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {user.isCreator ? (
                    <span className="text-xs font-medium gradient-brand-text">Criador</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Usuário</span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {files.length} {files.length === 1 ? "foto selecionada" : "fotos selecionadas"}
                </p>
              </div>
              <button onClick={() => setStep("media")} className="text-[10px] text-[hsl(var(--primary))] font-medium">
                Alterar
              </button>
            </div>

            {/* Legenda */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Type size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Legenda</span>
              </div>
              <textarea
                placeholder="Escreva algo sobre sua publicação..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-3 bg-card rounded-xl border border-border/50 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/50 text-sm resize-none placeholder:text-muted-foreground/50"
              />
              <p className="text-[10px] text-muted-foreground text-right mt-1">{caption.length}/1000</p>
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-2">
              <button onClick={handleSubmit} disabled={loading}
                className="w-full py-3.5 gradient-brand text-white rounded-xl font-semibold flex items-center justify-center gap-2 glow-md disabled:opacity-50">
                <Sparkles size={16} />
                {loading ? "Publicando..." : "Publicar no feed"}
              </button>
              <button onClick={() => setStep("media")}
                className="w-full py-2.5 text-xs text-muted-foreground hover:text-foreground transition">
                ← Voltar
              </button>
            </div>
          </div>
        )}

      </main>
      <BottomBar />
    </>
  );
}
