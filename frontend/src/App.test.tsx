// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { connectWallet } from "./lib/wallet";
import { callContract } from "./lib/contract";
import { getXlmBalance } from "./lib/horizon";
import { isReputationConfigured } from "./lib/reputation";
import { useEventStream } from "./hooks/useEventStream";

vi.mock("./lib/config", () => ({
  getConfig: () => ({
    contractId: "CCEBMZKEH4GBRZVYDDGMSXWCHTL57ZIG6YRVZWRHTU4BP6QZVWQPXI7I",
    tokenId: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    rpcUrl: "https://soroban-testnet.stellar.org",
    horizonUrl: "https://horizon-testnet.stellar.org",
    networkPassphrase: "Test SDF Network ; September 2015",
  }),
  EXPLORER_TX_URL: (hash: string) => `https://stellar.expert/explorer/testnet/tx/${hash}`,
}));

// The wallet-kit (freighter-api, etc.) doesn't load in jsdom — stub the
// module entirely, same as ContractPanel.test.tsx does.
vi.mock("./lib/wallet", () => ({
  connectWallet: vi.fn(),
  disconnectWallet: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./lib/contract", () => ({
  callContract: vi.fn(),
  readContract: vi.fn(),
  BOUNTY_STATUS_LABELS: ["Open", "Accepted", "Disputed", "Completed"],
}));

vi.mock("./lib/horizon", () => ({
  getXlmBalance: vi.fn(),
}));

vi.mock("./lib/reputation", () => ({
  isReputationConfigured: vi.fn().mockReturnValue(false),
  fetchReputation: vi.fn(),
}));

vi.mock("./hooks/useEventStream", () => ({
  useEventStream: vi.fn().mockReturnValue({ items: [], state: "live", error: null }),
}));

const mockConnectWallet = vi.mocked(connectWallet);
const mockCallContract = vi.mocked(callContract);
const mockGetXlmBalance = vi.mocked(getXlmBalance);
const mockIsReputationConfigured = vi.mocked(isReputationConfigured);
const mockUseEventStream = vi.mocked(useEventStream);

const ADDRESS = "GBUFJT7DPW2JELFSBRZJR53DCYRGG7BX4LA2ECJB7PUDXGP33EKJVJBF";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  mockUseEventStream.mockReturnValue({ items: [], state: "live", error: null });
  mockIsReputationConfigured.mockReturnValue(false);
});

describe("App", () => {
  it("renders every main panel without crashing", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Wallet" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Balance" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Reputation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Contract" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Transaction Status" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Live Activity" })).toBeInTheDocument();
  });

  it("shows the no-wallet state across every wallet-dependent panel", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /connect wallet/i })).toBeInTheDocument();
    expect(screen.getByText(/connect a wallet to see your balance/i)).toBeInTheDocument();
    expect(screen.getByText(/connect a wallet to call the contract/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /create bounty/i })).not.toBeInTheDocument();
  });

  it("flows a wallet connection through to the dependent panels", async () => {
    mockConnectWallet.mockResolvedValue(ADDRESS);
    mockGetXlmBalance.mockResolvedValue("100.0000000");
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /connect wallet/i }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /disconnect/i })).toBeInTheDocument(),
    );
    expect(screen.getByText(ADDRESS)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/100\.0000000 xlm/i)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /^create bounty$/i })).toBeInTheDocument();
  });

  it("runs a create_bounty transaction through the full App wiring", async () => {
    mockConnectWallet.mockResolvedValue(ADDRESS);
    mockGetXlmBalance.mockResolvedValue("100.0000000");
    mockCallContract.mockResolvedValue({ hash: "abc123", result: 7 });
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /connect wallet/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^create bounty$/i })).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: /^create bounty$/i }));

    await waitFor(() => expect(screen.getByText("Success")).toBeInTheDocument());
    expect(screen.getByRole("link", { name: "abc123" })).toBeInTheDocument();
  });
});
