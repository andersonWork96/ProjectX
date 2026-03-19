"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { Check, X, Loader2 } from "lucide-react";

export default function CadastroPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCreator, setIsCreator] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const checkUsername = useCallback(async (value: string) => {
    if (value.length < 3) { setUsernameStatus("idle"); return; }
    setUsernameStatus("checking");
    try {
      const res = await api.get<{ available: boolean }>(`/auth/check-username/${value}`);
      setUsernameStatus(res.available ? "available" : "taken");
    } catch { setUsernameStatus("idle"); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { if (username.length >= 3) checkUsername(username); }, 500);
    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  const handleUsernameChange = (value: string) => {
    setUsername(value.toLowerCase().replace(/[^a-z0-9._]/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (usernameStatus === "taken") { setError("Username já em uso."); return; }
    if (username.length < 3) { setError("Username deve ter pelo menos 3 caracteres."); return; }
    setLoading(true);
    try {
      await register(name, username, email, password, isCreator);
      router.push("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally { setLoading(false); }
  };

  return (
    <div className="h-full flex items-center justify-center px-6 overflow-y-auto scrollbar-hide">
      <div className="w-full py-8">
        <h1 className="text-3xl font-black tracking-tighter gradient-brand-text text-center mb-1">
          projectX
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-6">Crie sua conta</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="text" placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-card rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm" required />

          <div className="relative">
            <input type="text" placeholder="Username (ex: bella.santos)" value={username}
              onChange={(e) => handleUsernameChange(e.target.value)} maxLength={30}
              className={`w-full px-4 py-3 bg-card rounded-xl border focus:outline-none focus:ring-2 pr-10 text-sm ${
                usernameStatus === "available" ? "border-green-500/50 focus:ring-green-500/50" :
                usernameStatus === "taken" ? "border-red-500/50 focus:ring-red-500/50" :
                "border-border focus:ring-[hsl(var(--primary))]"
              }`} required />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {usernameStatus === "checking" && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
              {usernameStatus === "available" && <Check size={16} className="text-green-500" />}
              {usernameStatus === "taken" && <X size={16} className="text-red-500" />}
            </div>
          </div>
          {usernameStatus === "taken" && <p className="text-red-400 text-[11px] -mt-1">Username indisponível</p>}
          {usernameStatus === "available" && <p className="text-green-400 text-[11px] -mt-1">Disponível!</p>}

          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-card rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm" required />
          <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-card rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm" required />

          <div className="mt-1">
            <label className="text-xs text-muted-foreground mb-2 block">Tipo de conta</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setIsCreator(false)}
                className={`py-3 rounded-xl border text-sm font-medium transition ${!isCreator ? "gradient-brand text-white border-transparent" : "border-border text-muted-foreground hover:text-foreground hover:bg-card"}`}>
                Usuário
              </button>
              <button type="button" onClick={() => setIsCreator(true)}
                className={`py-3 rounded-xl border text-sm font-medium transition ${isCreator ? "gradient-brand text-white border-transparent" : "border-border text-muted-foreground hover:text-foreground hover:bg-card"}`}>
                Criador de Conteúdo
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button type="submit" disabled={loading || usernameStatus === "taken"}
            className="w-full py-3.5 gradient-brand text-white rounded-xl font-semibold disabled:opacity-50 mt-1">
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="text-center text-muted-foreground text-sm mt-6">
          Já tem conta? <Link href="/login" className="gradient-brand-text font-semibold">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
