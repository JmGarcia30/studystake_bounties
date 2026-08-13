import {
  Asset,
  BASE_FEE,
  Horizon,
  Operation,
  StrKey,
  Transaction,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { getConfig } from "./config";
import { toFriendlyError } from "./errors";
import { signTransaction as walletSignTransaction } from "./wallet";

export type PaymentStatus = "validating" | "awaiting_signature" | "submitting";

export interface SendXlmInput {
  sourceAddress: string;
  destinationAddress: string;
  amount: string;
  onStatus?: (status: PaymentStatus) => void;
}

interface PaymentDependencies {
  loadAccount: Horizon.Server["loadAccount"];
  submitTransaction: (transaction: Transaction) => Promise<{ hash: string }>;
  signTransaction: typeof walletSignTransaction;
}

const XLM_AMOUNT_PATTERN = /^\d+(?:\.\d{1,7})?$/;

export function validateXlmPayment(destinationAddress: string, amount: string) {
  const destination = destinationAddress.trim();
  const normalizedAmount = amount.trim();
  if (!destination) throw new Error("Enter a destination Stellar address.");
  if (!StrKey.isValidEd25519PublicKey(destination)) {
    throw new Error("Enter a valid Stellar G... destination address.");
  }
  if (!normalizedAmount) throw new Error("Enter an XLM amount.");
  if (!XLM_AMOUNT_PATTERN.test(normalizedAmount)) {
    throw new Error("Enter a valid XLM amount with no more than 7 decimal places.");
  }
  if (Number(normalizedAmount) <= 0) throw new Error("Amount must be greater than 0 XLM.");
  return { destinationAddress: destination, amount: normalizedAmount };
}

/** Builds a classic native-XLM payment and submits only a real wallet-signed envelope. */
export async function sendXlm(input: SendXlmInput, dependencies?: PaymentDependencies) {
  if (!input.sourceAddress) throw new Error("Connect a wallet before sending XLM.");
  input.onStatus?.("validating");
  const validated = validateXlmPayment(input.destinationAddress, input.amount);
  const config = getConfig();
  const server = dependencies ? null : new Horizon.Server(config.horizonUrl);
  const deps: PaymentDependencies = dependencies ?? {
    loadAccount: server!.loadAccount.bind(server),
    submitTransaction: server!.submitTransaction.bind(server),
    signTransaction: walletSignTransaction,
  };

  try {
    const sourceAccount = await deps.loadAccount(input.sourceAddress);
    const unsignedTransaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: config.networkPassphrase,
    })
      .addOperation(Operation.payment({
        destination: validated.destinationAddress,
        asset: Asset.native(),
        amount: validated.amount,
      }))
      .setTimeout(60)
      .build();

    input.onStatus?.("awaiting_signature");
    const { signedTxXdr } = await deps.signTransaction(unsignedTransaction.toXDR(), {
      address: input.sourceAddress,
      networkPassphrase: config.networkPassphrase,
    });
    if (!signedTxXdr) throw new Error("The wallet did not return a signed transaction.");
    const signedTransaction = TransactionBuilder.fromXDR(signedTxXdr, config.networkPassphrase);
    if (!(signedTransaction instanceof Transaction)) {
      throw new Error("The wallet returned an unexpected transaction type.");
    }

    input.onStatus?.("submitting");
    const response = await deps.submitTransaction(signedTransaction);
    if (!response.hash) throw new Error("Horizon did not return a transaction hash.");
    return { hash: response.hash };
  } catch (error) {
    const friendly = toFriendlyError(error);
    const lower = friendly.message.toLowerCase();
    if (lower.includes("not found") || lower.includes("404")) {
      throw new Error("Source account is not funded on Stellar Testnet.");
    }
    if (lower.includes("op_underfunded") || lower.includes("underfunded")) {
      throw new Error("Insufficient XLM balance for this payment and network fee.");
    }
    throw friendly;
  }
}
