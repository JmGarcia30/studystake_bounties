#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, Symbol};

// Define the states a bounty can be in
#[derive(Clone, PartialEq, Eq)]
#[contracttype]
pub enum BountyStatus {
    Open,       // Funds locked, waiting for a tutor
    Accepted,   // Tutor assigned, work in progress
    Disputed,   // Dispute raised, waiting for admin
    Completed,  // Funds released to tutor
}

#[contracttype]
pub enum DataKey {
    BountyCounter, // Tracks the global ID
    Bounty(u32),   // Stores individual bounties by ID
    Admin,         // Stores the admin address for disputes
}

#[contracttype]
pub struct Bounty {
    pub id: u32,
    pub buyer: Address,
    pub tutor: Option<Address>,
    pub token: Address,
    pub amount: i128,
    pub status: BountyStatus,
}

#[contract]
pub struct StudyStakeBounties;

#[contractimpl]
impl StudyStakeBounties {
    // 1. Initialize the contract with a trusted dispute admin (Student Council)
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::BountyCounter, &0u32);
    }

    // 2. Buyer creates a bounty and locks funds in the contract
    pub fn create_bounty(env: Env, buyer: Address, token: Address, amount: i128) -> u32 {
        buyer.require_auth();
        
        if amount <= 0 {
            panic!("Amount must be greater than zero");
        }

        // Transfer funds from buyer to the contract (Escrow)
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&buyer, &env.current_contract_address(), &amount);

        // Generate ID and store bounty
        let mut counter: u32 = env.storage().instance().get(&DataKey::BountyCounter).unwrap();
        counter += 1;

        let bounty = Bounty {
            id: counter,
            buyer,
            tutor: None,
            token,
            amount,
            status: BountyStatus::Open,
        };

        env.storage().instance().set(&DataKey::Bounty(counter), &bounty);
        env.storage().instance().set(&DataKey::BountyCounter, &counter);
        
        counter
    }

    // 3. Tutor accepts the bounty
    pub fn accept_bounty(env: Env, tutor: Address, bounty_id: u32) {
        tutor.require_auth();

        let key = DataKey::Bounty(bounty_id);
        let mut bounty: Bounty = env.storage().instance().get(&key).expect("Bounty not found");

        if bounty.status != BountyStatus::Open {
            panic!("Bounty is not open for acceptance");
        }

        bounty.tutor = Some(tutor);
        bounty.status = BountyStatus::Accepted;
        env.storage().instance().set(&key, &bounty);
    }

    // 4. Buyer releases funds after work is complete (Happy Path)
    pub fn release_funds(env: Env, buyer: Address, bounty_id: u32) {
        buyer.require_auth();

        let key = DataKey::Bounty(bounty_id);
        let mut bounty: Bounty = env.storage().instance().get(&key).expect("Bounty not found");

        if bounty.buyer != buyer {
            panic!("Only the buyer can release funds");
        }
        if bounty.status != BountyStatus::Accepted {
            panic!("Bounty is not in an accepted state");
        }

        let tutor = bounty.tutor.clone().expect("No tutor assigned");

        // Mark completed and transfer funds to tutor
        bounty.status = BountyStatus::Completed;
        env.storage().instance().set(&key, &bounty);

        let token_client = token::Client::new(&env, &bounty.token);
        token_client.transfer(&env.current_contract_address(), &tutor, &bounty.amount);
    }

    // 5. Admin resolves a dispute (Optional Edge Feature)
    pub fn resolve_dispute(env: Env, admin: Address, bounty_id: u32, favor_buyer: bool) {
        admin.require_auth();

        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).expect("Not initialized");
        if admin != stored_admin {
            panic!("Only the authorized admin can resolve disputes");
        }

        let key = DataKey::Bounty(bounty_id);
        let mut bounty: Bounty = env.storage().instance().get(&key).expect("Bounty not found");

        if bounty.status == BountyStatus::Completed {
            panic!("Bounty is already completed");
        }

        bounty.status = BountyStatus::Completed;
        env.storage().instance().set(&key, &bounty);

        let token_client = token::Client::new(&env, &bounty.token);
        let recipient = if favor_buyer {
            bounty.buyer
        } else {
            bounty.tutor.expect("No tutor assigned")
        };

        // Route funds to the winner of the dispute
        token_client.transfer(&env.current_contract_address(), &recipient, &bounty.amount);
    }
}