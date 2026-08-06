#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, token, Address, Env};

mod error;
mod test;
mod types;

pub use error::Error;
pub use types::{Bounty, BountyStatus, DataKey};

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

        env.storage()
            .instance()
            .set(&DataKey::Bounty(counter), &bounty);
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

        let key = DataKey::Bounty(bounty_id);
        let mut bounty: Bounty = env
            .storage()
            .instance()
            .get(&key)
            .ok_or(Error::BountyNotFound)?;

        if bounty.status != BountyStatus::Open {
            return Err(Error::NotOpen);
        }

        bounty.tutor = Some(tutor.clone());
        bounty.status = BountyStatus::Accepted;
        env.storage().instance().set(&key, &bounty);

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

        let key = DataKey::Bounty(bounty_id);
        let mut bounty: Bounty = env
            .storage()
            .instance()
            .get(&key)
            .ok_or(Error::BountyNotFound)?;

        if bounty.buyer != buyer {
            return Err(Error::NotBuyer);
        }
        if bounty.status != BountyStatus::Accepted {
            return Err(Error::NotAccepted);
        }

        let tutor = bounty.tutor.clone().ok_or(Error::NoTutor)?;

        // Mark completed and transfer funds to tutor
        bounty.status = BountyStatus::Completed;
        env.storage().instance().set(&key, &bounty);

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

        let key = DataKey::Bounty(bounty_id);
        let mut bounty: Bounty = env
            .storage()
            .instance()
            .get(&key)
            .ok_or(Error::BountyNotFound)?;

        if bounty.status == BountyStatus::Completed {
            return Err(Error::AlreadyCompleted);
        }

        bounty.status = BountyStatus::Completed;
        env.storage().instance().set(&key, &bounty);

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
        env.storage().instance().get(&DataKey::Bounty(bounty_id))
    }

    // 7. Read the total number of bounties created so far
    pub fn get_bounty_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::BountyCounter)
            .unwrap_or(0)
    }
}
