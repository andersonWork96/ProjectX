export interface AuthResponse {
  id: number;
  name: string;
  email: string;
  permission: number;
  token: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  type: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  gender: string | null;
  birthDate: string | null;
  plan: string;
}

export interface PostImage {
  imageUrl: string;
}

export interface Post {
  id: number;
  userId: number;
  userName: string;
  userAvatarUrl: string | null;
  caption: string | null;
  images: string[];
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  createdAt: string;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  type: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  gender: string | null;
  birthDate: string | null;
  plan: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowedByMe: boolean;
  isInterestedByMe: boolean;
  companionProfile: CompanionProfile | null;
}

export interface CompanionProfile {
  priceRange: string | null;
  verified: boolean;
  rating: number;
  ratingCount: number;
  availableFor: string | null;
}

export interface Comment {
  id: number;
  userId: number;
  userName: string;
  userAvatarUrl: string | null;
  text: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  type: string;
  message: string;
  referenceId: number | null;
  read: boolean;
  createdAt: string;
}

export interface ChatItem {
  id: number;
  otherUserId: number;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  text: string;
  createdAt: string;
  readAt: string | null;
}
