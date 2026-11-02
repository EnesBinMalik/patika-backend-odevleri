import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Coins, 
  Lock, 
  UserCheck, 
  Terminal,
  Zap,
  Flame,
  HelpCircle,
  Copy,
  ExternalLink
} from 'lucide-react';

interface Account {
  name: string;
  address: string;
  balance: number; // in octas (1 APT = 100,000,000 octas)
  role: 'admin' | 'user' | 'attacker';
}

interface TxLog {
  id: string;
  timestamp: string;
  functionName: string;
  sender: string;
  status: 'SUCCESS' | 'ABORTED';
  abortCode?: number;
  abortMessage?: string;
  gasUnits: number;
  gasSavedComparedToLegacy: number;
  eventsEmitted: Array<{ type: string; payload: Record<string, string | number> }>;
}

export const AptosSimulator: React.FC = () => {
  // Pre-configured simulation accounts
  const [accounts, setAccounts] = useState<Record<string, Account>>({
    admin: {
      name: 'Yönetici (Admin)',
      address: '0xca5f1897c8d32b56e409391b48d641b65e71881822b3f17c8f25875965416209',
      balance: 500_000_000, // 5.0 APT
      role: 'admin'
    },
    alice: {
      name: 'Alice (Alıcı Kullanıcı)',
      address: '0xa11ce88849b294c73f32c3bb129e048123959b87201389ba6e481b7a652da01a',
      balance: 10_000_000, // 0.1 APT
      role: 'user'
    },
    bob: {
      name: 'Bob (Test Kullanıcısı)',
      address: '0xb0b11223344556677889900aabbccddeeff00112233445566778899aabbccdde',
      balance: 5_000_000, // 0.05 APT
      role: 'user'
    },
    mallory: {
      name: 'Mallory (Yetkisiz Saldırgan)',
      address: '0xbad0bad0bad0bad0bad0bad0bad0bad0bad0bad0bad0bad0bad0bad0bad0bad0',
      balance: 2_000_000, // 0.02 APT
      role: 'attacker'
    }
  });

  const [activeCallerKey, setActiveCallerKey] = useState<string>('admin');

  // Vault state
  const [isInitialized, setIsInitialized] = useState<boolean>(true);
  const [vaultAddress] = useState<string>('0x89e24b759d6411b0e352f20a9a814149fa5eb88863f6959ba08b35f29918d361');
  const [currentAdminAddress, setCurrentAdminAddress] = useState<string>(
    '0xca5f1897c8d32b56e409391b48d641b65e71881822b3f17c8f25875965416209'
  );
  const [vaultTotalBalance, setVaultTotalBalance] = useState<number>(100_000_000); // 1.0 APT
  const [vaultAllocatedBalance, setVaultAllocatedBalance] = useState<number>(30_000_000); // 0.3 APT
  const [allocations, setAllocations] = useState<Record<string, number>>({
    '0xa11ce88849b294c73f32c3bb129e048123959b87201389ba6e481b7a652da01a': 30_000_000
  });

  // Action inputs
  const [depositAmount, setDepositAmount] = useState<string>('20000000'); // 0.2 APT
  const [allocateRecipient, setAllocateRecipient] = useState<string>('alice');
  const [allocateAmount, setAllocateAmount] = useState<string>('15000000'); // 0.15 APT
  const [withdrawAmount, setWithdrawAmount] = useState<string>('10000000'); // 0.1 APT
  const [newAdminRecipient, setNewAdminRecipient] = useState<string>('bob');

  // Interactive logs
  const [txLogs, setTxLogs] = useState<TxLog[]>([
    {
      id: '0x9fa1c7...',
      timestamp: '10:04:12',
      functionName: 'initialize_vault(admin, seed: "aptos_vault_seed_v2")',
      sender: '0xca5f...6209',
      status: 'SUCCESS',
      gasUnits: 1450,
      gasSavedComparedToLegacy: 1200,
      eventsEmitted: [{ type: 'VaultCreatedEvent', payload: { vault: '0x89e2...d361', admin: '0xca5f...6209' } }]
    },
    {
      id: '0x7ba2e1...',
      timestamp: '10:05:01',
      functionName: 'deposit_tokens(admin, vault_address, 100000000)',
      sender: '0xca5f...6209',
      status: 'SUCCESS',
      gasUnits: 620,
      gasSavedComparedToLegacy: 1220,
      eventsEmitted: [{ type: 'TokensDepositedEvent', payload: { amount: 100000000 } }]
    },
    {
      id: '0x3be5f9...',
      timestamp: '10:06:22',
      functionName: 'allocate_tokens(admin, vault_address, Alice, 30000000)',
      sender: '0xca5f...6209',
      status: 'SUCCESS',
      gasUnits: 710,
      gasSavedComparedToLegacy: 1180,
      eventsEmitted: [{ type: 'TokensAllocatedEvent', payload: { recipient: '0xa11c...a01a', amount: 30000000 } }]
    }
  ]);

  const [lastActionResult, setLastActionResult] = useState<{
    success: boolean;
    title: string;
    message: string;
  } | null>(null);

  const activeCaller = accounts[activeCallerKey];

  // Helper to format Octas to APT
  const formatAPT = (octas: number) => {
    return (octas / 100_000_000).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 6 }) + ' APT';
  };

  const addTxLog = (
    fnName: string, 
    status: 'SUCCESS' | 'ABORTED', 
    gas: number, 
    events: Array<{ type: string; payload: Record<string, string | number> }>,
    abortInfo?: { code: number; message: string }
  ) => {
    const newLog: TxLog = {
      id: '0x' + Math.random().toString(16).substring(2, 10) + '...',
      timestamp: new Date().toLocaleTimeString(),
      functionName: fnName,
      sender: activeCaller.address.slice(0, 6) + '...' + activeCaller.address.slice(-4),
      status,
      abortCode: abortInfo?.code,
      abortMessage: abortInfo?.message,
      gasUnits: gas,
      gasSavedComparedToLegacy: status === 'SUCCESS' ? 1200 : 0,
      eventsEmitted: events
    };
    setTxLogs(prev => [newLog, ...prev.slice(0, 19)]);
  };

  // 1. Deposit
  const handleDeposit = () => {
    const amount = parseInt(depositAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      setLastActionResult({ success: false, title: 'Hatalı Miktar', message: 'Lütfen geçerli pozitif bir miktar girin.' });
      return;
    }
    if (activeCaller.address !== currentAdminAddress) {
      addTxLog(`deposit_tokens(signer, ${vaultAddress.slice(0, 8)}..., ${amount})`, 'ABORTED', 210, [], {
        code: 1,
        message: 'MOVE_ABORT: E_NOT_ADMIN (Kod 1) - Çağıran adres kasa yöneticisi değil!'
      });
      setLastActionResult({
        success: false,
        title: 'Move İşlemi Durduruldu (Abort: E_NOT_ADMIN)',
        message: `Hata Kodu 1: İşlemi imzalayan ${activeCaller.name} kasanın kayıtlı yöneticisi (vault.admin) değildir.`
      });
      return;
    }
    if (activeCaller.balance < amount) {
      setLastActionResult({ success: false, title: 'Yetersiz Bakiye', message: 'Yöneticinin cüzdanında yeterli APT bakiyesi yok.' });
      return;
    }

    // Execute state update
    setAccounts(prev => ({
      ...prev,
      [activeCallerKey]: { ...prev[activeCallerKey], balance: prev[activeCallerKey].balance - amount }
    }));
    setVaultTotalBalance(prev => prev + amount);

    addTxLog(`deposit_tokens(admin, vault_address, ${amount})`, 'SUCCESS', 640, [
      { type: 'TokensDepositedEvent', payload: { amount } }
    ]);
    setLastActionResult({
      success: true,
      title: 'Token Yatırma Başarılı (Deposit)',
      message: `${formatAPT(amount)} doğrudan ${vaultAddress.slice(0, 10)}... kasasına yatırıldı.`
    });
  };

  // 2. Allocate
  const handleAllocate = () => {
    const amount = parseInt(allocateAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      setLastActionResult({ success: false, title: 'Hatalı Miktar', message: 'Geçersiz miktar.' });
      return;
    }
    const targetAccount = accounts[allocateRecipient];
    const targetAddr = targetAccount.address;

    // Check admin rights
    if (activeCaller.address !== currentAdminAddress) {
      addTxLog(`allocate_tokens(signer, vault_address, ${targetAccount.name}, ${amount})`, 'ABORTED', 215, [], {
        code: 1,
        message: 'MOVE_ABORT: E_NOT_ADMIN (Kod 1) - Yetkisiz kullanıcı token tahsis edemez!'
      });
      setLastActionResult({
        success: false,
        title: 'E_NOT_ADMIN Hatası Yakalandı (Test Başarılı)',
        message: `assert!(vault.admin == signer::address_of(admin), E_NOT_ADMIN) çalıştı! ${activeCaller.name} yetkisiz olduğu için işlem durduruldu.`
      });
      return;
    }

    const available = vaultTotalBalance - vaultAllocatedBalance;
    if (available < amount) {
      addTxLog(`allocate_tokens(admin, vault_address, ${targetAccount.name}, ${amount})`, 'ABORTED', 225, [], {
        code: 2,
        message: 'MOVE_ABORT: E_INSUFFICIENT_BALANCE (Kod 2) - Kasada tahsis edilebilir yeterli serbest bakiye yok!'
      });
      setLastActionResult({
        success: false,
        title: 'E_INSUFFICIENT_BALANCE Hatası',
        message: `Mevcut boşta bakiye: ${formatAPT(available)}, istenen: ${formatAPT(amount)}.`
      });
      return;
    }

    // Update allocations
    setAllocations(prev => ({
      ...prev,
      [targetAddr]: (prev[targetAddr] || 0) + amount
    }));
    setVaultAllocatedBalance(prev => prev + amount);

    addTxLog(`allocate_tokens(admin, vault_address, ${targetAccount.name}, ${amount})`, 'SUCCESS', 720, [
      { type: 'TokensAllocatedEvent', payload: { recipient: targetAddr.slice(0, 10) + '...', amount } }
    ]);
    setLastActionResult({
      success: true,
      title: 'Token Tahsisi Tamamlandı',
      message: `${targetAccount.name} için ${formatAPT(amount)} tahsis edildi.`
    });
  };

  // 3. Claim
  const handleClaim = () => {
    const callerAddr = activeCaller.address;
    const userAlloc = allocations[callerAddr] || 0;

    if (userAlloc <= 0) {
      addTxLog(`claim_tokens(recipient, vault_address)`, 'ABORTED', 190, [], {
        code: 3,
        message: 'MOVE_ABORT: E_NO_ALLOCATION (Kod 3) - Çağıran adrese ait talep edilebilir token bulunamadı!'
      });
      setLastActionResult({
        success: false,
        title: 'Talep Başarısız (E_NO_ALLOCATION)',
        message: `${activeCaller.name} için tanımlanmış tahsis edilmiş bakiye bulunmuyor.`
      });
      return;
    }

    // Execute claim
    setAllocations(prev => ({
      ...prev,
      [callerAddr]: 0
    }));
    setVaultTotalBalance(prev => prev - userAlloc);
    setVaultAllocatedBalance(prev => prev - userAlloc);
    setAccounts(prev => ({
      ...prev,
      [activeCallerKey]: { ...prev[activeCallerKey], balance: prev[activeCallerKey].balance + userAlloc }
    }));

    addTxLog(`claim_tokens(${activeCaller.name}, vault_address)`, 'SUCCESS', 840, [
      { type: 'TokensClaimedEvent', payload: { recipient: callerAddr.slice(0, 10) + '...', amount: userAlloc } }
    ]);
    setLastActionResult({
      success: true,
      title: 'Tokenlar Başarıyla Çekildi (Claimed)',
      message: `${activeCaller.name} hesabına ${formatAPT(userAlloc)} aktarıldı.`
    });
  };

  // 4. Withdraw Unallocated
  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      setLastActionResult({ success: false, title: 'Hatalı Miktar', message: 'Geçersiz miktar.' });
      return;
    }

    if (activeCaller.address !== currentAdminAddress) {
      addTxLog(`withdraw_tokens(signer, vault_address, ${amount})`, 'ABORTED', 210, [], {
        code: 1,
        message: 'MOVE_ABORT: E_NOT_ADMIN (Kod 1) - Yalnızca yönetici tahsis edilmemiş fonları çekebilir!'
      });
      setLastActionResult({
        success: false,
        title: 'Yetkisiz Çekim Girişimi (E_NOT_ADMIN)',
        message: 'Yönetici olmayan kullanıcılar kasadan tahsis edilmemiş fon çekemez.'
      });
      return;
    }

    const unallocated = vaultTotalBalance - vaultAllocatedBalance;
    if (amount > unallocated) {
      addTxLog(`withdraw_tokens(admin, vault_address, ${amount})`, 'ABORTED', 230, [], {
        code: 2,
        message: 'MOVE_ABORT: E_INSUFFICIENT_BALANCE (Kod 2) - Tahsis edilmiş kullanıcı fonları çekilemez!'
      });
      setLastActionResult({
        success: false,
        title: 'Kullanıcı Fonu Koruma Engeli (E_INSUFFICIENT_BALANCE)',
        message: `Kullanıcılara tahsis edilmiş fonlara dokunulamaz! Boşta olan çekilebilir bakiye: ${formatAPT(unallocated)}.`
      });
      return;
    }

    setVaultTotalBalance(prev => prev - amount);
    setAccounts(prev => ({
      ...prev,
      [activeCallerKey]: { ...prev[activeCallerKey], balance: prev[activeCallerKey].balance + amount }
    }));

    addTxLog(`withdraw_tokens(admin, vault_address, ${amount})`, 'SUCCESS', 690, [
      { type: 'TokensWithdrawnEvent', payload: { amount } }
    ]);
    setLastActionResult({
      success: true,
      title: 'Tahsis Edilmemiş Fon Çekildi',
      message: `Yönetici ${formatAPT(amount)} miktarındaki boşta fonu cüzdanına çekti.`
    });
  };

  // 5. Bonus: Transfer Admin
  const handleTransferAdmin = () => {
    const targetAccount = accounts[newAdminRecipient];
    const newAdminAddr = targetAccount.address;

    if (activeCaller.address !== currentAdminAddress) {
      addTxLog(`transfer_admin(signer, vault_address, ${newAdminAddr.slice(0, 8)}...)`, 'ABORTED', 210, [], {
        code: 1,
        message: 'MOVE_ABORT: E_NOT_ADMIN (Kod 1) - Yalnızca mevcut yönetici kasanın mülkiyetini devredebilir!'
      });
      setLastActionResult({
        success: false,
        title: 'Mülkiyet Devri Reddedildi (E_NOT_ADMIN)',
        message: 'Yalnızca mevcut kasanın kayıtlı yöneticisi sahipliği aktarabilir.'
      });
      return;
    }

    if (newAdminAddr === currentAdminAddress) {
      setLastActionResult({
        success: false,
        title: 'Hatalı Devir',
        message: 'Kasa zaten bu yöneticiye ait.'
      });
      return;
    }

    const oldAdmin = currentAdminAddress;
    setCurrentAdminAddress(newAdminAddr);

    addTxLog(`transfer_admin(admin, vault_address, ${targetAccount.name})`, 'SUCCESS', 790, [
      { type: 'AdminTransferredEvent', payload: { old_admin: oldAdmin.slice(0, 10) + '...', new_admin: newAdminAddr.slice(0, 10) + '...' } }
    ]);

    setLastActionResult({
      success: true,
      title: 'Bonus Özellik: Kasa Sahipliği Devredildi',
      message: `Kasa yöneticiliği başarıyla ${targetAccount.name} (${newAdminAddr.slice(0, 10)}...) adresine devredildi. Eski yönetici yetkilerini kaybetti.`
    });
  };

  // Reset simulator
  const handleReset = () => {
    setVaultTotalBalance(100_000_000);
    setVaultAllocatedBalance(30_000_000);
    setCurrentAdminAddress('0xca5f1897c8d32b56e409391b48d641b65e71881822b3f17c8f25875965416209');
    setAllocations({
      '0xa11ce88849b294c73f32c3bb129e048123959b87201389ba6e481b7a652da01a': 30_000_000
    });
    setAccounts({
      admin: {
        name: 'Yönetici (Admin)',
        address: '0xca5f1897c8d32b56e409391b48d641b65e71881822b3f17c8f25875965416209',
        balance: 500_000_000,
        role: 'admin'
      },
      alice: {
        name: 'Alice (Alıcı Kullanıcı)',
        address: '0xa11ce88849b294c73f32c3bb129e048123959b87201389ba6e481b7a652da01a',
        balance: 10_000_000,
        role: 'user'
      },
      bob: {
        name: 'Bob (Test Kullanıcısı)',
        address: '0xb0b11223344556677889900aabbccddeeff00112233445566778899aabbccdde',
        balance: 5_000_000,
        role: 'user'
      },
      mallory: {
        name: 'Mallory (Yetkisiz Saldırgan)',
        address: '0xbad0bad0bad0bad0bad0bad0bad0bad0bad0bad0bad0bad0bad0bad0bad0bad0',
        balance: 2_000_000,
        role: 'attacker'
      }
    });
    setActiveCallerKey('admin');
    setLastActionResult({
      success: true,
      title: 'Simülatör Sıfırlandı',
      message: 'Tüm cüzdanlar ve kasa başlangıç durumuna getirildi.'
    });
  };

  const unallocatedBalance = vaultTotalBalance - vaultAllocatedBalance;

  return (
    <div className="space-y-6">
      {/* Top Banner explaining the direct vault_address architecture */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
              <span>APTOS MOVE VM VIRTUAL SIMULATOR</span>
              <span>·</span>
              <span>DOĞRUDAN KASA ADRESİ ETKİLEŞİMİ</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              İnteraktif Aptos Kasa Simülatörü & Durum Makinesi
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Değiştirilen sözleşmedeki fonksiyonları (<code className="text-cyan-300">deposit_tokens</code>, <code className="text-cyan-300">allocate_tokens</code>, <code className="text-cyan-300">claim_tokens</code>, <code className="text-cyan-300">withdraw_tokens</code> ve bonus <code className="text-cyan-300">transfer_admin</code>) canlı olarak test edin. Yetkili ve yetkisiz roller arasında geçiş yaparak Move Abort hata durumlarını gözlemleyin.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Simülatörü Sıfırla</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Column: Active Caller & Vault State, Right Column: Contract Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Caller & Vault Resource View (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Caller Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              1. İşlemi Çağıran Cüzdanı Seçin (&signer)
            </label>
            <div className="space-y-2">
              {Object.entries(accounts).map(([key, acc]) => {
                const isCurrentAdmin = acc.address === currentAdminAddress;
                const isSelected = activeCallerKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCallerKey(key)}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/60 text-slate-100 shadow-sm'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{acc.name}</span>
                        {isCurrentAdmin && (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-1.5 py-0.5 rounded">
                            Mevcut Yönetici
                          </span>
                        )}
                        {acc.role === 'attacker' && (
                          <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/70 border border-rose-800/80 px-1.5 py-0.5 rounded">
                            Yetkisiz
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono truncate mt-0.5">
                        {acc.address.slice(0, 14)}...{acc.address.slice(-8)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-semibold text-slate-200 tabular-nums">
                        {formatAPT(acc.balance)}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                        {acc.balance.toLocaleString('tr-TR')} Octa
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vault Resource State at vault_address */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Vault Kaynağı Durumu (move_to &vault_address)
                </h3>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                Resource Account
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <div className="text-slate-400 mb-1">Kasa Adresi (vault_address - O(1) Borç Alınan Konum):</div>
                <div className="font-mono text-slate-200 break-all select-all text-[11px]">
                  {vaultAddress}
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <div className="text-slate-400 mb-1">Kasa Yöneticisi (vault.admin):</div>
                <div className="font-mono text-emerald-400 break-all text-[11px] font-semibold">
                  {currentAdminAddress}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Kontrol: <code className="text-slate-300">assert!(vault.admin == signer::address_of(admin), E_NOT_ADMIN);</code>
                </div>
              </div>

              {/* Balances grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400 text-[11px]">Toplam Kasa Bakiyesi</div>
                  <div className="text-base font-bold font-mono text-slate-100 mt-0.5 tabular-nums">
                    {formatAPT(vaultTotalBalance)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {vaultTotalBalance.toLocaleString('tr-TR')} Octa
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400 text-[11px]">Tahsis Edilmiş Bakiye</div>
                  <div className="text-base font-bold font-mono text-amber-400 mt-0.5 tabular-nums">
                    {formatAPT(vaultAllocatedBalance)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {vaultAllocatedBalance.toLocaleString('tr-TR')} Octa
                  </div>
                </div>
              </div>

              <div className="p-3 bg-cyan-950/30 rounded-lg border border-cyan-800/40">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Çekilebilir Boşta Bakiye (Unallocated):</span>
                  <span className="font-mono font-bold text-cyan-300 text-sm tabular-nums">
                    {formatAPT(unallocatedBalance)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Yönetici çekim yaparken bu miktarı aşamaz (kullanıcı fonu koruması).
                </div>
              </div>

              {/* Allocations Table */}
              <div className="pt-2">
                <div className="text-xs font-semibold text-slate-300 mb-2">
                  Kullanıcı Tahsis Tablosu (Table&lt;address, u64&gt;):
                </div>
                <div className="space-y-1.5">
                  {Object.entries(allocations).map(([addr, amt]) => {
                    const accName = Object.values(accounts).find(a => a.address === addr)?.name || addr.slice(0, 8);
                    return (
                      <div
                        key={addr}
                        className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/60 text-[11px]"
                      >
                        <div className="truncate pr-2">
                          <span className="font-medium text-slate-200">{accName}</span>
                          <span className="text-slate-400 font-mono ml-2">({addr.slice(0, 8)}...)</span>
                        </div>
                        <span className="font-mono font-semibold text-amber-300 shrink-0 tabular-nums">
                          {formatAPT(amt)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Operations & Terminal (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Feedback Banner */}
          {lastActionResult && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                lastActionResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              }`}
            >
              {lastActionResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <div className="font-bold text-sm mb-0.5">{lastActionResult.title}</div>
                <div>{lastActionResult.message}</div>
              </div>
            </div>
          )}

          {/* Operations Accordion/Tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Coins className="w-4 h-4 text-cyan-400" />
                <span>Akıllı Sözleşme Fonksiyon Çağrıları</span>
              </h3>
              <div className="text-xs text-slate-400">
                Aktif İmzalayıcı: <span className="text-cyan-300 font-semibold">{activeCaller.name}</span>
              </div>
            </div>

            {/* Action 1: deposit_tokens */}
            <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200 font-mono">
                    deposit_tokens(admin: &signer, vault_address: address, amount: u64)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Yönetici kasanın doğrudan adresine AptosCoin yatırır.
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50">
                  Yönetici Fonksiyonu
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono tabular-nums focus:outline-none focus:border-cyan-500"
                    placeholder="Miktar (Octas)"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-mono">
                    {formatAPT(parseInt(depositAmount) || 0)}
                  </span>
                </div>
                <button
                  onClick={handleDeposit}
                  className="px-4 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3" />
                  <span>Yatır (Deposit)</span>
                </button>
              </div>
            </div>

            {/* Action 2: allocate_tokens */}
            <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200 font-mono">
                    allocate_tokens(admin: &signer, vault_address: address, recipient: address, amount: u64)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Yönetici, kasadaki boşta bakiyeden hedef adrese pay tahsis eder.
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50">
                  Yönetici Fonksiyonu
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <select
                    value={allocateRecipient}
                    onChange={e => setAllocateRecipient(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="alice">Alice ({accounts.alice.address.slice(0, 8)}...)</option>
                    <option value="bob">Bob ({accounts.bob.address.slice(0, 8)}...)</option>
                    <option value="mallory">Mallory ({accounts.mallory.address.slice(0, 8)}...)</option>
                  </select>
                </div>
                <div className="sm:col-span-4 relative">
                  <input
                    type="number"
                    value={allocateAmount}
                    onChange={e => setAllocateAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono tabular-nums focus:outline-none focus:border-cyan-500"
                    placeholder="Miktar"
                  />
                  <span className="absolute right-2 top-2.5 text-[10px] text-slate-400 font-mono">
                    {formatAPT(parseInt(allocateAmount) || 0)}
                  </span>
                </div>
                <div className="sm:col-span-3">
                  <button
                    onClick={handleAllocate}
                    className="w-full px-3 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3 h-3" />
                    <span>Tahsis Et</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Action 3: claim_tokens */}
            <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200 font-mono">
                    claim_tokens(recipient: &signer, vault_address: address)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Kullanıcı kasanın doğrudan adresini belirterek kendi hakkını talep eder.
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
                  Herkes Çağırabilir
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div className="text-xs">
                  <span className="text-slate-400">Aktif Kullanıcı ({activeCaller.name}) Tahsisi: </span>
                  <span className="font-mono font-bold text-amber-300">
                    {formatAPT(allocations[activeCaller.address] || 0)}
                  </span>
                </div>
                <button
                  onClick={handleClaim}
                  className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3" />
                  <span>Tokenları Talep Et (Claim)</span>
                </button>
              </div>
            </div>

            {/* Action 4: withdraw_tokens */}
            <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200 font-mono">
                    withdraw_tokens(admin: &signer, vault_address: address, amount: u64)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Yönetici tahsis edilmemiş (unallocated) boşta duran fonları çeker.
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50">
                  Yönetici Fonksiyonu
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono tabular-nums focus:outline-none focus:border-cyan-500"
                    placeholder="Miktar"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-mono">
                    {formatAPT(parseInt(withdrawAmount) || 0)}
                  </span>
                </div>
                <button
                  onClick={handleWithdraw}
                  className="px-4 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3" />
                  <span>Geri Çek (Withdraw)</span>
                </button>
              </div>
            </div>

            {/* Action 5 (BONUS): transfer_admin */}
            <div className="p-4 bg-purple-950/20 rounded-lg border border-purple-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-200 font-mono">
                      transfer_admin(admin: &signer, vault_address: address, new_admin: address)
                    </span>
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-700/60 px-1.5 py-0.2 rounded">
                      BONUS GÖREV
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Kasa mülkiyetini yeni bir yöneticiye devreder. Doğrudan <code className="text-slate-300">vault_address</code> mimarisi sayesinde fon taşımaya gerek kalmadan O(1) yetki aktarımı sağlanır!
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={newAdminRecipient}
                  onChange={e => setNewAdminRecipient(e.target.value)}
                  className="flex-1 bg-slate-900 border border-purple-700/60 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-400"
                >
                  <option value="bob">Bob ({accounts.bob.address.slice(0, 10)}...)</option>
                  <option value="alice">Alice ({accounts.alice.address.slice(0, 10)}...)</option>
                  <option value="admin">Admin ({accounts.admin.address.slice(0, 10)}...)</option>
                </select>
                <button
                  onClick={handleTransferAdmin}
                  className="px-4 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Mülkiyeti Devret</span>
                </button>
              </div>
            </div>
          </div>

          {/* Simulated Aptos Transaction & Event Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Simüle Edilen Aptos İşlem ve Olay Günlüğü (Ledger Events)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Gaz Tasarrufu: ~1,200 gaz / işlem
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
              {txLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border font-mono text-[11px] ${
                    log.status === 'SUCCESS'
                      ? 'bg-slate-950/70 border-slate-800/80 text-slate-300'
                      : 'bg-rose-950/30 border-rose-900/60 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                    <span className="text-cyan-400 font-bold">{log.id}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">İmzalayan: {log.sender}</span>
                      <span>·</span>
                      <span className="text-slate-400">{log.timestamp}</span>
                    </div>
                  </div>
                  <div className="font-semibold text-slate-200">
                    &gt; {log.functionName}
                  </div>

                  {log.status === 'SUCCESS' ? (
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] text-emerald-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Durum: EXECUTED_SUCCESS
                      </span>
                      <span className="text-slate-400">Gaz: {log.gasUnits} birim</span>
                      <span className="text-cyan-400 font-semibold">
                        Tasarruf: +{log.gasSavedComparedToLegacy} gaz (O(1) Direct Lookup)
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1.5 text-[10px] text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{log.abortMessage}</span>
                    </div>
                  )}

                  {log.eventsEmitted.length > 0 && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 text-[10px] text-slate-400">
                      <span className="text-slate-300 font-medium">Yayınlanan Event: </span>
                      {log.eventsEmitted.map((ev, eIdx) => (
                        <span key={eIdx} className="text-amber-300/90 ml-1">
                          {ev.type}({JSON.stringify(ev.payload)})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
