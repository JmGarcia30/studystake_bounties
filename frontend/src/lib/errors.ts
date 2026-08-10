// Mirrors contracts/studystake_bounties/src/error.rs — kept in sync by hand
// since this contract has no generated TS bindings yet (see README).
const CONTRACT_ERROR_MESSAGES: Record<number, string> = {
  1: "This contract has already been initialized.",
  2: "This contract has not been initialized yet.",
  3: "Enter a positive amount.",
  4: "No bounty exists with that ID.",
  5: "This bounty is not open.",
  6: "This bounty has not been accepted yet.",
  7: "Only the buyer of this bounty can do that.",
  8: "Only the contract admin can do that.",
  9: "This bounty doesn't have a tutor assigned yet.",
  10: "This bounty has already been completed.",
  11: "You're not authorized to do that.",
};

// Matches the Stellar SDK's own internal contract-error format, e.g. embedded
// in a larger simulation/transaction failure message as "Error(Contract, #3)".
const CONTRACT_ERROR_PATTERN = /Error\(Contract,\s*#(\d+)\)/;

/** Extracts a typed contract error code from an SDK error message, if present. */
function mapContractErrorCode(message: string): string | null {
  const match = message.match(CONTRACT_ERROR_PATTERN);
  if (!match) return null;
  const code = Number(match[1]);
  return CONTRACT_ERROR_MESSAGES[code] ?? `Contract rejected the transaction (error #${code}).`;
}

/** Safely converts any error type (Error, object, string, SDK response) to a clean human-readable string without producing [object Object]. */
export function formatErrorMessage(err: unknown): string {
  if (!err) return "";
  if (typeof err === "string") {
    return err === "[object Object]" ? "Transaction failed. Please check wallet connection." : err;
  }
  if (err instanceof Error) {
    return err.message || "An unexpected error occurred.";
  }
  if (typeof err === "object") {
    const obj = err as Record<string, unknown>;
    if (typeof obj.message === "string" && obj.message) return obj.message;
    if (typeof obj.error === "string" && obj.error) return obj.error;
    if (typeof obj.details === "string" && obj.details) return obj.details;
    if (typeof obj.reason === "string" && obj.reason) return obj.reason;
    if (typeof obj.description === "string" && obj.description) return obj.description;
    
    try {
      const json = JSON.stringify(err);
      if (json && json !== "{}" && json !== "[]") {
        return json;
      }
    } catch {
      // JSON stringify fallback
    }
  }
  const str = String(err);
  return str === "[object Object]" ? "Transaction simulation or wallet authorization failed." : str;
}

/**
 * Maps kit/wallet/contract errors to user-friendly messages: no wallet
 * available, user rejected, a known typed contract error, or everything
 * else (simulation/submission failures).
 */
export function toFriendlyError(err: unknown): Error {
  const message = formatErrorMessage(err);

  // Checked first: a typed contract error code is unambiguous, so it takes
  // priority over the looser substring heuristics below.
  const contractMessage = mapContractErrorCode(message);
  if (contractMessage) {
    return new Error(contractMessage);
  }

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
