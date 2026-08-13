import { useState } from "react";
import { X, Send, Link as LinkIcon, FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import type { Bounty } from "../../types/bounty";
import { submitBountyProof } from "../../services/bountyService";
import { useAuth } from "../../hooks/useAuth";

interface Props {
  bounty: Bounty;
  onClose: () => void;
  onSuccess: () => void;
}

export function SubmitProofModal({ bounty, onClose, onSuccess }: Props) {
  const { walletAddress, userProfile } = useAuth();

  const [proofUrl, setProofUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl.trim()) {
      setError("Please provide a valid proof link (e.g. GitHub URL or PR).");
      return;
    }
    if (!walletAddress) {
      setError("Please connect your Stellar wallet first.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitBountyProof({
        bountyId: bounty.id,
        contributor: {
          walletAddress,
          displayName: userProfile?.name || "Student Scholar",
        },
        proofUrl: proofUrl.trim(),
        notes: notes.trim(),
      });
      setSubmittedSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to submit bounty proof.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 selection:bg-[#6C5CE7] selection:text-white font-sans animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6C5CE7] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              Submit Task Proof
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-2 line-clamp-1">{bounty.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Proof Submitted Successfully!</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your solution has been submitted to {bounty.creator.displayName} for review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Proof URL */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[#6C5CE7]" />
                <span>Proof URL (GitHub Repo / PR / Doc)</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://github.com/yourhandle/bounty-submission"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7]"
              />
            </div>

            {/* Submission Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Solution Overview &amp; Verification Notes</span>
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe key changes, test runs, or logic proofs completed..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7] resize-none"
              />
            </div>

            {/* Bounty Reward Summary */}
            <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Bounty Reward Allocation:</span>
              <span className="font-extrabold text-[#6C5CE7]">{bounty.rewardXlm} XLM</span>
            </div>

            {/* Action CTAs */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#6C5CE7] hover:bg-[#5B4BD6] text-white text-xs font-bold shadow-xs flex items-center gap-2 disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Proof…</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Proof</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
