import { describe, it, expect } from "vitest";
import {
  fetchEcosystemData,
  formatShortAddress,
  formatRelativeTime,
} from "./walletEcosystemService";
import { DEMO_USERS, DEMO_BOUNTIES, generateDemoInteractions } from "../data/seedData";

describe("Wallet Ecosystem Service & Seed Dataset", () => {
  it("formats short Stellar wallet addresses correctly", () => {
    const full = "GCF82K9X3P1111111111111111111111111111111111111111111111";
    expect(formatShortAddress(full)).toBe("GCF...111");
    expect(formatShortAddress("SHORT")).toBe("SHORT");
  });

  it("formats relative timestamps safely", () => {
    const formatted = formatRelativeTime(new Date().toISOString());
    expect(typeof formatted).toBe("string");
    expect(formatted.length).toBeGreaterThan(0);
  });

  it("contains exactly 15 demo users (10 students, 5 sponsors)", () => {
    expect(DEMO_USERS).toHaveLength(15);
    const students = DEMO_USERS.filter((u) => u.role === "student");
    const sponsors = DEMO_USERS.filter((u) => u.role === "sponsor");
    expect(students).toHaveLength(10);
    expect(sponsors).toHaveLength(5);
  });

  it("ensures all wallet addresses are unique, 56 chars, and start with G", () => {
    const addresses = DEMO_USERS.map((u) => u.walletAddress);
    const uniqueSet = new Set(addresses);

    expect(uniqueSet.size).toBe(15);
    addresses.forEach((addr) => {
      expect(addr).toHaveLength(56);
      expect(addr.startsWith("G")).toBe(true);
    });
  });

  it("generates between 75 and 150 wallet interaction records", () => {
    const interactions = generateDemoInteractions();
    expect(interactions.length).toBeGreaterThanOrEqual(75);
    expect(interactions.length).toBeLessThanOrEqual(150);
  });

  it("calculates aggregated statistics accurately", async () => {
    const data = await fetchEcosystemData(null);

    expect(data.users).toHaveLength(15);
    expect(data.bounties).toHaveLength(DEMO_BOUNTIES.length);
    expect(data.stats.totalUsers).toBe(15);
    expect(data.stats.connectedWalletsCount).toBeGreaterThan(0);
    expect(data.stats.totalXlmVolume).toBeGreaterThan(0);
    expect(data.stats.totalRewardsDistributed).toBeGreaterThan(0);
    expect(data.stats.totalFunded).toBeGreaterThan(0);

    const providerTotalPercent = data.stats.providerBreakdown.reduce(
      (sum, p) => sum + p.percentage,
      0
    );
    expect(providerTotalPercent).toBeGreaterThanOrEqual(98);
    expect(providerTotalPercent).toBeLessThanOrEqual(102);
  });
});
