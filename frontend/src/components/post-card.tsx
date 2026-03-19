"use client";

import { useState, useRef, TouchEvent } from "react";
import Link from "next/link";
import { Heart, MessageCircle, User, MoreVertical, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { imgSrc } from "@/lib/image";
import { Post } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";
import { AuthModal } from "@/components/auth-modal";

interface PostCardProps {
  post: Post;
  onDelete?: (postId: number) => void;
}

export function PostCard({ post, onDelete }: PostCardProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [currentImage, setCurrentImage] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const touchStartX = useRef(0);

  const isMyPost = user?.id === post.userId;
  const isAdmin = user?.isAdmin;

  const requireAuth = (action: () => void) => {
    if (!user) { setShowAuthModal(true); return; }
    action();
  };

  const handleLike = async () => {
    try {
      const res = await api.post<{ liked: boolean }>(`/api/posts/${post.id}/like`);
      setLiked(res.liked);
      setLikesCount(prev => (res.liked ? prev + 1 : prev - 1));
    } catch { /* ignore */ }
  };

  const handleDelete = async () => {
    const msg = isAdmin && !isMyPost
      ? "Remover por violação? O usuário será notificado."
      : "Excluir esta publicação?";
    if (!confirm(msg)) return;
    setDeleting(true);
    try {
      if (isAdmin && !isMyPost) await api.delete(`/api/admin/posts/${post.id}`);
      else await api.delete(`/api/posts/${post.id}`);
      onDelete?.(post.id);
    } catch { /* ignore */ }
    setDeleting(false);
    setShowMenu(false);
  };

  const handleTouchStart = (e: TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentImage < post.images.length - 1) setCurrentImage(p => p + 1);
      else if (diff < 0 && currentImage > 0) setCurrentImage(p => p - 1);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!user) { e.preventDefault(); setShowAuthModal(true); }
  };

  if (deleting) return null;

  return (
    <>
      <div className="mx-3 mb-5 rounded-[20px] overflow-hidden bg-card border border-white/[0.04] glow-sm">
        {/* Image */}
        {post.images.length > 0 && (
          <div className="relative overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <div className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentImage * 100}%)` }}>
              {post.images.map((img, i) => (
                <img key={i} src={imgSrc(img)} alt="" className="w-full aspect-[3/4] object-cover flex-shrink-0" />
              ))}
            </div>

            {/* Áreas clicáveis para navegar fotos (desktop) */}
            {post.images.length > 1 && (
              <>
                {currentImage > 0 && (
                  <button onClick={() => setCurrentImage(p => p - 1)}
                    className="absolute left-0 top-0 bottom-0 w-1/3 z-[5] cursor-pointer" />
                )}
                {currentImage < post.images.length - 1 && (
                  <button onClick={() => setCurrentImage(p => p + 1)}
                    className="absolute right-0 top-0 bottom-0 w-1/3 z-[5] cursor-pointer" />
                )}
              </>
            )}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

            {/* User info - bottom left */}
            <Link href={`/perfil/${post.userId}`} onClick={handleProfileClick}
              className="absolute bottom-12 left-3 flex items-center gap-2.5 z-10">
              <div className="relative">
                {post.userAvatarUrl ? (
                  <img src={imgSrc(post.userAvatarUrl)} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-[hsl(var(--accent))]/50" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center ring-2 ring-[hsl(var(--accent))]/50">
                    <User size={14} className="text-white" />
                  </div>
                )}
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${post.userIsOnline ? "bg-green-500" : "bg-red-500"}`} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-white text-[13px] font-bold drop-shadow-lg">{post.userName}</span>
                {post.userIsCreator && <span className="text-[9px] gradient-brand text-white px-1.5 py-0.5 rounded-full font-bold">PRO</span>}
                <span className="text-white/40 text-[10px] ml-0.5">{timeAgo(post.createdAt)}</span>
              </div>
            </Link>

            {/* Right side actions - vertical */}
            <div className="absolute right-3 bottom-12 flex flex-col items-center gap-4 z-10">
              <button onClick={() => requireAuth(handleLike)} className="flex flex-col items-center gap-0.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition ${liked ? "gradient-hot animate-pulse-glow" : "bg-black/30 backdrop-blur-sm"}`}>
                  <Heart size={18} className={liked ? "fill-white text-white" : "text-white"} />
                </div>
                <span className={`text-[10px] font-bold ${liked ? "text-[hsl(var(--accent))]" : "text-white/60"}`}>{likesCount}</span>
              </button>
              <button onClick={() => requireAuth(() => { window.location.href = `/chat/solicitar/${post.userId}`; })} className="flex flex-col items-center gap-0.5">
                <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                  <MessageCircle size={18} className="text-white" />
                </div>
                <span className="text-[10px] text-white/60 font-bold">{post.commentsCount}</span>
              </button>
            </div>

            {/* Menu (own post / admin) */}
            {(isMyPost || isAdmin) && (
              <div className="absolute top-3 right-3 z-10">
                <button onClick={() => setShowMenu(!showMenu)}
                  className="w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <MoreVertical size={14} className="text-white" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-10 bg-card/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[130px]">
                    <button onClick={handleDelete}
                      className="flex items-center gap-2 px-3 py-2.5 text-red-400 hover:bg-white/5 w-full text-left text-xs">
                      <Trash2 size={12} /> {isAdmin && !isMyPost ? "Remover" : "Excluir"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Counter */}
            {post.images.length > 1 && (
              <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full z-10">
                <span className="text-white text-[10px] font-bold">{currentImage + 1}/{post.images.length}</span>
              </div>
            )}
          </div>
        )}

        {/* Caption - below image */}
        {post.caption && (
          <div className="px-4 py-3">
            <p className="text-[13px] text-white/70 leading-relaxed">
              <span className="font-bold text-white mr-1">{post.userName}</span>
              {post.caption}
            </p>
          </div>
        )}
      </div>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
