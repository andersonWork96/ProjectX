"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { imgSrc } from "@/lib/image";
import { Comment } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";
import { X, Send, User, Trash2 } from "lucide-react";
import Link from "next/link";

interface CommentsDrawerProps {
  open: boolean;
  postId: number | null;
  onClose: () => void;
  onCountChange?: (postId: number, delta: number) => void;
}

export function CommentsDrawer({ open, postId, onClose, onCountChange }: CommentsDrawerProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !postId) return;
    setLoading(true);
    api.get<Comment[]>(`/api/posts/${postId}/comments`)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, postId]);

  const handleSend = async () => {
    if (!text.trim() || !postId || sending) return;
    setSending(true);
    try {
      const comment = await api.post<Comment>(`/api/posts/${postId}/comments`, { text: text.trim() });
      setComments(prev => [...prev, comment]);
      setText("");
      onCountChange?.(postId, 1);
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 100);
    } catch { /* ignore */ }
    setSending(false);
  };

  const handleDelete = async (commentId: number) => {
    try {
      await api.delete(`/api/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
      if (postId) onCountChange?.(postId, -1);
    } catch { /* ignore */ }
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

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[90] transition-all duration-300 ${open ? "opacity-100 backdrop-blur-sm bg-black/40" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed bottom-0 left-0 right-0 z-[95] transition-transform duration-400 ease-out ${open ? "translate-y-0" : "translate-y-full"}`}>
        <div className="mx-auto max-w-[430px] bg-[hsl(var(--popover))] border-t border-white/[0.06] rounded-t-3xl overflow-hidden shadow-2xl"
          style={{ maxHeight: "70vh" }}>

          {/* Handle + header */}
          <div className="flex flex-col items-center pt-2 pb-3 px-4 border-b border-white/[0.06]">
            <div className="w-10 h-1 rounded-full bg-white/10 mb-3" />
            <div className="flex items-center justify-between w-full">
              <h3 className="text-sm font-bold gradient-brand-text">Comentários</h3>
              <button onClick={onClose} className="w-7 h-7 rounded-xl bg-white/[0.05] flex items-center justify-center hover:bg-white/[0.1] transition">
                <X size={14} className="text-white/40" />
              </button>
            </div>
          </div>

          {/* Comments list */}
          <div ref={listRef} className="overflow-y-auto scrollbar-hide px-4 py-3" style={{ maxHeight: "calc(70vh - 130px)" }}>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-[hsl(var(--accent))] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-white/20">Nenhum comentário ainda</p>
                <p className="text-[11px] text-white/10 mt-1">Seja o primeiro a comentar</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 group">
                    <Link href={`/perfil/${comment.userId}`} className="flex-shrink-0">
                      {comment.userAvatarUrl ? (
                        <img src={imgSrc(comment.userAvatarUrl)} alt="" className="w-8 h-8 rounded-xl object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                          <User size={12} className="text-white/40" />
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/perfil/${comment.userId}`} className="text-xs font-bold text-white/80 hover:text-white transition">
                          {comment.userName}
                        </Link>
                        {comment.subscriptionBadge && (
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-bold ${
                            comment.subscriptionBadge === "vip"
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          }`}>
                            {comment.subscriptionBadge === "vip" ? "VIP" : "FÃ"}
                          </span>
                        )}
                        <span className="text-[9px] text-white/15">{timeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-[13px] text-white/50 leading-relaxed mt-0.5">{comment.text}</p>
                    </div>
                    {(user?.id === comment.userId || user?.isAdmin) && (
                      <button onClick={() => handleDelete(comment.id)}
                        className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition">
                        <Trash2 size={11} className="text-red-400/60" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          {user && (
            <div className="px-4 py-3 border-t border-white/[0.06] bg-[hsl(var(--card))]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Adicionar comentário..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  maxLength={500}
                  className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]/30"
                />
                <button onClick={handleSend} disabled={!text.trim() || sending}
                  className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center disabled:opacity-30 transition shadow-lg shadow-pink-500/10">
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
