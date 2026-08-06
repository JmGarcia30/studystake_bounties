/**
 * Maps kit/wallet errors to the 3 required user-friendly categories:
 * no wallet available, user rejected, and everything else (simulation/submission failures).
 */
export function toFriendlyError(err: unknown): Error {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (
    lower.includes("no modules") ||
    lower.includes("not installed") ||
    lower.includes("not available") ||
    lower.includes("no wallet")
  ) {
    return new Error(
      "No Stellar wallet detected. Install Freighter (or another supported wallet) and try again.",
    );
  }

  if (
    lower.includes("user declined") ||
    lower.includes("rejected") ||
    lower.includes("cancelled") ||
    lower.includes("canceled") ||
    lower.includes("user closed")
  ) {
    return new Error("You cancelled the request in your wallet.");
  }

  return new Error(message);
}
