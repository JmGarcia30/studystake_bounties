import { useState } from "react";
import "./App.css";
import { WalletPanel } from "./components/WalletPanel";
import { BalancePanel } from "./components/BalancePanel";
import { ContractPanel } from "./components/ContractPanel";
import { StatusPanel } from "./components/StatusPanel";
import { ActivityFeed } from "./components/ActivityFeed";
import { ReputationPanel } from "./components/ReputationPanel";
import type { TxStatus } from "./lib/contract";
import {
  createOptimisticActivity,
  type OptimisticActivity,
  type OptimisticActivityInput,
} from "./lib/optimisticActivity";

// Caps how many local entries we keep around waiting to be confirmed or
// scrolled off — this is a demo feed, not a durable activity log.
const MAX_OPTIMISTIC_ITEMS = 20;

function App() {
  const [address, setAddress] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | undefined>();
  const [txError, setTxError] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [optimisticActivity, setOptimisticActivity] = useState<OptimisticActivity[]>([]);

  function handleTxUpdate(status: TxStatus, hash?: string, error?: string) {
    setTxStatus(status);
    setTxHash(hash);
    setTxError(error);
  }

  function handleSuccess() {
    // Refresh balance and activity feed after any successful transaction.
    setRefreshKey((k) => k + 1);
  }

  function handleActivity(activity: OptimisticActivityInput) {
    setOptimisticActivity((prev) =>
      [...prev, createOptimisticActivity(activity)].slice(-MAX_OPTIMISTIC_ITEMS),
    );
  }

  return (
    <div className="app">
      <header>
        <h1>StudyStake Bounties</h1>
        <p className="muted">Testnet escrow demo for the Stellar Yellow Belt submission.</p>
      </header>

      <main>
        <div className="panel-grid">
          <WalletPanel
            address={address}
            onConnected={setAddress}
            onDisconnected={() => setAddress(null)}
          />
          <BalancePanel address={address} refreshKey={refreshKey} />
          <ReputationPanel address={address} refreshKey={refreshKey} />
        </div>
        <ContractPanel
          address={address}
          onTxUpdate={handleTxUpdate}
          onSuccess={handleSuccess}
          onActivity={handleActivity}
        />
        <StatusPanel status={txStatus} hash={txHash} error={txError} />
        <ActivityFeed refreshKey={refreshKey} optimisticItems={optimisticActivity} />
      </main>
    </div>
  );
}

export default App;
