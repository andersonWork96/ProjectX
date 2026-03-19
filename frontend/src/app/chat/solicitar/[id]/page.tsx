"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowLeft, Send, Clock, CheckCircle, XCircle } from "lucide-react";
import { BottomBar } from "@/components/navbar";

export default function SolicitarChatPage() {
  const params = useParams();
  const router = useRouter();
  const creatorId = Number(params.id);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"loading" | "form" | "pending" | "sent" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  // Verificar se já existe solicitação pendente
  useEffect(() => {
    api.get<{ status: string } | null>(`/api/chats/request-status/${creatorId}`)
      .then(res => {
        if (res && res.status === "pending") setStatus("pending");
        else setStatus("form");
      })
      .catch(() => setStatus("form"));
  }, [creatorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setErrorMsg("");
    try {
      const res = await api.post(`/api/chats/request/${creatorId}`, { message });
      if (res) setStatus("sent");
      else {
        setErrorMsg("Não foi possível enviar. Verifique seus limites.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Não foi possível enviar. Verifique seus limites.");
      setStatus("error");
    }
  };

  return (
    <>
      <header className="flex items-center gap-3 px-4 h-12 border-b border-border/50 flex-shrink-0">
        <button onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <h1 className="font-bold text-sm">Solicitar Conversa</h1>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide px-4 py-6">
        {status === "loading" && (
          <div className="flex justify-center py-10">
            <div className="w-5 h-5 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {status === "pending" && (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock size={28} className="text-yellow-400" />
            </div>
            <h2 className="text-lg font-bold mb-2">Solicitação pendente</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Você já enviou uma solicitação para este criador. Aguarde a resposta antes de enviar outra.
            </p>
            <button onClick={() => router.back()} className="mt-6 px-6 py-2.5 gradient-brand text-white rounded-xl text-sm font-medium">
              Voltar
            </button>
          </div>
        )}

        {status === "sent" && (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-400" />
            </div>
            <h2 className="text-lg font-bold mb-2">Solicitação enviada!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O criador receberá sua mensagem e poderá aceitar ou recusar. Você será notificado.
            </p>
            <button onClick={() => router.back()} className="mt-6 px-6 py-2.5 gradient-brand text-white rounded-xl text-sm font-medium">
              Voltar
            </button>
          </div>
        )}

        {(status === "form" || status === "error") && (
          <>
            <div className="bg-card border border-border/50 rounded-2xl p-4 mb-5">
              <h2 className="font-semibold text-sm mb-2">Como funciona?</h2>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li>• Você pode enviar <strong className="text-foreground">1 mensagem</strong> como solicitação</li>
                <li>• O criador decide se aceita ou recusa</li>
                <li>• Se aceitar, o chat será aberto</li>
                <li>• Se recusar, tente novamente em 7 dias</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <textarea
                placeholder="Escreva sua mensagem... (capriche, é sua única chance!)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 bg-card rounded-xl border border-border/50 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/50 text-sm resize-none"
                required
              />
              <p className="text-[10px] text-muted-foreground text-right">{message.length}/500</p>

              {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}

              <button type="submit" disabled={!message.trim()}
                className="w-full py-3.5 gradient-brand text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 glow-md">
                <Send size={16} /> Enviar Solicitação
              </button>
            </form>
          </>
        )}
      </main>
      <BottomBar />
    </>
  );
}
