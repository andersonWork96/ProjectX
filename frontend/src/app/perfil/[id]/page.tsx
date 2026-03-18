"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { UserProfile, Post, PagedResponse } from "@/lib/types";
import { PostCard } from "@/components/post-card";
import { Navbar } from "@/components/navbar";
import { ArrowLeft, User, Star, MessageCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5010";

export default function PerfilPage() {
  const params = useParams();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const userId = Number(params.id);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isInterested, setIsInterested] = useState(false);

  const isMe = authUser?.id === userId;

  useEffect(() => {
    const load = async () => {
      try {
        const [profileData, postsData] = await Promise.all([
          api.get<UserProfile>(`/api/profile/${userId}`),
          api.get<PagedResponse<Post>>(`/api/posts/user/${userId}?page=1&pageSize=50`),
        ]);
        setProfile(profileData);
        setPosts(postsData.items);
        setIsFollowing(profileData.isFollowedByMe);
        setIsInterested(profileData.isInterestedByMe);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handleFollow = async () => {
    try {
      const res = await api.post<{ followed: boolean }>(`/api/users/${userId}/follow`);
      setIsFollowing(res.followed);
      setProfile((prev) =>
        prev
          ? { ...prev, followersCount: prev.followersCount + (res.followed ? 1 : -1) }
          : prev
      );
    } catch { /* ignore */ }
  };

  const handleInterest = async () => {
    try {
      const res = await api.post<{ interested: boolean }>(`/api/users/${userId}/interest`);
      setIsInterested(res.interested);
    } catch { /* ignore */ }
  };

  const handleChat = async () => {
    try {
      const res = await api.post<{ id: number }>(`/api/chats/start/${userId}`);
      router.push(`/chat/${res.id}`);
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Perfil não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-lg mx-auto pt-16 pb-20">
        {/* Header */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => router.back()}>
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold">{profile.name}</h1>
            {profile.companionProfile?.verified && (
              <CheckCircle size={18} className="text-primary" />
            )}
          </div>

          <div className="flex items-center gap-6">
            {/* Avatar */}
            {profile.avatarUrl ? (
              <img
                src={`${API_URL}${profile.avatarUrl}`}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                <User size={32} className="text-muted-foreground" />
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-6 text-center">
              <div>
                <p className="font-bold">{profile.postsCount}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div>
                <p className="font-bold">{profile.followersCount}</p>
                <p className="text-xs text-muted-foreground">Seguidores</p>
              </div>
              <div>
                <p className="font-bold">{profile.followingCount}</p>
                <p className="text-xs text-muted-foreground">Seguindo</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-3">
            <p className="font-semibold text-sm">{profile.name}</p>
            {profile.city && (
              <p className="text-xs text-muted-foreground">{profile.city}</p>
            )}
            {profile.bio && <p className="text-sm mt-1">{profile.bio}</p>}
            {profile.companionProfile?.priceRange && (
              <p className="text-sm text-primary mt-1">
                Valor: {profile.companionProfile.priceRange}
              </p>
            )}
            {profile.companionProfile?.availableFor && (
              <p className="text-xs text-muted-foreground mt-1">
                {profile.companionProfile.availableFor}
              </p>
            )}
            {profile.companionProfile && profile.companionProfile.ratingCount > 0 && (
              <p className="text-sm mt-1 flex items-center gap-1">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                {profile.companionProfile.rating.toFixed(1)} ({profile.companionProfile.ratingCount})
              </p>
            )}
          </div>

          {/* Action buttons */}
          {!isMe && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleFollow}
                className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${
                  isFollowing
                    ? "bg-secondary text-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {isFollowing ? "Seguindo" : "Seguir"}
              </button>
              <button
                onClick={handleInterest}
                className={`py-2 px-4 rounded-lg font-medium text-sm transition ${
                  isInterested
                    ? "bg-yellow-500/20 text-yellow-500"
                    : "bg-secondary text-foreground"
                }`}
              >
                <Star size={16} className={isInterested ? "fill-yellow-500" : ""} />
              </button>
              <button
                onClick={handleChat}
                className="py-2 px-4 rounded-lg bg-secondary text-foreground font-medium text-sm"
              >
                <MessageCircle size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Posts grid */}
        <div className="border-t border-border mt-4 pt-4">
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">Nenhuma publicação.</p>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </main>
    </div>
  );
}
