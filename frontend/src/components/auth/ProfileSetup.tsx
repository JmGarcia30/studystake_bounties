import { useState } from "react";
import { GraduationCap, Briefcase, UserCheck, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import type { UserRole } from "../../types/user";

export function ProfileSetup() {
  const { walletAddress, createProfile, loadingStep, authError, clearError } = useAuth();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [validationError, setValidationError] = useState<string | null>(null);

  const isSaving = loadingStep === "loading_profile";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError("Full Name is required.");
      return;
    }
    if (!username.trim()) {
      setValidationError("Username is required.");
      return;
    }

    const formattedHandle = username.trim().startsWith("@")
      ? username.trim()
      : `@${username.trim()}`;

    try {
      await createProfile({
        name: name.trim(),
        username: formattedHandle,
        bio: bio.trim() || "Studying and staking micro-bounties on StudyStake.",
        role,
      });
    } catch {
      // Auth error handled in context
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-slate-100 flex items-center justify-center p-6 selection:bg-[#6C5CE7] selection:text-white font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6C5CE7]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl z-10 relative">
        {/* Top Icon & Heading */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6C5CE7] to-indigo-500 flex items-center justify-center shadow-lg shadow-[#6C5CE7]/30 mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Complete Your Profile</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Set up your StudyStake identity linked to your Stellar Wallet address.
          </p>
          {walletAddress && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {walletAddress.slice(0, 8)}…{walletAddress.slice(-6)}
            </div>
          )}
        </div>

        {/* Errors */}
        {(validationError || authError) && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{validationError || authError}</span>
            </div>
            <button
              onClick={() => {
                setValidationError(null);
                clearError();
              }}
              className="text-slate-400 hover:text-white text-[11px] underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Select Your Primary Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  role === "student"
                    ? "bg-[#6C5CE7]/20 border-[#6C5CE7] text-white shadow-md shadow-[#6C5CE7]/10"
                    : "bg-slate-800/60 border-slate-700/80 text-slate-400 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <UserCheck className={`w-4 h-4 ${role === "student" ? "text-[#6C5CE7]" : "text-slate-400"}`} />
                  {role === "student" && <span className="w-2 h-2 rounded-full bg-[#6C5CE7]" />}
                </div>
                <span className="text-xs font-bold text-white mt-1">Student Hunter</span>
                <span className="text-[10px] text-slate-400">Complete tasks & earn bounties</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("sponsor")}
                className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                  role === "sponsor"
                    ? "bg-indigo-500/20 border-indigo-400 text-white shadow-md shadow-indigo-500/10"
                    : "bg-slate-800/60 border-slate-700/80 text-slate-400 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Briefcase className={`w-4 h-4 ${role === "sponsor" ? "text-indigo-400" : "text-slate-400"}`} />
                  {role === "sponsor" && <span className="w-2 h-2 rounded-full bg-indigo-400" />}
                </div>
                <span className="text-xs font-bold text-white mt-1">Sponsor / Employer</span>
                <span className="text-[10px] text-slate-400">Fund bounties & verify proof</span>
              </button>
            </div>
          </div>

          {/* Full Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Full Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Username Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Username <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alex_scholar"
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Bio Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Bio / Bio Goal</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief summary of your learning path or sponsorship interests..."
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7] resize-none"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#6C5CE7] to-indigo-600 hover:from-[#5B4BD6] hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-[#6C5CE7]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile…</span>
              </>
            ) : (
              <>
                <span>Save &amp; Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
