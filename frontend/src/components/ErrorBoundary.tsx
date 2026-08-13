import { Component, type ErrorInfo, type ReactNode } from "react";
import { captureException } from "../lib/monitoring";

interface Props {
  children: ReactNode;
  /** Injectable so tests can assert on it without reloading jsdom. */
  onReload?: () => void;
}

interface State {
  error: Error | null;
}

/**
 * Catches unexpected render-time crashes (bad config, unhandled exceptions
 * in a component body, etc.) and shows a friendly fallback instead of a
 * blank page. Panel-level errors (failed transactions, RPC calls) are
 * handled locally by their own components and never reach this boundary.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled error caught by ErrorBoundary:", error, info.componentStack);
    captureException(error, { extra: { componentStack: info.componentStack ?? undefined } });
  }

  handleReload = () => {
    if (this.props.onReload) {
      this.props.onReload();
    } else {
      window.location.reload();
    }
  };

  render() {
    const { error } = this.state;
    if (!error) {
      return this.props.children;
    }

    return (
      <div className="panel" role="alert">
        <h2>Something went wrong</h2>
        <p className="error">
          The app hit an unexpected error and couldn't continue. This is usually caused by a
          configuration problem or a bug, not something you did.
        </p>
        <div className="row">
          <button onClick={this.handleReload}>Reload the page</button>
        </div>
        <details style={{ marginTop: 12 }}>
          <summary className="muted">Technical details</summary>
          <pre className="bounty-detail">{error.message}</pre>
        </details>
      </div>
    );
  }
}
