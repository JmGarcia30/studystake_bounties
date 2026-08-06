import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}




export const Errors = {
  1: {message:"AlreadyInitialized"},
  2: {message:"NotInitialized"},
  3: {message:"NotAdmin"},
  4: {message:"AuthorizedContractNotSet"},
  5: {message:"UnauthorizedCaller"},
  6: {message:"InvalidAmount"}
}

export type DataKey = {tag: "Admin", values: void} | {tag: "AuthorizedContract", values: void} | {tag: "Reputation", values: readonly [string]};


export interface Reputation {
  completed: u32;
  volume: i128;
}

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({admin}: {admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_authorized transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_authorized: ({admin, bounty_contract}: {admin: string, bounty_contract: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a record_completion transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  record_completion: ({caller, tutor, amount}: {caller: string, tutor: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_reputation transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_reputation: ({tutor}: {tutor: string}, options?: MethodOptions) => Promise<AssembledTransaction<Option<Reputation>>>

  /**
   * Construct and simulate a get_completed transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_completed: ({tutor}: {tutor: string}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_volume transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_volume: ({tutor}: {tutor: string}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABgAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAABAAAAAAAAAA5Ob3RJbml0aWFsaXplZAAAAAAAAgAAAAAAAAAITm90QWRtaW4AAAADAAAAAAAAABhBdXRob3JpemVkQ29udHJhY3ROb3RTZXQAAAAEAAAAAAAAABJVbmF1dGhvcml6ZWRDYWxsZXIAAAAAAAUAAAAAAAAADUludmFsaWRBbW91bnQAAAAAAAAG",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAASQXV0aG9yaXplZENvbnRyYWN0AAAAAAABAAAAAAAAAApSZXB1dGF0aW9uAAAAAAABAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAAClJlcHV0YXRpb24AAAAAAAIAAAAAAAAACWNvbXBsZXRlZAAAAAAAAAQAAAAAAAAABnZvbHVtZQAAAAAACw==",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAAAAAAAOc2V0X2F1dGhvcml6ZWQAAAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAPYm91bnR5X2NvbnRyYWN0AAAAABMAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAAAAAAARcmVjb3JkX2NvbXBsZXRpb24AAAAAAAADAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABXR1dG9yAAAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAAAAAAAOZ2V0X3JlcHV0YXRpb24AAAAAAAEAAAAAAAAABXR1dG9yAAAAAAAAEwAAAAEAAAPoAAAH0AAAAApSZXB1dGF0aW9uAAA=",
        "AAAAAAAAAAAAAAANZ2V0X2NvbXBsZXRlZAAAAAAAAAEAAAAAAAAABXR1dG9yAAAAAAAAEwAAAAEAAAAE",
        "AAAAAAAAAAAAAAAKZ2V0X3ZvbHVtZQAAAAAAAQAAAAAAAAAFdHV0b3IAAAAAAAATAAAAAQAAAAs=" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<Result<void>>,
        set_authorized: this.txFromJSON<Result<void>>,
        record_completion: this.txFromJSON<Result<void>>,
        get_reputation: this.txFromJSON<Option<Reputation>>,
        get_completed: this.txFromJSON<u32>,
        get_volume: this.txFromJSON<i128>
  }
}