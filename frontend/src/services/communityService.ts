import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseClient, getSupabaseConfig } from "../lib/supabase";
import type { UserFeedbackInput, WalletInteractionInput } from "../types/bounty";

function clientOrThrow(): SupabaseClient {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase is not configured; shared feedback and wallet interaction logging are unavailable.");
  return createSupabaseClient(config);
}

function writeError(table: string, error: { message: string; code?: string }): Error {
  const code = error.code ? ` (${error.code})` : "";
  return new Error(`Supabase ${table} write failed${code}: ${error.message}`);
}

export async function logWalletInteraction(
  input: WalletInteractionInput,
  client: SupabaseClient = clientOrThrow(),
): Promise<void> {
  const { error } = await client.from("wallet_interactions").insert({
    wallet_address: input.walletAddress,
    interaction_type: input.interactionType,
    transaction_hash: input.transactionHash ?? null,
    contract_escrow_id: input.contractEscrowId ?? null,
    metadata: input.metadata ?? {},
  });
  if (error) throw writeError("wallet_interactions", error);
}

export async function submitUserFeedback(
  input: UserFeedbackInput,
  client: SupabaseClient = clientOrThrow(),
): Promise<void> {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    throw new Error("Feedback rating must be an integer from 1 to 5.");
  }
  if (!input.feedback.trim()) throw new Error("Feedback cannot be empty.");
  const { error } = await client.from("user_feedback").insert({
    wallet_address: input.walletAddress ?? null,
    rating: input.rating,
    feedback: input.feedback.trim(),
  });
  if (error) throw writeError("user_feedback", error);
}
