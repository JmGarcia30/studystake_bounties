import { StellarWalletsKit, Networks } from "@creit.tech/stellar-wallets-kit";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";
import { getConfig } from "./config";
import { toFriendlyError } from "./errors";

export { toFriendlyError };

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
      networkPassphrase: opts?.networkPassphrase ?? getConfig().networkPassphrase,
    });
  } catch (err) {
    throw toFriendlyError(err);
  }
}
