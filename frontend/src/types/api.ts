// TypeScript interfaces matching backend DTOs

export interface UserProfileDTO {
  username: string;
  age?: number;
  country?: string;
  city?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface MatchmakingPreferencesDTO {
  mode: "FRIENDS" | "DATING" | "RANDOM" | "NETWORKING";
  age?: number;
  country?: string;
  city?: string;
  minAge?: number;
  maxAge?: number;
  allowedCountries?: string[];
  interests?: string[];
  openToAny?: boolean;
}

export interface MatchResponse {
  matchFound: boolean;
  roomId?: string;
  otherUser?: UserProfileDTO;
  sharedInterests?: string[];
  score?: number;
}

export interface MatchmakingStatusResponse {
  status: "SEARCHING" | "MATCHED" | "IDLE";
  roomId?: string;
  match?: MatchResponse;
}

export interface ConversationOpenerDTO {
  id: number;
  text: string;
  createdAt: string;
}

export interface ChatMessageDTO {
  id: number;
  roomId: string;
  sender: string;
  receiver: string;
  content?: string;
  type: "TEXT" | "IMAGE" | "FILE";
  mediaUrl?: string;
  timestamp: string;
  isRead: boolean;
  isDelivered: boolean;
  isEdited: boolean;
  editedAt?: string;
}

export interface ChatRoomDTO {
  roomId: string;
  otherUser?: UserProfileDTO;
  mode?: "FRIENDS" | "DATING" | "RANDOM" | "NETWORKING";
  lastMessagePreview?: string;
  unreadCount: number;
  lastMessageAt?: string;
  isActive?: boolean;
}

export interface UnreadCountResponse {
  totalUnread: number;
  perRoom: Record<string, number>;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: UserProfileDTO;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  age?: number;
  country?: string;
  city?: string;
  bio?: string;
}

export interface RegisterResponse {
  user: UserProfileDTO;
  accessToken?: string;
}

export interface UserRequest {
  username: string;
  email: string;
  age?: number;
  country?: string;
  city?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UserResponse {
  username: string;
  email: string;
  age?: number;
  country?: string;
  city?: string;
  bio?: string;
  avatarUrl?: string;
}

