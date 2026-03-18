"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Post } from "@/lib/types";
import { Navbar } from "@/components/navbar";
import { ArrowLeft, ImagePlus, X } from "lucide-react";

export default function NovoPostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;
    setLoading(true);

    try {
      const formData = new FormData();
      if (caption) formData.append("caption", caption);
      files.forEach((file) => formData.append("images", file));

      await api.post<Post>("/api/posts", formData);
      router.push("/feed");
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-lg mx-auto pt-16 pb-20 px-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Nova Publicação</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Image picker */}
          <div className="flex flex-wrap gap-2">
            {previews.map((preview, i) => (
              <div key={i} className="relative w-24 h-24">
                <img src={preview} alt="" className="w-full h-full object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <label className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition">
              <ImagePlus size={24} className="text-muted-foreground" />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            placeholder="Escreva uma legenda..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />

          <button
            type="submit"
            disabled={loading || files.length === 0}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Publicando..." : "Publicar"}
          </button>
        </form>
      </main>
    </div>
  );
}
