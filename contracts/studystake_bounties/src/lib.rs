#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, token, Address, Env};

mod error;
mod test;
mod types;

pub use error::Error;
pub use types::{Bounty, BountyStatus, DataKey};

/// One ledger closes roughly every 5 seconds on the Stellar network.
const LEDGERS_PER_DAY: u32 = 17280;

/// Once a bounty record's remaining TTL drops below this many ledgers
/// (~7 days), the next read or write extends it back out to
/// `BOUNTY_TTL_EXTEND_TO`.
const BOUNTY_TTL_THRESHOLD: u32 = 7 * LEDGERS_PER_DAY;

/// Target TTL (~30 days) a bounty record is extended to whenever it is
/// created, read, or updated and its remaining TTL is below the threshold.
const BOUNTY_TTL_EXTEND_TO: u32 = 30 * LEDGERS_PER_DAY;

/// Loads a bounty from persistent storage and extends its TTL.
///
/// Returns `Error::BountyNotFound` if the id was never used or its entry has
/// expired — in either case nothing is written and no TTL is extended.
fn load_bounty(env: &Env, bounty_id: u32) -> Result<Bounty, Error> {
    let key = DataKey::Bounty(bounty_id);
    let bounty: Bounty = env
        .storage()
        .persistent()
        .get(&key)
        .ok_or(Error::BountyNotFound)?;
    env.storage()
        .persistent()
        .extend_ttl(&key, BOUNTY_TTL_THRESHOLD, BOUNTY_TTL_EXTEND_TO);
    Ok(bounty)
}

/// Writes a bounty to persistent storage and extends its TTL.
fn save_bounty(env: &Env, bounty_id: u32, bounty: &Bounty) {
    let key = DataKey::Bounty(bounty_id);
    env.storage().persistent().set(&key, bounty);
    env.storage()
        .persistent()
        .extend_ttl(&key, BOUNTY_TTL_THRESHOLD, BOUNTY_TTL_EXTEND_TO);
}

#[contract]
pub struct StudyStakeBounties;

#[contractimpl]
impl StudyStakeBounties {
    // 1. Initialize the contract with a trusted dispute admin (Student Council)
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::BountyCounter, &0u32);
        Ok(())
    }

    // 2. Buyer creates a bounty and locks funds in the contract
    // `events().publish` is deprecated in favor of `#[contractevent]` structs,
    // but that macro is still evolving in SDK 25; the plain publish API is
    // stable and sufficient for the simple activity-feed events this contract emits.
    #[allow(deprecated)]
    pub fn create_bounty(
        env: Env,
        buyer: Address,
        token: Address,
        amount: i128,
    ) -> Result<u32, Error> {
        buyer.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        // Transfer funds from buyer to the contract (Escrow)
        let token_client = token::TokenClient::new(&env, &token);
        token_client.transfer(&buyer, &env.current_contract_address(), &amount);

        // Generate ID and store bounty
        let mut counter: u32 = env
            .storage()
            .instance()
            .get(&DataKey::BountyCounter)
            .ok_or(Error::NotInitialized)?;
        counter += 1;

        let bounty = Bounty {
            id: counter,
            buyer,
            tutor: None,
            token,
            amount,
            status: BountyStatus::Open,
        };

        save_bounty(&env, counter, &bounty);
        env.storage()
            .instance()
            .set(&DataKey::BountyCounter, &counter);

        env.events().publish(
            (symbol_short!("bounty"), symbol_short!("created")),
            (counter, bounty.buyer.clone(), bounty.amount),
        );

        Ok(counter)
    }

    // 3. Tutor accepts the bounty
    #[allow(deprecated)]
    pub fn accept_bounty(env: Env, tutor: Address, bounty_id: u32) -> Result<(), Error> {
        tutor.require_auth();

        let mut bounty = load_bounty(&env, bounty_id)?;

        if bounty.status != BountyStatus::Open {
            return Err(Error::NotOpen);
        }

        bounty.tutor = Some(tutor.clone());
        bounty.status = BountyStatus::Accepted;
        save_bounty(&env, bounty_id, &bounty);

        env.events().publish(
            (symbol_short!("bounty"), symbol_short!("accepted")),
            (bounty_id, tutor, bounty.amount),
        );

        Ok(())
    }

    // 4. Buyer releases funds after work is complete (Happy Path)
    #[allow(deprecated)]
    pub fn release_funds(env: Env, buyer: Address, bounty_id: u32) -> Result<(), Error> {
        buyer.require_auth();

        let mut bounty = load_bounty(&env, bounty_id)?;

        if bounty.buyer != buyer {
            return Err(Error::NotBuyer);
        }
        if bounty.status != BountyStatus::Accepted {
            return Err(Error::NotAccepted);
        }

        let tutor = bounty.tutor.clone().ok_or(Error::NoTutor)?;

        // Mark completed and transfer funds to tutor
        bounty.status = BountyStatus::Completed;
        save_bounty(&env, bounty_id, &bounty);

        let token_client = token::TokenClient::new(&env, &bounty.token);
        token_client.transfer(&env.current_contract_address(), &tutor, &bounty.amount);

        env.events().publish(
            (symbol_short!("bounty"), symbol_short!("released")),
            (bounty_id, tutor, bounty.amount),
        );

        Ok(())
    }

    // 5. Admin resolves a dispute (Optional Edge Feature)
    #[allow(deprecated)]
    pub fn resolve_dispute(
        env: Env,
        admin: Address,
        bounty_id: u32,
        favor_buyer: bool,
    ) -> Result<(), Error> {
        admin.require_auth();

        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        if admin != stored_admin {
            return Err(Error::NotAdmin);
        }

        let mut bounty = load_bounty(&env, bounty_id)?;

        if bounty.status == BountyStatus::Completed {
            return Err(Error::AlreadyCompleted);
        }

        bounty.status = BountyStatus::Completed;
        save_bounty(&env, bounty_id, &bounty);

        let token_client = token::TokenClient::new(&env, &bounty.token);
        let recipient = if favor_buyer {
            bounty.buyer
        } else {
            bounty.tutor.ok_or(Error::NoTutor)?
        };

        // Route funds to the winner of the dispute
        token_client.transfer(&env.current_contract_address(), &recipient, &bounty.amount);

        env.events().publish(
            (symbol_short!("bounty"), symbol_short!("resolved")),
            (bounty_id, recipient, bounty.amount),
        );

        Ok(())
    }

    // 6. Read a single bounty by id (read-only, no auth required)
    pub fn get_bounty(env: Env, bounty_id: u32) -> Option<Bounty> {
        load_bounty(&env, bounty_id).ok()
    }

    // 7. Read the total number of bounties created so far
    pub fn get_bounty_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::BountyCounter)
            .unwrap_or(0)
    }
}
