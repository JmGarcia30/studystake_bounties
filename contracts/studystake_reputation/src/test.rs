#![cfg(test)]

mod tests {
    use crate::{
        DataKey, Error, StudyStakeReputation, StudyStakeReputationClient, LEDGERS_PER_DAY,
        REPUTATION_TTL_EXTEND_TO, REPUTATION_TTL_THRESHOLD,
    };
    use soroban_sdk::testutils::storage::Persistent as _;
    use soroban_sdk::testutils::{Address as _, Events as _, Ledger as _};
    use soroban_sdk::{symbol_short, vec, Address, Env, IntoVal};

    /// Registers the contract, initializes it, and configures `bounty_contract`
    /// as the authorized caller. Returns the ids tests need to build clients.
    fn setup_test(env: &Env) -> (Address, Address, Address) {
        env.mock_all_auths();

        let contract_id = env.register(StudyStakeReputation, ());
        let client = StudyStakeReputationClient::new(env, &contract_id);

        let admin = Address::generate(env);
        let bounty_contract = Address::generate(env);

        client.initialize(&admin);
        client.set_authorized(&admin, &bounty_contract);

        (contract_id, admin, bounty_contract)
    }

    // Test 1: Successful initialization allows the admin to configure the
    // authorized contract afterward (proves the admin was actually stored).
    #[test]
    fn test_initialize_succeeds() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(StudyStakeReputation, ());
        let client = StudyStakeReputationClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let bounty_contract = Address::generate(&env);

        client.initialize(&admin);

        let result = client.try_set_authorized(&admin, &bounty_contract);
        assert!(result.is_ok());
    }

    // Test 2: Duplicate initialization is rejected.
    #[test]
    fn test_duplicate_initialize_rejected() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(StudyStakeReputation, ());
        let client = StudyStakeReputationClient::new(&env, &contract_id);
        let admin = Address::generate(&env);

        client.initialize(&admin);

        let result = client.try_initialize(&admin);
        assert_eq!(result, Err(Ok(Error::AlreadyInitialized)));
    }

    // Test 3: The admin can (re)configure the authorized contract.
    #[test]
    fn test_admin_can_set_authorized() {
        let env = Env::default();
        let (contract_id, admin, _bounty_contract) = setup_test(&env);
        let client = StudyStakeReputationClient::new(&env, &contract_id);
        let new_contract = Address::generate(&env);

        let result = client.try_set_authorized(&admin, &new_contract);
        assert!(result.is_ok());
    }

    // Test 4: A non-admin caller cannot configure the authorized contract.
    #[test]
    fn test_non_admin_cannot_set_authorized() {
        let env = Env::default();
        let (contract_id, _admin, _bounty_contract) = setup_test(&env);
        let client = StudyStakeReputationClient::new(&env, &contract_id);
        let outsider = Address::generate(&env);
        let new_contract = Address::generate(&env);

        let result = client.try_set_authorized(&outsider, &new_contract);
        assert_eq!(result, Err(Ok(Error::NotAdmin)));
    }

    // Test 5: The authorized caller can record a tutor's completion.
    #[test]
    fn test_authorized_caller_can_record_completion() {
        let env = Env::default();
        let (contract_id, _admin, bounty_contract) = setup_test(&env);
        let client = StudyStakeReputationClient::new(&env, &contract_id);
        let tutor = Address::generate(&env);

        client.record_completion(&bounty_contract, &tutor, &5);

        let reputation = client
            .get_reputation(&tutor)
            .expect("reputation should exist");
        assert_eq!(reputation.completed, 1);
        assert_eq!(reputation.volume, 5);
    }

    // Test 6: A caller other than the configured authorized contract is rejected.
    #[test]
    fn test_unauthorized_caller_rejected() {
        let env = Env::default();
        let (contract_id, _admin, _bounty_contract) = setup_test(&env);
        let client = StudyStakeReputationClient::new(&env, &contract_id);
        let outsider = Address::generate(&env);
        let tutor = Address::generate(&env);

        let result = client.try_record_completion(&outsider, &tutor, &5);
        assert_eq!(result, Err(Ok(Error::UnauthorizedCaller)));
    }

    // Test 7: A zero amount is rejected.
    #[test]
    fn test_zero_amount_rejected() {
        let env = Env::default();
        let (contract_id, _admin, bounty_contract) = setup_test(&env);
        let client = StudyStakeReputationClient::new(&env, &contract_id);
        let tutor = Address::generate(&env);

        let result = client.try_record_completion(&bounty_contract, &tutor, &0);
        assert_eq!(result, Err(Ok(Error::InvalidAmount)));
    }

    // Test 8: A negative amount is rejected.
    #[test]
    fn test_negative_amount_rejected() {
        let env = Env::default();
        let (contract_id, _admin, bounty_contract) = setup_test(&env);
        let client = StudyStakeReputationClient::new(&env, &contract_id);
        let tutor = Address::generate(&env);

        let result = client.try_record_completion(&bounty_contract, &tutor, &-1);
        assert_eq!(result, Err(Ok(Error::InvalidAmount)));
    }

    // Test 9: Multiple completions accumulate both count and volume correctly.
    #[test]
    fn test_multiple_completions_accumulate() {
        let env = Env::default();
        let (contract_id, _admin, bounty_contract) = setup_test(&env);
        let client = StudyStakeReputationClient::new(&env, &contract_id);
        let tutor = Address::generate(&env);

        client.record_completion(&bounty_contract, &tutor, &5);
        client.record_completion(&bounty_contract, &tutor, &3);
        client.record_completion(&bounty_contract, &tutor, &10);

        let reputation = client
            .get_reputation(&tutor)
            .expect("reputation should exist");
        assert_eq!(reputation.completed, 3);
        assert_eq!(reputation.volume, 18);

        assert_eq!(client.get_completed(&tutor), 3);
        assert_eq!(client.get_volume(&tutor), 18);
    }

    // Test 10: An unknown tutor has no reputation and reads as zero.
    #[test]
    fn test_unknown_tutor_returns_no_reputation() {
        let env = Env::default();
        let (contract_id, _admin, _bounty_contract) = setup_test(&env);
        let client = StudyStakeReputationClient::new(&env, &contract_id);
        let tutor = Address::generate(&env);

        assert!(client.get_reputation(&tutor).is_none());
        assert_eq!(client.get_completed(&tutor), 0);
        assert_eq!(client.get_volume(&tutor), 0);
    }

    // Test 11: record_completion emits a ("reput", "recorded") event carrying
    // the tutor, completed count, cumulative volume, and the amount added.
    #[test]
    fn test_reputation_event_payload() {
        let env = Env::default();
        let (contract_id, _admin, bounty_contract) = setup_test(&env);
        let client = StudyStakeReputationClient::new(&env, &contract_id);
        let tutor = Address::generate(&env);

        client.record_completion(&bounty_contract, &tutor, &5);

        assert_eq!(
            env.events().all(),
            vec![
                &env,
                (
                    contract_id.clone(),
                    (symbol_short!("reput"), symbol_short!("recorded")).into_val(&env),
                    (tutor.clone(), 1u32, 5i128, 5i128).into_val(&env),
                ),
            ]
        );
    }

    // Test 12: Reputation records live in persistent storage (not instance),
    // and a read after the TTL drops below the threshold extends it back out.
    #[test]
    fn test_persistent_storage_and_ttl() {
        let env = Env::default();
        let (contract_id, _admin, bounty_contract) = setup_test(&env);
        let client = StudyStakeReputationClient::new(&env, &contract_id);
        let tutor = Address::generate(&env);

        env.ledger()
            .set_max_entry_ttl(REPUTATION_TTL_EXTEND_TO + LEDGERS_PER_DAY);

        client.record_completion(&bounty_contract, &tutor, &5);

        env.as_contract(&contract_id, || {
            let key = DataKey::Reputation(tutor.clone());
            assert!(env.storage().persistent().has(&key));
            assert!(!env.storage().instance().has(&key));
        });

        let advance = REPUTATION_TTL_EXTEND_TO - REPUTATION_TTL_THRESHOLD + 1;
        env.ledger().with_mut(|li| li.sequence_number += advance);

        let ttl_before_read = env.as_contract(&contract_id, || {
            env.storage()
                .persistent()
                .get_ttl(&DataKey::Reputation(tutor.clone()))
        });
        assert!(ttl_before_read < REPUTATION_TTL_THRESHOLD);

        // A read extends the TTL back out to the target.
        assert!(client.get_reputation(&tutor).is_some());

        let ttl_after_read = env.as_contract(&contract_id, || {
            env.storage()
                .persistent()
                .get_ttl(&DataKey::Reputation(tutor.clone()))
        });
        assert_eq!(ttl_after_read, REPUTATION_TTL_EXTEND_TO);
    }
}
