import type { UserProfile } from "../types/user";

const STORAGE_PREFIX = "studystake_user_profile_";

/**
 * User Service Abstraction
 * Currently uses localStorage for local session caching,
 * designed as an async abstraction for seamless backend/database integration (Supabase, PostgreSQL, REST API).
 */
export async function fetchUserProfile(walletAddress: string): Promise<UserProfile | null> {
  if (!walletAddress) return null;
  
  // Simulate network delay to match real API behavior
  await new Promise((resolve) => setTimeout(resolve, 200));

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${walletAddress}`);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch (err) {
    console.error("Failed to parse stored profile", err);
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<UserProfile> {
  if (!profile.walletAddress) {
    throw new Error("Cannot save profile without a valid wallet address");
  }

  // Simulate network latency for backend persistence readiness
  await new Promise((resolve) => setTimeout(resolve, 300));

  const updatedProfile: UserProfile = {
    ...profile,
    createdAt: profile.createdAt || new Date().toISOString(),
  };

  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${profile.walletAddress}`,
      JSON.stringify(updatedProfile)
    );
    return updatedProfile;
  } catch (err) {
    console.error("Failed to save profile", err);
    throw new Error("Unable to save profile to storage service");
  }
}
