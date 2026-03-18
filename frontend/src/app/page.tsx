"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/feed");
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold text-primary mb-4">ProjectX</h1>
        <p className="text-muted-foreground text-lg mb-8">
          A plataforma onde conexões acontecem.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg text-center font-medium hover:opacity-90 transition"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="w-full py-3 px-6 border border-border rounded-lg text-center font-medium hover:bg-secondary transition"
          >
            Criar Conta
          </Link>
        </div>
      </div>
    </div>
  );
}
