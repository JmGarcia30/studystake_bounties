import type { UserRole } from "./user";

export interface EcosystemUser {
  id: string;
  name: string;
  username: string;
  walletAddress: string;
  role: UserRole;
  bio: string;
  avatarUrl?: string;
  createdAt: string;
  verifiedAt?: string;
  balanceXlm: number;
  totalDepositedXlm: number;
  totalEarnedXlm: number;
  totalSpentXlm: number;
  transactionCount: number;
  status: "Active" | "Inactive";
  metadata?: Record<string, unknown>;
}

export type EcosystemInteractionType =
  | "wallet_connected"
  | "wallet_disconnected"
  | "escrow_created"
  | "bounty_accepted"
  | "proof_submitted"
  | "reward_released"
  | "xlm_payment_sent";

export interface EcosystemTransaction {
  id: string;
  userId: string;
  userName: string;
  walletAddress: string;
  type: EcosystemInteractionType;
  amount: number;
  asset: "XLM";
  status: "Completed" | "Pending" | "Failed";
  counterparty?: string;
  bountyId?: string;
  bountyTitle?: string;
  description: string;
  transactionHash?: string;
  contractEscrowId?: number;
  walletProvider?: "Freighter" | "Albedo" | "xBull" | "Hana";
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface EcosystemBounty {
  id: number;
  title: string;
  category: string;
  rewardXlm: number;
  creatorWalletAddress: string;
  creatorDisplayName: string;
  contributorWalletAddress?: string;
  contributorDisplayName?: string;
  description: string;
  difficulty: string;
  status: string;
  contractEscrowId?: number;
  fundingTransactionHash?: string;
  createdAt: string;
  submissionsCount: number;
  metadata?: Record<string, unknown>;
}

export interface EcosystemProviderStat {
  provider: "Freighter" | "Albedo" | "xBull" | "Hana";
  count: number;
  percentage: number;
}

export interface EcosystemStats {
  totalUsers: number;
  connectedWalletsCount: number;
  totalXlmVolume: number;
  totalRewardsDistributed: number;
  totalFunded: number;
  activeWalletsCount: number;
  totalInteractionsCount: number;
  bountyCount: number;
  recentTransactions: EcosystemTransaction[];
  providerBreakdown: EcosystemProviderStat[];
}
