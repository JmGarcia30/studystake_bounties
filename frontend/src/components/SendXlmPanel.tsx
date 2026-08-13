import { useState } from "react";
import { EXPLORER_TX_URL } from "../lib/config";
import { sendXlm, type PaymentStatus } from "../lib/payments";
import { logWalletInteraction } from "../services/communityService";
import { trackEvent } from "../lib/analytics";

interface Props { address: string | null; onSuccess: () => void; }
type UiStatus = "idle" | PaymentStatus | "success" | "failed";
const LABELS: Record<UiStatus, string> = {
  idle: "Ready to send a standard Stellar payment.", validating: "Validating payment\u2026",
  awaiting_signature: "Awaiting wallet signature\u2026", submitting: "Submitting to Stellar Testnet\u2026",
  success: "XLM sent successfully", failed: "Payment failed",
};

export function SendXlmPanel({ address, onSuccess }: Props) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<UiStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const pending = status === "validating" || status === "awaiting_signature" || status === "submitting";

  async function handleSend() {
    if (pending) return;
    setError(null); setHash(null); setStatus("validating");
    try {
      const result = await sendXlm({ sourceAddress: address ?? "", destinationAddress: destination, amount, onStatus: setStatus });
      setHash(result.hash); setStatus("success"); onSuccess();
      if (address && result.hash) {
        trackEvent("xlm_payment_sent", { amount_xlm: amount });
        void logWalletInteraction({
          walletAddress: address, interactionType: "xlm_payment_sent", transactionHash: result.hash,
          metadata: { source: "send_xlm", app_area: "dashboard", destination: destination.trim(), amount_xlm: amount },
        }).catch((logError) => console.warn("XLM payment evidence was not recorded.", logError));
      }
    } catch (err) {
      setStatus("failed");
      setError(err instanceof Error ? err.message : "The payment could not be completed.");
    }
  }

  return (
    <section className="panel payment-panel">
      <h2>Send XLM</h2>
      <p className="muted">Native XLM payment on Stellar Testnet, signed by your wallet.</p>
      {!address && <p className="muted">Connect Wallet above to send XLM.</p>}
      <div className="payment-form">
        <label htmlFor="xlm-destination">Destination Stellar Address</label>
        <input id="xlm-destination" value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="G\u2026" autoComplete="off" disabled={pending} />
        <label htmlFor="xlm-amount">Amount (XLM)</label>
        <input id="xlm-amount" value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="0" step="0.0000001" placeholder="0.1" disabled={pending} />
        <button onClick={handleSend} disabled={!address || pending}>{pending ? LABELS[status] : "Send XLM"}</button>
      </div>
      <p className={`status status-${status === "failed" ? "failed" : status === "success" ? "success" : pending ? "pending" : "idle"}`} aria-live="polite">{LABELS[status]}</p>
      {status === "failed" && error && <p className="error">{error}</p>}
      {status === "success" && hash && <div className="payment-result">
        <p>Amount: {amount} XLM</p><p>Destination: <code>{destination.trim()}</code></p>
        <p>Transaction hash: <a className="hash" href={EXPLORER_TX_URL(hash)} target="_blank" rel="noreferrer">{hash}</a></p>
      </div>}
    </section>
  );
}
