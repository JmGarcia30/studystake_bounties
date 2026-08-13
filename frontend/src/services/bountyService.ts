import { LocalBountyRepository } from "../repositories/localBountyRepository";
import type { BountyRepository } from "../repositories/bountyRepository";
import type { Bounty, BountyCategory, CreateProofSubmissionInput, ProofSubmission, WalletAddress } from "../types/bounty";

let repository: BountyRepository | null = null;
function getRepository(): BountyRepository { repository ??= new LocalBountyRepository(); return repository; }

/** Composition seam for tests and a future Supabase or API-backed repository. */
export function setBountyRepository(nextRepository: BountyRepository): void { repository = nextRepository; }
export function resetBountyRepository(): void { repository = null; }
export function fetchBounties(category: BountyCategory | "All" = "All", search = ""): Promise<Bounty[]> { return getRepository().listBounties({ category, search }); }
export function fetchBountyById(id: number): Promise<Bounty | null> { return getRepository().getBountyById(id); }
export function submitBountyProof(input: CreateProofSubmissionInput): Promise<ProofSubmission> { return getRepository().createProofSubmission(input); }
export function fetchContributorSubmissions(address: WalletAddress): Promise<ProofSubmission[]> { return getRepository().listProofSubmissionsByContributor(address); }
