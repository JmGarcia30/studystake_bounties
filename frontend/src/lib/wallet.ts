import { StellarWalletsKit, Networks } from "@creit.tech/stellar-wallets-kit";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import { NETWORK_PASSPHRASE } from "./config";

let initialized = false;

function ensureInit() {
  if (initialized) return;
  StellarWalletsKit.init({
    modules: defaultModules(),
    network: Networks.TESTNET,
  });
  initialized = true;
}

/** Opens the wallet picker modal and returns the connected public key. */
export async function connectWallet(): Promise<string> {
  ensureInit();
  try {
    const { address } = await StellarWalletsKit.authModal();
    return address;
  } catch (err) {
    throw toFriendlyError(err);
  }
}

export async function disconnectWallet(): Promise<void> {
  ensureInit();
  await StellarWalletsKit.disconnect();
}

/** Matches the SDK's `SignTransaction` shape so it can be passed straight to contract.Client. */
export async function signTransaction(
  xdr: string,
  opts?: { address?: string; networkPassphrase?: string },
): Promise<{ signedTxXdr: string; signerAddress?: string }> {
  ensureInit();
  try {
    return await StellarWalletsKit.signTransaction(xdr, {
      address: opts?.address,
      networkPassphrase: opts?.networkPassphrase ?? NETWORK_PASSPHRASE,
    });
  } catch (err) {
    throw toFriendlyError(err);
  }
}

/**
 * Maps kit/wallet errors to the 3 required user-friendly categories:
 * no wallet available, user rejected, and everything else (simulation/submission failures).
 */
export function toFriendlyError(err: unknown): Error {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (
    lower.includes("no modules") ||
    lower.includes("not installed") ||
    lower.includes("not available") ||
    lower.includes("no wallet")
  ) {
    return new Error(
      "No Stellar wallet detected. Install Freighter (or another supported wallet) and try again.",
    );
  }

  if (
    lower.includes("user declined") ||
    lower.includes("rejected") ||
    lower.includes("cancelled") ||
    lower.includes("canceled") ||
    lower.includes("user closed")
  ) {
    return new Error("You cancelled the request in your wallet.");
  }

  return new Error(message);
}
