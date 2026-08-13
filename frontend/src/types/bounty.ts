/** Public Stellar identifiers are strings at runtime; aliases document their role. */
export type WalletAddress = string;
export type TransactionHash = string;
export type ContractEscrowId = number;

export type BountyStatus = "Open" | "In Progress" | "In Review" | "Completed" | "Disputed";
export type ReviewStatus = "Pending" | "Approved" | "Rejected";
export type BountyCategory =
  | "Soroban Smart Contracts"
  | "Web3 Development"
  | "STEM & Peer Tutoring"
  | "Data & Algorithms";

export interface BountyCreator { walletAddress: WalletAddress; displayName: string; }
export interface Contributor { walletAddress: WalletAddress; displayName: string; }
export interface EscrowReference {
  contractEscrowId: ContractEscrowId | null;
  fundingTransactionHash: TransactionHash | null;
}
export interface ProofSubmission {
  id: string;
  bountyId: number;
  contributor: Contributor;
  proofUrl: string;
  notes: string;
  submittedAt: string;
  reviewStatus: ReviewStatus;
  reviewTransactionHash: TransactionHash | null;
}
export interface Bounty {
  id: number;
  title: string;
  category: BountyCategory;
  rewardXlm: string;
  creator: BountyCreator;
  contributor: Contributor | null;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  status: BountyStatus;
  escrow: EscrowReference;
  createdAt: string;
  submissionsCount: number;
}
export interface BountyListQuery { category?: BountyCategory | "All"; search?: string; }
export interface CreateProofSubmissionInput {
  bountyId: number;
  contributor: Contributor;
  proofUrl: string;
  notes: string;
}

export type WalletInteractionType =
  | "wallet_connected"
  | "wallet_disconnected"
  | "xlm_payment_sent"
  | "payment_submitted"
  | "escrow_created"
  | "bounty_accepted"
  | "proof_submitted"
  | "reward_released";

export interface WalletInteractionInput {
  walletAddress: WalletAddress;
  interactionType: WalletInteractionType;
  transactionHash?: TransactionHash | null;
  contractEscrowId?: ContractEscrowId | null;
  metadata?: Record<string, unknown>;
}

export interface UserFeedbackInput {
  walletAddress?: WalletAddress | null;
  rating: number;
  feedback: string;
}
