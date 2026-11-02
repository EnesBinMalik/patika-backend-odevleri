/**
 * Aptos Move Vault Contract Sources and Comparisons
 * Hazırlayan: Enes Öztürk
 */

export const MOVE_TOML_CODE = `[package]
name = "AptosVault"
version = "2.0.0"
authors = ["Enes Öztürk <enesbino38@gmail.com>"]

[addresses]
vault_addr = "0x89e24b759d6411b0e352f20a9a814149fa5eb88863f6959ba08b35f29918d361"
admin = "0xca5f1897c8d32b56e409391b48d641b65e71881822b3f17c8f25875965416209"

[dependencies.AptosFramework]
git = "https://github.com/aptos-labs/aptos-core.git"
rev = "mainnet"
subdir = "aptos-move/framework/aptos-framework"
`;

export const LEGACY_MOVE_CODE = `module vault_addr::legacy_vault {
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event;
    use aptos_std::table::{Self, Table};

    // Hata Kodları
    const E_NOT_ADMIN: u64 = 1;
    const E_INSUFFICIENT_BALANCE: u64 = 2;
    const E_NO_ALLOCATION: u64 = 3;
    const E_INVALID_AMOUNT: u64 = 4;

    struct VaultSignerCapability has key {
        cap: account::SignerCapability,
    }

    struct Vault has key {
        admin: address,
        vault_address: address,
        total_balance: u64,
        allocated_balance: u64,
        allocations: Table<address, u64>,
        tokens_deposited_events: event::EventHandle<TokensDepositedEvent>,
        tokens_allocated_events: event::EventHandle<TokensAllocatedEvent>,
        tokens_claimed_events: event::EventHandle<TokensClaimedEvent>,
        tokens_withdrawn_events: event::EventHandle<TokensWithdrawnEvent>,
    }

    struct TokensDepositedEvent has drop, store { amount: u64 }
    struct TokensAllocatedEvent has drop, store { recipient: address, amount: u64 }
    struct TokensClaimedEvent has drop, store { recipient: address, amount: u64 }
    struct TokensWithdrawnEvent has drop, store { amount: u64 }

    // ESKİ UYGULAMA: Her çağrıda admin_address üzerinden kasa adresi türetiliyordu.
    // Bu yöntem ek storage okuması (borrow_global<VaultSignerCapability>) gerektiriyor
    // ve gaz maliyetini artırıyordu.
    public fun get_vault_address(admin_address: address): address acquires VaultSignerCapability {
        let vault_signer_cap = &borrow_global<VaultSignerCapability>(admin_address).cap;
        account::get_signer_capability_address(vault_signer_cap)
    }

    public entry fun deposit_tokens(admin: &signer, amount: u64) acquires Vault, VaultSignerCapability {
        let admin_address = signer::address_of(admin);
        let vault_address = get_vault_address(admin_address);
        let vault = borrow_global_mut<Vault>(vault_address);
        assert!(vault.admin == admin_address, E_NOT_ADMIN);

        coin::transfer<AptosCoin>(admin, vault.vault_address, amount);
        vault.total_balance = vault.total_balance + amount;
        event::emit_event(&mut vault.tokens_deposited_events, TokensDepositedEvent { amount });
    }

    public entry fun allocate_tokens(
        admin: &signer,
        recipient: address,
        amount: u64
    ) acquires Vault, VaultSignerCapability {
        let admin_address = signer::address_of(admin);
        let vault_address = get_vault_address(admin_address);
        let vault = borrow_global_mut<Vault>(vault_address);
        assert!(vault.admin == admin_address, E_NOT_ADMIN);
        assert!(vault.total_balance - vault.allocated_balance >= amount, E_INSUFFICIENT_BALANCE);

        let current_alloc = if (table::contains(&vault.allocations, recipient)) {
            *table::borrow(&vault.allocations, recipient)
        } else {
            0
        };
        table::upsert(&mut vault.allocations, recipient, current_alloc + amount);
        vault.allocated_balance = vault.allocated_balance + amount;

        event::emit_event(&mut vault.tokens_allocated_events, TokensAllocatedEvent { recipient, amount });
    }

    public entry fun claim_tokens(
        recipient: &signer,
        admin_address: address
    ) acquires Vault, VaultSignerCapability {
        let vault_address = get_vault_address(admin_address);
        let vault = borrow_global_mut<Vault>(vault_address);
        let recipient_addr = signer::address_of(recipient);
        assert!(table::contains(&vault.allocations, recipient_addr), E_NO_ALLOCATION);

        let amount = *table::borrow(&vault.allocations, recipient_addr);
        assert!(amount > 0, E_NO_ALLOCATION);
        table::upsert(&mut vault.allocations, recipient_addr, 0);
        vault.total_balance = vault.total_balance - amount;
        vault.allocated_balance = vault.allocated_balance - amount;

        let vault_signer_cap = &borrow_global<VaultSignerCapability>(admin_address).cap;
        let vault_signer = account::create_signer_with_capability(vault_signer_cap);
        coin::transfer<AptosCoin>(&vault_signer, recipient_addr, amount);

        event::emit_event(&mut vault.tokens_claimed_events, TokensClaimedEvent { recipient: recipient_addr, amount });
    }
}
`;

export const UPGRADED_MOVE_CODE = `/**
 * @title Aptos Vault v2 - Doğrudan Kasa Adresi Mimarisi
 * @author Enes Öztürk
 * @notice Bu akıllı sözleşme, kasa adresini yönetici adresinden türetmek yerine
 *         doğrudan \`vault_address\` parametresi alarak O(1) erişim ve gaz tasarrufu sağlar.
 *         Bonus olarak kasa sahipliğinin güvenli devri (\`transfer_admin\`) fonksiyonunu içerir.
 */
module vault_addr::vault {
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event;
    use aptos_std::table::{Self, Table};

    // ==========================================
    // Hata Kodları (Error Constants)
    // ==========================================
    /// Çağıran adres kasanın yetkili yöneticisi değil
    const E_NOT_ADMIN: u64 = 1;
    /// Kasada yeterli tahsis edilmemiş (unallocated) bakiye yok
    const E_INSUFFICIENT_BALANCE: u64 = 2;
    /// Kullanıcının talep edebileceği tahsis edilmiş token bulunmuyor
    const E_NO_ALLOCATION: u64 = 3;
    /// Geçersiz miktar (sıfır veya negatif işlem)
    const E_INVALID_AMOUNT: u64 = 4;
    /// Kasa bu adreste zaten başlatılmış
    const E_ALREADY_INITIALIZED: u64 = 5;
    /// Yeni yönetici adresi geçersiz veya sıfır adres olamaz
    const E_INVALID_NEW_ADMIN: u64 = 6;
    /// Yalnızca mevcut yönetici devir işlemini gerçekleştirebilir
    const E_CANNOT_TRANSFER_TO_SELF: u64 = 7;

    // ==========================================
    // Depolama Yapısı (Resources)
    // ==========================================

    /// Kasa kaynağı: Doğrudan kasa adresinde (vault_address) depolanır.
    /// SignerCapability kasa içerisinde saklanarak harici lookup ortadan kaldırılmıştır.
    struct Vault has key {
        admin: address,
        vault_address: address,
        signer_cap: account::SignerCapability,
        total_balance: u64,
        allocated_balance: u64,
        allocations: Table<address, u64>,
        tokens_deposited_events: event::EventHandle<TokensDepositedEvent>,
        tokens_allocated_events: event::EventHandle<TokensAllocatedEvent>,
        tokens_claimed_events: event::EventHandle<TokensClaimedEvent>,
        tokens_withdrawn_events: event::EventHandle<TokensWithdrawnEvent>,
        admin_transferred_events: event::EventHandle<AdminTransferredEvent>,
    }

    // ==========================================
    // Olay Tanımları (Event Structs)
    // ==========================================
    struct TokensDepositedEvent has drop, store {
        amount: u64,
    }

    struct TokensAllocatedEvent has drop, store {
        recipient: address,
        amount: u64,
    }

    struct TokensClaimedEvent has drop, store {
        recipient: address,
        amount: u64,
    }

    struct TokensWithdrawnEvent has drop, store {
        amount: u64,
    }

    struct AdminTransferredEvent has drop, store {
        old_admin: address,
        new_admin: address,
    }

    // ==========================================
    // Başlatma Fonksiyonu (Initialization)
    // ==========================================

    /**
     * @notice Yeni bir kasa oluşturur ve Resource Account oluşturarak SignerCapability üretir.
     * @param admin Kasanın kurucusu ve yöneticisi
     * @param seed Resource account türetme tohumu
     */
    public entry fun initialize_vault(
        admin: &signer,
        seed: vector<u8>
    ) {
        let admin_addr = signer::address_of(admin);
        let (vault_signer, vault_signer_cap) = account::create_resource_account(admin, seed);
        let vault_addr = signer::address_of(&vault_signer);

        assert!(!exists<Vault>(vault_addr), E_ALREADY_INITIALIZED);

        // Kasa hesabına AptosCoin alım yetkisi verilir
        coin::register<AptosCoin>(&vault_signer);

        let vault = Vault {
            admin: admin_addr,
            vault_address: vault_addr,
            signer_cap: vault_signer_cap,
            total_balance: 0,
            allocated_balance: 0,
            allocations: table::new<address, u64>(),
            tokens_deposited_events: account::new_event_handle<TokensDepositedEvent>(&vault_signer),
            tokens_allocated_events: account::new_event_handle<TokensAllocatedEvent>(&vault_signer),
            tokens_claimed_events: account::new_event_handle<TokensClaimedEvent>(&vault_signer),
            tokens_withdrawn_events: account::new_event_handle<TokensWithdrawnEvent>(&vault_signer),
            admin_transferred_events: account::new_event_handle<AdminTransferredEvent>(&vault_signer),
        };

        move_to(&vault_signer, vault);
    }

    // ==========================================
    // Değiştirilmiş Fonksiyonlar (v2 Architecture)
    // ==========================================

    /**
     * @notice Kasaya token yatırır.
     * @dev Doğrudan vault_address alır ve vault.admin doğrulaması yapar.
     */
    public entry fun deposit_tokens(
        admin: &signer,
        vault_address: address,
        amount: u64
    ) acquires Vault {
        assert!(amount > 0, E_INVALID_AMOUNT);
        let vault = borrow_global_mut<Vault>(vault_address);
        assert!(vault.admin == signer::address_of(admin), E_NOT_ADMIN);

        coin::transfer<AptosCoin>(admin, vault.vault_address, amount);
        vault.total_balance = vault.total_balance + amount;

        event::emit_event(
            &mut vault.tokens_deposited_events,
            TokensDepositedEvent { amount }
        );
    }

    /**
     * @notice Belirli bir alıcı adresine token tahsis eder.
     * @dev Tahsis edilen miktar unallocated bakiyeden düşülür.
     */
    public entry fun allocate_tokens(
        admin: &signer,
        vault_address: address,
        recipient: address,
        amount: u64
    ) acquires Vault {
        assert!(amount > 0, E_INVALID_AMOUNT);
        let vault = borrow_global_mut<Vault>(vault_address);
        assert!(vault.admin == signer::address_of(admin), E_NOT_ADMIN);

        let available = vault.total_balance - vault.allocated_balance;
        assert!(available >= amount, E_INSUFFICIENT_BALANCE);

        let current_alloc = if (table::contains(&vault.allocations, recipient)) {
            *table::borrow(&vault.allocations, recipient)
        } else {
            0
        };
        table::upsert(&mut vault.allocations, recipient, current_alloc + amount);
        vault.allocated_balance = vault.allocated_balance + amount;

        event::emit_event(
            &mut vault.tokens_allocated_events,
            TokensAllocatedEvent { recipient, amount }
        );
    }

    /**
     * @notice Kullanıcı adına tahsis edilmiş tokenları talep eder.
     * @dev Doğrudan vault_address alır. Kasa SignerCapability ile transfer gerçekleştirir.
     */
    public entry fun claim_tokens(
        recipient: &signer,
        vault_address: address
    ) acquires Vault {
        let recipient_addr = signer::address_of(recipient);
        let vault = borrow_global_mut<Vault>(vault_address);

        assert!(table::contains(&vault.allocations, recipient_addr), E_NO_ALLOCATION);
        let amount = *table::borrow(&vault.allocations, recipient_addr);
        assert!(amount > 0, E_NO_ALLOCATION);

        // Tahsis sıfırlanır ve bakiyeler güncellenir
        table::upsert(&mut vault.allocations, recipient_addr, 0);
        vault.total_balance = vault.total_balance - amount;
        vault.allocated_balance = vault.allocated_balance - amount;

        let vault_signer = account::create_signer_with_capability(&vault.signer_cap);
        coin::transfer<AptosCoin>(&vault_signer, recipient_addr, amount);

        event::emit_event(
            &mut vault.tokens_claimed_events,
            TokensClaimedEvent { recipient: recipient_addr, amount }
        );
    }

    /**
     * @notice Yönetici, henüz tahsis edilmemiş (unallocated) boşta duran tokenları çeker.
     * @dev Kullanıcılara tahsis edilmiş fonlara dokunulamaz.
     */
    public entry fun withdraw_tokens(
        admin: &signer,
        vault_address: address,
        amount: u64
    ) acquires Vault {
        assert!(amount > 0, E_INVALID_AMOUNT);
        let vault = borrow_global_mut<Vault>(vault_address);
        let admin_addr = signer::address_of(admin);
        assert!(vault.admin == admin_addr, E_NOT_ADMIN);

        let unallocated = vault.total_balance - vault.allocated_balance;
        assert!(unallocated >= amount, E_INSUFFICIENT_BALANCE);

        vault.total_balance = vault.total_balance - amount;

        let vault_signer = account::create_signer_with_capability(&vault.signer_cap);
        coin::transfer<AptosCoin>(&vault_signer, admin_addr, amount);

        event::emit_event(
            &mut vault.tokens_withdrawn_events,
            TokensWithdrawnEvent { amount }
        );
    }

    // ==========================================
    // BONUS FONKSİYON: Kasa Sahipliğinin Devri
    // ==========================================

    /**
     * @notice Kasa yönetim yetkisini yeni bir yönetici adresine devreder.
     * @param admin Mevcut yönetici imzalayıcısı
     * @param vault_address Hedef kasanın doğrudan adresi
     * @param new_admin Yeni yönetici adresi
     * 
     * GÜVENLİK ANALİZİ:
     * Eski mimaride kasa adresi \`admin_address\`ten türetildiği için mülkiyet devri
     * mimari olarak imkansızdı (tüm varlıkların yeni adrese taşınması gerekiyordu).
     * Doğrudan \`vault_address\` mimarisinde ise kasa adresi bağımsız olduğundan
     * tek bir \`vault.admin = new_admin\` ataması ile fon taşımaksızın güvenli
     * mülkiyet devri gerçekleştirilir.
     */
    public entry fun transfer_admin(
        admin: &signer,
        vault_address: address,
        new_admin: address
    ) acquires Vault {
        let vault = borrow_global_mut<Vault>(vault_address);
        let old_admin = signer::address_of(admin);

        // 1. Yetki Kontrolü: Yalnızca mevcut yönetici çağırabilir
        assert!(vault.admin == old_admin, E_NOT_ADMIN);

        // 2. Geçerlilik Kontrolü: Sıfır adrese devredilemez (yakılma koruması)
        assert!(new_admin != @0x0, E_INVALID_NEW_ADMIN);

        // 3. Kendine devir yapılmasını engelle
        assert!(new_admin != old_admin, E_CANNOT_TRANSFER_TO_SELF);

        // 4. Yetki aktarımı
        vault.admin = new_admin;

        // 5. Şeffaf zincir üstü denetim için olay tetikle
        event::emit_event(
            &mut vault.admin_transferred_events,
            AdminTransferredEvent { old_admin, new_admin }
        );
    }

    // ==========================================
    // Görünüm Fonksiyonları (View Functions)
    // ==========================================

    #[view]
    public fun get_vault_admin(vault_address: address): address acquires Vault {
        borrow_global<Vault>(vault_address).admin
    }

    #[view]
    public fun get_total_balance(vault_address: address): u64 acquires Vault {
        borrow_global<Vault>(vault_address).total_balance
    }

    #[view]
    public fun get_allocated_balance(vault_address: address): u64 acquires Vault {
        borrow_global<Vault>(vault_address).allocated_balance
    }

    #[view]
    public fun get_unallocated_balance(vault_address: address): u64 acquires Vault {
        let vault = borrow_global<Vault>(vault_address);
        vault.total_balance - vault.allocated_balance
    }

    #[view]
    public fun get_user_allocation(vault_address: address, user: address): u64 acquires Vault {
        let vault = borrow_global<Vault>(vault_address);
        if (table::contains(&vault.allocations, user)) {
            *table::borrow(&vault.allocations, user)
        } else {
            0
        }
    }
}
`;

export const MOVE_TESTS_CODE = `#[test_only]
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
`;

export interface DiffPoint {
  step: number;
  title: string;
  legacyCode: string;
  upgradedCode: string;
  explanation: string;
  benefit: string;
}

export const ARCHITECTURE_DIFF_POINTS: DiffPoint[] = [
  {
    step: 1,
    title: "1. get_vault_address Fonksiyonunun Kaldırılması",
    legacyCode: `public fun get_vault_address(admin_address: address): address 
    acquires VaultSignerCapability {
    let vault_signer_cap = 
        &borrow_global<VaultSignerCapability>(admin_address).cap;
    account::get_signer_capability_address(vault_signer_cap)
}`,
    upgradedCode: `// get_vault_address tamamen kaldırıldı!
// Vault SignerCapability artık doğrudan Vault kaynağı içinde saklanır.
// Kasa adresi doğrudan çağrıcı parametresi olarak aktarılır.`,
    explanation:
      "Eski uygulamada her işlemde admin adresinden global depolama araması yapılıyordu. Bu gereksiz bir okuma adımıdır. Kaldırılarak doğrudan kasa adresi kullanımı sağlandı.",
    benefit: "Her işlemde bir global depolama okuması ve bir adres türetme adımı kaldırıldı; O(1) doğrudan kaynak erişimi.",
  },
  {
    step: 2,
    title: "2. Fonksiyon İmzalarının vault_address Alacak Şekilde Güncellenmesi",
    legacyCode: `public entry fun deposit_tokens(
    admin: &signer, 
    amount: u64
) acquires Vault, VaultSignerCapability`,
    upgradedCode: `public entry fun deposit_tokens(
    admin: &signer, 
    vault_address: address, 
    amount: u64
) acquires Vault`,
    explanation:
      "Tüm entry fonksiyonları (deposit_tokens, allocate_tokens, claim_tokens, withdraw_tokens) ve view fonksiyonları parametre olarak vault_address alacak şekilde güncellendi.",
    benefit: "Tek bir yöneticinin birden fazla kasayı bağımsız adreslerle yönetebilme esnekliği.",
  },
  {
    step: 3,
    title: "3. Fonksiyon İçindeki get_vault_address Çağrılarının Temizlenmesi",
    legacyCode: `let admin_address = signer::address_of(admin);
let vault_address = get_vault_address(admin_address);
let vault = borrow_global_mut<Vault>(vault_address);`,
    upgradedCode: `let vault = borrow_global_mut<Vault>(vault_address);
// Doğrudan parametreden gelen vault_address'teki kaynağı ödünç al`,
    explanation:
      "Fonksiyon gövdelerindeki iki aşamalı lookup zinciri kaldırılarak, doğrudan vault_address üzerindeki Vault kaynağı borç alınır.",
    benefit: "Daha yalın kod yapısı, daha az bellek tüketimi ve azaltılmış bayt kodu boyutu.",
  },
  {
    step: 4,
    title: "4. Erişim Kontrolünün vault.admin Alanı Üzerinden Yapılması",
    legacyCode: `let admin_address = signer::address_of(admin);
// Yönetici kontrolü admin_address parametresiyle dolaylı yapılıyordu
assert!(vault.admin == admin_address, E_NOT_ADMIN);`,
    upgradedCode: `let vault = borrow_global_mut<Vault>(vault_address);
assert!(vault.admin == signer::address_of(admin), E_NOT_ADMIN);`,
    explanation:
      "Yetkilendirme denetimi, kasanın depoladığı güncel vault.admin alanı ile işlem imzalayıcısı karşılaştırılarak gerçekleştirilir.",
    benefit: "Kasa sahipliği devredildiğinde yetki kontrollerinin anında ve sorunsuz güncellenmesi.",
  },
];
