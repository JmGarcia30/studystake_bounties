use soroban_sdk::{contracttype, Address};

// Define the states a bounty can be in
#[derive(Clone, PartialEq, Eq)]
#[contracttype]
pub enum BountyStatus {
    Open,      // Funds locked, waiting for a tutor
    Accepted,  // Tutor assigned, work in progress
    Disputed,  // Dispute raised, waiting for admin
    Completed, // Funds released to tutor
}

#[contracttype]
pub enum DataKey {
    BountyCounter,      // Tracks the global ID
    Bounty(u32),        // Stores individual bounties by ID
    Admin,              // Stores the admin address for disputes
    ReputationContract, // Stores the optional linked reputation contract address
}

#[derive(Clone)]
#[contracttype]
pub struct Bounty {
    pub id: u32,
    pub buyer: Address,
    pub tutor: Option<Address>,
    pub token: Address,
    pub amount: i128,
    pub status: BountyStatus,
}
