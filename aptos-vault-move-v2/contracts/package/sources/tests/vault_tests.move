#[test_only]
module vault_addr::vault_tests {
    use std::signer;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use aptos_framework::coin;
    use vault_addr::vault::{
        Self,
        initialize_vault,
        deposit_tokens,
        allocate_tokens,
        claim_tokens,
        withdraw_tokens,
        transfer_admin,
        get_vault_admin,
        get_total_balance,
        get_allocated_balance,
        get_unallocated_balance,
        get_user_allocation
    };

    // Test adresleri
    const ADMIN_ADDR: address = @0xCAFE;
    const ALICE_ADDR: address = @0xA11CE;
    const BOB_ADDR: address = @0xB0B;
    const CHARLIE_ADDR: address = @0xCC;

    // Test kurulum yardımcısı
    fun setup_test(
        aptos_framework: &signer,
        admin: &signer,
        alice: &signer
    ): address {
        account::create_account_for_test(signer::address_of(aptos_framework));
        account::create_account_for_test(signer::address_of(admin));
        account::create_account_for_test(signer::address_of(alice));

        let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);

        coin::register<AptosCoin>(admin);
        coin::register<AptosCoin>(alice);

        // Admin'e 1,000,000 APT ver
        let coins = coin::mint<AptosCoin>(1000000, &mint_cap);
        coin::deposit(signer::address_of(admin), coins);

        coin::destroy_burn_cap(burn_cap);
        coin::destroy_mint_cap(mint_cap);

        // Kasa başlat (resource account oluşturulur)
        let seed = b"aptos_vault_seed_v2";
        initialize_vault(admin, seed);

        // Resource account adresini türet
        let vault_addr = account::create_resource_address(&signer::address_of(admin), seed);
        vault_addr
    }

    // ==========================================
    // TEST 1: Sözleşmeyi Dağıt ve Kasayı Başlat, Token Yatır
    // ==========================================
    #[test(aptos_framework = @0x1, admin = @0xCAFE, alice = @0xA11CE)]
    fun test_initialize_and_deposit(
        aptos_framework: &signer,
        admin: &signer,
        alice: &signer
    ) {
        let vault_addr = setup_test(aptos_framework, admin, alice);

        // Doğrudan vault_addr kullanarak deposit çağrısı
        deposit_tokens(admin, vault_addr, 50000);

        assert!(get_total_balance(vault_addr) == 50000, 101);
        assert!(get_unallocated_balance(vault_addr) == 50000, 102);
        assert!(get_allocated_balance(vault_addr) == 0, 103);
        assert!(get_vault_admin(vault_addr) == signer::address_of(admin), 104);
    }

    // ==========================================
    // TEST 2: Token Tahsis Et ve Kullanıcı Tarafından Talep Et
    // ==========================================
    #[test(aptos_framework = @0x1, admin = @0xCAFE, alice = @0xA11CE)]
    fun test_allocate_and_claim(
        aptos_framework: &signer,
        admin: &signer,
        alice: &signer
    ) {
        let vault_addr = setup_test(aptos_framework, admin, alice);
        deposit_tokens(admin, vault_addr, 100000);

        // Alice için 30,000 token tahsis et
        allocate_tokens(admin, vault_addr, signer::address_of(alice), 30000);

        assert!(get_user_allocation(vault_addr, signer::address_of(alice)) == 30000, 201);
        assert!(get_allocated_balance(vault_addr) == 30000, 202);
        assert!(get_unallocated_balance(vault_addr) == 70000, 203);

        // Alice tokenlarını talep eder
        claim_tokens(alice, vault_addr);

        assert!(coin::balance<AptosCoin>(signer::address_of(alice)) == 30000, 204);
        assert!(get_user_allocation(vault_addr, signer::address_of(alice)) == 0, 205);
        assert!(get_total_balance(vault_addr) == 70000, 206);
    }

    // ==========================================
    // TEST 3: Yönetici Olmayan Biri Token Tahsis Etmeye Çalışır (HATA BEKLENİR)
    // ==========================================
    #[test(aptos_framework = @0x1, admin = @0xCAFE, alice = @0xA11CE)]
    #[expected_failure(abort_code = 1, location = vault_addr::vault)]
    fun test_unauthorized_allocation_fails(
        aptos_framework: &signer,
        admin: &signer,
        alice: &signer
    ) {
        let vault_addr = setup_test(aptos_framework, admin, alice);
        deposit_tokens(admin, vault_addr, 50000);

        // Yetkisiz kullanıcı (Alice) yöneticiymiş gibi tahsis yapmaya çalışır -> E_NOT_ADMIN (abort 1)
        allocate_tokens(alice, vault_addr, @0xB0B, 10000);
    }

    // ==========================================
    // TEST 4: Tahsis Edilmemiş Tokenları Çek (Withdraw)
    // ==========================================
    #[test(aptos_framework = @0x1, admin = @0xCAFE, alice = @0xA11CE)]
    fun test_withdraw_unallocated_tokens(
        aptos_framework: &signer,
        admin: &signer,
        alice: &signer
    ) {
        let vault_addr = setup_test(aptos_framework, admin, alice);
        deposit_tokens(admin, vault_addr, 100000);

        // 40,000 tahsis et, boşta kalan 60,000
        allocate_tokens(admin, vault_addr, signer::address_of(alice), 40000);

        // Yönetici boşta kalan 50,000 çeker
        let admin_bal_before = coin::balance<AptosCoin>(signer::address_of(admin));
        withdraw_tokens(admin, vault_addr, 50000);
        let admin_bal_after = coin::balance<AptosCoin>(signer::address_of(admin));

        assert!(admin_bal_after - admin_bal_before == 50000, 401);
        assert!(get_unallocated_balance(vault_addr) == 10000, 402);
        assert!(get_total_balance(vault_addr) == 50000, 403);
    }

    // ==========================================
    // TEST 5: Tahsis Edilmiş Miktarı Çekmeye Çalışma (YETERSİZ BAKİYE HATASI)
    // ==========================================
    #[test(aptos_framework = @0x1, admin = @0xCAFE, alice = @0xA11CE)]
    #[expected_failure(abort_code = 2, location = vault_addr::vault)]
    fun test_cannot_withdraw_allocated_tokens(
        aptos_framework: &signer,
        admin: &signer,
        alice: &signer
    ) {
        let vault_addr = setup_test(aptos_framework, admin, alice);
        deposit_tokens(admin, vault_addr, 50000);
        allocate_tokens(admin, vault_addr, signer::address_of(alice), 40000);

        // Boşta sadece 10,000 var. Yönetici 20,000 çekmeye kalkarsa E_INSUFFICIENT_BALANCE ile durdurulmalı!
        withdraw_tokens(admin, vault_addr, 20000);
    }

    // ==========================================
    // TEST 6 (BONUS): Kasa Sahipliğinin Devri ve Yeni Yöneticinin Kontrolü
    // ==========================================
    #[test(aptos_framework = @0x1, admin = @0xCAFE, alice = @0xA11CE, new_admin = @0xD00D)]
    fun test_transfer_admin_and_verify_new_authority(
        aptos_framework: &signer,
        admin: &signer,
        alice: &signer,
        new_admin: &signer
    ) {
        account::create_account_for_test(signer::address_of(new_admin));
        coin::register<AptosCoin>(new_admin);

        let vault_addr = setup_test(aptos_framework, admin, alice);
        deposit_tokens(admin, vault_addr, 100000);

        // Yönetici mülkiyeti new_admin'e devreder
        let new_admin_addr = signer::address_of(new_admin);
        transfer_admin(admin, vault_addr, new_admin_addr);

        assert!(get_vault_admin(vault_addr) == new_admin_addr, 601);

        // Yeni yönetici başarıyla tahsis işlemi gerçekleştirebilir
        allocate_tokens(new_admin, vault_addr, signer::address_of(alice), 25000);
        assert!(get_allocated_balance(vault_addr) == 25000, 602);
    }
}
