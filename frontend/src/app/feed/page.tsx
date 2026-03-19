"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Post, PagedResponse } from "@/lib/types";
import { PostCard } from "@/components/post-card";
import { TopBar, BottomBar } from "@/components/navbar";
import { LocationModal } from "@/components/location-modal";
import { RefreshCw } from "lucide-react";

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const pageRef = useRef(1);
  const observerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const loadPosts = useCallback(async (pageNum: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await api.get<PagedResponse<Post>>(`/api/posts/feed?page=${pageNum}&pageSize=10`);
      setPosts(prev => pageNum === 1 ? data.items : [...prev, ...data.items]);
      setHasMore(data.hasMore);
    } catch { /* ignore */ }
    setLoading(false);
  }, [loading]);

  const refreshFeed = () => {
    pageRef.current = 1;
    setPosts([]);
    setHasMore(true);
    loadPosts(1);
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    loadPosts(1);
    api.post("/api/admin/visit").catch(() => {});
  }, []);

  useEffect(() => {
    if (user && !user.hasLocation) {
      const timer = setTimeout(() => setShowLocationModal(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          pageRef.current += 1;
          loadPosts(pageRef.current);
        }
      },
      { threshold: 0.1 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  if (authLoading) return null;

  return (
    <>
      <TopBar />
      <main ref={mainRef} className="flex-1 overflow-y-auto scrollbar-hide">
        {posts.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-lg text-white/30">Nenhuma publicação ainda.</p>
            <p className="text-sm text-white/15 mt-2">Seja o primeiro a postar!</p>
          </div>
        )}

        {posts.map((post) => (
          <PostCard key={post.id} post={post} onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))} />
        ))}

        <div ref={observerRef} className="h-10" />

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block w-6 h-6 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Fim do feed - refresh */}
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-8 pb-4">
            <p className="text-xs text-white/20 mb-3">Você viu tudo por agora</p>
            <button onClick={refreshFeed}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-full text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition">
              <RefreshCw size={14} /> Voltar ao início
            </button>
          </div>
        )}
      </main>
      <BottomBar />
      <LocationModal open={showLocationModal} onClose={() => setShowLocationModal(false)} />
    </>
  );
}
