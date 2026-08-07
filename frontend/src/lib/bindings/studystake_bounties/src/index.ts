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
  3: {message:"InvalidAmount"},
  4: {message:"BountyNotFound"},
  5: {message:"NotOpen"},
  6: {message:"NotAccepted"},
  7: {message:"NotBuyer"},
  8: {message:"NotAdmin"},
  9: {message:"NoTutor"},
  10: {message:"AlreadyCompleted"},
  11: {message:"Unauthorized"}
}

/**
 * Mirrors the wire-level discriminants of `studystake_reputation::Error`
 * that this client needs to be able to decode.
 * 
 * Defined locally rather than depending on the studystake_reputation crate:
 * Soroban identifies contract errors by their numeric discriminant on the
 * wire, not by Rust type identity, so a small local mirror trait+error is
 * the correct "shared interface" pattern for calling another contract
 * without a source dependency on its implementation crate.
 */
export const ReputationError = {
  1: {message:"AlreadyInitialized"},
  2: {message:"NotInitialized"},
  3: {message:"NotAdmin"},
  4: {message:"AuthorizedContractNotSet"},
  5: {message:"UnauthorizedCaller"},
  6: {message:"InvalidAmount"}
}

export type BountyStatus = {tag: "Open", values: void} | {tag: "Accepted", values: void} | {tag: "Disputed", values: void} | {tag: "Completed", values: void};

export type DataKey = {tag: "BountyCounter", values: void} | {tag: "Bounty", values: readonly [u32]} | {tag: "Admin", values: void} | {tag: "ReputationContract", values: void};


export interface Bounty {
  amount: i128;
  buyer: string;
  id: u32;
  status: BountyStatus;
  token: string;
  tutor: Option<string>;
}

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({admin}: {admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a create_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_bounty: ({buyer, token, amount}: {buyer: string, token: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a accept_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  accept_bounty: ({tutor, bounty_id}: {tutor: string, bounty_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a dispute_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  dispute_bounty: ({caller, bounty_id}: {caller: string, bounty_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a release_funds transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  release_funds: ({buyer, bounty_id}: {buyer: string, bounty_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a resolve_dispute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  resolve_dispute: ({admin, bounty_id, favor_buyer}: {admin: string, bounty_id: u32, favor_buyer: boolean}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_bounty: ({bounty_id}: {bounty_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Option<Bounty>>>

  /**
   * Construct and simulate a get_bounty_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_bounty_count: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a set_reputation transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_reputation: ({admin, reputation_contract}: {admin: string, reputation_contract: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_reputation_contract transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_reputation_contract: (options?: MethodOptions) => Promise<AssembledTransaction<Option<string>>>

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
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACwAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAABAAAAAAAAAA5Ob3RJbml0aWFsaXplZAAAAAAAAgAAAAAAAAANSW52YWxpZEFtb3VudAAAAAAAAAMAAAAAAAAADkJvdW50eU5vdEZvdW5kAAAAAAAEAAAAAAAAAAdOb3RPcGVuAAAAAAUAAAAAAAAAC05vdEFjY2VwdGVkAAAAAAYAAAAAAAAACE5vdEJ1eWVyAAAABwAAAAAAAAAITm90QWRtaW4AAAAIAAAAAAAAAAdOb1R1dG9yAAAAAAkAAAAAAAAAEEFscmVhZHlDb21wbGV0ZWQAAAAKAAAAAAAAAAxVbmF1dGhvcml6ZWQAAAAL",
        "AAAABAAAActNaXJyb3JzIHRoZSB3aXJlLWxldmVsIGRpc2NyaW1pbmFudHMgb2YgYHN0dWR5c3Rha2VfcmVwdXRhdGlvbjo6RXJyb3JgCnRoYXQgdGhpcyBjbGllbnQgbmVlZHMgdG8gYmUgYWJsZSB0byBkZWNvZGUuCgpEZWZpbmVkIGxvY2FsbHkgcmF0aGVyIHRoYW4gZGVwZW5kaW5nIG9uIHRoZSBzdHVkeXN0YWtlX3JlcHV0YXRpb24gY3JhdGU6ClNvcm9iYW4gaWRlbnRpZmllcyBjb250cmFjdCBlcnJvcnMgYnkgdGhlaXIgbnVtZXJpYyBkaXNjcmltaW5hbnQgb24gdGhlCndpcmUsIG5vdCBieSBSdXN0IHR5cGUgaWRlbnRpdHksIHNvIGEgc21hbGwgbG9jYWwgbWlycm9yIHRyYWl0K2Vycm9yIGlzCnRoZSBjb3JyZWN0ICJzaGFyZWQgaW50ZXJmYWNlIiBwYXR0ZXJuIGZvciBjYWxsaW5nIGFub3RoZXIgY29udHJhY3QKd2l0aG91dCBhIHNvdXJjZSBkZXBlbmRlbmN5IG9uIGl0cyBpbXBsZW1lbnRhdGlvbiBjcmF0ZS4AAAAAAAAAAA9SZXB1dGF0aW9uRXJyb3IAAAAABgAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAABAAAAAAAAAA5Ob3RJbml0aWFsaXplZAAAAAAAAgAAAAAAAAAITm90QWRtaW4AAAADAAAAAAAAABhBdXRob3JpemVkQ29udHJhY3ROb3RTZXQAAAAEAAAAAAAAABJVbmF1dGhvcml6ZWRDYWxsZXIAAAAAAAUAAAAAAAAADUludmFsaWRBbW91bnQAAAAAAAAG",
        "AAAAAgAAAAAAAAAAAAAADEJvdW50eVN0YXR1cwAAAAQAAAAAAAAAAAAAAARPcGVuAAAAAAAAAAAAAAAIQWNjZXB0ZWQAAAAAAAAAAAAAAAhEaXNwdXRlZAAAAAAAAAAAAAAACUNvbXBsZXRlZAAAAA==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABAAAAAAAAAAAAAAADUJvdW50eUNvdW50ZXIAAAAAAAABAAAAAAAAAAZCb3VudHkAAAAAAAEAAAAEAAAAAAAAAAAAAAAFQWRtaW4AAAAAAAAAAAAAAAAAABJSZXB1dGF0aW9uQ29udHJhY3QAAA==",
        "AAAAAQAAAAAAAAAAAAAABkJvdW50eQAAAAAABgAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAVidXllcgAAAAAAABMAAAAAAAAAAmlkAAAAAAAEAAAAAAAAAAZzdGF0dXMAAAAAB9AAAAAMQm91bnR5U3RhdHVzAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAABXR1dG9yAAAAAAAD6AAAABM=",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAAAAAAANY3JlYXRlX2JvdW50eQAAAAAAAAMAAAAAAAAABWJ1eWVyAAAAAAAAEwAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAD6QAAAAQAAAAD",
        "AAAAAAAAAAAAAAANYWNjZXB0X2JvdW50eQAAAAAAAAIAAAAAAAAABXR1dG9yAAAAAAAAEwAAAAAAAAAJYm91bnR5X2lkAAAAAAAABAAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAAAAAAAOZGlzcHV0ZV9ib3VudHkAAAAAAAIAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAJYm91bnR5X2lkAAAAAAAABAAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAAAAAAANcmVsZWFzZV9mdW5kcwAAAAAAAAIAAAAAAAAABWJ1eWVyAAAAAAAAEwAAAAAAAAAJYm91bnR5X2lkAAAAAAAABAAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAAAAAAAPcmVzb2x2ZV9kaXNwdXRlAAAAAAMAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAJYm91bnR5X2lkAAAAAAAABAAAAAAAAAALZmF2b3JfYnV5ZXIAAAAAAQAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAAAAAAAKZ2V0X2JvdW50eQAAAAAAAQAAAAAAAAAJYm91bnR5X2lkAAAAAAAABAAAAAEAAAPoAAAH0AAAAAZCb3VudHkAAA==",
        "AAAAAAAAAAAAAAAQZ2V0X2JvdW50eV9jb3VudAAAAAAAAAABAAAABA==",
        "AAAAAAAAAAAAAAAOc2V0X3JlcHV0YXRpb24AAAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAATcmVwdXRhdGlvbl9jb250cmFjdAAAAAATAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAAAAAAAXZ2V0X3JlcHV0YXRpb25fY29udHJhY3QAAAAAAAAAAAEAAAPoAAAAEw==" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<Result<void>>,
        create_bounty: this.txFromJSON<Result<u32>>,
        accept_bounty: this.txFromJSON<Result<void>>,
        dispute_bounty: this.txFromJSON<Result<void>>,
        release_funds: this.txFromJSON<Result<void>>,
        resolve_dispute: this.txFromJSON<Result<void>>,
        get_bounty: this.txFromJSON<Option<Bounty>>,
        get_bounty_count: this.txFromJSON<u32>,
        set_reputation: this.txFromJSON<Result<void>>,
        get_reputation_contract: this.txFromJSON<Option<string>>
  }
}