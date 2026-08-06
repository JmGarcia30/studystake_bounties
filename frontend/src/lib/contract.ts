import { contract, rpc, scValToNative } from "@stellar/stellar-sdk";
import { CONTRACT_ID, RPC_URL, NETWORK_PASSPHRASE } from "./config";
import { signTransaction, toFriendlyError } from "./wallet";

const server = new rpc.Server(RPC_URL);

export interface ActivityItem {
  id: string;
  ledger: number;
  closedAt: string;
  action: string;
  bountyId: number;
  actor: string;
  amount: bigint;
}

/** Polls the last ~1 hour of ledgers for this contract's activity events. */
export async function getRecentEvents(): Promise<ActivityItem[]> {
  const { sequence } = await server.getLatestLedger();
  const startLedger = Math.max(sequence - 720, 1); // ~1hr at ~5s/ledger

  const { events } = await server.getEvents({
    startLedger,
    filters: [{ type: "contract", contractIds: [CONTRACT_ID] }],
  });

  return events.map((e) => {
    const [, action] = e.topic.map(scValToNative) as [string, string];
    const [bountyId, actor, amount] = scValToNative(e.value) as [
      number,
      string,
      bigint,
    ];
    return {
      id: e.id,
      ledger: e.ledger,
      closedAt: e.ledgerClosedAt,
      action,
      bountyId,
      actor,
      amount,
    };
  });
}

// Mirrors contracts/studystake_bounties/src/lib.rs — kept in sync by hand since
// this contract has no generated TS bindings yet (see README).
export const BOUNTY_STATUS_LABELS = [
  "Open",
  "Accepted",
  "Disputed",
  "Completed",
] as const;

export interface Bounty {
  id: number;
  buyer: string;
  tutor?: string;
  token: string;
  amount: bigint;
  status: number;
}

interface StudyStakeContract {
  initialize: (args: { admin: string }) => Promise<contract.AssembledTransaction<null>>;
  create_bounty: (args: {
    buyer: string;
    token: string;
    amount: bigint;
  }) => Promise<contract.AssembledTransaction<number>>;
  accept_bounty: (args: {
    tutor: string;
    bounty_id: number;
  }) => Promise<contract.AssembledTransaction<null>>;
  release_funds: (args: {
    buyer: string;
    bounty_id: number;
  }) => Promise<contract.AssembledTransaction<null>>;
  resolve_dispute: (args: {
    admin: string;
    bounty_id: number;
    favor_buyer: boolean;
  }) => Promise<contract.AssembledTransaction<null>>;
  get_bounty: (args: {
    bounty_id: number;
  }) => Promise<contract.AssembledTransaction<Bounty | undefined>>;
  get_bounty_count: () => Promise<contract.AssembledTransaction<number>>;
}

let clientPromise: Promise<contract.Client & StudyStakeContract> | null = null;

/** Cached contract client, signed by whichever wallet address is currently connected. */
function getClient() {
  if (!clientPromise) {
    clientPromise = contract.Client.from<StudyStakeContract>({
      contractId: CONTRACT_ID,
      networkPassphrase: NETWORK_PASSPHRASE,
      rpcUrl: RPC_URL,
      signTransaction,
    });
  }
  return clientPromise;
}

export type TxStatus = "idle" | "pending" | "success" | "failed";

export interface TxResult<T = unknown> {
  hash?: string;
  result?: T;
  error?: string;
}

/** Calls a write method, signs it with the connected wallet, and submits it. */
export async function callContract<K extends keyof StudyStakeContract>(
  method: K,
  args: Parameters<StudyStakeContract[K]>[0],
  publicKey: string,
  onStatus: (status: TxStatus) => void,
): Promise<TxResult<Awaited<ReturnType<StudyStakeContract[K]>>["result"]>> {
  onStatus("pending");
  try {
    const client = await getClient();
    const fn = client[method] as (a: unknown) => Promise<contract.AssembledTransaction<unknown>>;
    const assembled = await fn(args ?? {});
    const sent = await assembled.signAndSend({
      // The kit needs to know which address to request a signature from.
      signTransaction: (xdr, opts) =>
        signTransaction(xdr, { ...opts, address: opts?.address ?? publicKey }),
    });
    onStatus("success");
    return {
      hash: sent.sendTransactionResponse?.hash,
      result: sent.result as Awaited<ReturnType<StudyStakeContract[K]>>["result"],
    };
  } catch (err) {
    onStatus("failed");
    return { error: toFriendlyError(err).message };
  }
}

/** Read-only call: simulates only, no signature or fee. */
export async function readContract<K extends "get_bounty" | "get_bounty_count">(
  method: K,
  args?: Parameters<StudyStakeContract[K]>[0],
): Promise<Awaited<ReturnType<StudyStakeContract[K]>>["result"]> {
  const client = await getClient();
  const fn = client[method] as (a: unknown) => Promise<contract.AssembledTransaction<unknown>>;
  const assembled = await fn(args ?? {});
  return assembled.result as Awaited<ReturnType<StudyStakeContract[K]>>["result"];
}
