import { FULLNODE_ENDPOINT, FAUCET_ENDPOINT, CONTRACT_ADDRESS } from '../data/initialData';
import { MoveTestItem } from '../types/escrow';

export interface WalletState {
  address: string;
  name: string;
  balanceApt: number;
  isConnected: boolean;
  network: string;
}

const LOCAL_STORAGE_KEY = 'aptos_trustescrow_wallet';

export const AptosService = {
  getStoredWallet(): WalletState {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Default account for Enes Öztürk
    return {
      address: CONTRACT_ADDRESS,
      name: 'Enes Öztürk (Sözleşme Sahibi)',
      balanceApt: 28.45,
      isConnected: true,
      network: 'Aptos Testnet',
    };
  },

  saveWallet(state: WalletState) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  },

  async fetchLiveBalance(address: string): Promise<number | null> {
    try {
      const response = await fetch(
        `${FULLNODE_ENDPOINT}/accounts/${address}/resource/0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>`,
        { method: 'GET', headers: { 'Accept': 'application/json' } }
      );
      if (response.ok) {
        const data = await response.json();
        const octas = Number(data?.data?.coin?.value || 0);
        return octas / 100000000;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Testnet musluğuna gerçek POST atar. Yalnızca sunucu 2xx dönerse başarı bildirir;
   * ağ/CORS hatasında sahte işlem hash'i üretmez, başarısızlığı çağırana bildirir.
   */
  async requestTestnetFaucet(address: string, amountApt: number = 1.0): Promise<{ success: boolean; txHash?: string; message: string }> {
    const octas = Math.round(amountApt * 100000000);
    try {
      const response = await fetch(`${FAUCET_ENDPOINT}?amount=${octas}&address=${address}`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        const txHash = Array.isArray(data) ? String(data[0]) : (data?.hash ?? null);
        return {
          success: true,
          txHash: txHash || undefined,
          message: txHash
            ? `${amountApt} APT musluktan istendi (İşlem: ${txHash.slice(0, 12)}…)`
            : `${amountApt} APT musluktan istendi (hash döndü, sunucu yanıtı kontrol edilmeli)`,
        };
      }
      return {
        success: false,
        message: `Musluk ${response.status} döndü. Yerel bakiye değiştirilmedi.`,
      };
    } catch {
      return {
        success: false,
        message: 'Musluk isteği yapılamadı (ağ erişimi veya CORS engeli). Yerel bakiye değiştirilmedi.',
      };
    }
  },

  /**
   * contracts/tests/trust_escrow_tests.move dosyasındaki GERÇEK testlerin listesi.
   * gasUsed/durationMs değerleri simülasyondur; ölçüm değildir.
   */
  getInitialTests(): MoveTestItem[] {
    return [
      {
        id: 'test-1',
        name: 'test_create_and_release_milestone',
        module: 'trust_escrow::escrow_vault_tests',
        status: 'idle',
        gasUsed: 1482,
        durationMs: 42,
        description: 'Emanet oluşturma, 10 APT kilitleme, iki aşamanın onayı ve yüklenici bakiyesinin 10 APT olması (test dosyası: 13-106).',
      },
      {
        id: 'test-2',
        name: 'test_dispute_resolution',
        module: 'trust_escrow::escrow_vault_tests',
        status: 'idle',
        gasUsed: 964,
        durationMs: 31,
        description: 'Uyuşmazlık bildirimi ve hakemin 50-50 bölüştürmesi: 250 000 000 octas her iki tarafa (test dosyası: 108-162).',
      },
    ];
  },
};
