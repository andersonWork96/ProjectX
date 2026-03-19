export interface AuthResponse {
  id: number;
  name: string;
  username: string;
  email: string;
  isCreator: boolean;
  permission: number;
  platformPlan: string;
  hasLocation: boolean;
  token: string;
}

export interface AdminStats {
  anonymousVisitsToday: number;
  creatorSubscribers: number;
  totalUsers: number;
  totalCreators: number;
  totalPosts: number;
  newUsersToday: number;
}

export interface Post {
  id: number;
  userId: number;
  userName: string;
  userAvatarUrl: string | null;
  userIsCreator: boolean;
  userIsOnline: boolean;
  caption: string | null;
  images: string[];
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  isCensored: boolean;
  createdAt: string;
}

export interface TrendingCreator {
  id: number;
  name: string;
  avatarUrl: string | null;
  isOnline: boolean;
  subscribersCount: number;
  newSubscribersWeek: number;
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
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  city: string | null;
  gender: string | null;
  isCreator: boolean;
  platformPlan: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  exclusiveCount: number;
  subscribersCount: number;
  isFollowedByMe: boolean;
  mySubscriptionPlan: string | null;
  creatorPlan: CreatorPlan | null;
}

export interface CreatorPlan {
  fanPrice: number;
  vipPrice: number;
}

export interface ExclusiveContent {
  id: number;
  caption: string | null;
  mediaType: string;
  mediaUrl: string | null;
  isLocked: boolean;
  minPlan: string;
  displayOrder: number;
  createdAt: string;
}

export interface Comment {
  id: number;
  userId: number;
  userName: string;
  userAvatarUrl: string | null;
  userPlatformPlan: string | null;
  subscriptionBadge: string | null;
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

export interface ChatRequestItem {
  id: number;
  fromUserId: number;
  fromUserName: string;
  fromUserAvatarUrl: string | null;
  message: string;
  status: string;
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
  isVip: boolean;
}

export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  text: string;
  createdAt: string;
  readAt: string | null;
}
