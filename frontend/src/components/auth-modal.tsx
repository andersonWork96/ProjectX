"use client";

import { Sparkles, X } from "lucide-react";
import Link from "next/link";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

export function AuthModal({ open, onClose, message }: AuthModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <div className="relative w-full max-w-[430px] bg-background/95 backdrop-blur-xl rounded-t-3xl p-6 pb-8 animate-slide-up border-t border-white/10"
        onClick={(e) => e.stopPropagation()}>

        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-white/20 hover:text-white/40">
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 gradient-hot rounded-2xl flex items-center justify-center mx-auto mb-3 glow-hot">
            <Sparkles size={22} className="text-white" />
          </div>
          <h2 className="text-lg font-bold mb-1">Entre no projectX</h2>
          <p className="text-sm text-white/40">
            {message || "Crie uma conta para curtir, comentar e conectar com criadores."}
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <Link href="/cadastro" onClick={onClose}
            className="w-full py-3.5 gradient-hot text-white rounded-xl text-center font-bold glow-hot">
            Criar conta grátis
          </Link>
          <Link href="/login" onClick={onClose}
            className="w-full py-3 bg-white/[0.04] border border-white/[0.08] text-white/60 rounded-xl text-center font-medium">
            Já tenho conta
          </Link>
        </div>
      </div>
    </div>
  );
}
