// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { ReputationPanel } from "./ReputationPanel";
import * as reputation from "../lib/reputation";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const ADDRESS = "GBUFJT7DPW2JELFSBRZJR53DCYRGG7BX4LA2ECJB7PUDXGP33EKJVJBF";

describe("ReputationPanel", () => {
  it("shows a not-configured message when the reputation contract id is unset", () => {
    vi.spyOn(reputation, "isReputationConfigured").mockReturnValue(false);
    render(<ReputationPanel address={ADDRESS} refreshKey={0} />);
    expect(screen.getByText(/not configured yet/i)).toBeInTheDocument();
  });

  it("prompts to connect a wallet when configured but no wallet is connected", () => {
    vi.spyOn(reputation, "isReputationConfigured").mockReturnValue(true);
    render(<ReputationPanel address={null} refreshKey={0} />);
    expect(screen.getByText(/connect a wallet/i)).toBeInTheDocument();
  });

  it("shows a loading state while the reputation call is in flight", () => {
    vi.spyOn(reputation, "isReputationConfigured").mockReturnValue(true);
    vi.spyOn(reputation, "fetchReputation").mockReturnValue(new Promise(() => {}));
    render(<ReputationPanel address={ADDRESS} refreshKey={0} />);
    expect(screen.getByText(/loading reputation/i)).toBeInTheDocument();
  });

  it("shows an empty state when the tutor has no completed bounties yet", async () => {
    vi.spyOn(reputation, "isReputationConfigured").mockReturnValue(true);
    vi.spyOn(reputation, "fetchReputation").mockResolvedValue(null);
    render(<ReputationPanel address={ADDRESS} refreshKey={0} />);
    await waitFor(() => expect(screen.getByText(/no completed bounties yet/i)).toBeInTheDocument());
  });

  it("shows completed count and cumulative volume once loaded", async () => {
    vi.spyOn(reputation, "isReputationConfigured").mockReturnValue(true);
    vi.spyOn(reputation, "fetchReputation").mockResolvedValue({ completed: 4, volume: 12_500n });
    render(<ReputationPanel address={ADDRESS} refreshKey={0} />);
    await waitFor(() => expect(screen.getByText(/completed: 4/i)).toBeInTheDocument());
    expect(screen.getByText(/12500 stroops/)).toBeInTheDocument();
  });

  it("shows a friendly error message when the read fails", async () => {
    vi.spyOn(reputation, "isReputationConfigured").mockReturnValue(true);
    vi.spyOn(reputation, "fetchReputation").mockRejectedValue(new Error("RPC unreachable"));
    render(<ReputationPanel address={ADDRESS} refreshKey={0} />);
    await waitFor(() => expect(screen.getByText(/RPC unreachable/)).toBeInTheDocument());
  });
});
