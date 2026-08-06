use soroban_sdk::{contracttype, Address};

#[contracttype]
pub enum DataKey {
    Admin,               // Stores the admin address
    AuthorizedContract,  // Stores the sole bounty contract allowed to record completions
    Reputation(Address), // Stores each tutor's reputation record by their address
}

#[derive(Clone)]
#[contracttype]
pub struct Reputation {
    pub completed: u32,
    pub volume: i128,
}
