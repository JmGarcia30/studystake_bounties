import { useState } from "react";
import "./App.css";
import { WalletPanel } from "./components/WalletPanel";
import { BalancePanel } from "./components/BalancePanel";
import { ContractPanel } from "./components/ContractPanel";
import { StatusPanel } from "./components/StatusPanel";
import { ActivityFeed } from "./components/ActivityFeed";
import type { TxStatus } from "./lib/contract";

function App() {
  const [address, setAddress] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | undefined>();
  const [txError, setTxError] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  function handleTxUpdate(status: TxStatus, hash?: string, error?: string) {
    setTxStatus(status);
    setTxHash(hash);
    setTxError(error);
  }

  function handleSuccess() {
    // Refresh balance and activity feed after any successful transaction.
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="app">
      <header>
        <h1>StudyStake Bounties</h1>
        <p className="muted">Testnet escrow demo for the Stellar Yellow Belt submission.</p>
      </header>

      <main>
        <WalletPanel
          address={address}
          onConnected={setAddress}
          onDisconnected={() => setAddress(null)}
        />
        <BalancePanel address={address} refreshKey={refreshKey} />
        <ContractPanel address={address} onTxUpdate={handleTxUpdate} onSuccess={handleSuccess} />
        <StatusPanel status={txStatus} hash={txHash} error={txError} />
        <ActivityFeed refreshKey={refreshKey} />
      </main>
    </div>
  );
}

export default App;
