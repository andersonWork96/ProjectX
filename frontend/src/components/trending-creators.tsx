"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingCreator } from "@/lib/types";
import { api } from "@/lib/api";
import { imgSrc } from "@/lib/image";
import { Flame, User, TrendingUp } from "lucide-react";

export function TrendingCreators() {
  const [creators, setCreators] = useState<TrendingCreator[]>([]);

  useEffect(() => {
    api.get<TrendingCreator[]>("/api/feed/trending-creators")
      .then(setCreators)
      .catch(() => {});
  }, []);

  if (creators.length === 0) return null;

  return (
    <div className="mx-3 mb-5">
      <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-gradient-to-r from-[hsl(var(--card))] to-[hsl(268,20%,10%)]">
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          <div className="w-6 h-6 rounded-full gradient-hot flex items-center justify-center">
            <Flame size={12} className="text-white" />
          </div>
          <span className="text-xs font-bold text-white/80">Em Alta</span>
          <TrendingUp size={12} className="text-[hsl(var(--accent))] ml-auto" />
        </div>

        <div className="flex gap-3 px-4 pb-4 overflow-x-auto scrollbar-hide">
          {creators.map((creator) => (
            <Link key={creator.id} href={`/perfil/${creator.id}`}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 group">
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-[2px] gradient-hot">
                  {creator.avatarUrl ? (
                    <img src={imgSrc(creator.avatarUrl)} alt=""
                      className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center">
                      <User size={20} className="text-white/40" />
                    </div>
                  )}
                </div>
                {creator.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[hsl(var(--card))]" />
                )}
              </div>
              <span className="text-[10px] text-white/60 font-medium max-w-[64px] truncate group-hover:text-white/90 transition">
                {creator.name.split(" ")[0]}
              </span>
              {creator.subscribersCount > 0 && (
                <span className="text-[8px] text-[hsl(var(--accent))] font-bold">
                  {creator.subscribersCount} fans
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
