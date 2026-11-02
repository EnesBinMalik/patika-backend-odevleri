/**
 * @title Aptos Vault v2 - Doğrudan Kasa Adresi Mimarisi
 * @author Enes Öztürk
 * @notice Bu akıllı sözleşme, kasa adresini yönetici adresinden türetmek yerine
 *         doğrudan `vault_address` parametresi alarak O(1) erişim ve gaz tasarrufu sağlar.
 *         Bonus olarak kasa sahipliğinin güvenli devri (`transfer_admin`) fonksiyonunu içerir.
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
     * Eski mimaride kasa adresi `admin_address`ten türetildiği için mülkiyet devri
     * mimari olarak imkansızdı (tüm varlıkların yeni adrese taşınması gerekiyordu).
     * Doğrudan `vault_address` mimarisinde ise kasa adresi bağımsız olduğundan
     * tek bir `vault.admin = new_admin` ataması ile fon taşımaksızın güvenli
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
