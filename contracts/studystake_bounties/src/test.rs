#![cfg(test)]

mod tests {
    use crate::{
        BountyStatus, DataKey, Error, StudyStakeBounties, StudyStakeBountiesClient,
        BOUNTY_TTL_EXTEND_TO, BOUNTY_TTL_THRESHOLD, LEDGERS_PER_DAY,
    };
    use soroban_sdk::testutils::storage::Persistent as _;
    use soroban_sdk::testutils::{Address as _, Events as _, Ledger as _};
    use soroban_sdk::{symbol_short, token, vec, Address, Env, IntoVal};

    /// Registers the contract and a funded test token, initializes the contract,
    /// and returns the ids needed to build clients in each test.
    ///
    /// Returns owned `Address`es rather than client structs — a client borrows
    /// `&Env`, and this `Env` is also returned/used by the caller, so packaging
    /// both together would be a self-referential tuple.
    fn setup_test(env: &Env) -> (Address, Address, Address, Address, Address) {
        env.mock_all_auths();

        let contract_id = env.register(StudyStakeBounties, ());
        let client = StudyStakeBountiesClient::new(env, &contract_id);

        let admin = Address::generate(env);
        let buyer = Address::generate(env);
        let tutor = Address::generate(env);

        let token_admin = Address::generate(env);
        let sac = env.register_stellar_asset_contract_v2(token_admin);
        let token_id = sac.address();
        let token_admin_client = token::StellarAssetClient::new(env, &token_id);

        // Mint starting balance
        token_admin_client.mint(&buyer, &100);

        client.initialize(&admin);

        (contract_id, admin, buyer, tutor, token_id)
    }

    // Test 1 (Happy path): Escrow flow executes successfully end-to-end
    #[test]
    fn test_happy_path_end_to_end() {
        let env = Env::default();
        let (contract_id, _admin, buyer, tutor, token_id) = setup_test(&env);
        let client = StudyStakeBountiesClient::new(&env, &contract_id);
        let token = token::TokenClient::new(&env, &token_id);

        // 1. Buyer locks 5 USDC
        let bounty_id = client.create_bounty(&buyer, &token.address, &5);
        assert_eq!(token.balance(&buyer), 95);
        assert_eq!(token.balance(&client.address), 5);

        // 2. Tutor accepts
        client.accept_bounty(&tutor, &bounty_id);

        // 3. Buyer releases funds
        client.release_funds(&buyer, &bounty_id);

        // 4. Verify tutor received funds
        assert_eq!(token.balance(&client.address), 0);
        assert_eq!(token.balance(&tutor), 5);
    }

    // Test 2 (Edge case): Unauthorized caller tries to release funds
    #[test]
    fn test_unauthorized_release() {
        let env = Env::default();
        let (contract_id, _admin, buyer, tutor, token_id) = setup_test(&env);
        let client = StudyStakeBountiesClient::new(&env, &contract_id);
        let token = token::TokenClient::new(&env, &token_id);
        let fake_buyer = Address::generate(&env);

        let bounty_id = client.create_bounty(&buyer, &token.address, &5);
        client.accept_bounty(&tutor, &bounty_id);

        // A different address tries to release the funds
        let result = client.try_release_funds(&fake_buyer, &bounty_id);
        assert_eq!(result, Err(Ok(Error::NotBuyer)));
    }

    // Test 3 (State verification): Verify dispute resolution routing to tutor
    #[test]
    fn test_dispute_resolution_to_tutor() {
        let env = Env::default();
        let (contract_id, admin, buyer, tutor, token_id) = setup_test(&env);
        let client = StudyStakeBountiesClient::new(&env, &contract_id);
        let token = token::TokenClient::new(&env, &token_id);

        let bounty_id = client.create_bounty(&buyer, &token.address, &10);
        client.accept_bounty(&tutor, &bounty_id);

        // Admin resolves in favor of tutor (favor_buyer = false)
        client.resolve_dispute(&admin, &bounty_id, &false);

        assert_eq!(token.balance(&client.address), 0);
        assert_eq!(token.balance(&tutor), 10);
        assert_eq!(token.balance(&buyer), 90);
    }

    // Test 4 (State verification): Verify dispute resolution routing back to buyer
    #[test]
    fn test_dispute_resolution_to_buyer() {
        let env = Env::default();
        let (contract_id, admin, buyer, tutor, token_id) = setup_test(&env);
        let client = StudyStakeBountiesClient::new(&env, &contract_id);
        let token = token::TokenClient::new(&env, &token_id);

        let bounty_id = client.create_bounty(&buyer, &token.address, &10);
        client.accept_bounty(&tutor, &bounty_id);

        // Admin resolves in favor of buyer (favor_buyer = true)
        client.resolve_dispute(&admin, &bounty_id, &true);

        assert_eq!(token.balance(&client.address), 0);
        assert_eq!(token.balance(&tutor), 0);
        assert_eq!(token.balance(&buyer), 100); // Refunded
    }

    // Test 5 (Edge case): Prevent double acceptance
    #[test]
    fn test_double_acceptance() {
        let env = Env::default();
        let (contract_id, _admin, buyer, tutor, token_id) = setup_test(&env);
        let client = StudyStakeBountiesClient::new(&env, &contract_id);
        let token = token::TokenClient::new(&env, &token_id);
        let tutor_2 = Address::generate(&env);

        let bounty_id = client.create_bounty(&buyer, &token.address, &5);

        client.accept_bounty(&tutor, &bounty_id);

        // Second tutor tries to accept an already accepted bounty
        let result = client.try_accept_bounty(&tutor_2, &bounty_id);
        assert_eq!(result, Err(Ok(Error::NotOpen)));
    }

    // Test 6: A newly created bounty is stored in persistent storage, not instance storage.
    #[test]
    fn test_bounty_stored_in_persistent_storage() {
        let env = Env::default();
        let (contract_id, _admin, buyer, _tutor, token_id) = setup_test(&env);
        let client = StudyStakeBountiesClient::new(&env, &contract_id);
        let token = token::TokenClient::new(&env, &token_id);

        let bounty_id = client.create_bounty(&buyer, &token.address, &5);

        env.as_contract(&contract_id, || {
            let key = DataKey::Bounty(bounty_id);
            assert!(env.storage().persistent().has(&key));
            assert!(!env.storage().instance().has(&key));
        });
    }

    // Test 7: Reading a bounty after its TTL has dropped below the threshold
    // extends it back out to the target TTL.
    #[test]
    fn test_read_extends_ttl_when_below_threshold() {
        let env = Env::default();
        let (contract_id, _admin, buyer, _tutor, token_id) = setup_test(&env);
        let client = StudyStakeBountiesClient::new(&env, &contract_id);
        let token = token::TokenClient::new(&env, &token_id);

        // Give the test ledger enough headroom to actually grant the TTL
        // this contract asks for.
        env.ledger()
            .set_max_entry_ttl(BOUNTY_TTL_EXTEND_TO + LEDGERS_PER_DAY);

        let bounty_id = client.create_bounty(&buyer, &token.address, &5);

        // Advance the ledger until the bounty's remaining TTL is just below
        // the extend threshold, but the entry has not expired.
        let advance = BOUNTY_TTL_EXTEND_TO - BOUNTY_TTL_THRESHOLD + 1;
        env.ledger().with_mut(|li| li.sequence_number += advance);

        let ttl_before_read = env.as_contract(&contract_id, || {
            env.storage()
                .persistent()
                .get_ttl(&DataKey::Bounty(bounty_id))
        });
        assert!(ttl_before_read < BOUNTY_TTL_THRESHOLD);

        // A read (get_bounty) should extend the TTL back out to the target.
        assert!(client.get_bounty(&bounty_id).is_some());

        let ttl_after_read = env.as_contract(&contract_id, || {
            env.storage()
                .persistent()
                .get_ttl(&DataKey::Bounty(bounty_id))
        });
        assert_eq!(ttl_after_read, BOUNTY_TTL_EXTEND_TO);
    }

    // Test 8: Updating a bounty (accept_bounty) persists the change and
    // extends its TTL.
    #[test]
    fn test_update_persists_and_extends_ttl() {
        let env = Env::default();
        let (contract_id, _admin, buyer, tutor, token_id) = setup_test(&env);
        let client = StudyStakeBountiesClient::new(&env, &contract_id);
        let token = token::TokenClient::new(&env, &token_id);

        env.ledger()
            .set_max_entry_ttl(BOUNTY_TTL_EXTEND_TO + LEDGERS_PER_DAY);

        let bounty_id = client.create_bounty(&buyer, &token.address, &5);

        let advance = BOUNTY_TTL_EXTEND_TO - BOUNTY_TTL_THRESHOLD + 1;
        env.ledger().with_mut(|li| li.sequence_number += advance);

        client.accept_bounty(&tutor, &bounty_id);

        let bounty = client
            .get_bounty(&bounty_id)
            .expect("bounty should still exist");
        assert!(matches!(bounty.status, BountyStatus::Accepted));
        assert_eq!(bounty.tutor, Some(tutor));

        let ttl_after_update = env.as_contract(&contract_id, || {
            env.storage()
                .persistent()
                .get_ttl(&DataKey::Bounty(bounty_id))
        });
        assert_eq!(ttl_after_update, BOUNTY_TTL_EXTEND_TO);
    }

    // Test 9: A bounty id that was never created returns the typed
    // BountyNotFound error, and the failed lookup does not create an entry.
    #[test]
    fn test_missing_bounty_returns_not_found() {
        let env = Env::default();
        let (contract_id, _admin, _buyer, tutor, _token_id) = setup_test(&env);
        let client = StudyStakeBountiesClient::new(&env, &contract_id);

        let missing_id = 999u32;

        assert!(client.get_bounty(&missing_id).is_none());

        let result = client.try_accept_bounty(&tutor, &missing_id);
        assert_eq!(result, Err(Ok(Error::BountyNotFound)));

        env.as_contract(&contract_id, || {
            assert!(!env.storage().persistent().has(&DataKey::Bounty(missing_id)));
        });
    }

    // Test 10: A bounty touched again long after its TTL should have lapsed
    // (no intervening read/write to extend it) is still handled correctly —
    // the next successful access re-establishes a fresh full-length TTL.
    //
    // NOTE: `Env::default()`'s in-memory test host runs with a "recording
    // footprint", which transparently auto-restores an expired persistent
    // entry on access (see `handle_maybe_expired_entry` in
    // soroban-env-host's storage.rs) instead of making it inaccessible the
    // way the real network would until an explicit restore operation. That
    // means this harness cannot observe "expired persistent entry ->
    // BountyNotFound" as a distinct case from "entry never existed" — the
    // latter is exercised by `test_missing_bounty_returns_not_found` above,
    // which does not depend on this auto-restore behavior. This test instead
    // asserts the nearest thing the harness can observe: the contract keeps
    // working correctly on a long-dormant bounty and re-extends its TTL.
    #[test]
    fn test_stale_bounty_access_reestablishes_full_ttl() {
        let env = Env::default();
        let (contract_id, _admin, buyer, tutor, token_id) = setup_test(&env);
        let client = StudyStakeBountiesClient::new(&env, &contract_id);
        let token = token::TokenClient::new(&env, &token_id);

        env.ledger()
            .set_max_entry_ttl(BOUNTY_TTL_EXTEND_TO + LEDGERS_PER_DAY);

        let bounty_id = client.create_bounty(&buyer, &token.address, &5);

        // Advance well past the bounty's TTL, with no read or write in
        // between to extend it.
        env.ledger()
            .with_mut(|li| li.sequence_number += BOUNTY_TTL_EXTEND_TO + 1);

        // The bounty is still reachable and functionally correct — the
        // contract's normal write path re-extends its TTL rather than
        // requiring a dedicated "restore" endpoint.
        client.accept_bounty(&tutor, &bounty_id);

        let bounty = client
            .get_bounty(&bounty_id)
            .expect("bounty should still exist");
        assert!(matches!(bounty.status, BountyStatus::Accepted));

        let ttl_after_access = env.as_contract(&contract_id, || {
            env.storage()
                .persistent()
                .get_ttl(&DataKey::Bounty(bounty_id))
        });
        assert_eq!(ttl_after_access, BOUNTY_TTL_EXTEND_TO);
    }

    // Test 11: The buyer can dispute an accepted bounty.
    #[test]
    fn test_buyer_can_dispute_accepted_bounty() {
        let env = Env::default();
        let (contract_id, _admin, buyer, tutor, token_id) = setup_test(&env);
        let client = StudyStakeBountiesClient::new(&env, &contract_id);
        let token = token::TokenClient::new(&env, &token_id);

        let bounty_id = client.create_bounty(&buyer, &token.address, &5);
        client.accept_bounty(&tutor, &bounty_id);

        client.dispute_bounty(&buyer, &bounty_id);

        let bounty = client.get_bounty(&bounty_id).expect("bounty should exist");
        assert!(matches!(bounty.status, BountyStatus::Disputed));
    }

    // Test 12: The assigned tutor can dispute an accepted bounty.
    #[test]
    fn test_tutor_can_dispute_accepted_bounty() {
        let env = Env::default();
        let (contract_id, _admin, buyer, tutor, token_id) = setup_test(&env);
        let client = StudyStakeBountiesClient::new(&env, &contract_id);
        let token = token::TokenClient::new(&env, &token_id);

        let bounty_id = client.create_bounty(&buyer, &token.address, &5);
        client.accept_bounty(&tutor, &bounty_id);

        client.dispute_bounty(&tutor, &bounty_id);

        let bounty = client.get_bounty(&bounty_id).expect("bounty should exist");
        assert!(matches!(bounty.status, BountyStatus::Disputed));
    }

    // Test 13: An unrelated authenticated address cannot dispute the bounty.
    #[test]
    fn test_unrelated_address_cannot_dispute() {
        let env = Env::default();
        let (contract_id, _admin, buyer, tutor, token_id) = setup_test(&env);
        let client = StudyStakeBountiesClient::new(&env, &contract_id);
        let token = token::TokenClient::new(&env, &token_id);
        let outsider = Address::generate(&env);

        let bounty_id = client.create_bounty(&buyer, &token.address, &5);
        client.accept_bounty(&tutor, &bounty_id);

        let result = client.try_dispute_bounty(&outsider, &bounty_id);
        assert_eq!(result, Err(Ok(Error::Unauthorized)));
    }

    // Test 14: An open bounty (no assigned tutor yet) cannot be disputed,
    // even by its buyer.
    #[test]
    fn test_open_bounty_cannot_be_disputed() {
        let env = Env::default();
        let (contract_id, _admin, buyer, _tutor, token_id) = setup_test(&env);
        let client = StudyStakeBountiesClient::new(&env, &contract_id);
        let token = token::TokenClient::new(&env, &token_id);

        let bounty_id = client.create_bounty(&buyer, &token.address, &5);

        let result = client.try_dispute_bounty(&buyer, &bounty_id);
        assert_eq!(result, Err(Ok(Error::NotAccepted)));
    }

    // Test 15: A completed bounty cannot be disputed.
    #[test]
    fn test_completed_bounty_cannot_be_disputed() {
        let env = Env::default();
        let (contract_id, _admin, buyer, tutor, token_id) = setup_test(&env);
        let client = StudyStakeBountiesClient::new(&env, &contract_id);
        let token = token::TokenClient::new(&env, &token_id);

        let bounty_id = client.create_bounty(&buyer, &token.address, &5);
        client.accept_bounty(&tutor, &bounty_id);
        client.release_funds(&buyer, &bounty_id);

        let result = client.try_dispute_bounty(&buyer, &bounty_id);
        assert_eq!(result, Err(Ok(Error::NotAccepted)));
    }

    // Test 16: An already disputed bounty cannot be disputed again.
    #[test]
    fn test_already_disputed_bounty_cannot_be_disputed_again() {
        let env = Env::default();
        let (contract_id, _admin, buyer, tutor, token_id) = setup_test(&env);
        let client = StudyStakeBountiesClient::new(&env, &contract_id);
        let token = token::TokenClient::new(&env, &token_id);

        let bounty_id = client.create_bounty(&buyer, &token.address, &5);
        client.accept_bounty(&tutor, &bounty_id);
        client.dispute_bounty(&buyer, &bounty_id);

        let result = client.try_dispute_bounty(&tutor, &bounty_id);
        assert_eq!(result, Err(Ok(Error::NotAccepted)));
    }

    // Test 17: resolve_dispute succeeds after dispute_bounty places the
    // bounty into the Disputed state.
    #[test]
    fn test_resolve_dispute_succeeds_after_dispute_bounty() {
        let env = Env::default();
        let (contract_id, admin, buyer, tutor, token_id) = setup_test(&env);
        let client = StudyStakeBountiesClient::new(&env, &contract_id);
        let token = token::TokenClient::new(&env, &token_id);

        let bounty_id = client.create_bounty(&buyer, &token.address, &10);
        client.accept_bounty(&tutor, &bounty_id);
        client.dispute_bounty(&tutor, &bounty_id);

        let bounty = client.get_bounty(&bounty_id).expect("bounty should exist");
        assert!(matches!(bounty.status, BountyStatus::Disputed));

        client.resolve_dispute(&admin, &bounty_id, &false);

        assert_eq!(token.balance(&client.address), 0);
        assert_eq!(token.balance(&tutor), 10);
        assert_eq!(token.balance(&buyer), 90);
    }

    // Test 18: dispute_bounty emits a ("bounty", "disputed") event carrying
    // the bounty id, the caller who raised the dispute, and the amount.
    #[test]
    fn test_dispute_event_emitted() {
        let env = Env::default();
        let (contract_id, _admin, buyer, tutor, token_id) = setup_test(&env);
        let client = StudyStakeBountiesClient::new(&env, &contract_id);
        let token = token::TokenClient::new(&env, &token_id);

        let bounty_id = client.create_bounty(&buyer, &token.address, &7);
        client.accept_bounty(&tutor, &bounty_id);

        client.dispute_bounty(&buyer, &bounty_id);

        assert_eq!(
            env.events().all(),
            vec![
                &env,
                (
                    contract_id.clone(),
                    (symbol_short!("bounty"), symbol_short!("disputed")).into_val(&env),
                    (bounty_id, buyer.clone(), 7i128).into_val(&env),
                ),
            ]
        );
    }
}
