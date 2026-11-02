module vault_addr::legacy_vault {
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
