import { getConfig } from "./config";

/** Fetches the native XLM balance for an account from Horizon. Throws if unfunded. */
export async function getXlmBalance(publicKey: string): Promise<string> {
  const res = await fetch(`${getConfig().horizonUrl}/accounts/${publicKey}`);
  if (res.status === 404) {
    throw new Error(
      "Account not found on testnet. Fund it with Friendbot first.",
    );
  }
  if (!res.ok) {
    throw new Error(`Horizon error: ${res.status}`);
  }
  const data = await res.json();
  const native = (data.balances as Array<{ asset_type: string; balance: string }>).find(
    (b) => b.asset_type === "native",
  );
  return native?.balance ?? "0";
}
