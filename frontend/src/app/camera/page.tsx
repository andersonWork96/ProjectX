"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Post } from "@/lib/types";
import { X, Camera, Video, Send, Sparkles, SmilePlus, Type, RotateCcw } from "lucide-react";

export default function CameraPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"capture" | "edit">("capture");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [posted, setPosted] = useState(false);

  if (!user) return null;

  const handleCapture = (captureType: "photo" | "video") => {
    const input = fileInputRef.current;
    if (!input) return;
    input.accept = captureType === "video" ? "video/*" : "image/*";
    input.capture = "environment";
    input.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setMode("edit");
    };
    reader.readAsDataURL(f);
  };

  const handlePost = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      if (caption) formData.append("caption", caption);
      formData.append("images", file);
      await api.post<Post>("/api/posts", formData);
      setPosted(true);
      setTimeout(() => router.push("/feed"), 1500);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleRetake = () => {
    setFile(null);
    setPreview(null);
    setCaption("");
    setMode("capture");
  };

  // Hidden file input
  const hiddenInput = (
    <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
  );

  // Posted success
  if (posted) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8">
        <div className="w-20 h-20 gradient-brand rounded-3xl flex items-center justify-center mb-4 glow-md animate-pulse-glow">
          <Sparkles size={32} className="text-white" />
        </div>
        <h2 className="text-xl font-bold mb-1">Publicado!</h2>
        <p className="text-sm text-white/40">Redirecionando para o feed...</p>
      </div>
    );
  }

  // Capture mode
  if (mode === "capture") {
    return (
      <div className="h-full flex flex-col">
        {hiddenInput}

        {/* Header */}
        <div className="flex items-center justify-between px-4 h-12 flex-shrink-0">
          <button onClick={() => router.back()} className="text-white/40 hover:text-white/70 transition">
            <X size={22} />
          </button>
          <span className="text-sm font-bold gradient-brand-text">Câmera</span>
          <div className="w-6" />
        </div>

        {/* Área da câmera */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-full aspect-[3/4] bg-white/[0.03] border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center mb-6">
            <Camera size={48} className="text-white/10 mb-4" />
            <p className="text-sm text-white/25">Capture um momento</p>
          </div>

          {/* Botões de captura */}
          <div className="flex gap-4">
            <button onClick={() => handleCapture("photo")}
              className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center glow-md active:scale-95 transition">
                <Camera size={24} className="text-white" />
              </div>
              <span className="text-[10px] text-white/40">Foto</span>
            </button>
            <button onClick={() => handleCapture("video")}
              className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full gradient-hot flex items-center justify-center glow-hot active:scale-95 transition">
                <Video size={24} className="text-white" />
              </div>
              <span className="text-[10px] text-white/40">Vídeo</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="h-full flex flex-col">
      {hiddenInput}

      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12 flex-shrink-0 border-b border-white/[0.04]">
        <button onClick={handleRetake} className="flex items-center gap-1 text-white/40 hover:text-white/70 transition text-xs">
          <RotateCcw size={14} /> Refazer
        </button>
        <span className="text-sm font-bold">Editar</span>
        <button onClick={handlePost} disabled={loading}
          className="flex items-center gap-1 text-[hsl(var(--accent))] font-bold text-xs disabled:opacity-50">
          <Send size={14} /> {loading ? "..." : "Postar"}
        </button>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="relative">
          {file?.type.startsWith("video") ? (
            <video src={preview || ""} className="w-full aspect-[3/4] object-cover" controls />
          ) : (
            <img src={preview || ""} alt="" className="w-full aspect-[3/4] object-cover" />
          )}
        </div>

        {/* Edição */}
        <div className="px-4 py-4">
          {/* Caption */}
          <div className="relative mb-3">
            <textarea
              placeholder="Escreva algo..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-3 bg-white/[0.04] rounded-2xl border border-white/[0.06] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]/50 text-sm resize-none placeholder:text-white/15"
            />
            <p className="text-[9px] text-white/15 text-right mt-1">{caption.length}/1000</p>
          </div>

          {/* Publicar */}
          <button onClick={handlePost} disabled={loading}
            className="w-full py-3.5 gradient-hot text-white rounded-2xl font-bold disabled:opacity-30 glow-hot flex items-center justify-center gap-2">
            <Sparkles size={16} />
            {loading ? "Publicando..." : "Publicar agora"}
          </button>
        </div>
      </div>
    </div>
  );
}
