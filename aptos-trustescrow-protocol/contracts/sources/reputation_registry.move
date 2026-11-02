/**
 * @title Aptos TrustEscrow Reputation Registry
 * @author Enes Öztürk <enesbino38@gmail.com>
 * @notice On-chain reputation metrics, completion badges, and rating tracker for Aptos decentralized workforce.
 */
module trust_escrow::reputation_registry {
    use std::signer;
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;

    const E_ALREADY_INITIALIZED: u64 = 1;
    const E_NOT_AUTHORIZED: u64 = 2;
    const E_INVALID_RATING: u64 = 3;

    struct ReputationProfile has key {
        user: address,
        completed_contracts: u64,
        total_volume_octas: u64,
        rating_sum: u64,
        rating_count: u64,
        disputed_contracts: u64,
        created_at: u64,
        last_active: u64,
    }

    struct ReputationEvents has key {
        rating_updated_events: EventHandle<RatingUpdatedEvent>,
    }

    struct RatingUpdatedEvent has drop, store {
        target_user: address,
        rater: address,
        score: u8,
        total_rating_avg: u64,
        timestamp: u64,
    }

    public entry fun init_profile(account: &signer) {
        let addr = signer::address_of(account);
        assert!(!exists<ReputationProfile>(addr), E_ALREADY_INITIALIZED);

        move_to(account, ReputationProfile {
            user: addr,
            completed_contracts: 0,
            total_volume_octas: 0,
            rating_sum: 0,
            rating_count: 0,
            disputed_contracts: 0,
            created_at: timestamp::now_seconds(),
            last_active: timestamp::now_seconds(),
        });

        if (!exists<ReputationEvents>(addr)) {
            move_to(account, ReputationEvents {
                rating_updated_events: account::new_event_handle<RatingUpdatedEvent>(account),
            });
        };
    }

    public entry fun record_completion(
        caller: &signer,
        target_user: address,
        volume_octas: u64,
        score: u8,
    ) acquires ReputationProfile, ReputationEvents {
        assert!(score >= 1 && score <= 5, E_INVALID_RATING);

        if (!exists<ReputationProfile>(target_user)) {
            // Can be initialized by caller if profile does not exist yet
            return
        };

        let profile = borrow_global_mut<ReputationProfile>(target_user);
        profile.completed_contracts = profile.completed_contracts + 1;
        profile.total_volume_octas = profile.total_volume_octas + volume_octas;
        profile.rating_sum = profile.rating_sum + (score as u64);
        profile.rating_count = profile.rating_count + 1;
        profile.last_active = timestamp::now_seconds();

        if (exists<ReputationEvents>(signer::address_of(caller))) {
            let events = borrow_global_mut<ReputationEvents>(signer::address_of(caller));
            let avg = (profile.rating_sum * 100) / profile.rating_count;
            event::emit_event(
                &mut events.rating_updated_events,
                RatingUpdatedEvent {
                    target_user,
                    rater: signer::address_of(caller),
                    score,
                    total_rating_avg: avg,
                    timestamp: timestamp::now_seconds(),
                }
            );
        };
    }

    #[view]
    public fun get_reputation(target_user: address): (u64, u64, u64, u64, u64) acquires ReputationProfile {
        if (!exists<ReputationProfile>(target_user)) {
            return (0, 0, 0, 0, 0)
        };
        let p = borrow_global<ReputationProfile>(target_user);
        let avg = if (p.rating_count > 0) { (p.rating_sum * 10) / p.rating_count } else { 50 }; // default 5.0
        (
            p.completed_contracts,
            p.total_volume_octas,
            avg,
            p.rating_count,
            p.disputed_contracts
        )
    }
}
