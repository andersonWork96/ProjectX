"use client";

import { useAuth } from "@/contexts/auth-context";
import { TopBar, BottomBar } from "@/components/navbar";
import { ArrowLeft, Check, Crown, MessageCircle, Eye, Zap, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Gratuito",
    price: "R$0",
    color: "border-border",
    badge: null,
    features: [
      { text: "Ver feed público", included: true },
      { text: "Curtir e comentar", included: true },
      { text: "Seguir criadores", included: true },
      { text: "1 solicitação de chat/dia", included: true },
      { text: "Anúncios", included: true },
      { text: "Desconto em assinaturas", included: false },
      { text: "Ver quem visitou perfil", included: false },
    ],
  },
  {
    name: "Premium",
    price: "R$24,90",
    color: "border-primary",
    badge: "bg-primary",
    features: [
      { text: "Tudo do Gratuito", included: true },
      { text: "Selo Premium", included: true },
      { text: "Sem anúncios", included: true },
      { text: "5 solicitações de chat/dia", included: true },
      { text: "10% desconto em assinaturas", included: true },
      { text: "Ver quem visitou perfil", included: true },
      { text: "Solicitações ilimitadas", included: false },
    ],
  },
  {
    name: "Elite",
    price: "R$49,90",
    color: "border-yellow-500",
    badge: "bg-yellow-500",
    features: [
      { text: "Tudo do Premium", included: true },
      { text: "Selo Elite dourado", included: true },
      { text: "Solicitações de chat ilimitadas", included: true },
      { text: "20% desconto em assinaturas", included: true },
      { text: "Destaque nos comentários", included: true },
      { text: "Suporte prioritário", included: true },
      { text: "Acesso antecipado a criadores", included: true },
    ],
  },
];

export default function PlanosPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <>
      <TopBar />
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()}><ArrowLeft size={24} /></button>
          <h1 className="text-xl font-bold">Planos da Plataforma</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Escolha um plano para ter mais benefícios na plataforma. Os planos de criadores são separados.
        </p>

        <div className="flex flex-col gap-4">
          {plans.map((plan) => {
            const isCurrent = user?.platformPlan === plan.name.toLowerCase();
            return (
              <div key={plan.name} className={`rounded-xl border-2 p-4 ${plan.color} ${isCurrent ? "bg-card" : ""}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {plan.badge && <Crown size={18} className={plan.name === "Elite" ? "text-yellow-500" : "text-primary"} />}
                    <span className="font-bold text-lg">{plan.name}</span>
                    {isCurrent && <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full">ATUAL</span>}
                  </div>
                  <span className="font-bold text-lg">{plan.price}<span className="text-xs text-muted-foreground">/mês</span></span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {plan.features.map((f, i) => (
                    <span key={i} className={`text-sm flex items-center gap-2 ${f.included ? "" : "text-muted-foreground/40"}`}>
                      <Check size={14} className={f.included ? "text-green-500" : "text-muted-foreground/20"} />
                      {f.text}
                    </span>
                  ))}
                </div>
                {!isCurrent && (
                  <button className="w-full mt-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                    Em breve
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <BottomBar />
    </>
  );
}
