// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { BalancePanel } from "./BalancePanel";
import { getXlmBalance } from "../lib/horizon";

vi.mock("../lib/horizon", () => ({
  getXlmBalance: vi.fn(),
}));

const mockGetXlmBalance = vi.mocked(getXlmBalance);
const ADDRESS = "GBUFJT7DPW2JELFSBRZJR53DCYRGG7BX4LA2ECJB7PUDXGP33EKJVJBF";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  mockGetXlmBalance.mockReset();
});

describe("BalancePanel", () => {
  it("prompts to connect a wallet when no address is set", () => {
    render(<BalancePanel address={null} refreshKey={0} />);
    expect(screen.getByText(/connect a wallet to see your balance/i)).toBeInTheDocument();
    expect(mockGetXlmBalance).not.toHaveBeenCalled();
  });

  it("shows a loading state while the balance fetch is in flight", () => {
    mockGetXlmBalance.mockReturnValue(new Promise(() => {}));
    render(<BalancePanel address={ADDRESS} refreshKey={0} />);
    expect(screen.getByText(/loading balance/i)).toBeInTheDocument();
  });

  it("shows the resolved balance", async () => {
    mockGetXlmBalance.mockResolvedValue("42.0000000");
    render(<BalancePanel address={ADDRESS} refreshKey={0} />);
    await waitFor(() => expect(screen.getByText(/42\.0000000 xlm/i)).toBeInTheDocument());
  });

  it("shows a friendly error message when the fetch fails", async () => {
    mockGetXlmBalance.mockRejectedValue(
      new Error("Account not found on testnet. Fund it with Friendbot first."),
    );
    render(<BalancePanel address={ADDRESS} refreshKey={0} />);
    await waitFor(() =>
      expect(
        screen.getByText("Account not found on testnet. Fund it with Friendbot first."),
      ).toBeInTheDocument(),
    );
  });

  it("refetches when refreshKey changes", async () => {
    mockGetXlmBalance.mockResolvedValue("10.0000000");
    const { rerender } = render(<BalancePanel address={ADDRESS} refreshKey={0} />);
    await waitFor(() => expect(mockGetXlmBalance).toHaveBeenCalledTimes(1));

    rerender(<BalancePanel address={ADDRESS} refreshKey={1} />);
    await waitFor(() => expect(mockGetXlmBalance).toHaveBeenCalledTimes(2));
  });
});
