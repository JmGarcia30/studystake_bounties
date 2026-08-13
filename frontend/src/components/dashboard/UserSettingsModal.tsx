import { useState } from "react";
import { X, User, Copy, Check, ShieldCheck, GraduationCap, Briefcase, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import type { UserRole } from "../../types/user";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function UserSettingsModal({ isOpen, onClose }: Props) {
  const { walletAddress, userProfile, createProfile, updateRole } = useAuth();

  const [name, setName] = useState(userProfile?.name || "");
  const [username, setUsername] = useState(userProfile?.username || "");
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [role, setRoleState] = useState<UserRole>(userProfile?.role || "student");
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const formattedHandle = username.trim().startsWith("@") ? username.trim() : `@${username.trim()}`;
      await createProfile({
        name: name.trim(),
        username: formattedHandle,
        bio: bio.trim(),
        role,
      });
      updateRole(role);
      onClose();
    } catch {
      // Handled in context
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-[#6C5CE7]" />
            <h3 className="text-base font-bold text-slate-900 m-0">Account Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Public Key Card */}
        {walletAddress && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Stellar Wallet Identity
              </span>
              <button
                onClick={handleCopy}
                className="text-[11px] font-semibold text-[#6C5CE7] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Key"}</span>
              </button>
            </div>
            <p className="text-[11px] font-mono text-slate-500 break-all m-0">{walletAddress}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Role Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Primary Account Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRoleState("student")}
                className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  role === "student"
                    ? "bg-[#6C5CE7]/10 border-[#6C5CE7] text-slate-900 font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <GraduationCap className="w-4 h-4 text-[#6C5CE7]" />
                <span className="text-xs">Student Hunter</span>
              </button>

              <button
                type="button"
                onClick={() => setRoleState("sponsor")}
                className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  role === "sponsor"
                    ? "bg-indigo-500/10 border-indigo-500 text-slate-900 font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <Briefcase className="w-4 h-4 text-indigo-500" />
                <span className="text-xs">Sponsor</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Username Handle</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Bio / Learning Path</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:bg-white focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#6C5CE7] hover:bg-[#5B4BD6] text-white text-xs font-bold shadow-xs flex items-center gap-2 disabled:opacity-75"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
