"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Post, PagedResponse } from "@/lib/types";
import { PostCard } from "@/components/post-card";
import { Navbar } from "@/components/navbar";

export default function FeedPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const loadPosts = useCallback(async (pageNum: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await api.get<PagedResponse<Post>>(
        `/api/posts/feed?page=${pageNum}&pageSize=10`
      );
      setPosts((prev) => (pageNum === 1 ? data.items : [...prev, ...data.items]));
      setHasMore(data.hasMore);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    if (user) {
      loadPosts(1);
    }
  }, [user]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => {
            const nextPage = prev + 1;
            loadPosts(nextPage);
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-lg mx-auto pt-16 pb-20">
        {posts.length === 0 && !loading && (
          <div className="text-center text-muted-foreground py-20">
            <p className="text-lg">Nenhuma publicação ainda.</p>
            <p className="text-sm mt-2">Seja o primeiro a postar!</p>
          </div>
        )}

        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        <div ref={observerRef} className="h-10" />

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </main>
    </div>
  );
}
