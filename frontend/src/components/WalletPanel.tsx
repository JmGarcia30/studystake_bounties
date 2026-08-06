import { useState } from "react";
import { connectWallet, disconnectWallet } from "../lib/wallet";

interface Props {
  address: string | null;
  onConnected: (address: string) => void;
  onDisconnected: () => void;
}

export function WalletPanel({ address, onConnected, onDisconnected }: Props) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setConnecting(true);
    setError(null);
    try {
      const addr = await connectWallet();
      onConnected(addr);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    await disconnectWallet();
    onDisconnected();
  }

  return (
    <section className="panel">
      <h2>Wallet</h2>
      <p className="network-badge">Network: Stellar Testnet</p>
      {address ? (
        <>
          <p className="address">
            Connected: <code>{address}</code>
          </p>
          <button onClick={handleDisconnect}>Disconnect</button>
        </>
      ) : (
        <>
          {/* The kit's picker modal lists all available wallet options
              (Freighter, xBull, Lobstr, hardware wallets, etc). */}
          <button onClick={handleConnect} disabled={connecting}>
            {connecting ? "Connecting…" : "Connect Wallet"}
          </button>
          {error && <p className="error">{error}</p>}
        </>
      )}
    </section>
  );
}
