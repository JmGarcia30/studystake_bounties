import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseBountyRepository } from "./supabaseBountyRepository";

const BOUNTY_ROW = {
  id: 7,
  title: "Shared bounty",
  category: "Web3 Development",
  reward_xlm: "4.5",
  creator_wallet_address: "GCREATOR",
  creator_display_name: "Creator",
  contributor_wallet_address: null,
  contributor_display_name: null,
  description: "Stored in Supabase",
  difficulty: "Intermediate",
  status: "Open",
  contract_escrow_id: 12,
  funding_transaction_hash: "abc123",
  created_at: "2026-08-13T00:00:00.000Z",
  submissions_count: 0,
};

function clientWithResult(result: { data: unknown; error: unknown }): SupabaseClient {
  const query = {
    select() { return this; },
    order() { return this; },
    eq() { return this; },
    or() { return this; },
    upsert() { return this; },
    insert() { return this; },
    single() { return Promise.resolve(result); },
    maybeSingle() { return Promise.resolve(result); },
    then(resolve: (value: typeof result) => unknown) { return Promise.resolve(result).then(resolve); },
  };
  return { from: () => query } as unknown as SupabaseClient;
}

describe("SupabaseBountyRepository", () => {
  it("maps a successful Supabase bounty query into the domain model", async () => {
    const repository = new SupabaseBountyRepository(clientWithResult({ data: [BOUNTY_ROW], error: null }));
    const result = await repository.listBounties({ category: "Web3 Development", search: "shared" });
    expect(result[0]).toMatchObject({
      id: 7,
      creator: { walletAddress: "GCREATOR", displayName: "Creator" },
      escrow: { contractEscrowId: 12, fundingTransactionHash: "abc123" },
    });
  });

  it("surfaces the Supabase operation and database message on failure", async () => {
    const repository = new SupabaseBountyRepository(clientWithResult({
      data: null,
      error: { message: "permission denied", code: "42501" },
    }));
    await expect(repository.listBounties()).rejects.toThrow(
      "Supabase bounty list failed (42501): permission denied",
    );
  });
});
