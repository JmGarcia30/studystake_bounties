#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env};

mod error;
mod test;
mod types;

pub use error::Error;
pub use types::{DataKey, Reputation};

/// One ledger closes roughly every 5 seconds on the Stellar network.
const LEDGERS_PER_DAY: u32 = 17280;

/// Once a tutor's reputation record's remaining TTL drops below this many
/// ledgers (~7 days), the next read or write extends it back out to
/// `REPUTATION_TTL_EXTEND_TO`.
const REPUTATION_TTL_THRESHOLD: u32 = 7 * LEDGERS_PER_DAY;

/// Target TTL (~30 days) a reputation record is extended to whenever it is
/// created, read, or updated and its remaining TTL is below the threshold.
const REPUTATION_TTL_EXTEND_TO: u32 = 30 * LEDGERS_PER_DAY;

/// Reads a tutor's reputation record and extends its TTL if present.
///
/// A tutor with no record yet is not an error — a fresh reputation of zero
/// completions is a valid, expected state, unlike a missing bounty id.
fn load_reputation(env: &Env, tutor: &Address) -> Option<Reputation> {
    let key = DataKey::Reputation(tutor.clone());
    let reputation: Option<Reputation> = env.storage().persistent().get(&key);
    if reputation.is_some() {
        env.storage().persistent().extend_ttl(
            &key,
            REPUTATION_TTL_THRESHOLD,
            REPUTATION_TTL_EXTEND_TO,
        );
    }
    reputation
}

/// Writes a tutor's reputation record and extends its TTL.
fn save_reputation(env: &Env, tutor: &Address, reputation: &Reputation) {
    let key = DataKey::Reputation(tutor.clone());
    env.storage().persistent().set(&key, reputation);
    env.storage()
        .persistent()
        .extend_ttl(&key, REPUTATION_TTL_THRESHOLD, REPUTATION_TTL_EXTEND_TO);
}

#[contract]
pub struct StudyStakeReputation;

#[contractimpl]
impl StudyStakeReputation {
    // 1. Initialize the contract with an admin who may configure the
    // authorized bounty contract.
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        admin.require_auth();

        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        Ok(())
    }

    // 2. Admin configures (or updates) the single bounty contract address
    // allowed to record tutor completions.
    pub fn set_authorized(env: Env, admin: Address, bounty_contract: Address) -> Result<(), Error> {
        admin.require_auth();

        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        if admin != stored_admin {
            return Err(Error::NotAdmin);
        }

        env.storage()
            .instance()
            .set(&DataKey::AuthorizedContract, &bounty_contract);
        Ok(())
    }

    // 3. The authorized bounty contract records a tutor's completed bounty.
    // `events().publish` is deprecated in favor of `#[contractevent]` structs,
    // but that macro is still evolving in SDK 25; the plain publish API is
    // stable and sufficient for the simple activity-feed events this contract emits.
    #[allow(deprecated)]
    pub fn record_completion(
        env: Env,
        caller: Address,
        tutor: Address,
        amount: i128,
    ) -> Result<(), Error> {
        caller.require_auth();

        let authorized: Address = env
            .storage()
            .instance()
            .get(&DataKey::AuthorizedContract)
            .ok_or(Error::AuthorizedContractNotSet)?;
        if caller != authorized {
            return Err(Error::UnauthorizedCaller);
        }

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let mut reputation = load_reputation(&env, &tutor).unwrap_or(Reputation {
            completed: 0,
            volume: 0,
        });
        reputation.completed += 1;
        reputation.volume += amount;
        save_reputation(&env, &tutor, &reputation);

        env.events().publish(
            (symbol_short!("reput"), symbol_short!("recorded")),
            (tutor, reputation.completed, reputation.volume, amount),
        );

        Ok(())
    }

    // 4. Read a tutor's full reputation record (read-only, no auth required).
    pub fn get_reputation(env: Env, tutor: Address) -> Option<Reputation> {
        load_reputation(&env, &tutor)
    }

    // 5. Read just a tutor's completed-bounty count.
    pub fn get_completed(env: Env, tutor: Address) -> u32 {
        load_reputation(&env, &tutor)
            .map(|r| r.completed)
            .unwrap_or(0)
    }

    // 6. Read just a tutor's cumulative completed volume.
    pub fn get_volume(env: Env, tutor: Address) -> i128 {
        load_reputation(&env, &tutor).map(|r| r.volume).unwrap_or(0)
    }
}
