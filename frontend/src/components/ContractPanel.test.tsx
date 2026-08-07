// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ContractPanel } from "./ContractPanel";
import { callContract } from "../lib/contract";

vi.mock("../lib/config", () => ({
  getConfig: () => ({
    contractId: "CCEBMZKEH4GBRZVYDDGMSXWCHTL57ZIG6YRVZWRHTU4BP6QZVWQPXI7I",
    tokenId: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    rpcUrl: "https://soroban-testnet.stellar.org",
    horizonUrl: "https://horizon-testnet.stellar.org",
    networkPassphrase: "Test SDF Network ; September 2015",
  }),
}));

// contract.ts's real implementation pulls in the wallet-kit (freighter-api,
// etc.) which doesn't load in jsdom — stub it out entirely, same as the
// component only ever needs callContract/readContract/BOUNTY_STATUS_LABELS.
vi.mock("../lib/contract", () => ({
  callContract: vi.fn(),
  readContract: vi.fn(),
  BOUNTY_STATUS_LABELS: ["Open", "Accepted", "Disputed", "Completed"],
}));

const mockCallContract = vi.mocked(callContract);

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const ADDRESS = "GBUFJT7DPW2JELFSBRZJR53DCYRGG7BX4LA2ECJB7PUDXGP33EKJVJBF";

function renderPanel(address: string | null) {
  const onTxUpdate = vi.fn();
  const onSuccess = vi.fn();
  const onActivity = vi.fn();
  render(
    <ContractPanel
      address={address}
      onTxUpdate={onTxUpdate}
      onSuccess={onSuccess}
      onActivity={onActivity}
    />,
  );
  return { onTxUpdate, onSuccess, onActivity };
}

describe("ContractPanel", () => {
  it("hides write actions and prompts to connect when no wallet is connected", () => {
    renderPanel(null);
    expect(screen.getByText(/connect a wallet to call the contract/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /create bounty/i })).not.toBeInTheDocument();
  });

  it("does not block read-only actions when no wallet is connected", () => {
    renderPanel(null);
    expect(screen.getByRole("button", { name: /refresh bounty count/i })).toBeEnabled();
  });

  it("shows a Creating… label and disables other write actions while create_bounty is in flight", async () => {
    mockCallContract.mockReturnValue(new Promise(() => {}));
    renderPanel(ADDRESS);

    fireEvent.click(screen.getByRole("button", { name: /create bounty/i }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /creating…/i })).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /initialize/i })).toBeDisabled();
  });

  it("shows an Accepting… label while accept_bounty is in flight", async () => {
    mockCallContract.mockReturnValue(new Promise(() => {}));
    renderPanel(ADDRESS);

    fireEvent.change(screen.getAllByPlaceholderText("Bounty ID")[1], { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: /accept bounty/i }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /accepting…/i })).toBeInTheDocument(),
    );
  });

  it("shows a Releasing… label while release_funds is in flight", async () => {
    mockCallContract.mockReturnValue(new Promise(() => {}));
    renderPanel(ADDRESS);

    const bountyIdInputs = screen.getAllByPlaceholderText("Bounty ID");
    fireEvent.change(bountyIdInputs[2], { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: /release funds/i }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /releasing…/i })).toBeInTheDocument(),
    );
  });

  it("calls onSuccess and reports success once a write action resolves", async () => {
    mockCallContract.mockResolvedValue({ hash: "abc123", result: 5 });
    const { onTxUpdate, onSuccess } = renderPanel(ADDRESS);

    fireEvent.click(screen.getByRole("button", { name: /create bounty/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(onTxUpdate).toHaveBeenCalledWith("success", "abc123");
  });

  it("re-enables actions and shows a friendly error when a write action fails", async () => {
    mockCallContract.mockResolvedValue({
      error: "Contract rejected the transaction (error #4).",
    });
    const { onTxUpdate } = renderPanel(ADDRESS);

    fireEvent.click(screen.getByRole("button", { name: /create bounty/i }));

    await waitFor(() =>
      expect(onTxUpdate).toHaveBeenCalledWith(
        "failed",
        undefined,
        "Contract rejected the transaction (error #4).",
      ),
    );
    expect(screen.getByRole("button", { name: /create bounty/i })).toBeEnabled();
  });

  it("displays a friendly message when the wallet request is rejected", async () => {
    mockCallContract.mockResolvedValue({
      error: "You cancelled the request in your wallet.",
    });
    const { onTxUpdate } = renderPanel(ADDRESS);

    fireEvent.click(screen.getByRole("button", { name: /create bounty/i }));

    await waitFor(() =>
      expect(onTxUpdate).toHaveBeenCalledWith(
        "failed",
        undefined,
        "You cancelled the request in your wallet.",
      ),
    );
  });

  it("reports an optimistic activity entry after a successful create_bounty", async () => {
    mockCallContract.mockResolvedValue({ hash: "abc123", result: 7 });
    const { onActivity } = renderPanel(ADDRESS);

    fireEvent.click(screen.getByRole("button", { name: /create bounty/i }));

    await waitFor(() =>
      expect(onActivity).toHaveBeenCalledWith({
        action: "created",
        bountyId: 7,
        actor: ADDRESS,
        amount: 10_000_000n,
      }),
    );
  });

  it("reports an optimistic activity entry after a successful accept_bounty", async () => {
    mockCallContract.mockResolvedValue({ hash: "abc123", result: null });
    const { onActivity } = renderPanel(ADDRESS);

    fireEvent.change(screen.getAllByPlaceholderText("Bounty ID")[1], { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: /accept bounty/i }));

    await waitFor(() =>
      expect(onActivity).toHaveBeenCalledWith({ action: "accepted", bountyId: 3, actor: ADDRESS }),
    );
  });

  it("does not report an optimistic activity entry when a write action fails", async () => {
    mockCallContract.mockResolvedValue({ error: "Enter a positive amount." });
    const { onActivity } = renderPanel(ADDRESS);

    fireEvent.click(screen.getByRole("button", { name: /create bounty/i }));

    await waitFor(() => expect(mockCallContract).toHaveBeenCalled());
    expect(onActivity).not.toHaveBeenCalled();
  });
});
