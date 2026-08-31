export type UserRole = 'USER' | 'PREMIUM_USER' | 'EDITOR' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  isSubscribed: boolean;
  subscriptionExpiry?: number;
  createdAt: number;
  updatedAt: number;
}

export type AccessType = 'FREE' | 'PREMIUM';
export type AudioStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'BLOCKED';

export interface Track {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  audioUrl: string;
  categoryId: string;
  creatorId: string;
  accessType: AccessType;
  status: AudioStatus;
  featured: boolean;
  explicitContent: boolean;
  language: string;
  releaseDate: number;
  duration: number;
  playCount: number;
  likeCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface Podcast {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverUrl: string;
  creatorId: string;
  categoryId: string;
  language: string;
  status: AudioStatus;
  featured: boolean;
  subscriberCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface Episode {
  id: string;
  podcastId: string;
  title: string;
  slug: string;
  description: string;
  episodeNumber: number;
  seasonNumber: number;
  thumbnailUrl: string;
  audioUrl: string;
  duration: number;
  accessType: AccessType;
  publishedAt: number;
  status: AudioStatus;
}

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  trackIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ListeningHistory {
  id: string;
  userId: string;
  audioId: string;
  title?: string;
  thumbnailUrl?: string;
  positionSeconds: number;
  duration: number;
  completed: boolean;
  lastPlayedAt: number;
}

export type SubscriptionStatus = 'CREATED' | 'AUTHENTICATED' | 'ACTIVE' | 'PENDING' | 'HALTED' | 'CANCELLED' | 'COMPLETED' | 'EXPIRED';
export type BillingInterval = 'MONTHLY' | 'YEARLY';

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  billingInterval: BillingInterval;
  razorpayPlanId: string;
  features: string[];
  active: boolean;
  displayOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  razorpaySubscriptionId: string;
  status: SubscriptionStatus;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId?: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  capturedAt: number;
  createdAt: number;
}
