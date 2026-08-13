import { useState } from "react";
import { callContract, type TxStatus, type WriteMethod } from "../lib/contract";
import { formatErrorMessage } from "../lib/errors";
import { logWalletInteraction } from "../services/communityService";
import { trackEvent } from "../lib/analytics";

interface UseContractActionOptions {
  address: string | null;
  onTxUpdate: (status: TxStatus, hash?: string, error?: string) => void;
  onSuccess: () => void;
}

/**
 * Runs one contract write action at a time and tracks which one (if any) is
 * pending, so the UI can show a specific "Creating..."/"Accepting..." label on
 * the button that triggered it instead of one generic busy flag.
 */
export function useContractAction({ address, onTxUpdate, onSuccess }: UseContractActionOptions) {
  const [pendingAction, setPendingAction] = useState<WriteMethod | null>(null);

  async function run<K extends WriteMethod>(method: K, args: Record<string, unknown>) {
    if (!address) return undefined;
    setPendingAction(method);
    try {
      const { hash, result, error } = await callContract(method, args as never, address, onTxUpdate);
      if (error) {
        onTxUpdate("failed", undefined, formatErrorMessage(error));
        return undefined;
      }
      onTxUpdate("success", hash);
      onSuccess();
      const interactionType = method === "create_bounty" ? "escrow_created"
        : method === "accept_bounty" ? "bounty_accepted"
        : method === "release_funds" ? "reward_released" : null;
      if (interactionType && hash) {
        trackEvent(interactionType, { contract_method: method });
        const bountyId = typeof args.bounty_id === "number" ? args.bounty_id
          : typeof result === "number" ? result : undefined;
        void logWalletInteraction({
          walletAddress: address, interactionType, transactionHash: hash, contractEscrowId: bountyId,
          metadata: { source: "sponsor_hub", app_area: "contract", contract_method: method, bounty_id: bountyId },
        }).catch((logError) => console.warn("Contract interaction evidence was not recorded.", logError));
      }
      return result;
    } finally {
      setPendingAction(null);
    }
  }

  return { pendingAction, run };
}
