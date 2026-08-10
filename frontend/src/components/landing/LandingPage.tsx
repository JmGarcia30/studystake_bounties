import { LandingNavbar } from "./LandingNavbar";
import { LandingHero } from "./LandingHero";
import { LandingProblemSolution } from "./LandingProblemSolution";
import { LandingHowItWorks } from "./LandingHowItWorks";
import { PublicBountyPreview } from "./PublicBountyPreview";
import { LandingFeatures } from "./LandingFeatures";
import { LandingBenefits } from "./LandingBenefits";
import { LandingCTA } from "./LandingCTA";
import { LandingFooter } from "./LandingFooter";

interface Props {
  onConnectWallet: () => void;
  onLaunchApp: () => void;
}

export function LandingPage({ onConnectWallet, onLaunchApp }: Props) {
  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B1120] text-slate-100 font-sans selection:bg-[#6C5CE7] selection:text-white flex flex-col justify-between">
      {/* 1. Public Landing Navbar */}
      <LandingNavbar
        onConnectWallet={onConnectWallet}
        onLaunchApp={onLaunchApp}
        onScrollToSection={handleScrollToSection}
      />

      {/* 2. Split Hero Section with Product Visualization */}
      <LandingHero
        onConnectWallet={onConnectWallet}
        onExploreBounties={() => handleScrollToSection("bounties")}
      />

      {/* 3. Problem & Solution Section */}
      <LandingProblemSolution />

      {/* 4. How StudyStake Works Section */}
      <LandingHowItWorks />

      {/* 5. Read-Only Public Bounty Preview Section */}
      <PublicBountyPreview onConnectWallet={onConnectWallet} />

      {/* 6. Features Section (User Benefits First) */}
      <LandingFeatures />

      {/* 7. Benefits Section (Student vs Sponsor) */}
      <LandingBenefits />

      {/* 8. Bottom Conversion CTA Section */}
      <LandingCTA onConnectWallet={onConnectWallet} />

      {/* 9. Public Footer */}
      <LandingFooter onScrollToSection={handleScrollToSection} />
    </div>
  );
}
