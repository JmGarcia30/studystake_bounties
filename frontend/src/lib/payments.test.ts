import { Account, Networks, Operation, Transaction, TransactionBuilder } from "@stellar/stellar-sdk";
import { describe, expect, it, vi } from "vitest";
import { sendXlm, validateXlmPayment } from "./payments";

vi.mock("./wallet", () => ({
  signTransaction: vi.fn(),
}));

vi.mock("./config", () => ({
  getConfig: () => ({
    horizonUrl: "https://horizon-testnet.stellar.org",
    networkPassphrase: Networks.TESTNET,
  }),
}));

const SOURCE = "GBUFJT7DPW2JELFSBRZJR53DCYRGG7BX4LA2ECJB7PUDXGP33EKJVJBF";
const DESTINATION = SOURCE;

describe("validateXlmPayment", () => {
  it.each([
    ["", "1", /destination/i],
    ["not-an-address", "1", /valid stellar/i],
    [DESTINATION, "", /amount/i],
    [DESTINATION, "0", /greater than 0/i],
    [DESTINATION, "-1", /valid xlm amount/i],
    [DESTINATION, "NaN", /valid xlm amount/i],
  ])("rejects destination %j and amount %j", (destination, amount, message) => {
    expect(() => validateXlmPayment(destination, amount)).toThrow(message);
  });
});

describe("sendXlm", () => {
  it("builds a native payment, invokes wallet signing, and submits the signed envelope", async () => {
    const loadAccount = vi.fn().mockResolvedValue(new Account(SOURCE, "123"));
    const signTransaction = vi.fn(async (xdr: string) => ({ signedTxXdr: xdr }));
    const submitTransaction = vi.fn().mockResolvedValue({ hash: "real-network-hash" });
    const statuses: string[] = [];

    const result = await sendXlm(
      { sourceAddress: SOURCE, destinationAddress: DESTINATION, amount: "0.1", onStatus: (s) => statuses.push(s) },
      { loadAccount, signTransaction, submitTransaction },
    );

    expect(loadAccount).toHaveBeenCalledWith(SOURCE);
    expect(signTransaction).toHaveBeenCalledOnce();
    const unsigned = TransactionBuilder.fromXDR(signTransaction.mock.calls[0][0], Networks.TESTNET);
    expect(unsigned).toBeInstanceOf(Transaction);
    const payment = (unsigned as Transaction).operations[0];
    expect(payment.type).toBe("payment");
    expect((payment as Operation.Payment).asset.isNative()).toBe(true);
    expect((payment as Operation.Payment).destination).toBe(DESTINATION);
    expect((payment as Operation.Payment).amount).toBe("0.1000000");
    expect(submitTransaction).toHaveBeenCalledOnce();
    expect(result.hash).toBe("real-network-hash");
    expect(statuses).toEqual(["validating", "awaiting_signature", "submitting"]);
  });

  it("does not submit when wallet signing is rejected", async () => {
    const submitTransaction = vi.fn();
    await expect(sendXlm(
      { sourceAddress: SOURCE, destinationAddress: DESTINATION, amount: "1" },
      {
        loadAccount: vi.fn().mockResolvedValue(new Account(SOURCE, "1")),
        signTransaction: vi.fn().mockRejectedValue(new Error("User rejected signing")),
        submitTransaction,
      },
    )).rejects.toThrow("cancelled");
    expect(submitTransaction).not.toHaveBeenCalled();
  });
});
