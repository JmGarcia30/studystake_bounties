import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseClient, getSupabaseConfig } from "../lib/supabase";
import type {
  EcosystemUser,
  EcosystemTransaction,
  EcosystemBounty,
  EcosystemStats,
  EcosystemProviderStat,
  EcosystemInteractionType,
} from "../types/walletEcosystem";
import { DEMO_USERS, DEMO_BOUNTIES, generateDemoInteractions } from "../data/seedData";

export function formatShortAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 3)}...${address.slice(-3)}`;
}

export function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date("2026-08-13T21:00:00Z");
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    return date.toLocaleDateString();
  } catch {
    return dateStr;
  }
}

function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) return null;
  return createSupabaseClient(config);
}

/**
 * Fetch persistent ecosystem data directly from Supabase, or format fallback dataset.
 */
export async function fetchEcosystemData(client: SupabaseClient | null = getSupabaseClient()): Promise<{
  users: EcosystemUser[];
  transactions: EcosystemTransaction[];
  bounties: EcosystemBounty[];
  stats: EcosystemStats;
  isSupabaseLive: boolean;
}> {
  let dbProfiles: any[] = [];
  let dbBounties: any[] = [];
  let dbInteractions: any[] = [];
  let isLive = false;

  if (client) {
    try {
      const [profilesRes, bountiesRes, interactionsRes] = await Promise.allSettled([
        client.from("profiles").select("*"),
        client.from("bounties").select("*"),
        client.from("wallet_interactions").select("*"),
      ]);

      if (profilesRes.status === "fulfilled" && Array.isArray(profilesRes.value.data) && profilesRes.value.data.length > 0) {
        dbProfiles = profilesRes.value.data;
      }

      if (bountiesRes.status === "fulfilled" && Array.isArray(bountiesRes.value.data) && bountiesRes.value.data.length > 0) {
        dbBounties = bountiesRes.value.data;
        isLive = true;
      }

      if (interactionsRes.status === "fulfilled" && Array.isArray(interactionsRes.value.data) && interactionsRes.value.data.length > 0) {
        dbInteractions = interactionsRes.value.data;
        isLive = true;
      }
    } catch (err) {
      console.warn("Supabase query encounter notice, falling back to local dataset:", err);
    }
  }

  // Map or fallback Users
  const userMap = new Map<string, EcosystemUser>();

  if (dbProfiles.length > 0) {
    dbProfiles.forEach((p) => {
      userMap.set(p.wallet_address, {
        id: p.id || `user-${p.username}`,
        name: p.name,
        username: p.username,
        walletAddress: p.wallet_address,
        role: p.role || "student",
        bio: p.bio || "",
        avatarUrl: p.avatar_url,
        createdAt: p.created_at,
        verifiedAt: p.verified_at,
        balanceXlm: Number(p.metadata?.initial_balance ?? 100),
        totalDepositedXlm: p.role === "sponsor" ? 1500 : 0,
        totalEarnedXlm: 0,
        totalSpentXlm: 0,
        transactionCount: 0,
        status: "Active",
        metadata: p.metadata,
      });
    });
  }

  // Ensure all 15 demo users exist in userMap
  DEMO_USERS.forEach((u) => {
    if (!userMap.has(u.walletAddress)) {
      userMap.set(u.walletAddress, {
        id: u.id,
        name: u.name,
        username: u.username,
        walletAddress: u.walletAddress,
        role: u.role,
        bio: u.bio,
        createdAt: u.createdAt,
        verifiedAt: u.verifiedAt,
        balanceXlm: u.initialBalance,
        totalDepositedXlm: u.role === "sponsor" ? 1500 : 0,
        totalEarnedXlm: 0,
        totalSpentXlm: 0,
        transactionCount: 0,
        status: "Active",
      });
    }
  });

  // Map or fallback Bounties
  const bounties: EcosystemBounty[] = (dbBounties.length > 0 ? dbBounties : DEMO_BOUNTIES).map((b) => ({
    id: Number(b.id),
    title: b.title,
    category: b.category,
    rewardXlm: Number(b.reward_xlm ?? b.rewardXlm ?? 100),
    creatorWalletAddress: b.creator_wallet_address ?? b.creatorWalletAddress,
    creatorDisplayName: b.creator_display_name ?? b.creatorDisplayName,
    contributorWalletAddress: b.contributor_wallet_address ?? b.contributorWalletAddress,
    contributorDisplayName: b.contributor_display_name ?? b.contributorDisplayName,
    description: b.description,
    difficulty: b.difficulty,
    status: b.status,
    contractEscrowId: b.contract_escrow_id ?? b.contractEscrowId,
    fundingTransactionHash: b.funding_transaction_hash ?? b.fundingTransactionHash,
    createdAt: b.created_at ?? b.createdAt,
    submissionsCount: b.submissions_count ?? b.submissionsCount ?? 0,
  }));

  // Map or fallback Transactions
  const rawInteractions = dbInteractions.length > 0
    ? dbInteractions.map((row) => ({
        walletAddress: row.wallet_address,
        interactionType: row.interaction_type as EcosystemInteractionType,
        transactionHash: row.transaction_hash,
        contractEscrowId: row.contract_escrow_id,
        amount: Number(row.metadata?.amount ?? 0),
        bountyId: row.metadata?.bounty_id,
        description: row.metadata?.description || `${row.interaction_type} interaction logged`,
        walletProvider: (row.metadata?.wallet_provider as any) || "Freighter",
        createdAt: row.created_at,
        metadata: row.metadata,
      }))
    : generateDemoInteractions();

  const transactions: EcosystemTransaction[] = rawInteractions.map((tx, idx) => {
    const user = userMap.get(tx.walletAddress);
    const userName = user?.name || formatShortAddress(tx.walletAddress);
    const userId = user?.id || `user-${tx.walletAddress.slice(0, 6)}`;
    const bounty = bounties.find((b) => String(b.id) === String(tx.bountyId));

    return {
      id: `tx-${idx + 1000}`,
      userId,
      userName,
      walletAddress: tx.walletAddress,
      type: tx.interactionType,
      amount: tx.amount || 0,
      asset: "XLM",
      status: "Completed",
      bountyId: tx.bountyId,
      bountyTitle: bounty?.title,
      description: tx.description,
      transactionHash: tx.transactionHash,
      contractEscrowId: tx.contractEscrowId,
      walletProvider: tx.walletProvider,
      createdAt: tx.createdAt,
      metadata: tx.metadata,
    };
  });

  // Calculate Aggregations & Metrics
  let totalXlmVolume = 0;
  let totalRewardsDistributed = 0;
  let totalFunded = 0;

  const providerCounts: Record<string, number> = {
    Freighter: 0,
    Albedo: 0,
    xBull: 0,
    Hana: 0,
  };

  const activeWalletsSet = new Set<string>();

  transactions.forEach((tx) => {
    activeWalletsSet.add(tx.walletAddress);

    // Track Provider
    if (tx.walletProvider && providerCounts[tx.walletProvider] !== undefined) {
      providerCounts[tx.walletProvider]++;
    } else {
      providerCounts.Freighter++;
    }

    // Accumulate transaction statistics
    if (tx.type === "reward_released" || tx.type === "xlm_payment_sent") {
      totalXlmVolume += tx.amount;
      if (tx.type === "reward_released") {
        totalRewardsDistributed += tx.amount;
      }
    } else if (tx.type === "escrow_created") {
      totalXlmVolume += tx.amount;
      totalFunded += tx.amount;
    }

    // Update user balance metrics
    const user = userMap.get(tx.walletAddress);
    if (user) {
      user.transactionCount++;
      if (tx.type === "reward_released") {
        user.totalEarnedXlm += tx.amount;
        user.balanceXlm += tx.amount;
      } else if (tx.type === "escrow_created") {
        user.totalSpentXlm += tx.amount;
      }
    }
  });

  const totalProviderInteractions = transactions.length || 1;
  const providerBreakdown: EcosystemProviderStat[] = (
    ["Freighter", "Albedo", "xBull", "Hana"] as const
  ).map((prov) => ({
    provider: prov,
    count: providerCounts[prov],
    percentage: Math.round((providerCounts[prov] / totalProviderInteractions) * 100),
  }));

  const users = Array.from(userMap.values());

  const stats: EcosystemStats = {
    totalUsers: users.length,
    connectedWalletsCount: activeWalletsSet.size,
    totalXlmVolume: Number(totalXlmVolume.toFixed(4)),
    totalRewardsDistributed: Number(totalRewardsDistributed.toFixed(4)),
    totalFunded: Number(totalFunded.toFixed(4)),
    activeWalletsCount: activeWalletsSet.size,
    totalInteractionsCount: transactions.length,
    bountyCount: bounties.length,
    recentTransactions: transactions.slice(0, 15),
    providerBreakdown,
  };

  return {
    users,
    transactions,
    bounties,
    stats,
    isSupabaseLive: isLive,
  };
}
