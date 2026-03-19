"use client";

import { useState, useRef, TouchEvent } from "react";
import Link from "next/link";
import { Heart, MessageCircle, User, MoreVertical, Trash2, Lock, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { imgSrc } from "@/lib/image";
import { Post } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";
import { AuthModal } from "@/components/auth-modal";
import { CommentsDrawer } from "@/components/comments-drawer";

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
  const [doubleTapHeart, setDoubleTapHeart] = useState(false);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const touchStartX = useRef(0);
  const lastTap = useRef(0);

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

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!liked) {
        requireAuth(handleLike);
      }
      setDoubleTapHeart(true);
      setTimeout(() => setDoubleTapHeart(false), 800);
    }
    lastTap.current = now;
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
      <div className="mx-4 mb-6 relative group">
        {/* Gradient border glow effect */}
        <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-[hsl(var(--accent))]/20 via-purple-500/10 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[1px]" />

        {/* Main card - Glassmorphism */}
        <div className="relative rounded-3xl overflow-hidden bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

          {/* User header bar - floating glass */}
          <div className="relative z-10 flex items-center justify-between px-4 py-3">
            <Link href={`/perfil/${post.userId}`} onClick={handleProfileClick}
              className="flex items-center gap-3">
              <div className="relative">
                <div className={`rounded-2xl overflow-hidden ${post.userIsOnline ? "ring-2 ring-green-400/60 shadow-[0_0_12px_rgba(74,222,128,0.3)]" : "ring-1 ring-white/10"}`}>
                  {post.userAvatarUrl ? (
                    <img src={imgSrc(post.userAvatarUrl)} alt="" className="w-10 h-10 object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600/40 to-pink-600/40 flex items-center justify-center">
                      <User size={16} className="text-white/60" />
                    </div>
                  )}
                </div>
                {post.userIsOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[hsl(var(--background))] shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white/90">{post.userName}</span>
                  {post.userIsCreator && (
                    <span className="text-[8px] bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-0.5 rounded-md font-bold tracking-wide">
                      PRO
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {post.userIsOnline && (
                    <span className="text-[9px] text-green-400 font-semibold">online</span>
                  )}
                  {post.userIsOnline && <span className="text-white/10 text-[9px]">·</span>}
                  <span className="text-[10px] text-white/25">{timeAgo(post.createdAt)}</span>
                </div>
              </div>
            </Link>

            {/* Menu */}
            {(isMyPost || isAdmin) && (
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)}
                  className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center transition">
                  <MoreVertical size={14} className="text-white/40" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-10 bg-[hsl(var(--popover))]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[140px] z-50">
                    <button onClick={handleDelete}
                      className="flex items-center gap-2.5 px-4 py-3 text-red-400 hover:bg-white/5 w-full text-left text-xs font-medium">
                      <Trash2 size={13} /> {isAdmin && !isMyPost ? "Remover" : "Excluir"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Image area - Cinema style */}
          {post.images.length > 0 && (
            <div className="relative overflow-hidden"
              onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onClick={handleDoubleTap}>
              <div className="flex transition-transform duration-400 ease-out"
                style={{ transform: `translateX(-${currentImage * 100}%)` }}>
                {post.images.map((img, i) => (
                  <div key={i} className="relative w-full aspect-[4/5] flex-shrink-0">
                    <img src={imgSrc(img)} alt=""
                      className={`w-full h-full object-cover transition-all duration-500 ${post.isCensored && !revealed[i] ? "blur-2xl scale-110 brightness-75" : ""}`} />
                    {post.isCensored && !revealed[i] && (
                      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                        <button onClick={(e) => { e.stopPropagation(); setRevealed(prev => { const n = [...prev]; n[i] = true; return n; }); }}
                          className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl text-[11px] text-white font-bold flex items-center gap-2 shadow-lg shadow-pink-500/20">
                          <Eye size={13} /> Revelar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Double tap heart animation */}
              {doubleTapHeart && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <Heart size={80} className="fill-white text-white animate-ping opacity-80" />
                </div>
              )}

              {/* Desktop click areas */}
              {post.images.length > 1 && (
                <>
                  {currentImage > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); setCurrentImage(p => p - 1); }}
                      className="absolute left-0 top-0 bottom-0 w-1/3 z-[5] cursor-pointer" />
                  )}
                  {currentImage < post.images.length - 1 && (
                    <button onClick={(e) => { e.stopPropagation(); setCurrentImage(p => p + 1); }}
                      className="absolute right-0 top-0 bottom-0 w-1/3 z-[5] cursor-pointer" />
                  )}
                </>
              )}

              {/* Image counter - pill */}
              {post.images.length > 1 && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="flex gap-1 bg-black/30 backdrop-blur-md rounded-full px-2.5 py-1.5">
                    {post.images.map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === currentImage ? "bg-white w-4" : "bg-white/30"
                      }`} />
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom gradient for transition to action bar */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>
          )}

          {/* Action bar - Magazine style glassmorphism */}
          <div className="relative px-4 py-3">
            {/* Actions row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <button onClick={() => requireAuth(handleLike)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    liked
                      ? "bg-gradient-to-r from-pink-500/20 to-red-500/20 border border-pink-500/30"
                      : "bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08]"
                  }`}>
                  <Heart size={15} className={liked ? "fill-pink-400 text-pink-400" : "text-white/50"} />
                  <span className={`text-xs font-bold ${liked ? "text-pink-400" : "text-white/40"}`}>{likesCount}</span>
                </button>
                <button onClick={() => requireAuth(() => setShowComments(true))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition">
                  <MessageCircle size={15} className="text-white/50" />
                  <span className="text-xs font-bold text-white/40">{commentsCount}</span>
                </button>
              </div>
            </div>

            {/* Caption - Magazine style */}
            {post.caption && (
              <div className="mt-1">
                <p className="text-xs font-bold text-white/80">{post.userName}</p>
                <p className="text-[13px] text-white/45 leading-relaxed mt-0.5">{post.caption}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <CommentsDrawer
        open={showComments}
        postId={showComments ? post.id : null}
        onClose={() => setShowComments(false)}
        onCountChange={(_, delta) => setCommentsCount(prev => prev + delta)}
      />
    </>
  );
}
