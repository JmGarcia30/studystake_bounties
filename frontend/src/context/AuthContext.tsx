import { createContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { UserProfile, UserRole, AuthLoadingStep } from "../types/user";
import { stellarAdapter, createAuthChallenge, verifyWalletSignature } from "../lib/stellar";
import { fetchUserProfile, saveUserProfile } from "../services/userService";

export interface AuthContextValue {
  walletAddress: string | null;
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  role: UserRole;
  isProfileComplete: boolean;
  loadingStep: AuthLoadingStep;
  authError: string | null;
  connectAndVerifyWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  createProfile: (data: { name: string; username: string; bio: string; role: UserRole }) => Promise<void>;
  updateRole: (role: UserRole) => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const CACHED_ADDRESS_KEY = "studystake_active_wallet";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>("student");
  const [loadingStep, setLoadingStep] = useState<AuthLoadingStep>("idle");
  const [authError, setAuthError] = useState<string | null>(null);

  // Restore session from cached wallet address on load
  const loadSavedSession = useCallback(async (addr: string) => {
    setLoadingStep("loading_profile");
    try {
      const profile = await fetchUserProfile(addr);
      setWalletAddress(addr);
      setIsAuthenticated(true);
      if (profile) {
        setUserProfile(profile);
        setRole(profile.role);
      }
    } catch (err: any) {
      console.error("Failed to load saved session", err);
    } finally {
      setLoadingStep("idle");
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(CACHED_ADDRESS_KEY);
    if (saved) {
      loadSavedSession(saved);
    }
  }, [loadSavedSession]);

  const connectAndVerifyWallet = async () => {
    setAuthError(null);
    try {
      // 1. Connect wallet
      setLoadingStep("connecting");
      const address = await stellarAdapter.connect();
      if (!address) {
        throw new Error("No address returned from Stellar wallet");
      }

      // 2. Issue signature challenge
      setLoadingStep("signing");
      const challenge = createAuthChallenge(address);
      const signature = await stellarAdapter.signMessage(challenge, address);

      // 3. Verify signature
      setLoadingStep("verifying");
      const isValid = await verifyWalletSignature(address, signature, challenge);
      if (!isValid) {
        throw new Error("Wallet signature verification failed");
      }

      // 4. Load profile
      setLoadingStep("loading_profile");
      const profile = await fetchUserProfile(address);
      
      setWalletAddress(address);
      setIsAuthenticated(true);
      localStorage.setItem(CACHED_ADDRESS_KEY, address);

      if (profile) {
        setUserProfile(profile);
        setRole(profile.role);
      } else {
        setUserProfile(null);
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to authenticate wallet");
      setIsAuthenticated(false);
    } finally {
      setLoadingStep("idle");
    }
  };

  const disconnectWallet = async () => {
    setLoadingStep("idle");
    try {
      await stellarAdapter.disconnect();
    } catch {
      // ignore disconnect errors
    } finally {
      setWalletAddress(null);
      setIsAuthenticated(false);
      setUserProfile(null);
      setRole("student");
      localStorage.removeItem(CACHED_ADDRESS_KEY);
    }
  };

  const createProfile = async (data: { name: string; username: string; bio: string; role: UserRole }) => {
    if (!walletAddress) {
      throw new Error("Wallet address missing for profile creation");
    }
    setLoadingStep("loading_profile");
    setAuthError(null);

    try {
      const newProfile: UserProfile = {
        walletAddress,
        name: data.name,
        username: data.username.startsWith("@") ? data.username : `@${data.username}`,
        bio: data.bio,
        role: data.role,
        createdAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString(),
      };

      const saved = await saveUserProfile(newProfile);
      setUserProfile(saved);
      setRole(saved.role);
    } catch (err: any) {
      setAuthError(err.message || "Failed to save profile");
      throw err;
    } finally {
      setLoadingStep("idle");
    }
  };

  const updateRole = (newRole: UserRole) => {
    setRole(newRole);
    if (userProfile && walletAddress) {
      const updated = { ...userProfile, role: newRole };
      setUserProfile(updated);
      saveUserProfile(updated).catch(console.error);
    }
  };

  const clearError = () => setAuthError(null);

  const isProfileComplete = Boolean(userProfile && userProfile.name && userProfile.username);

  return (
    <AuthContext.Provider
      value={{
        walletAddress,
        isAuthenticated,
        userProfile,
        role,
        isProfileComplete,
        loadingStep,
        authError,
        connectAndVerifyWallet,
        disconnectWallet,
        createProfile,
        updateRole,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
