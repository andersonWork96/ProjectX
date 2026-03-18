"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, User } from "lucide-react";
import { api } from "@/lib/api";
import { Post } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5010";

interface PostCardProps {
  post: Post;
  onLikeToggle?: (postId: number, liked: boolean) => void;
}

export function PostCard({ post, onLikeToggle }: PostCardProps) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [currentImage, setCurrentImage] = useState(0);

  const handleLike = async () => {
    try {
      const res = await api.post<{ liked: boolean }>(`/api/posts/${post.id}/like`);
      setLiked(res.liked);
      setLikesCount((prev) => (res.liked ? prev + 1 : prev - 1));
      onLikeToggle?.(post.id, res.liked);
    } catch {
      // Silently fail if not logged in
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="border-b border-border pb-4 mb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3 px-4">
        <Link href={`/perfil/${post.userId}`} className="flex items-center gap-3">
          {post.userAvatarUrl ? (
            <img
              src={`${API_URL}${post.userAvatarUrl}`}
              alt={post.userName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <User size={20} className="text-muted-foreground" />
            </div>
          )}
          <span className="font-semibold text-sm">{post.userName}</span>
        </Link>
        <span className="text-muted-foreground text-xs ml-auto">{timeAgo(post.createdAt)}</span>
      </div>

      {/* Images */}
      {post.images.length > 0 && (
        <div className="relative">
          <img
            src={`${API_URL}${post.images[currentImage]}`}
            alt="Post"
            className="w-full aspect-square object-cover"
          />
          {post.images.length > 1 && (
            <>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {post.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-1.5 h-1.5 rounded-full transition ${
                      i === currentImage ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
              {currentImage > 0 && (
                <button
                  onClick={() => setCurrentImage((p) => p - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center"
                >
                  &lt;
                </button>
              )}
              {currentImage < post.images.length - 1 && (
                <button
                  onClick={() => setCurrentImage((p) => p + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center"
                >
                  &gt;
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 mt-3">
        <button onClick={handleLike} className="flex items-center gap-1">
          <Heart
            size={24}
            className={liked ? "fill-red-500 text-red-500" : "text-foreground"}
          />
        </button>
        <Link href={`/feed?post=${post.id}`} className="flex items-center gap-1">
          <MessageCircle size={24} />
        </Link>
      </div>

      {/* Likes count */}
      <p className="px-4 mt-1 text-sm font-semibold">
        {likesCount} {likesCount === 1 ? "curtida" : "curtidas"}
      </p>

      {/* Caption */}
      {post.caption && (
        <p className="px-4 mt-1 text-sm">
          <span className="font-semibold mr-1">{post.userName}</span>
          {post.caption}
        </p>
      )}

      {/* Comments link */}
      {post.commentsCount > 0 && (
        <p className="px-4 mt-1 text-sm text-muted-foreground">
          Ver {post.commentsCount === 1 ? "1 comentário" : `todos os ${post.commentsCount} comentários`}
        </p>
      )}
    </div>
  );
}
