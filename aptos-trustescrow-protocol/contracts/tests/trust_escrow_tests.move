#[test_only]
module trust_escrow::escrow_vault_tests {
    use std::signer;
    use std::string::utf8;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::timestamp;
    use trust_escrow::escrow_vault;

    #[test(aptos_framework = @0x1, client = @0x123, contractor = @0x456, arbitrator = @0x789)]
    fun test_create_and_release_milestone(
        aptos_framework: &signer,
        client: &signer,
        contractor: &signer,
        arbitrator: &signer,
    ) {
        // 1. Initialize framework environment & timestamps
        timestamp::set_time_has_started_for_testing(aptos_framework);
        account::create_account_for_test(signer::address_of(client));
        account::create_account_for_test(signer::address_of(contractor));
        account::create_account_for_test(signer::address_of(arbitrator));

        // 2. Initialize AptosCoin and fund client with 10 APT (1,000,000,000 Octas)
        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);
        coin::register<AptosCoin>(client);
        coin::register<AptosCoin>(contractor);
        coin::register<AptosCoin>(arbitrator);

        let coins = coin::mint<AptosCoin>(1000000000, &mint_cap);
        coin::deposit(signer::address_of(client), coins);

        // 3. Create Escrow with 2 milestones (4 APT and 6 APT)
        let titles = vector::empty();
        vector::push_back(&mut titles, utf8(b"Milestone 1: UI & Smart Contract Draft"));
        vector::push_back(&mut titles, utf8(b"Milestone 2: Testnet Deployment & Audit"));

        let amounts = vector::empty();
        vector::push_back(&mut amounts, 400000000); // 4 APT
        vector::push_back(&mut amounts, 600000000); // 6 APT

        escrow_vault::create_escrow(
            client,
            signer::address_of(contractor),
            signer::address_of(arbitrator),
            utf8(b"Aptos DApp Development by Enes Ozturk"),
            1000000000,
            titles,
            amounts,
            2000000000,
        );

        // Verify initial vault state
        let (escrow_id, _, _, _, total, released, status, balance) = 
            escrow_vault::get_escrow_info(signer::address_of(client));
        assert!(escrow_id == 1, 100);
        assert!(total == 1000000000, 101);
        assert!(released == 0, 102);
        assert!(status == 2, 103); // STATUS_ACTIVE
        assert!(balance == 1000000000, 104);

        // 4. Contractor submits milestone 1 proof
        escrow_vault::submit_milestone(
            contractor,
            signer::address_of(client),
            1,
            utf8(b"https://github.com/aptos-projects/trust-escrow/pull/1")
        );

        // 5. Client approves milestone 1
        escrow_vault::approve_milestone(
            client,
            signer::address_of(client),
            1
        );

        // Verify contractor received 4 APT (400,000,000 Octas)
        let contractor_balance = coin::balance<AptosCoin>(signer::address_of(contractor));
        assert!(contractor_balance == 400000000, 105);

        // 6. Contractor submits and client approves milestone 2
        escrow_vault::submit_milestone(
            contractor,
            signer::address_of(client),
            2,
            utf8(b"https://explorer.aptoslabs.com/txn/0x123abc?network=testnet")
        );
        escrow_vault::approve_milestone(
            client,
            signer::address_of(client),
            2
        );

        // Verify contractor has received all 10 APT and escrow is completed
        let final_balance = coin::balance<AptosCoin>(signer::address_of(contractor));
        assert!(final_balance == 1000000000, 106);

        let (_, _, _, _, _, _, final_status, final_vault_coins) = 
            escrow_vault::get_escrow_info(signer::address_of(client));
        assert!(final_status == 4, 107); // STATUS_COMPLETED
        assert!(final_vault_coins == 0, 108);

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }

    #[test(aptos_framework = @0x1, client = @0x123, contractor = @0x456, arbitrator = @0x789)]
    fun test_dispute_resolution(
        aptos_framework: &signer,
        client: &signer,
        contractor: &signer,
        arbitrator: &signer,
    ) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        account::create_account_for_test(signer::address_of(client));
        account::create_account_for_test(signer::address_of(contractor));
        account::create_account_for_test(signer::address_of(arbitrator));

        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);
        coin::register<AptosCoin>(client);
        coin::register<AptosCoin>(contractor);
        coin::register<AptosCoin>(arbitrator);

        let coins = coin::mint<AptosCoin>(500000000, &mint_cap);
        coin::deposit(signer::address_of(client), coins);

        let titles = vector::empty();
        vector::push_back(&mut titles, utf8(b"Design & Smart Contract Specs"));
        let amounts = vector::empty();
        vector::push_back(&mut amounts, 500000000);

        escrow_vault::create_escrow(
            client,
            signer::address_of(contractor),
            signer::address_of(arbitrator),
            utf8(b"Disputed Freelance Project"),
            500000000,
            titles,
            amounts,
            2000000000,
        );

        // Client raises dispute
        escrow_vault::raise_dispute(client, signer::address_of(client));
        let (_, _, _, _, _, _, status, _) = escrow_vault::get_escrow_info(signer::address_of(client));
        assert!(status == 3, 201); // STATUS_DISPUTED

        // Arbitrator resolves with 50-50 split: 2.5 APT refund, 2.5 APT payout
        escrow_vault::resolve_dispute(
            arbitrator,
            signer::address_of(client),
            250000000,
            250000000
        );

        assert!(coin::balance<AptosCoin>(signer::address_of(client)) == 250000000, 202);
        assert!(coin::balance<AptosCoin>(signer::address_of(contractor)) == 250000000, 203);

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);
    }
}
