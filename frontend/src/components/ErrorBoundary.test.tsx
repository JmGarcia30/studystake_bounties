// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ErrorBoundary } from "./ErrorBoundary";

function Bomb(): never {
  throw new Error("boom: bad config value");
}

afterEach(cleanup);

describe("ErrorBoundary", () => {
  it("renders children normally when nothing throws", () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("renders a friendly fallback when a child throws during render", () => {
    // React logs the caught error to the console; silence it for this test.
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/boom: bad config value/)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("calls the injected reload handler when the reload button is clicked", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const onReload = vi.fn();

    render(
      <ErrorBoundary onReload={onReload}>
        <Bomb />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByRole("button", { name: /reload the page/i }));
    expect(onReload).toHaveBeenCalledOnce();

    vi.restoreAllMocks();
  });
});
