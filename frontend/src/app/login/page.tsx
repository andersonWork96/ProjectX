"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login.");
    } finally { setLoading(false); }
  };

  return (
    <div className="h-full flex items-center justify-center px-8 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-[hsl(var(--accent))]/8 blur-[80px]" />

      <div className="w-full relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 gradient-hot rounded-2xl flex items-center justify-center mx-auto mb-3 glow-hot">
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight gradient-brand-text">projectX</h1>
          <p className="text-white/30 text-xs mt-1">Entre na sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 bg-white/[0.04] rounded-xl border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]/50 text-sm placeholder:text-white/20" required />
          <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 bg-white/[0.04] rounded-xl border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]/50 text-sm placeholder:text-white/20" required />

          {error && <p className="text-[hsl(var(--accent))] text-xs">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 gradient-hot text-white rounded-xl font-bold disabled:opacity-50 mt-1 glow-hot">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-white/25 text-sm mt-8">
          Não tem conta? <Link href="/cadastro" className="gradient-brand-text font-bold">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}
