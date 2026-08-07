const STROOPS_PER_XLM = 10_000_000n;

/** Converts a user-entered XLM amount string to stroops (the contract's base unit). */
export function xlmToStroops(xlm: string): bigint {
  const value = Number(xlm);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Enter a positive amount.");
  }
  return BigInt(Math.round(value * Number(STROOPS_PER_XLM)));
}
