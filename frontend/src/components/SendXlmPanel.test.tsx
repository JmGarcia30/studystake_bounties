// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sendXlm } from "../lib/payments";
import { SendXlmPanel } from "./SendXlmPanel";

vi.mock("../lib/payments", () => ({ sendXlm: vi.fn() }));
vi.mock("../lib/config", () => ({
  EXPLORER_TX_URL: (hash: string) => `https://stellar.expert/explorer/testnet/tx/${hash}`,
}));

const ADDRESS = "GBUFJT7DPW2JELFSBRZJR53DCYRGG7BX4LA2ECJB7PUDXGP33EKJVJBF";
const mockSendXlm = vi.mocked(sendXlm);

afterEach(() => { cleanup(); vi.restoreAllMocks(); mockSendXlm.mockReset(); });

describe("SendXlmPanel", () => {
  it("requires a connected wallet", () => {
    render(<SendXlmPanel address={null} onSuccess={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Send XLM" })).toBeDisabled();
    expect(screen.getByText(/connect wallet above/i)).toBeInTheDocument();
  });

  it("shows a rejected wallet-signing failure", async () => {
    mockSendXlm.mockRejectedValue(new Error("You cancelled the request in your wallet."));
    render(<SendXlmPanel address={ADDRESS} onSuccess={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Send XLM" }));
    await waitFor(() => expect(screen.getByText(/cancelled the request/i)).toBeInTheDocument());
  });

  it("shows the real returned hash and refreshes balance after success", async () => {
    const onSuccess = vi.fn();
    mockSendXlm.mockResolvedValue({ hash: "network-hash-123" });
    render(<SendXlmPanel address={ADDRESS} onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText(/destination stellar address/i), { target: { value: ADDRESS } });
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: "0.1" } });
    fireEvent.click(screen.getByRole("button", { name: "Send XLM" }));
    await waitFor(() => expect(screen.getByText("XLM sent successfully")).toBeInTheDocument());
    expect(screen.getByRole("link", { name: "network-hash-123" })).toHaveAttribute("href", expect.stringContaining("/testnet/tx/network-hash-123"));
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it("prevents duplicate submissions while pending", async () => {
    mockSendXlm.mockImplementation(({ onStatus }) => { onStatus?.("awaiting_signature"); return new Promise(() => {}); });
    render(<SendXlmPanel address={ADDRESS} onSuccess={vi.fn()} />);
    const button = screen.getByRole("button", { name: "Send XLM" });
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByRole("button", { name: /awaiting wallet signature/i })).toBeDisabled());
    fireEvent.click(screen.getByRole("button", { name: /awaiting wallet signature/i }));
    expect(mockSendXlm).toHaveBeenCalledOnce();
  });
});
