// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { StatusPanel } from "./StatusPanel";

afterEach(cleanup);

describe("StatusPanel", () => {
  it("renders idle status with no hash", () => {
    render(<StatusPanel status="idle" />);
    expect(screen.getByText(/idle/i)).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows the failure error message when a transaction fails", () => {
    render(<StatusPanel status="failed" error="Enter a positive amount." />);
    expect(screen.getByText("Enter a positive amount.")).toBeInTheDocument();
  });

  it("renders the tx hash as a wrap-safe link so long hashes don't overflow on mobile", () => {
    const hash = "a".repeat(64);
    render(<StatusPanel status="success" hash={hash} />);
    const link = screen.getByRole("link", { name: hash });
    expect(link).toHaveClass("hash");
  });
});
