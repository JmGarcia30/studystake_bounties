import type { BountyRepository } from "./bountyRepository";
import type { Bounty, BountyListQuery, CreateProofSubmissionInput, ProofSubmission, WalletAddress } from "../types/bounty";

const SUBMISSIONS_STORAGE_KEY = "studystake_bounty_submissions_v2";
const LEGACY_SUBMISSIONS_STORAGE_KEY = "studystake_bounty_submissions";
const MOCK_DELAY_MS = 150;

const SEED_BOUNTIES: readonly Bounty[] = [
  { id: 1, title: "Rust Soroban Contract Escrow Logic Bugfix", category: "Soroban Smart Contracts", rewardXlm: "5.0", creator: { walletAddress: "GC2F...9X2A", displayName: "StudyStake Labs" }, contributor: null, description: "Review soroban contract event emissions and optimize storage map gas consumption for peer payouts.", difficulty: "Intermediate", status: "Open", escrow: { contractEscrowId: 1, fundingTransactionHash: null }, createdAt: "2026-08-01T00:00:00.000Z", submissionsCount: 1 },
  { id: 2, title: "Web3 Wallet Kit Connection React Hook Refactor", category: "Web3 Development", rewardXlm: "3.5", creator: { walletAddress: "GBUF...VJBF", displayName: "Stellar Dev Guild" }, contributor: null, description: "Refactor wallet reconnect state management using custom React 19 hooks and optimistic status indicators.", difficulty: "Beginner", status: "Open", escrow: { contractEscrowId: 2, fundingTransactionHash: null }, createdAt: "2026-08-02T00:00:00.000Z", submissionsCount: 0 },
  { id: 3, title: "Binary Search Tree Rebalancing Peer Review", category: "STEM & Peer Tutoring", rewardXlm: "1.5", creator: { walletAddress: "GA88...L42X", displayName: "CS Tutoring Circle" }, contributor: null, description: "Provide detailed feedback on BST rebalancing algorithms and Big-O memory bounds for tutoring students.", difficulty: "Beginner", status: "Open", escrow: { contractEscrowId: 3, fundingTransactionHash: null }, createdAt: "2026-08-03T00:00:00.000Z", submissionsCount: 2 },
  { id: 4, title: "Soroban Ledger Key Expiration & Storage Rental Optimization", category: "Soroban Smart Contracts", rewardXlm: "8.0", creator: { walletAddress: "GD77...Q88K", displayName: "Stellar Horizon Labs" }, contributor: null, description: "Implement instance storage TTL extension helpers for long-running bounty escrow contracts on Stellar Testnet.", difficulty: "Advanced", status: "Open", escrow: { contractEscrowId: 4, fundingTransactionHash: null }, createdAt: "2026-08-04T00:00:00.000Z", submissionsCount: 0 },
];

interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void; }
class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}
function wait(ms: number): Promise<void> { return new Promise((resolve) => setTimeout(resolve, ms)); }

function readSubmissions(storage: StorageLike): ProofSubmission[] {
  const current = storage.getItem(SUBMISSIONS_STORAGE_KEY);
  const raw = current ?? storage.getItem(LEGACY_SUBMISSIONS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Stored submissions are not a list.");
    if (current) return parsed as ProofSubmission[];
    return parsed.map((legacy: Record<string, unknown>) => ({
      id: String(legacy.id),
      bountyId: Number(legacy.bountyId),
      contributor: {
        walletAddress: String(legacy.studentAddress),
        displayName: String(legacy.studentName),
      },
      proofUrl: String(legacy.proofUrl),
      notes: String(legacy.notes ?? ""),
      submittedAt: String(legacy.submittedAt),
      reviewStatus: legacy.status === "Approved" || legacy.status === "Rejected" ? legacy.status : "Pending",
      reviewTransactionHash: null,
    }));
  } catch (error) {
    throw new Error("Saved proof submissions could not be read.", { cause: error });
  }
}

export class LocalBountyRepository implements BountyRepository {
  private readonly storage: StorageLike;
  private readonly delayMs: number;

  constructor(storage?: StorageLike, delayMs = MOCK_DELAY_MS) {
    this.storage = storage ?? globalThis.localStorage ?? new MemoryStorage();
    this.delayMs = delayMs;
  }

  async listBounties(query: BountyListQuery = {}): Promise<Bounty[]> {
    await wait(this.delayMs);
    const category = query.category ?? "All";
    const search = query.search?.trim().toLowerCase() ?? "";
    return SEED_BOUNTIES.filter((bounty) => {
      const matchesCategory = category === "All" || bounty.category === category;
      const matchesSearch = !search || bounty.title.toLowerCase().includes(search) || bounty.description.toLowerCase().includes(search);
      return matchesCategory && matchesSearch;
    });
  }

  async getBountyById(id: number): Promise<Bounty | null> {
    await wait(this.delayMs);
    return SEED_BOUNTIES.find((bounty) => bounty.id === id) ?? null;
  }

  async saveBounty(bounty: Bounty): Promise<Bounty> {
    throw new Error(`Local bounty metadata is read-only; bounty #${bounty.id} was not saved.`);
  }

  async createProofSubmission(input: CreateProofSubmissionInput): Promise<ProofSubmission> {
    await wait(this.delayMs);
    if (!(await this.getBountyById(input.bountyId))) throw new Error(`Bounty #${input.bountyId} does not exist.`);
    const submission: ProofSubmission = { id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, bountyId: input.bountyId, contributor: input.contributor, proofUrl: input.proofUrl, notes: input.notes, submittedAt: new Date().toISOString(), reviewStatus: "Pending", reviewTransactionHash: null };
    const existing = readSubmissions(this.storage);
    this.storage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify([submission, ...existing]));
    return submission;
  }

  async listProofSubmissionsByContributor(address: WalletAddress): Promise<ProofSubmission[]> {
    if (!address) return [];
    await wait(this.delayMs);
    return readSubmissions(this.storage).filter((submission) => submission.contributor.walletAddress === address);
  }
}
