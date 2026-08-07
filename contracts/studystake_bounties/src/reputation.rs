use soroban_sdk::{contractclient, contracterror, Address, Env};

/// Mirrors the wire-level discriminants of `studystake_reputation::Error`
/// that this client needs to be able to decode.
///
/// Defined locally rather than depending on the studystake_reputation crate:
/// Soroban identifies contract errors by their numeric discriminant on the
/// wire, not by Rust type identity, so a small local mirror trait+error is
/// the correct "shared interface" pattern for calling another contract
/// without a source dependency on its implementation crate.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ReputationError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    NotAdmin = 3,
    AuthorizedContractNotSet = 4,
    UnauthorizedCaller = 5,
    InvalidAmount = 6,
}

#[contractclient(name = "ReputationClient")]
pub trait ReputationContract {
    fn record_completion(
        env: Env,
        caller: Address,
        tutor: Address,
        amount: i128,
    ) -> Result<(), ReputationError>;
}
