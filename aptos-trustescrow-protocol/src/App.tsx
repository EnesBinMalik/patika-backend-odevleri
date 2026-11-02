import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { EscrowList } from './components/EscrowList';
import { CreateEscrowModal } from './components/CreateEscrowModal';
import { MoveStudio } from './components/MoveStudio';
import { ReputationAnalytics } from './components/ReputationAnalytics';
import { DocumentationViewer } from './components/DocumentationViewer';
import { Footer } from './components/Footer';
import { INITIAL_ESCROWS, DEVELOPER_PROFILE, CONTRACTOR_PROFILES } from './data/initialData';
import { Escrow } from './types/escrow';
import { AptosService, WalletState } from './services/aptosService';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'escrows' | 'create' | 'move-studio' | 'reputation' | 'docs'>('escrows');
  const [escrows, setEscrows] = useState<Escrow[]>(INITIAL_ESCROWS);
  const [wallet, setWallet] = useState<WalletState>(() => AptosService.getStoredWallet());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isClaimingFaucet, setIsClaimingFaucet] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Sync wallet to local storage
  useEffect(() => {
    AptosService.saveWallet(wallet);
  }, [wallet]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleClaimFaucet = async () => {
    if (isClaimingFaucet) return;
    setIsClaimingFaucet(true);
    showToast('Aptos Testnet musluğuna istek gönderiliyor...', 'info');

    const result = await AptosService.requestTestnetFaucet(wallet.address, 1.0);
    if (result.success) {
      // Musluk kabul etti: simülasyon bakiyesini +1 yap, sonra fullnode'dan gerçek
      // bakiyeyi okuyabiliyorsak onu esas al.
      setWallet((prev) => ({ ...prev, balanceApt: prev.balanceApt + 1.0 }));
      showToast(result.message, 'success');

      const live = await AptosService.fetchLiveBalance(wallet.address);
      if (live !== null) {
        setWallet((prev) => ({ ...prev, balanceApt: live }));
        showToast(`Fullnode'dan okunan gerçek bakiye: ${live.toFixed(4)} APT`, 'info');
      }
    } else {
      showToast(result.message, 'error');
    }
    setIsClaimingFaucet(false);
  };

  const handleSwitchAccount = (role: 'developer' | 'contractor' | 'arbitrator') => {
    if (role === 'developer') {
      setWallet({
        address: DEVELOPER_PROFILE.address,
        name: 'Enes Öztürk (İşveren / Geliştirici)',
        balanceApt: 28.45,
        isConnected: true,
        network: 'Aptos Testnet',
      });
      showToast('Aktif hesap: Enes Öztürk (Proje Sahibi & İşveren)', 'info');
    } else if (role === 'contractor') {
      setWallet({
        address: CONTRACTOR_PROFILES[0].address,
        name: `${CONTRACTOR_PROFILES[0].name} (Yüklenici)`,
        balanceApt: 14.2,
        isConnected: true,
        network: 'Aptos Testnet',
      });
      showToast('Aktif hesap: Ayşe Kaya (Geliştirici / Yüklenici)', 'info');
    } else {
      setWallet({
        address: CONTRACTOR_PROFILES[1].address,
        name: `${CONTRACTOR_PROFILES[1].name} (Hakem)`,
        balanceApt: 55.0,
        isConnected: true,
        network: 'Aptos Testnet',
      });
      showToast('Aktif hesap: Prof. Mehmet Demir (Bağımsız Hakem)', 'info');
    }
  };

  const handleCreateEscrow = (newEscrow: Escrow) => {
    setEscrows([newEscrow, ...escrows]);
    setWallet((prev) => ({
      ...prev,
      balanceApt: Math.max(0, prev.balanceApt - newEscrow.totalApt),
    }));
    showToast(`"${newEscrow.title}" emanet kasası oluşturuldu ve ${newEscrow.totalApt} APT simülasyon cüzdanından düşüldü.`, 'success');
    setCurrentTab('escrows');
  };

  const handleSubmitProof = (escrowId: string, milestoneId: number, proofUri: string) => {
    setEscrows((prev) =>
      prev.map((escrow) => {
        if (escrow.id !== escrowId) return escrow;
        const updatedMilestones = escrow.milestones.map((m) =>
          m.id === milestoneId
            ? { ...m, status: 'submitted' as const, proofUri, submittedAt: new Date().toISOString().split('T')[0] }
            : m
        );
        return { ...escrow, milestones: updatedMilestones };
      })
    );
    showToast(`Aşama ${milestoneId} teslim kanıtı yerel duruma yazıldı (zincire gitmiyor). İnceleme için müşteriye iletildi.`, 'success');
  };

  const handleApproveMilestone = (escrowId: string, milestoneId: number) => {
    const escrow = escrows.find((e) => e.id === escrowId);
    const milestone = escrow?.milestones.find((m) => m.id === milestoneId);
    if (!escrow || !milestone) return;

    // Sözleşmenin approve_milestone kapısı: yalnızca in_progress veya submitted onaylanabilir
    if (milestone.status !== 'in_progress' && milestone.status !== 'submitted') {
      showToast(`Aşama ${milestoneId} onaylanabilir durumda değil.`, 'error');
      return;
    }

    const approvedApt = milestone.amountApt;
    const today = new Date().toISOString().split('T')[0];

    setEscrows((prev) =>
      prev.map((e) => {
        if (e.id !== escrowId) return e;

        const updatedMilestones = e.milestones.map((m) =>
          m.id === milestoneId
            ? { ...m, status: 'approved' as const, approvedAt: today }
            : m
        );

        let activatedNext = false;
        const finalizedMilestones = updatedMilestones.map((m) => {
          if (!activatedNext && m.status === 'pending') {
            activatedNext = true;
            return { ...m, status: 'in_progress' as const };
          }
          return m;
        });

        return {
          ...e,
          releasedApt: e.releasedApt + approvedApt,
          status: finalizedMilestones.every((m) => m.status === 'approved')
            ? ('completed' as const)
            : e.status,
          milestones: finalizedMilestones,
        };
      })
    );

    // Yüklenici rolü aktifse simülasyon cüzdanına yansıt
    if (wallet.address === escrow.contractorAddress) {
      setWallet((prev) => ({
        ...prev,
        balanceApt: prev.balanceApt + approvedApt,
      }));
    }

    showToast(
      `Aşama onaylandı! ${approvedApt} APT yükleniciye aktarıldı (istemci taraflı simülasyon).`,
      'success'
    );
  };

  const handleRaiseDispute = (escrowId: string, reason: string) => {
    setEscrows((prev) =>
      prev.map((escrow) =>
        escrow.id === escrowId
          ? { ...escrow, status: 'disputed' as const, disputeReason: reason }
          : escrow
      )
    );
    showToast('Uyuşmazlık bildirildi. Simülasyonda onaylar durdu, karar hakeme havale edildi.', 'info');
  };

  const handleResolveDispute = (
    escrowId: string,
    clientRefund: number,
    contractorPayout: number,
    note: string
  ) => {
    setEscrows((prev) =>
      prev.map((escrow) => {
        if (escrow.id !== escrowId) return escrow;
        return {
          ...escrow,
          status: 'completed' as const,
          releasedApt: escrow.releasedApt + contractorPayout,
          arbitratorRuling: {
            clientRefundApt: clientRefund,
            contractorPayoutApt: contractorPayout,
            note,
            resolvedAt: new Date().toISOString().split('T')[0],
          },
        };
      })
    );
    showToast(`Hakem kararı simülasyona uygulandı: ${clientRefund} APT iade, ${contractorPayout} APT yükleniciye dağıtıldı.`, 'success');
  };

  const handleCancelEscrow = (escrowId: string) => {
    const escrow = escrows.find((e) => e.id === escrowId);
    if (!escrow) return;
    const refundApt = Math.max(0, escrow.totalApt - escrow.releasedApt);

    setEscrows((prev) =>
      prev.map((e) => (e.id === escrowId ? { ...e, status: 'cancelled' as const } : e))
    );
    setWallet((prev) => ({
      ...prev,
      balanceApt: prev.balanceApt + refundApt,
    }));
    showToast(`Kasa iptal edildi. ${refundApt} APT simülasyon cüzdanına iade edildi.`, 'info');
  };

  const totalTvlApt = escrows
    .filter((e) => e.status === 'active' || e.status === 'disputed')
    .reduce((sum, e) => sum + (e.totalApt - e.releasedApt), 0);

  const activeCount = escrows.filter((e) => e.status === 'active').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Top Bar */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab: string) => {
          if (tab === 'create') {
            setIsCreateModalOpen(true);
          } else {
            setCurrentTab(tab as any);
          }
        }}
        wallet={wallet}
        onClaimFaucet={handleClaimFaucet}
        isClaimingFaucet={isClaimingFaucet}
        onSwitchAccount={handleSwitchAccount}
      />

      {/* Hero Banner (Always visible or on Escrows tab) */}
      <HeroSection
        onOpenCreate={() => setIsCreateModalOpen(true)}
        onOpenStudio={() => setCurrentTab('move-studio')}
        totalTvlApt={totalTvlApt}
        activeCount={activeCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {currentTab === 'escrows' && (
          <EscrowList
            escrows={escrows}
            wallet={wallet}
            onOpenCreate={() => setIsCreateModalOpen(true)}
            onSubmitProof={handleSubmitProof}
            onApproveMilestone={handleApproveMilestone}
            onRaiseDispute={handleRaiseDispute}
            onResolveDispute={handleResolveDispute}
            onCancelEscrow={handleCancelEscrow}
          />
        )}

        {currentTab === 'move-studio' && <MoveStudio />}

        {currentTab === 'reputation' && <ReputationAnalytics />}

        {currentTab === 'docs' && <DocumentationViewer />}
      </main>

      {/* Create Escrow Wizard Modal */}
      <CreateEscrowModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        wallet={wallet}
        onCreateEscrow={handleCreateEscrow}
      />

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-medium border ${
              toast.type === 'success'
                ? 'bg-slate-900 border-teal-500/80 text-teal-300'
                : toast.type === 'error'
                ? 'bg-slate-900 border-rose-500/80 text-rose-300'
                : 'bg-slate-900 border-slate-700 text-slate-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

    </div>
  );
}
