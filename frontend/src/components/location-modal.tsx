"use client";

import { useState } from "react";
import { MapPin, X } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

interface LocationModalProps {
  open: boolean;
  onClose: () => void;
}

export function LocationModal({ open, onClose }: LocationModalProps) {
  const { updateUserField } = useAuth();
  const [requesting, setRequesting] = useState(false);

  if (!open) return null;

  const handleAllow = () => {
    setRequesting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await api.post("/auth/location", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          updateUserField("hasLocation", true);
        } catch { /* ignore */ }
        setRequesting(false);
        onClose();
      },
      () => {
        setRequesting(false);
        onClose();
      }
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
      <div className="relative w-full max-w-[430px] bg-background/95 backdrop-blur-xl rounded-t-3xl p-6 pb-8 animate-slide-up border-t border-white/10"
        onClick={(e) => e.stopPropagation()}>

        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="text-center mb-5">
          <div className="w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4 glow-md">
            <MapPin size={28} className="text-white" />
          </div>
          <h2 className="text-lg font-bold mb-1">Ative sua localização</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Com a localização ativa, criadores próximos aparecem para você e sua experiência fica melhor.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button onClick={handleAllow} disabled={requesting}
            className="w-full py-3.5 gradient-brand text-white rounded-xl font-semibold flex items-center justify-center gap-2 glow-md disabled:opacity-50">
            <MapPin size={16} />
            {requesting ? "Obtendo localização..." : "Ativar localização"}
          </button>
          <button onClick={onClose}
            className="w-full py-3 text-muted-foreground text-sm font-medium">
            Talvez depois
          </button>
        </div>
      </div>
    </div>
  );
}
