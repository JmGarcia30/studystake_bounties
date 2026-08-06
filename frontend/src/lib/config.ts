// Public network/contract configuration, read from Vite env vars.
// Nothing here is secret — these are all public testnet identifiers.

export const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID as string;
export const TOKEN_ID = import.meta.env.VITE_TOKEN_ID as string;
export const RPC_URL = import.meta.env.VITE_RPC_URL as string;
export const HORIZON_URL = import.meta.env.VITE_HORIZON_URL as string;
export const NETWORK_PASSPHRASE = import.meta.env
  .VITE_NETWORK_PASSPHRASE as string;

export const EXPLORER_TX_URL = (hash: string) =>
  `https://stellar.expert/explorer/testnet/tx/${hash}`;
