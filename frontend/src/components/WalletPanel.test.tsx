// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { WalletPanel } from "./WalletPanel";
import { connectWallet, disconnectWallet } from "../lib/wallet";

vi.mock("../lib/wallet", () => ({
  connectWallet: vi.fn(),
  disconnectWallet: vi.fn(),
}));

const mockConnectWallet = vi.mocked(connectWallet);
const mockDisconnectWallet = vi.mocked(disconnectWallet);

const ADDRESS = "GBUFJT7DPW2JELFSBRZJR53DCYRGG7BX4LA2ECJB7PUDXGP33EKJVJBF";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderPanel(address: string | null) {
  const onConnected = vi.fn();
  const onDisconnected = vi.fn();
  render(
    <WalletPanel address={address} onConnected={onConnected} onDisconnected={onDisconnected} />,
  );
  return { onConnected, onDisconnected };
}

describe("WalletPanel", () => {
  it("shows a Connect Wallet button when no address is connected", () => {
    renderPanel(null);
    expect(screen.getByRole("button", { name: /connect wallet/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /disconnect/i })).not.toBeInTheDocument();
  });

  it("calls onConnected with the resolved address after a successful connect", async () => {
    mockConnectWallet.mockResolvedValue(ADDRESS);
    const { onConnected } = renderPanel(null);

    fireEvent.click(screen.getByRole("button", { name: /connect wallet/i }));

    await waitFor(() => expect(onConnected).toHaveBeenCalledWith(ADDRESS));
  });

  it("shows a Connecting… label while the connect call is in flight", async () => {
    mockConnectWallet.mockReturnValue(new Promise(() => {}));
    renderPanel(null);

    fireEvent.click(screen.getByRole("button", { name: /connect wallet/i }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /connecting…/i })).toBeDisabled(),
    );
  });

  it("shows a friendly error message when connecting fails", async () => {
    mockConnectWallet.mockRejectedValue(new Error("You cancelled the request in your wallet."));
    renderPanel(null);

    fireEvent.click(screen.getByRole("button", { name: /connect wallet/i }));

    await waitFor(() =>
      expect(screen.getByText("You cancelled the request in your wallet.")).toBeInTheDocument(),
    );
  });

  it("shows the connected address and a Disconnect button when a wallet is connected", () => {
    renderPanel(ADDRESS);
    expect(screen.getByText(ADDRESS)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /disconnect/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^connect wallet$/i })).not.toBeInTheDocument();
  });

  it("calls disconnectWallet and onDisconnected when Disconnect is clicked", async () => {
    mockDisconnectWallet.mockResolvedValue(undefined);
    const { onDisconnected } = renderPanel(ADDRESS);

    fireEvent.click(screen.getByRole("button", { name: /disconnect/i }));

    await waitFor(() => expect(onDisconnected).toHaveBeenCalledTimes(1));
    expect(mockDisconnectWallet).toHaveBeenCalledTimes(1);
  });
});
