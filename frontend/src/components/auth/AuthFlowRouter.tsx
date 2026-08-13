import type { ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ProfileSetup } from "./ProfileSetup";
import { LandingPage } from "../landing/LandingPage";
import { Loader2 } from "lucide-react";

interface Props {
  children: ReactNode;
}

export function AuthFlowRouter({ children }: Props) {
  const { isAuthenticated, isProfileComplete, loadingStep, connectAndVerifyWallet } = useAuth();

  // If restoring session or initial wallet profile loading
  if (loadingStep === "loading_profile" && !isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#0F172A] flex flex-col items-center justify-center text-slate-300 gap-3 font-sans">
        <Loader2 className="w-8 h-8 text-[#6C5CE7] animate-spin" />
        <p className="text-xs font-semibold tracking-wide">Loading StudyStake Session…</p>
      </div>
    );
  }

  // 1. Wallet missing / Not authenticated -> Display main LandingPage
  if (!isAuthenticated) {
    return (
      <LandingPage
        onConnectWallet={() => connectAndVerifyWallet()}
        onLaunchApp={() => connectAndVerifyWallet()}
      />
    );
  }

  // 2. Wallet connected, but profile setup incomplete -> ProfileSetup
  if (!isProfileComplete) {
    return <ProfileSetup />;
  }

  // 3. Authenticated & complete profile -> Dashboard
  return <>{children}</>;
}
