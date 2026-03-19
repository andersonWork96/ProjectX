"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push("/feed");
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div className="h-full flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[hsl(var(--accent))]/10 blur-[100px]" />
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-purple-600/10 blur-[80px]" />

      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className="animate-float mb-8">
          <div className="w-20 h-20 gradient-hot rounded-3xl flex items-center justify-center mx-auto mb-4 glow-hot">
            <Sparkles size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight gradient-brand-text">
            projectX
          </h1>
          <p className="text-white/30 text-sm mt-2 font-light">
            Onde conexões acontecem.
          </p>
        </div>

        {/* CTA */}
        <div className="w-full flex flex-col gap-3 max-w-[280px] mx-auto">
          <Link href="/cadastro"
            className="w-full py-4 gradient-hot text-white rounded-2xl text-center font-bold flex items-center justify-center gap-2 glow-hot text-[15px]">
            Começar <ArrowRight size={18} />
          </Link>
          <Link href="/login"
            className="w-full py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-center font-medium text-white/60 hover:text-white/80 hover:bg-white/[0.06] transition">
            Já tenho conta
          </Link>
          <Link href="/feed"
            className="text-center text-xs text-white/20 hover:text-white/40 mt-2 transition">
            Explorar sem conta →
          </Link>
        </div>
      </div>
    </div>
  );
}
