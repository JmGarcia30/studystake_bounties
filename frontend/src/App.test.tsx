// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { stellarAdapter } from "./lib/stellar";
import { getXlmBalance } from "./lib/horizon";
import { useEventStream } from "./hooks/useEventStream";
import { fetchUserProfile, saveUserProfile } from "./services/userService";

vi.mock("@creit.tech/stellar-wallets-kit", () => ({
  StellarWalletsKit: {
    init: vi.fn(),
    authModal: vi.fn(),
    disconnect: vi.fn(),
  },
  Networks: { TESTNET: "TESTNET" },
}));

vi.mock("@creit.tech/stellar-wallets-kit/modules/utils", () => ({
  defaultModules: vi.fn().mockReturnValue([]),
}));

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

vi.mock("./lib/stellar", () => ({
  stellarAdapter: {
    connect: vi.fn(),
    signMessage: vi.fn().mockResolvedValue("sig_123"),
    disconnect: vi.fn().mockResolvedValue(undefined),
  },
  createAuthChallenge: vi.fn().mockReturnValue("challenge"),
  verifyWalletSignature: vi.fn().mockResolvedValue(true),
}));

vi.mock("./services/userService", () => ({
  fetchUserProfile: vi.fn(),
  saveUserProfile: vi.fn().mockImplementation(async (p) => p),
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

const mockConnect = vi.mocked(stellarAdapter.connect);
const mockFetchProfile = vi.mocked(fetchUserProfile);
const mockSaveProfile = vi.mocked(saveUserProfile);
const mockGetXlmBalance = vi.mocked(getXlmBalance);
const mockUseEventStream = vi.mocked(useEventStream);

const ADDRESS = "GBUFJT7DPW2JELFSBRZJR53DCYRGG7BX4LA2ECJB7PUDXGP33EKJVJBF";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
  mockUseEventStream.mockReturnValue({ items: [], state: "live", error: null });
});

describe("App & Auth Flow", () => {
  it("renders LandingPage by default for unauthenticated public visitors", () => {
    mockFetchProfile.mockResolvedValue(null);
    render(<App />);
    expect(screen.getByRole("heading", { name: /Earn by Learning/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Connect Stellar Wallet/i }).length).toBeGreaterThan(0);
  });

  it("routes first-time connected wallet from LandingPage to ProfileSetup", async () => {
    mockConnect.mockResolvedValue(ADDRESS);
    mockFetchProfile.mockResolvedValue(null);

    render(<App />);
    // Connect wallet directly from LandingPage
    fireEvent.click(screen.getAllByRole("button", { name: /Connect Stellar Wallet/i })[0]);

    await waitFor(() => {
      expect(screen.getByText("Complete Your Profile")).toBeInTheDocument();
    });
  });

  it("completes profile setup and enters Dashboard", async () => {
    mockConnect.mockResolvedValue(ADDRESS);
    mockFetchProfile.mockResolvedValue(null);
    mockSaveProfile.mockResolvedValue({
      walletAddress: ADDRESS,
      name: "Alex Scholar",
      username: "@alex_scholar",
      bio: "Learning Soroban",
      role: "student",
      createdAt: new Date().toISOString(),
    });
    mockGetXlmBalance.mockResolvedValue("100.0000000");

    render(<App />);
    // Connect wallet directly from LandingPage
    fireEvent.click(screen.getAllByRole("button", { name: /Connect Stellar Wallet/i })[0]);

    await waitFor(() => {
      expect(screen.getByText("Complete Your Profile")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("e.g. Alex Rivera"), {
      target: { value: "Alex Scholar" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. alex_scholar"), {
      target: { value: "alex_scholar" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Save & Enter Dashboard/i }));

    const elements = await screen.findAllByText("Alex Scholar");
    expect(elements.length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Send XLM" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/100\.0000000 xlm/i)).toBeInTheDocument());
  });
});
