// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Level4Evidence } from "./Level4Evidence";
import { getSupabaseConfig } from "../lib/supabase";
import { submitUserFeedback } from "../services/communityService";

vi.mock("../lib/supabase", () => ({ getSupabaseConfig: vi.fn() }));
vi.mock("../services/communityService", () => ({ submitUserFeedback: vi.fn() }));
const mockConfig = vi.mocked(getSupabaseConfig);
const mockSubmit = vi.mocked(submitUserFeedback);

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("Level4Evidence", () => {
  it("validates feedback and shows success", async () => {
    mockConfig.mockReturnValue({ url: "https://example.supabase.co", anonKey: "key" });
    mockSubmit.mockResolvedValue(undefined);
    render(<Level4Evidence walletAddress="GWALLET" />);
    fireEvent.click(screen.getByRole("button", { name: /submit feedback/i }));
    expect(screen.getByRole("alert")).toHaveTextContent("Feedback cannot be empty");
    fireEvent.change(screen.getByLabelText(/what worked/i), { target: { value: "Useful test flow" } });
    fireEvent.change(screen.getByLabelText(/rating/i), { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: /submit feedback/i }));
    await waitFor(() => expect(mockSubmit).toHaveBeenCalledWith({ walletAddress: "GWALLET", rating: 4, feedback: "Useful test flow" }));
    expect(await screen.findByRole("status")).toHaveTextContent(/feedback was saved/i);
  });

  it("shows a Supabase error", async () => {
    mockConfig.mockReturnValue({ url: "https://example.supabase.co", anonKey: "key" });
    mockSubmit.mockRejectedValue(new Error("RLS blocked insert"));
    render(<Level4Evidence walletAddress={null} />);
    fireEvent.change(screen.getByLabelText(/what worked/i), { target: { value: "A note" } });
    fireEvent.click(screen.getByRole("button", { name: /submit feedback/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("RLS blocked insert");
  });

  it("keeps local fallback clear and does not attempt a shared write", () => {
    mockConfig.mockReturnValue(null);
    render(<Level4Evidence walletAddress={null} />);
    expect(screen.getByText("Local fallback mode")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit feedback/i })).toBeDisabled();
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});