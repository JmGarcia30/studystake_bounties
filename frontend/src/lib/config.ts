// Public network/contract configuration, read from Vite env vars.
// Nothing here is secret — these are all public testnet identifiers.

export interface AppConfig {
  contractId: string;
  tokenId: string;
  rpcUrl: string;
  horizonUrl: string;
  networkPassphrase: string;
}

const REQUIRED_KEYS = [
  "VITE_CONTRACT_ID",
  "VITE_TOKEN_ID",
  "VITE_RPC_URL",
  "VITE_HORIZON_URL",
  "VITE_NETWORK_PASSPHRASE",
] as const;

// Stellar contract addresses: 'C' + 55 base32 chars (strkey-encoded contract id).
const CONTRACT_ADDRESS_PATTERN = /^C[A-Z2-7]{55}$/;

function isPlaceholder(value: string): boolean {
  return /^<.*>$/.test(value.trim());
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates raw env values and returns typed config, or throws a single
 * Error listing every problem found — so a broken deployment fails with
 * one readable message instead of a cryptic runtime crash deep in the app.
 */
export function validateConfig(env: Record<string, string | undefined>): AppConfig {
  const problems: string[] = [];

  for (const key of REQUIRED_KEYS) {
    const value = env[key];
    if (!value || value.trim() === "") {
      problems.push(`${key} is missing.`);
    } else if (isPlaceholder(value)) {
      problems.push(`${key} still has a placeholder value ("${value}").`);
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `Invalid frontend configuration:\n${problems.map((p) => `  - ${p}`).join("\n")}\n` +
      `Copy frontend/.env.example to frontend/.env and fill in real values.`,
    );
  }

  const contractId = env.VITE_CONTRACT_ID!;
  const tokenId = env.VITE_TOKEN_ID!;
  const rpcUrl = env.VITE_RPC_URL!;
  const horizonUrl = env.VITE_HORIZON_URL!;
  const networkPassphrase = env.VITE_NETWORK_PASSPHRASE!;

  if (!CONTRACT_ADDRESS_PATTERN.test(contractId)) {
    problems.push(`VITE_CONTRACT_ID is not a valid Stellar contract address: "${contractId}".`);
  }
  if (!CONTRACT_ADDRESS_PATTERN.test(tokenId)) {
    problems.push(`VITE_TOKEN_ID is not a valid Stellar contract address: "${tokenId}".`);
  }
  if (!isValidUrl(rpcUrl)) {
    problems.push(`VITE_RPC_URL is not a valid URL: "${rpcUrl}".`);
  }
  if (!isValidUrl(horizonUrl)) {
    problems.push(`VITE_HORIZON_URL is not a valid URL: "${horizonUrl}".`);
  }

  if (problems.length > 0) {
    throw new Error(
      `Invalid frontend configuration:\n${problems.map((p) => `  - ${p}`).join("\n")}`,
    );
  }

  return { contractId, tokenId, rpcUrl, horizonUrl, networkPassphrase };
}

let cachedConfig: AppConfig | null = null;

/**
 * Lazily validates and caches config on first use. Deferred (rather than
 * validated at module load) so the first failure happens inside a React
 * render or an action handler — where it's catchable — instead of crashing
 * the whole script before the app can even mount.
 */
export function getConfig(): AppConfig {
  if (!cachedConfig) {
    cachedConfig = validateConfig(import.meta.env as unknown as Record<string, string | undefined>);
  }
  return cachedConfig;
}

export const EXPLORER_TX_URL = (hash: string) =>
  `https://stellar.expert/explorer/testnet/tx/${hash}`;
