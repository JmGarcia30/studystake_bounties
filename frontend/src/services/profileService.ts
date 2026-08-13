import type { UserProfile } from "../types/user";
import { fetchUserProfile, saveUserProfile } from "./userService";

/**
 * Profile Service Layer Abstraction
 * Enforces clean separation between UI components and database persistence logic.
 */
export async function getProfile(walletAddress: string): Promise<UserProfile | null> {
  return fetchUserProfile(walletAddress);
}

export async function updateProfile(profile: UserProfile): Promise<UserProfile> {
  return saveUserProfile(profile);
}
