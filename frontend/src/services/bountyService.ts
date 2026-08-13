import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseClient, getSupabaseConfig } from "../lib/supabase";
import { LocalBountyRepository } from "../repositories/localBountyRepository";
import { SupabaseBountyRepository } from "../repositories/supabaseBountyRepository";
import type { BountyRepository } from "../repositories/bountyRepository";
import type { Bounty, BountyCategory, CreateProofSubmissionInput, ProofSubmission, WalletAddress } from "../types/bounty";

let repository: BountyRepository | null = null;

export function createBountyRepository(
  env: Record<string, string | undefined> = import.meta.env,
  clientFactory: (url: string, anonKey: string) => SupabaseClient = (url, anonKey) =>
    createSupabaseClient({ url, anonKey }),
): BountyRepository {
  const config = getSupabaseConfig(env);
  return config
    ? new SupabaseBountyRepository(clientFactory(config.url, config.anonKey))
    : new LocalBountyRepository();
}

function getRepository(): BountyRepository {
  repository ??= createBountyRepository();
  return repository;
}

/** Composition seam for tests. Runtime selection otherwise comes from Vite env. */
export function setBountyRepository(nextRepository: BountyRepository): void { repository = nextRepository; }
export function resetBountyRepository(): void { repository = null; }
export function fetchBounties(category: BountyCategory | "All" = "All", search = ""): Promise<Bounty[]> { return getRepository().listBounties({ category, search }); }
export function fetchBountyById(id: number): Promise<Bounty | null> { return getRepository().getBountyById(id); }
export function saveBounty(bounty: Bounty): Promise<Bounty> { return getRepository().saveBounty(bounty); }
export function submitBountyProof(input: CreateProofSubmissionInput): Promise<ProofSubmission> { return getRepository().createProofSubmission(input); }
export function fetchContributorSubmissions(address: WalletAddress): Promise<ProofSubmission[]> { return getRepository().listProofSubmissionsByContributor(address); }
