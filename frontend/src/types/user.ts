export type UserRole = "student" | "sponsor";

export interface UserProfile {
  walletAddress: string;
  name: string;
  username: string;
  bio: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  verifiedAt?: string;
}

export type AuthLoadingStep = "idle" | "connecting" | "signing" | "verifying" | "loading_profile";

export interface AuthState {
  walletAddress: string | null;
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  role: UserRole;
  isProfileComplete: boolean;
  loadingStep: AuthLoadingStep;
  authError: string | null;
}
