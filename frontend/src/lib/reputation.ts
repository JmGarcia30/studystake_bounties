import { contract } from "@stellar/stellar-sdk";
import { getConfig } from "./config";
import { toFriendlyError } from "./errors";

export interface Reputation {
  completed: number;
  volume: bigint;
}

function isPlaceholder(value: string): boolean {
  return /^<.*>$/.test(value.trim());
}

/** Reads the optional reputation contract id, or null if unset/still a placeholder. */
export function getReputationContractId(
  env: Record<string, string | undefined> = import.meta.env as unknown as Record<
    string,
    string | undefined
  >,
): string | null {
  const raw = env.VITE_REPUTATION_CONTRACT_ID;
  if (!raw || raw.trim() === "" || isPlaceholder(raw)) return null;
  return raw;
}

export function isReputationConfigured(
  env?: Record<string, string | undefined>,
): boolean {
  return getReputationContractId(env) !== null;
}

// Read-only: only get_reputation is called from the frontend. record_completion
// is written exclusively by the bounty contract's inter-contract call.
interface ReputationContract {
  get_reputation: (args: {
    tutor: string;
  }) => Promise<contract.AssembledTransaction<Reputation | undefined>>;
}

let clientPromise: Promise<contract.Client & ReputationContract> | null = null;

function getClient() {
  if (!clientPromise) {
    const contractId = getReputationContractId();
    if (!contractId) {
      throw new Error("Reputation contract is not configured.");
    }
    const cfg = getConfig();
    clientPromise = contract.Client.from<ReputationContract>({
      contractId,
      networkPassphrase: cfg.networkPassphrase,
      rpcUrl: cfg.rpcUrl,
    });
  }
  return clientPromise;
}

/** Fetches a tutor's reputation, or null if they have no completed bounties yet. */
export async function fetchReputation(tutor: string): Promise<Reputation | null> {
  try {
    const client = await getClient();
    const assembled = await client.get_reputation({ tutor });
    return assembled.result ?? null;
  } catch (err) {
    throw toFriendlyError(err);
  }
}
