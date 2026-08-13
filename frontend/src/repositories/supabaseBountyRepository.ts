import type { SupabaseClient } from "@supabase/supabase-js";
import type { BountyRepository } from "./bountyRepository";
import type { Bounty, BountyListQuery, CreateProofSubmissionInput, ProofSubmission, WalletAddress } from "../types/bounty";

interface BountyRow {
  id: number;
  title: string;
  category: Bounty["category"];
  reward_xlm: string | number;
  creator_wallet_address: string;
  creator_display_name: string;
  contributor_wallet_address: string | null;
  contributor_display_name: string | null;
  description: string;
  difficulty: Bounty["difficulty"];
  status: Bounty["status"];
  contract_escrow_id: number | null;
  funding_transaction_hash: string | null;
  created_at: string;
  submissions_count: number | null;
}

interface ProofSubmissionRow {
  id: string;
  bounty_id: number;
  contributor_wallet_address: string;
  contributor_display_name: string;
  proof_url: string;
  notes: string | null;
  submitted_at: string;
  review_status: ProofSubmission["reviewStatus"];
  review_transaction_hash: string | null;
}

function repositoryError(operation: string, error: { message: string; code?: string } | null): Error {
  const code = error?.code ? ` (${error.code})` : "";
  return new Error(`Supabase ${operation} failed${code}: ${error?.message ?? "Unknown database error."}`);
}

function toBounty(row: BountyRow): Bounty {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    rewardXlm: String(row.reward_xlm),
    creator: { walletAddress: row.creator_wallet_address, displayName: row.creator_display_name },
    contributor: row.contributor_wallet_address
      ? { walletAddress: row.contributor_wallet_address, displayName: row.contributor_display_name ?? "Contributor" }
      : null,
    description: row.description,
    difficulty: row.difficulty,
    status: row.status,
    escrow: { contractEscrowId: row.contract_escrow_id, fundingTransactionHash: row.funding_transaction_hash },
    createdAt: row.created_at,
    submissionsCount: row.submissions_count ?? 0,
  };
}

function fromBounty(bounty: Bounty): BountyRow {
  return {
    id: bounty.id,
    title: bounty.title,
    category: bounty.category,
    reward_xlm: bounty.rewardXlm,
    creator_wallet_address: bounty.creator.walletAddress,
    creator_display_name: bounty.creator.displayName,
    contributor_wallet_address: bounty.contributor?.walletAddress ?? null,
    contributor_display_name: bounty.contributor?.displayName ?? null,
    description: bounty.description,
    difficulty: bounty.difficulty,
    status: bounty.status,
    contract_escrow_id: bounty.escrow.contractEscrowId,
    funding_transaction_hash: bounty.escrow.fundingTransactionHash,
    created_at: bounty.createdAt,
    submissions_count: bounty.submissionsCount,
  };
}

function toProofSubmission(row: ProofSubmissionRow): ProofSubmission {
  return {
    id: row.id,
    bountyId: row.bounty_id,
    contributor: { walletAddress: row.contributor_wallet_address, displayName: row.contributor_display_name },
    proofUrl: row.proof_url,
    notes: row.notes ?? "",
    submittedAt: row.submitted_at,
    reviewStatus: row.review_status,
    reviewTransactionHash: row.review_transaction_hash,
  };
}

export class SupabaseBountyRepository implements BountyRepository {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) { this.client = client; }

  async listBounties(query: BountyListQuery = {}): Promise<Bounty[]> {
    let request = this.client.from("bounties").select("*").order("created_at", { ascending: false });
    if (query.category && query.category !== "All") request = request.eq("category", query.category);
    // PostgREST `.or()` accepts filter syntax, so strip its control characters
    // from user-provided search text before interpolating the two ilike clauses.
    const search = query.search?.trim().replace(/[%,().]/g, " ");
    if (search) request = request.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    const { data, error } = await request;
    if (error) throw repositoryError("bounty list", error);
    return ((data ?? []) as BountyRow[]).map(toBounty);
  }

  async getBountyById(id: number): Promise<Bounty | null> {
    const { data, error } = await this.client.from("bounties").select("*").eq("id", id).maybeSingle();
    if (error) throw repositoryError(`bounty #${id} lookup`, error);
    return data ? toBounty(data as BountyRow) : null;
  }

  async saveBounty(bounty: Bounty): Promise<Bounty> {
    const { data, error } = await this.client.from("bounties").upsert(fromBounty(bounty)).select("*").single();
    if (error) throw repositoryError(`bounty #${bounty.id} save`, error);
    return toBounty(data as BountyRow);
  }

  async createProofSubmission(input: CreateProofSubmissionInput): Promise<ProofSubmission> {
    const row = {
      bounty_id: input.bountyId,
      contributor_wallet_address: input.contributor.walletAddress,
      contributor_display_name: input.contributor.displayName,
      proof_url: input.proofUrl,
      notes: input.notes,
      review_status: "Pending",
      review_transaction_hash: null,
    };
    const { data, error } = await this.client.from("proof_submissions").insert(row).select("*").single();
    if (error) throw repositoryError("proof submission", error);
    return toProofSubmission(data as ProofSubmissionRow);
  }

  async listProofSubmissionsByContributor(address: WalletAddress): Promise<ProofSubmission[]> {
    if (!address) return [];
    const { data, error } = await this.client.from("proof_submissions").select("*")
      .eq("contributor_wallet_address", address).order("submitted_at", { ascending: false });
    if (error) throw repositoryError("contributor proof list", error);
    return ((data ?? []) as ProofSubmissionRow[]).map(toProofSubmission);
  }
}
