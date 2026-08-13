import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, ClipboardCheck, Database, Loader2, MessageSquare, ShieldCheck } from "lucide-react";
import { getSupabaseConfig } from "../lib/supabase";
import { submitUserFeedback } from "../services/communityService";
import { trackEvent } from "../lib/analytics";

interface Props { walletAddress: string | null; }

export function Level4Evidence({ walletAddress }: Props) {
  const supabaseConfigured = Boolean(getSupabaseConfig());
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("evidence_page_viewed", { supabase_configured: supabaseConfigured });
  }, [supabaseConfigured]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!feedback.trim()) {
      setStatus("error");
      setError("Feedback cannot be empty.");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      await submitUserFeedback({ walletAddress, rating, feedback });
      trackEvent("feedback_submitted", { rating, wallet_connected: Boolean(walletAddress) });
      setFeedback("");
      setStatus("success");
    } catch (submissionError) {
      setStatus("error");
      setError(submissionError instanceof Error ? submissionError.message : "Feedback could not be saved.");
    }
  }

  return (
    <section className="space-y-6" aria-labelledby="level4-evidence-title">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[#6C5CE7] mb-2"><ClipboardCheck className="w-5 h-5" /><span className="text-[10px] font-extrabold uppercase tracking-wider">Production validation</span></div>
            <h2 id="level4-evidence-title" className="text-xl font-black text-slate-900 m-0">Level 4 Evidence</h2>
            <p className="text-xs text-slate-500 mt-1 mb-0">Collect tester feedback and document real Stellar Testnet wallet interactions.</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${supabaseConfigured ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
            {supabaseConfigured ? "Supabase evidence enabled" : "Local fallback mode"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2"><Database className="w-5 h-5 text-[#6C5CE7]" /><h3 className="text-base font-bold text-slate-900 m-0">Evidence records</h3></div>
          {supabaseConfigured ? (
            <>
              <p className="text-xs text-slate-600 m-0">Wallet interactions and tester feedback are being written to Supabase.</p>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 space-y-2">
                <p className="m-0 font-bold text-slate-800">Counts and recent records are write-only in the MVP.</p>
                <p className="m-0">Use the Supabase Table Editor or SQL verification queries for totals, recent rows, and Level 4 screenshots. Browser read access remains closed to protect tester data.</p>
              </div>
            </>
          ) : (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl p-4 m-0">Supabase environment values are missing. Core local bounty flows still work, but shared evidence and feedback are not persisted.</p>
          )}
          <div className="flex items-start gap-2 text-xs text-slate-600"><ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /><span>Captured events include wallet connect/disconnect, proof submission, XLM payment, and successful escrow actions with transaction hashes.</span></div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-1"><MessageSquare className="w-5 h-5 text-[#6C5CE7]" /><h3 className="text-base font-bold text-slate-900 m-0">Tester feedback</h3></div>
          <p className="text-xs text-slate-500 mt-0 mb-4">Short feedback for Level 4 product testing. Your connected wallet is attached automatically.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label htmlFor="feedback-rating" className="block text-xs font-bold text-slate-800 mb-1.5">Rating</label><select id="feedback-rating" value={rating} onChange={(event) => setRating(Number(event.target.value))} disabled={status === "loading" || !supabaseConfigured} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs">{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></div>
            <div><label htmlFor="tester-feedback" className="block text-xs font-bold text-slate-800 mb-1.5">What worked well or could improve?</label><textarea id="tester-feedback" rows={4} value={feedback} onChange={(event) => setFeedback(event.target.value)} disabled={status === "loading" || !supabaseConfigured} placeholder="Share a short note about your testing experience…" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs resize-none" /></div>
            <p className="text-[11px] text-slate-500 m-0">Wallet: {walletAddress ?? "Not connected (feedback remains anonymous)"}</p>
            {status === "success" && <p role="status" className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Thank you—your Level 4 feedback was saved.</p>}
            {status === "error" && error && <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">{error}</p>}
            <button type="submit" disabled={status === "loading" || !supabaseConfigured} className="btn-primary disabled:opacity-50">{status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}{status === "loading" ? "Saving feedback…" : "Submit feedback"}</button>
          </form>
        </div>
      </div>
    </section>
  );
}
