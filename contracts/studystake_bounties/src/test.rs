#![cfg(test)]

mod tests {
    use crate::{Error, StudyStakeBounties, StudyStakeBountiesClient};
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{token, Address, Env};

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
}
