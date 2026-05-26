#![cfg(test)]

mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{token, Address, Env};
    use crate::{StudyStakeBounties, StudyStakeBountiesClient};

    fn setup_test() -> (Env, StudyStakeBountiesClient, Address, Address, Address, token::Client) {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, StudyStakeBounties);
        let client = StudyStakeBountiesClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let buyer = Address::generate(&env);
        let tutor = Address::generate(&env);

        let token_admin = Address::generate(&env);
        let token_id = env.register_stellar_asset_contract(token_admin);
        let token = token::Client::new(&env, &token_id);
        let token_admin_client = token::StellarAssetClient::new(&env, &token_id);

        // Mint starting balances
        token_admin_client.mint(&buyer, &100);
        
        client.initialize(&admin);

        (env, client, admin, buyer, tutor, token)
    }

    // Test 1 (Happy path): Escrow flow executes successfully end-to-end
    #[test]
    fn test_happy_path_end_to_end() {
        let (_env, client, _admin, buyer, tutor, token) = setup_test();

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
    #[should_panic(expected = "Only the buyer can release funds")]
    fn test_unauthorized_release() {
        let (env, client, _admin, buyer, tutor, token) = setup_test();
        let fake_buyer = Address::generate(&env);

        let bounty_id = client.create_bounty(&buyer, &token.address, &5);
        client.accept_bounty(&tutor, &bounty_id);
        
        // A different address tries to release the funds
        client.release_funds(&fake_buyer, &bounty_id);
    }

    // Test 3 (State verification): Verify dispute resolution routing to tutor
    #[test]
    fn test_dispute_resolution_to_tutor() {
        let (_env, client, admin, buyer, tutor, token) = setup_test();

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
        let (_env, client, admin, buyer, tutor, token) = setup_test();

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
    #[should_panic(expected = "Bounty is not open for acceptance")]
    fn test_double_acceptance() {
        let (env, client, _admin, buyer, tutor, token) = setup_test();
        let tutor_2 = Address::generate(&env);

        let bounty_id = client.create_bounty(&buyer, &token.address, &5);
        
        client.accept_bounty(&tutor, &bounty_id);
        
        // Second tutor tries to accept an already accepted bounty
        client.accept_bounty(&tutor_2, &bounty_id);
    }
}