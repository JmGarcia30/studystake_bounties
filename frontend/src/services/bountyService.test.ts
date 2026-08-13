import { afterEach, describe, expect, it, vi } from "vitest";
import type { BountyRepository } from "../repositories/bountyRepository";
import { fetchBounties, resetBountyRepository, setBountyRepository } from "./bountyService";

afterEach(resetBountyRepository);

describe("bountyService", () => {
  it("delegates queries through the replaceable repository boundary", async () => {
    const listBounties = vi.fn().mockResolvedValue([]);
    const repository: BountyRepository = {
      listBounties,
      getBountyById: vi.fn(),
      createProofSubmission: vi.fn(),
      listProofSubmissionsByContributor: vi.fn(),
    };
    setBountyRepository(repository);

    await expect(fetchBounties("Web3 Development", "wallet")).resolves.toEqual([]);
    expect(listBounties).toHaveBeenCalledWith({ category: "Web3 Development", search: "wallet" });
  });
});
