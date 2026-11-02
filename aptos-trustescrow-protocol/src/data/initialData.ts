import { Escrow, UserProfile } from '../types/escrow';
import { IMAGES } from '../assets/images';

// Sentetik demo adresi: bu depoda derlenmiş veya dağıtılmış bir paketi
// işaret etmez. Arayüzün "sözleşme sahibi" hesabı olarak kullanılır.
export const CONTRACT_ADDRESS = '0x9f4a8b7c2518e3d647a508b9c6f2e8d3b57a1e0c4f839a672e519bd746203c15';
export const MODULE_ESCROW = 'trust_escrow::escrow_vault';
export const MODULE_REPUTATION = 'trust_escrow::reputation_registry';
export const NETWORK_NAME = 'Aptos Testnet';
export const EXPLORER_URL = `https://explorer.aptoslabs.com/account/${CONTRACT_ADDRESS}?network=testnet`;
export const FAUCET_ENDPOINT = 'https://faucet.testnet.aptoslabs.com/mint';
export const FULLNODE_ENDPOINT = 'https://fullnode.testnet.aptoslabs.com/v1';

export const DEVELOPER_PROFILE: UserProfile = {
  address: '0x9f4a8b7c2518e3d647a508b9c6f2e8d3b57a1e0c4f839a672e519bd746203c15',
  name: 'Enes Öztürk',
  role: 'client',
  avatar: IMAGES.enesAvatar,
  completedContracts: 18,
  totalVolumeApt: 245.8,
  rating: 4.96,
  reviewCount: 22,
  disputeRate: 0,
  badges: ['Proje Sahibi', 'Aptos Move Geliştirici', 'Demo profil'],
};

export const CONTRACTOR_PROFILES: UserProfile[] = [
  {
    address: '0x456a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567',
    name: 'Ayşe Kaya',
    role: 'contractor',
    avatar: IMAGES.contractorAvatar,
    completedContracts: 14,
    totalVolumeApt: 112.5,
    rating: 4.92,
    reviewCount: 16,
    disputeRate: 0,
    badges: ['Move Akıllı Sözleşme Uzmanı', 'Frontend Mühendisi'],
  },
  {
    address: '0x789c1d2e3f4a5b67890abcdef1234567890abcdef1234567890abcdef1234567',
    name: 'Prof. Mehmet Demir',
    role: 'arbitrator',
    avatar: IMAGES.arbitratorAvatar,
    completedContracts: 42,
    totalVolumeApt: 890.0,
    rating: 4.98,
    reviewCount: 39,
    disputeRate: 2.1,
    badges: ['Kıdemli Hakem', 'Web3 Güvenlik Denetçisi'],
  },
];

export const INITIAL_ESCROWS: Escrow[] = [
  {
    id: 'ESC-001',
    title: 'Aptos DEX Likidite Havuzu & Akıllı Sözleşme Denetimi',
    clientAddress: DEVELOPER_PROFILE.address,
    clientName: DEVELOPER_PROFILE.name,
    contractorAddress: CONTRACTOR_PROFILES[0].address,
    contractorName: CONTRACTOR_PROFILES[0].name,
    contractorAvatar: CONTRACTOR_PROFILES[0].avatar,
    arbitratorAddress: CONTRACTOR_PROFILES[1].address,
    arbitratorName: CONTRACTOR_PROFILES[1].name,
    arbitratorAvatar: CONTRACTOR_PROFILES[1].avatar,
    totalApt: 12.5,
    releasedApt: 5.0,
    status: 'active',
    createdAt: '2026-10-24',
    deadline: '2026-11-20',
    milestones: [
      {
        id: 1,
        title: 'Move Akıllı Sözleşme Mimarisi ve Swap Fonksiyonları',
        description: 'Aptos Framework uyumlu AMM swap kontratı ve test senaryoları',
        amountApt: 5.0,
        status: 'approved',
        proofUri: 'ipfs://demo-proof-dex-audit-0012 (ornek veri)',
        submittedAt: '2026-10-28',
        approvedAt: '2026-10-29',
      },
      {
        id: 2,
        title: 'Testnet Dağıtımı ve Formal Doğrulama (Move Prover)',
        description: 'Aptos Testnet üzerinde kontrat testleri ve prover raporu teslimi',
        amountApt: 4.5,
        status: 'submitted',
        proofUri: 'ipfs://demo-proof-cid-9a8b7c6d5e4f3a2b1c (örnek veri)',
        submittedAt: '2026-11-01',
      },
      {
        id: 3,
        title: 'Ön Yüz SDK Entegrasyonu ve Kapsamlı Dokümantasyon',
        description: 'React TS dApp entegrasyonu ve son kabul testi',
        amountApt: 3.0,
        status: 'pending',
      },
    ],
  },
  {
    id: 'ESC-002',
    title: 'Aptos NFT Stake & Dinamik Ödül Havuzu Sözleşmesi',
    clientAddress: DEVELOPER_PROFILE.address,
    clientName: DEVELOPER_PROFILE.name,
    contractorAddress: CONTRACTOR_PROFILES[0].address,
    contractorName: CONTRACTOR_PROFILES[0].name,
    contractorAvatar: CONTRACTOR_PROFILES[0].avatar,
    arbitratorAddress: CONTRACTOR_PROFILES[1].address,
    arbitratorName: CONTRACTOR_PROFILES[1].name,
    arbitratorAvatar: CONTRACTOR_PROFILES[1].avatar,
    totalApt: 8.0,
    releasedApt: 8.0,
    status: 'completed',
    createdAt: '2026-10-10',
    deadline: '2026-10-26',
    milestones: [
      {
        id: 1,
        title: 'Staking Havuzu Mantığı ve Zaman Damgası Kontrolü',
        description: 'NFT kitleme ve saniyelik getiri hesaplama Move modülü',
        amountApt: 4.0,
        status: 'approved',
        proofUri: 'ipfs://demo-proof-nft-vault-a8f902e (ornek veri)',
        submittedAt: '2026-10-16',
        approvedAt: '2026-10-17',
      },
      {
        id: 2,
        title: 'Acil Çekim ve Güvenlik Çoklu İmzası',
        description: 'Güvenlik denetimi ve acil durum iptal fonksiyonları',
        amountApt: 4.0,
        status: 'approved',
        proofUri: 'ipfs://demo-proof-emergency-multisig-07b8c (ornek veri)',
        submittedAt: '2026-10-24',
        approvedAt: '2026-10-25',
      },
    ],
  },
  {
    id: 'ESC-003',
    title: 'Aptos GameFi Eşya Ticareti & Emanet Pazaryeri',
    clientAddress: '0x111222333444555666777888999000aaabbbcccdddeeefff0001112223334445',
    clientName: 'Metin Arslan',
    contractorAddress: CONTRACTOR_PROFILES[0].address,
    contractorName: CONTRACTOR_PROFILES[0].name,
    contractorAvatar: CONTRACTOR_PROFILES[0].avatar,
    arbitratorAddress: CONTRACTOR_PROFILES[1].address,
    arbitratorName: CONTRACTOR_PROFILES[1].name,
    arbitratorAvatar: CONTRACTOR_PROFILES[1].avatar,
    totalApt: 15.0,
    releasedApt: 0,
    status: 'disputed',
    createdAt: '2026-10-18',
    deadline: '2026-11-05',
    disputeReason: 'Yüklenici teslim edilen modülde testnet gaz optimizasyonunun şartnameye uymadığını belirtirken, işveren tam iade talep etmektedir.',
    milestones: [
      {
        id: 1,
        title: 'Zincir Üstü Eşya Takas Motoru',
        description: 'Düşük gecikmeli Aptos Move eşler arası takas modülü',
        amountApt: 7.5,
        status: 'submitted',
        proofUri: 'ipfs://demo-proof-gamefi-trade-0003 (ornek veri)',
        submittedAt: '2026-10-30',
      },
      {
        id: 2,
        title: 'Oyuncu Envanter Arayüzü',
        description: 'React tabanlı envanter ve onay ekranı',
        amountApt: 7.5,
        status: 'pending',
      },
    ],
  },
];
