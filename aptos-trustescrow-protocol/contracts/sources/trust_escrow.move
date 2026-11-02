/**
 * @title Aptos TrustEscrow Protocol
 * @author Enes Öztürk <enesbino38@gmail.com>
 * @notice Decentralized, milestone-based escrow and conditional payment protocol for Aptos blockchain.
 *         Enables trustless freelancing, grant distribution, and service agreements with arbitrator support.
 */
module trust_escrow::escrow_vault {
    use std::signer;
    use std::string::String;
    use std::vector;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;

    // ==========================================
    // ERROR CODES
    // ==========================================
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INVALID_STATE: u64 = 2;
    const E_INSUFFICIENT_FUNDS: u64 = 3;
    const E_MILESTONE_NOT_FOUND: u64 = 4;
    const E_ALREADY_SUBMITTED: u64 = 5;
    const E_INVALID_ARBITRATOR: u64 = 6;
    const E_CANNOT_CANCEL: u64 = 7;
    const E_VAULT_NOT_FOUND: u64 = 8;
    const E_INVALID_SPLIT: u64 = 9;

    // ==========================================
    // ESCROW STATUS CONSTANTS
    // ==========================================
    const STATUS_CREATED: u8 = 1;
    const STATUS_ACTIVE: u8 = 2;
    const STATUS_DISPUTED: u8 = 3;
    const STATUS_COMPLETED: u8 = 4;
    const STATUS_CANCELLED: u8 = 5;

    // ==========================================
    // MILESTONE STATUS CONSTANTS
    // ==========================================
    const MILESTONE_PENDING: u8 = 1;
    const MILESTONE_IN_PROGRESS: u8 = 2;
    const MILESTONE_SUBMITTED: u8 = 3;
    const MILESTONE_APPROVED: u8 = 4;
    const MILESTONE_REFUNDED: u8 = 5;

    // ==========================================
    // STRUCTS & RESOURCES
    // ==========================================
    
    struct Milestone has store, drop, copy {
        id: u64,
        title: String,
        description: String,
        amount_octas: u64,
        status: u8,
        proof_uri: String,
        submitted_at: u64,
        approved_at: u64,
    }

    struct EscrowVault has key {
        escrow_id: u64,
        title: String,
        client: address,
        contractor: address,
        arbitrator: address,
        locked_funds: Coin<AptosCoin>,
        total_amount: u64,
        released_amount: u64,
        milestones: vector<Milestone>,
        status: u8,
        created_at: u64,
        deadline: u64,
    }

    struct EscrowRegistry has key {
        escrows: vector<u64>,
        next_escrow_id: u64,
        created_events: EventHandle<EscrowCreatedEvent>,
        milestone_events: EventHandle<MilestoneEvent>,
        dispute_events: EventHandle<DisputeEvent>,
    }

    // ==========================================
    // EVENTS
    // ==========================================

    struct EscrowCreatedEvent has drop, store {
        escrow_id: u64,
        client: address,
        contractor: address,
        arbitrator: address,
        total_amount: u64,
        timestamp: u64,
    }

    struct MilestoneEvent has drop, store {
        escrow_id: u64,
        milestone_id: u64,
        action: u8, // 1: Submitted, 2: Approved, 3: Refunded
        actor: address,
        amount: u64,
        timestamp: u64,
    }

    struct DisputeEvent has drop, store {
        escrow_id: u64,
        raised_by: address,
        resolved_by: address,
        client_refund: u64,
        contractor_payout: u64,
        timestamp: u64,
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    /// Initializes registry for escrow tracking on an account
    public entry fun init_registry(account: &signer) {
        let addr = signer::address_of(account);
        if (!exists<EscrowRegistry>(addr)) {
            move_to(account, EscrowRegistry {
                escrows: vector::empty<u64>(),
                next_escrow_id: 1,
                created_events: account::new_event_handle<EscrowCreatedEvent>(account),
                milestone_events: account::new_event_handle<MilestoneEvent>(account),
                dispute_events: account::new_event_handle<DisputeEvent>(account),
            });
        }
    }

    // ==========================================
    // CORE ENTRY FUNCTIONS
    // ==========================================

    /**
     * @notice Creates a new escrow vault, deposits APT, and assigns milestones.
     * @param client_signer Signer of the client funding the escrow
     * @param contractor Address of the service provider / worker
     * @param arbitrator Address of the designated mediator
     * @param title Title of the project/escrow
     * @param deposit_amount Total deposit in Octas (1 APT = 10^8 Octas)
     * @param milestone_titles Titles of milestones
     * @param milestone_amounts Fund allocations per milestone
     * @param deadline Unix timestamp for completion
     */
    public entry fun create_escrow(
        client_signer: &signer,
        contractor: address,
        arbitrator: address,
        title: String,
        deposit_amount: u64,
        milestone_titles: vector<String>,
        milestone_amounts: vector<u64>,
        deadline: u64,
    ) acquires EscrowRegistry {
        let client_addr = signer::address_of(client_signer);
        assert!(arbitrator != client_addr && arbitrator != contractor, E_INVALID_ARBITRATOR);
        assert!(vector::length(&milestone_titles) == vector::length(&milestone_amounts), E_INVALID_STATE);

        // Ensure client has registry initialized
        if (!exists<EscrowRegistry>(client_addr)) {
            init_registry(client_signer);
        };

        let registry = borrow_global_mut<EscrowRegistry>(client_addr);
        let escrow_id = registry.next_escrow_id;
        registry.next_escrow_id = escrow_id + 1;

        // Verify milestone sums match total deposit
        let total_milestone_sum: u64 = 0;
        let count = vector::length(&milestone_amounts);
        let i = 0;
        let milestones = vector::empty<Milestone>();
        let now = timestamp::now_seconds();

        while (i < count) {
            let amount = *vector::borrow(&milestone_amounts, i);
            total_milestone_sum = total_milestone_sum + amount;

            let m = Milestone {
                id: (i as u64) + 1,
                title: *vector::borrow(&milestone_titles, i),
                description: *vector::borrow(&milestone_titles, i),
                amount_octas: amount,
                status: if (i == 0) { MILESTONE_IN_PROGRESS } else { MILESTONE_PENDING },
                proof_uri: std::string::utf8(b""),
                submitted_at: 0,
                approved_at: 0,
            };
            vector::push_back(&mut milestones, m);
            i = i + 1;
        };

        assert!(total_milestone_sum == deposit_amount, E_INSUFFICIENT_FUNDS);

        // Withdraw APT from client into escrow vault
        let locked_coins = coin::withdraw<AptosCoin>(client_signer, deposit_amount);

        let vault = EscrowVault {
            escrow_id,
            title,
            client: client_addr,
            contractor,
            arbitrator,
            locked_funds: locked_coins,
            total_amount: deposit_amount,
            released_amount: 0,
            milestones,
            status: STATUS_ACTIVE,
            created_at: now,
            deadline,
        };

        move_to(client_signer, vault);
        vector::push_back(&mut registry.escrows, escrow_id);

        event::emit_event(
            &mut registry.created_events,
            EscrowCreatedEvent {
                escrow_id,
                client: client_addr,
                contractor,
                arbitrator,
                total_amount: deposit_amount,
                timestamp: now,
            }
        );
    }

    /**
     * @notice Contractor submits completion proof (URL, IPFS hash, GitHub PR) for a milestone.
     */
    public entry fun submit_milestone(
        contractor_signer: &signer,
        vault_owner: address,
        milestone_id: u64,
        proof_uri: String,
    ) acquires EscrowVault, EscrowRegistry {
        let contractor_addr = signer::address_of(contractor_signer);
        assert!(exists<EscrowVault>(vault_owner), E_VAULT_NOT_FOUND);

        let vault = borrow_global_mut<EscrowVault>(vault_owner);
        assert!(vault.contractor == contractor_addr, E_NOT_AUTHORIZED);
        assert!(vault.status == STATUS_ACTIVE, E_INVALID_STATE);

        let count = vector::length(&vault.milestones);
        let found = false;
        let i = 0;
        let now = timestamp::now_seconds();

        while (i < count) {
            let m = vector::borrow_mut(&mut vault.milestones, i);
            if (m.id == milestone_id) {
                assert!(m.status != MILESTONE_APPROVED, E_ALREADY_SUBMITTED);
                m.status = MILESTONE_SUBMITTED;
                m.proof_uri = proof_uri;
                m.submitted_at = now;
                found = true;
                break;
            };
            i = i + 1;
        };

        assert!(found, E_MILESTONE_NOT_FOUND);

        if (exists<EscrowRegistry>(vault.client)) {
            let registry = borrow_global_mut<EscrowRegistry>(vault.client);
            event::emit_event(
                &mut registry.milestone_events,
                MilestoneEvent {
                    escrow_id: vault.escrow_id,
                    milestone_id,
                    action: 1, // Submitted
                    actor: contractor_addr,
                    amount: 0,
                    timestamp: now,
                }
            );
        };
    }

    /**
     * @notice Client approves the milestone work and immediately releases funds to contractor.
     */
    public entry fun approve_milestone(
        client_signer: &signer,
        vault_owner: address,
        milestone_id: u64,
    ) acquires EscrowVault, EscrowRegistry {
        let client_addr = signer::address_of(client_signer);
        assert!(exists<EscrowVault>(vault_owner), E_VAULT_NOT_FOUND);

        let vault = borrow_global_mut<EscrowVault>(vault_owner);
        assert!(vault.client == client_addr, E_NOT_AUTHORIZED);
        assert!(vault.status == STATUS_ACTIVE, E_INVALID_STATE);

        let count = vector::length(&vault.milestones);
        let found = false;
        let milestone_payout: u64 = 0;
        let all_approved = true;
        let now = timestamp::now_seconds();
        let i = 0;

        while (i < count) {
            let m = vector::borrow_mut(&mut vault.milestones, i);
            if (m.id == milestone_id) {
                assert!(m.status == MILESTONE_SUBMITTED || m.status == MILESTONE_IN_PROGRESS, E_INVALID_STATE);
                m.status = MILESTONE_APPROVED;
                m.approved_at = now;
                milestone_payout = m.amount_octas;
                found = true;
            };
            if (m.status != MILESTONE_APPROVED) {
                all_approved = false;
            };
            i = i + 1;
        };

        assert!(found, E_MILESTONE_NOT_FOUND);

        // Disburse milestone funds to contractor atomically
        let payout_coin = coin::extract<AptosCoin>(&mut vault.locked_funds, milestone_payout);
        coin::deposit<AptosCoin>(vault.contractor, payout_coin);
        vault.released_amount = vault.released_amount + milestone_payout;

        // If next milestone exists, activate it
        let j = 0;
        while (j < count) {
            let m = vector::borrow_mut(&mut vault.milestones, j);
            if (m.status == MILESTONE_PENDING) {
                m.status = MILESTONE_IN_PROGRESS;
                break;
            };
            j = j + 1;
        };

        if (all_approved) {
            vault.status = STATUS_COMPLETED;
        };

        if (exists<EscrowRegistry>(vault.client)) {
            let registry = borrow_global_mut<EscrowRegistry>(vault.client);
            event::emit_event(
                &mut registry.milestone_events,
                MilestoneEvent {
                    escrow_id: vault.escrow_id,
                    milestone_id,
                    action: 2, // Approved
                    actor: client_addr,
                    amount: milestone_payout,
                    timestamp: now,
                }
            );
        };
    }

    /**
     * @notice Initiates dispute mode. Freezes approvals until arbitrator makes a ruling.
     */
    public entry fun raise_dispute(
        caller: &signer,
        vault_owner: address,
    ) acquires EscrowVault, EscrowRegistry {
        let caller_addr = signer::address_of(caller);
        assert!(exists<EscrowVault>(vault_owner), E_VAULT_NOT_FOUND);

        let vault = borrow_global_mut<EscrowVault>(vault_owner);
        assert!(caller_addr == vault.client || caller_addr == vault.contractor, E_NOT_AUTHORIZED);
        assert!(vault.status == STATUS_ACTIVE, E_INVALID_STATE);

        vault.status = STATUS_DISPUTED;
        let now = timestamp::now_seconds();

        if (exists<EscrowRegistry>(vault.client)) {
            let registry = borrow_global_mut<EscrowRegistry>(vault.client);
            event::emit_event(
                &mut registry.dispute_events,
                DisputeEvent {
                    escrow_id: vault.escrow_id,
                    raised_by: caller_addr,
                    resolved_by: @0x0,
                    client_refund: 0,
                    contractor_payout: 0,
                    timestamp: now,
                }
            );
        };
    }

    /**
     * @notice Designated arbitrator resolves the dispute by splitting remaining funds.
     */
    public entry fun resolve_dispute(
        arbitrator_signer: &signer,
        vault_owner: address,
        client_refund_amount: u64,
        contractor_payout_amount: u64,
    ) acquires EscrowVault, EscrowRegistry {
        let arb_addr = signer::address_of(arbitrator_signer);
        assert!(exists<EscrowVault>(vault_owner), E_VAULT_NOT_FOUND);

        let vault = borrow_global_mut<EscrowVault>(vault_owner);
        assert!(arb_addr == vault.arbitrator, E_NOT_AUTHORIZED);
        assert!(vault.status == STATUS_DISPUTED, E_INVALID_STATE);

        let remaining = coin::value<AptosCoin>(&vault.locked_funds);
        assert!(client_refund_amount + contractor_payout_amount == remaining, E_INVALID_SPLIT);

        if (client_refund_amount > 0) {
            let refund_coin = coin::extract<AptosCoin>(&mut vault.locked_funds, client_refund_amount);
            coin::deposit<AptosCoin>(vault.client, refund_coin);
        };

        if (contractor_payout_amount > 0) {
            let payout_coin = coin::extract<AptosCoin>(&mut vault.locked_funds, contractor_payout_amount);
            coin::deposit<AptosCoin>(vault.contractor, payout_coin);
        };

        vault.status = STATUS_COMPLETED;
        let now = timestamp::now_seconds();

        if (exists<EscrowRegistry>(vault.client)) {
            let registry = borrow_global_mut<EscrowRegistry>(vault.client);
            event::emit_event(
                &mut registry.dispute_events,
                DisputeEvent {
                    escrow_id: vault.escrow_id,
                    raised_by: arb_addr,
                    resolved_by: arb_addr,
                    client_refund: client_refund_amount,
                    contractor_payout: contractor_payout_amount,
                    timestamp: now,
                }
            );
        };
    }

    /**
     * @notice Allows client to cancel escrow and get full refund if contractor has not started.
     */
    public entry fun cancel_escrow(
        client_signer: &signer,
        vault_owner: address,
    ) acquires EscrowVault {
        let client_addr = signer::address_of(client_signer);
        assert!(exists<EscrowVault>(vault_owner), E_VAULT_NOT_FOUND);

        let vault = borrow_global_mut<EscrowVault>(vault_owner);
        assert!(vault.client == client_addr, E_NOT_AUTHORIZED);
        assert!(vault.status == STATUS_ACTIVE, E_INVALID_STATE);
        assert!(vault.released_amount == 0, E_CANNOT_CANCEL);

        let remaining = coin::extract_all<AptosCoin>(&mut vault.locked_funds);
        coin::deposit<AptosCoin>(client_addr, remaining);
        vault.status = STATUS_CANCELLED;
    }

    // ==========================================
    // VIEW FUNCTIONS
    // ==========================================

    #[view]
    public fun get_escrow_info(vault_owner: address): (u64, address, address, address, u64, u64, u8, u64) acquires EscrowVault {
        assert!(exists<EscrowVault>(vault_owner), E_VAULT_NOT_FOUND);
        let vault = borrow_global<EscrowVault>(vault_owner);
        (
            vault.escrow_id,
            vault.client,
            vault.contractor,
            vault.arbitrator,
            vault.total_amount,
            vault.released_amount,
            vault.status,
            coin::value<AptosCoin>(&vault.locked_funds)
        )
    }

    #[view]
    public fun get_milestone_count(vault_owner: address): u64 acquires EscrowVault {
        assert!(exists<EscrowVault>(vault_owner), E_VAULT_NOT_FOUND);
        let vault = borrow_global<EscrowVault>(vault_owner);
        vector::length(&vault.milestones)
    }
}
