import { afterEach, describe, expect, it, vi } from "vitest";
import type { BountyRepository } from "../repositories/bountyRepository";
import { LocalBountyRepository } from "../repositories/localBountyRepository";
import { SupabaseBountyRepository } from "../repositories/supabaseBountyRepository";
import { createBountyRepository, fetchBounties, resetBountyRepository, setBountyRepository } from "./bountyService";

afterEach(resetBountyRepository);

describe("bountyService", () => {
  it("selects Supabase when both public environment values are configured", () => {
    const repository = createBountyRepository(
      { VITE_SUPABASE_URL: "https://example.supabase.co", VITE_SUPABASE_ANON_KEY: "anon" },
      () => ({}) as never,
    );
    expect(repository).toBeInstanceOf(SupabaseBountyRepository);
  });

  it("falls back locally when either Supabase environment value is missing", () => {
    expect(createBountyRepository({})).toBeInstanceOf(LocalBountyRepository);
    expect(createBountyRepository({ VITE_SUPABASE_URL: "https://example.supabase.co" }))
      .toBeInstanceOf(LocalBountyRepository);
  });

  it("delegates queries through the replaceable repository boundary", async () => {
    const listBounties = vi.fn().mockResolvedValue([]);
    const repository: BountyRepository = {
      listBounties,
      getBountyById: vi.fn(),
      saveBounty: vi.fn(),
      createProofSubmission: vi.fn(),
      listProofSubmissionsByContributor: vi.fn(),
    };
    setBountyRepository(repository);

    await expect(fetchBounties("Web3 Development", "wallet")).resolves.toEqual([]);
    expect(listBounties).toHaveBeenCalledWith({ category: "Web3 Development", search: "wallet" });
  });
});
