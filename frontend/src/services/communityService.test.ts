import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logWalletInteraction, submitUserFeedback } from "./communityService";

function writeClient(error: { message: string; code?: string } | null): SupabaseClient {
  return {
    from: () => ({ insert: () => Promise.resolve({ error }) }),
  } as unknown as SupabaseClient;
}

describe("communityService", () => {
  it("supports wallet interaction and feedback writes", async () => {
    const client = writeClient(null);
    await expect(logWalletInteraction({
      walletAddress: "GWALLET",
      interactionType: "wallet_connected",
    }, client)).resolves.toBeUndefined();
    await expect(submitUserFeedback({ rating: 5, feedback: "Useful MVP" }, client))
      .resolves.toBeUndefined();
  });

  it("surfaces Supabase write errors", async () => {
    await expect(logWalletInteraction({
      walletAddress: "GWALLET",
      interactionType: "wallet_connected",
    }, writeClient({ message: "RLS blocked insert", code: "42501" })))
      .rejects.toThrow("Supabase wallet_interactions write failed (42501): RLS blocked insert");
  });
});
