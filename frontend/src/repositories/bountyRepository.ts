import type { Bounty, BountyListQuery, CreateProofSubmissionInput, ProofSubmission, WalletAddress } from "../types/bounty";

/** Persistence boundary for Level 4 bounty metadata. */
export interface BountyRepository {
  listBounties(query?: BountyListQuery): Promise<Bounty[]>;
  getBountyById(id: number): Promise<Bounty | null>;
  createProofSubmission(input: CreateProofSubmissionInput): Promise<ProofSubmission>;
  listProofSubmissionsByContributor(address: WalletAddress): Promise<ProofSubmission[]>;
}
