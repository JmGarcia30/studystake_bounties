use soroban_sdk::contracterror;

// Discriminants are part of the contract's public API — the frontend maps
// these numbers to user-facing messages, so once assigned they must never
// be renumbered or reused for a different meaning.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    InvalidAmount = 3,
    BountyNotFound = 4,
    NotOpen = 5,
    NotAccepted = 6,
    NotBuyer = 7,
    NotAdmin = 8,
    NoTutor = 9,
    AlreadyCompleted = 10,
}
