import { describe, expect, it } from "vitest";
import { LocalBountyRepository } from "./localBountyRepository";

class MemoryStorage {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

const CONTRIBUTOR = {
  walletAddress: "GBUFJT7DPW2JELFSBRZJR53DCYRGG7BX4LA2ECJB7PUDXGP33EKJVJBF",
  displayName: "Alex Scholar",
};

describe("LocalBountyRepository", () => {
  it("filters seeded metadata by category and search text", async () => {
    const repository = new LocalBountyRepository(new MemoryStorage(), 0);
    const matches = await repository.listBounties({
      category: "Soroban Smart Contracts",
      search: "expiration",
    });
    expect(matches).toHaveLength(1);
    expect(matches[0].escrow.contractEscrowId).toBe(4);
    expect(matches[0].creator.displayName).toBe("Stellar Horizon Labs");
  });

  it("returns null for an unknown bounty", async () => {
    const repository = new LocalBountyRepository(new MemoryStorage(), 0);
    await expect(repository.getBountyById(999)).resolves.toBeNull();
  });

  it("stores and retrieves a typed pending proof for its contributor", async () => {
    const repository = new LocalBountyRepository(new MemoryStorage(), 0);
    const submission = await repository.createProofSubmission({
      bountyId: 1,
      contributor: CONTRIBUTOR,
      proofUrl: "https://github.com/example/proof",
      notes: "All tests pass.",
    });

    expect(submission.reviewStatus).toBe("Pending");
    expect(submission.reviewTransactionHash).toBeNull();
    await expect(repository.listProofSubmissionsByContributor(CONTRIBUTOR.walletAddress))
      .resolves.toEqual([submission]);
    await expect(repository.listProofSubmissionsByContributor("GOTHER"))
      .resolves.toEqual([]);
  });

  it("rejects submissions for metadata that does not exist", async () => {
    const repository = new LocalBountyRepository(new MemoryStorage(), 0);
    await expect(repository.createProofSubmission({
      bountyId: 999,
      contributor: CONTRIBUTOR,
      proofUrl: "https://github.com/example/proof",
      notes: "",
    })).rejects.toThrow("Bounty #999 does not exist");
  });

  it("keeps legacy browser submissions readable through the new model", async () => {
    const storage = new MemoryStorage();
    storage.setItem("studystake_bounty_submissions", JSON.stringify([{
      id: "legacy-1",
      bountyId: 1,
      studentAddress: CONTRIBUTOR.walletAddress,
      studentName: CONTRIBUTOR.displayName,
      proofUrl: "https://github.com/example/legacy-proof",
      notes: "Legacy proof",
      submittedAt: "2026-08-01T00:00:00.000Z",
      status: "Pending",
    }]));
    const repository = new LocalBountyRepository(storage, 0);

    const submissions = await repository.listProofSubmissionsByContributor(CONTRIBUTOR.walletAddress);
    expect(submissions[0].contributor).toEqual(CONTRIBUTOR);
    expect(submissions[0].reviewStatus).toBe("Pending");
  });
});
