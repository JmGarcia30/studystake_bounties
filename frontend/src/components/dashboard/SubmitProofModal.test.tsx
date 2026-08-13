// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SubmitProofModal } from "./SubmitProofModal";
import { submitBountyProof } from "../../services/bountyService";
import { logWalletInteraction } from "../../services/communityService";

vi.mock("../../hooks/useAuth", () => ({ useAuth: () => ({ walletAddress: "GWALLET", userProfile: { name: "Tester" } }) }));
vi.mock("../../services/bountyService", () => ({ submitBountyProof: vi.fn() }));
vi.mock("../../services/communityService", () => ({ logWalletInteraction: vi.fn().mockResolvedValue(undefined) }));

const bounty = {
  id: 10, title: "Test bounty", category: "Web3 Development" as const, rewardXlm: "10",
  creator: { walletAddress: "GCREATOR", displayName: "Sponsor" }, contributor: null,
  description: "Test", difficulty: "Beginner" as const, status: "Open" as const,
  escrow: { contractEscrowId: 42, fundingTransactionHash: null },
  createdAt: "2026-08-13T00:00:00Z", submissionsCount: 0,
};

const mockSubmit = vi.mocked(submitBountyProof);
const mockLog = vi.mocked(logWalletInteraction);
afterEach(() => { cleanup(); vi.clearAllMocks(); });

function submit() {
  render(<SubmitProofModal bounty={bounty} onClose={vi.fn()} onSuccess={vi.fn()} />);
  fireEvent.change(screen.getByPlaceholderText("https://github.com/yourhandle/bounty-submission"), { target: { value: "https://example.com/proof" } });
  fireEvent.click(screen.getByRole("button", { name: /^submit proof$/i }));
}

describe("SubmitProofModal evidence", () => {
  it("logs proof evidence only after a successful submission", async () => {
    mockSubmit.mockResolvedValue({ id: "1", bountyId: 10, contributor: { walletAddress: "GWALLET", displayName: "Tester" }, proofUrl: "https://example.com/proof", notes: "", submittedAt: "2026-08-13T00:00:00Z", reviewStatus: "Pending", reviewTransactionHash: null });
    submit();
    await waitFor(() => expect(mockLog).toHaveBeenCalledWith(expect.objectContaining({
      walletAddress: "GWALLET", interactionType: "proof_submitted", contractEscrowId: 42,
      metadata: expect.objectContaining({ bounty_id: 10, bounty_title: "Test bounty", bounty_category: "Web3 Development" }),
    })));
  });

  it("does not log evidence when proof submission fails", async () => {
    mockSubmit.mockRejectedValue(new Error("Submission failed"));
    submit();
    await screen.findByText("Submission failed");
    expect(mockLog).not.toHaveBeenCalled();
  });
});