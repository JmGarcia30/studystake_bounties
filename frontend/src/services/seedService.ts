import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseClient, getSupabaseConfig } from "../lib/supabase";
import { DEMO_USERS, DEMO_BOUNTIES, generateDemoInteractions, DEMO_SEED_KEY } from "../data/seedData";

export function getClient(overrideClient?: SupabaseClient): SupabaseClient {
  if (overrideClient) return overrideClient;
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing.");
  return createSupabaseClient(config);
}

/**
 * Idempotently seed 15 users, 12 bounties, and 100+ wallet interactions into Supabase.
 */
export async function seedWalletEcosystem(client: SupabaseClient = getClient()): Promise<{
  usersCount: number;
  bountiesCount: number;
  interactionsCount: number;
}> {
  const metadata = {
    demo: true,
    seed: DEMO_SEED_KEY,
    source: "mock_data",
  };

  // 1. Seed public.profiles table if it exists
  const profileRows = DEMO_USERS.map((user) => ({
    id: user.id,
    name: user.name,
    username: user.username,
    wallet_address: user.walletAddress,
    role: user.role,
    bio: user.bio,
    created_at: user.createdAt,
    verified_at: user.verifiedAt,
    metadata: { ...metadata, initial_balance: user.initialBalance },
  }));

  try {
    const { error: profileErr } = await client
      .from("profiles")
      .upsert(profileRows, { onConflict: "id" });
    if (profileErr) {
      console.warn("Notice: public.profiles table upsert returned:", profileErr.message);
    }
  } catch (err) {
    console.warn("Notice: Unable to seed public.profiles table directly (schema missing or restricted).", err);
  }

  // 2. Seed public.bounties table
  const bountyRows = DEMO_BOUNTIES.map((b) => ({
    id: b.id,
    title: b.title,
    category: b.category,
    reward_xlm: b.rewardXlm,
    creator_wallet_address: b.creatorWalletAddress,
    creator_display_name: b.creatorDisplayName,
    contributor_wallet_address: b.contributorWalletAddress ?? null,
    contributor_display_name: b.contributorDisplayName ?? null,
    description: b.description,
    difficulty: b.difficulty,
    status: b.status,
    contract_escrow_id: b.contractEscrowId ?? null,
    funding_transaction_hash: b.fundingTransactionHash ?? null,
    created_at: b.createdAt,
    submissions_count: b.status === "Completed" ? 1 : 0,
  }));

  const { error: bountyErr } = await client
    .from("bounties")
    .upsert(bountyRows, { onConflict: "id" });
  if (bountyErr) {
    console.error("Failed to seed bounties in Supabase:", bountyErr.message);
    throw new Error(`Supabase bounties seed failed: ${bountyErr.message}`);
  }

  // 3. Seed public.wallet_interactions table
  // Clear existing demo interaction records to prevent duplicates on repeated seed runs
  try {
    await client
      .from("wallet_interactions")
      .delete()
      .eq("metadata->>seed", DEMO_SEED_KEY);
  } catch {
    // Ignore deletion restrictions if delete policy is disabled
  }

  const rawInteractions = generateDemoInteractions();
  const interactionRows = rawInteractions.map((item) => ({
    wallet_address: item.walletAddress,
    interaction_type: item.interactionType,
    transaction_hash: item.transactionHash ?? null,
    contract_escrow_id: item.contractEscrowId ?? null,
    metadata: {
      ...metadata,
      amount: item.amount,
      bounty_id: item.bountyId,
      description: item.description,
      wallet_provider: item.walletProvider ?? "Freighter",
    },
    created_at: item.createdAt,
  }));

  // Batch insert into wallet_interactions without .select('*') to conform to anon RLS policies
  const CHUNK_SIZE = 25;
  for (let i = 0; i < interactionRows.length; i += CHUNK_SIZE) {
    const chunk = interactionRows.slice(i, i + CHUNK_SIZE);
    const { error: interactionErr } = await client.from("wallet_interactions").insert(chunk);
    if (interactionErr) {
      console.warn("Wallet interactions batch insert notice:", interactionErr.message);
    }
  }

  return {
    usersCount: DEMO_USERS.length,
    bountiesCount: DEMO_BOUNTIES.length,
    interactionsCount: interactionRows.length,
  };
}

/**
 * Remove only demo records matching metadata->>seed = 'wallet_ecosystem_v1'.
 */
export async function clearWalletEcosystem(client: SupabaseClient = getClient()): Promise<{
  deletedProfiles: boolean;
  deletedBounties: boolean;
  deletedInteractions: boolean;
}> {
  let deletedProfiles = false;
  let deletedBounties = false;
  let deletedInteractions = false;

  try {
    const { error } = await client
      .from("profiles")
      .delete()
      .eq("metadata->>seed", DEMO_SEED_KEY);
    if (!error) deletedProfiles = true;
  } catch {
    // ignore
  }

  try {
    const demoBountyIds = DEMO_BOUNTIES.map((b) => b.id);
    const { error } = await client
      .from("bounties")
      .delete()
      .in("id", demoBountyIds);
    if (!error) deletedBounties = true;
  } catch {
    // ignore
  }

  try {
    const { error } = await client
      .from("wallet_interactions")
      .delete()
      .eq("metadata->>seed", DEMO_SEED_KEY);
    if (!error) deletedInteractions = true;
  } catch {
    // ignore
  }

  return { deletedProfiles, deletedBounties, deletedInteractions };
}
