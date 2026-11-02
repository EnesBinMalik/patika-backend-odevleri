import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ExternalLink, 
  Send, 
  Check, 
  ShieldAlert, 
  Sparkles,
  ArrowRight,
  FileCheck2,
  XCircle,
  Scale
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Escrow, Milestone } from '../types/escrow';
import { WalletState } from '../services/aptosService';

interface EscrowCardProps {
  escrow: Escrow;
  wallet: WalletState;
  onSubmitProof: (escrowId: string, milestoneId: number, proofUri: string) => void;
  onApproveMilestone: (escrowId: string, milestoneId: number) => void;
  onRaiseDispute: (escrowId: string, reason: string) => void;
  onResolveDispute: (escrowId: string, clientRefund: number, contractorPayout: number, note: string) => void;
  onCancelEscrow: (escrowId: string) => void;
}

export const EscrowCard: React.FC<EscrowCardProps> = ({
  escrow,
  wallet,
  onSubmitProof,
  onApproveMilestone,
  onRaiseDispute,
  onResolveDispute,
  onCancelEscrow,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [submittingMilestoneId, setSubmittingMilestoneId] = useState<number | null>(null);
  const [proofInput, setProofInput] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeInput, setDisputeInput] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [clientRefundInput, setClientRefundInput] = useState((escrow.totalApt - escrow.releasedApt) / 2);
  const [arbitratorNote, setArbitratorNote] = useState('');

  const progressPercent = escrow.totalApt > 0 ? Math.round((escrow.releasedApt / escrow.totalApt) * 100) : 0;

  const handleApprove = (milestoneId: number) => {
    // Fire celebratory confetti!
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#2dd4bf', '#38bdf8', '#fbbf24'],
    });
    onApproveMilestone(escrow.id, milestoneId);
  };

  const handleProofSubmit = (e: React.FormEvent, milestoneId: number) => {
    e.preventDefault();
    if (!proofInput.trim()) return;
    onSubmitProof(escrow.id, milestoneId, proofInput.trim());
    setSubmittingMilestoneId(null);
    setProofInput('');
  };

  const handleRaiseDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeInput.trim()) return;
    onRaiseDispute(escrow.id, disputeInput.trim());
    setShowDisputeModal(false);
    setDisputeInput('');
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const remaining = escrow.totalApt - escrow.releasedApt;
    const clientAmount = Number(clientRefundInput);
    const contractorAmount = Math.max(0, remaining - clientAmount);
    onResolveDispute(escrow.id, clientAmount, contractorAmount, arbitratorNote || 'Hakem incelemesi sonucunda bakiye dağıtıldı.');
    setShowResolveModal(false);
  };

  // Status text presentation
  const getStatusDisplay = (status: Escrow['status']) => {
    switch (status) {
      case 'active':
        return <span className="text-teal-400 font-medium">Aktif Süreçte</span>;
      case 'completed':
        return <span className="text-emerald-400 font-medium">Tamamlandı</span>;
      case 'disputed':
        return <span className="text-amber-400 font-medium">Hakem İncelemesinde</span>;
      case 'cancelled':
        return <span className="text-rose-400 font-medium">İptal Edildi</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all hover:border-slate-700/80">
      
      {/* Card Header & High-Level Summary */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          
          <div className="space-y-1">
            {/* Zero-pill unboxed metadata */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-slate-500">{escrow.id}</span>
              <span aria-hidden="true">·</span>
              {getStatusDisplay(escrow.status)}
              <span aria-hidden="true">·</span>
              <span>Oluşturulma: <span className="font-mono tabular-nums">{escrow.createdAt}</span></span>
              <span aria-hidden="true">·</span>
              <span>Bitiş: <span className="font-mono tabular-nums">{escrow.deadline}</span></span>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight">
              {escrow.title}
            </h3>
          </div>

          {/* Amount Summary */}
          <div className="text-left sm:text-right shrink-0">
            <div className="text-xs text-slate-400">Kasa Bütçesi</div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {escrow.totalApt.toFixed(2)} <span className="text-sm font-sans text-teal-400 font-normal">APT</span>
            </div>
            <div className="text-xs font-mono text-slate-400 mt-0.5 tabular-nums">
              Ödenen: {escrow.releasedApt.toFixed(2)} APT ({progressPercent}%)
            </div>
          </div>

        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                escrow.status === 'completed'
                  ? 'bg-emerald-500'
                  : escrow.status === 'disputed'
                  ? 'bg-amber-500'
                  : 'bg-teal-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Parties involved */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
          
          {/* Client */}
          <div className="space-y-0.5">
            <div className="text-slate-400 text-[11px]">İşveren (Müşteri)</div>
            <div className="font-semibold text-white truncate">{escrow.clientName}</div>
            <div className="font-mono text-[11px] text-slate-400 truncate">
              {escrow.clientAddress.slice(0, 8)}...{escrow.clientAddress.slice(-6)}
            </div>
          </div>

          {/* Contractor */}
          <div className="space-y-0.5">
            <div className="text-slate-400 text-[11px]">Yüklenici (Geliştirici)</div>
            <div className="flex items-center gap-1.5">
              {escrow.contractorAvatar && (
                <img src={escrow.contractorAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
              )}
              <span className="font-semibold text-white truncate">{escrow.contractorName}</span>
            </div>
            <div className="font-mono text-[11px] text-slate-400 truncate">
              {escrow.contractorAddress.slice(0, 8)}...{escrow.contractorAddress.slice(-6)}
            </div>
          </div>

          {/* Arbitrator */}
          <div className="space-y-0.5">
            <div className="text-slate-400 text-[11px]">Bağımsız Hakem</div>
            <div className="flex items-center gap-1.5">
              {escrow.arbitratorAvatar && (
                <img src={escrow.arbitratorAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
              )}
              <span className="font-semibold text-white truncate">{escrow.arbitratorName}</span>
            </div>
            <div className="font-mono text-[11px] text-slate-400 truncate">
              {escrow.arbitratorAddress.slice(0, 8)}...{escrow.arbitratorAddress.slice(-6)}
            </div>
          </div>

        </div>

        {/* Dispute Notice if active */}
        {escrow.status === 'disputed' && (
          <div className="mt-4 p-3 bg-amber-950/40 border border-amber-800/80 rounded-lg text-xs text-amber-200">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Sözleşme Hakem İncelemesine Alındı</span>
            </div>
            {escrow.disputeReason && (
              <p className="mt-1 text-slate-300 leading-relaxed">
                <strong>Gerekçe:</strong> {escrow.disputeReason}
              </p>
            )}
            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={() => setShowResolveModal(true)}
                className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs transition-colors"
              >
                Hakem Kararı Ver & Dağıt
              </button>
            </div>
          </div>
        )}

        {/* Dispute Resolution Note if completed via ruling */}
        {escrow.arbitratorRuling && (
          <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-teal-400" />
              <span>Hakem Kararı İle Sonuçlandı</span>
            </div>
            <p className="mt-1 text-slate-400">{escrow.arbitratorRuling.note}</p>
            <div className="mt-1 font-mono text-teal-300">
              Müşteri İadesi: {escrow.arbitratorRuling.clientRefundApt} APT · Yüklenici Ödemesi: {escrow.arbitratorRuling.contractorPayoutApt} APT
            </div>
          </div>
        )}

        {/* Bottom card action bar */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60 text-xs">
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <span>{expanded ? 'Aşamaları Gizle' : `Aşamaları Göster (${escrow.milestones.length})`}</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2">
            {escrow.status === 'active' && (
              <>
                <button
                  onClick={() => setShowDisputeModal(true)}
                  className="px-2.5 py-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                >
                  Uyuşmazlık Bildir
                </button>

                {escrow.releasedApt === 0 && (
                  <button
                    onClick={() => onCancelEscrow(escrow.id)}
                    className="px-2.5 py-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                  >
                    Kasayı İptal Et
                  </button>
                )}
              </>
            )}
          </div>

        </div>

      </div>

      {/* Expandable Milestones List */}
      {expanded && (
        <div className="border-t border-slate-800 bg-slate-950/60 p-5 space-y-4">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Sözleşme Kilometre Taşları & Ödeme Aşamaları
          </div>

          <div className="space-y-3">
            {escrow.milestones.map((milestone, idx) => {
              const isApproved = milestone.status === 'approved';
              const isSubmitted = milestone.status === 'submitted';
              const isInProgress = milestone.status === 'in_progress';
              const isPending = milestone.status === 'pending';

              return (
                <div
                  key={milestone.id}
                  className={`p-4 rounded-lg border transition-all text-xs ${
                    isApproved
                      ? 'bg-slate-900/40 border-emerald-900/40'
                      : isSubmitted
                      ? 'bg-slate-900/80 border-teal-800/80'
                      : 'bg-slate-900/30 border-slate-800/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {isApproved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isSubmitted ? (
                          <Clock className="w-4 h-4 text-teal-400" />
                        ) : isInProgress ? (
                          <div className="w-4 h-4 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500">
                            {idx + 1}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{milestone.title}</span>
                          <span className="text-slate-400 font-normal">({milestone.amountApt.toFixed(2)} APT)</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                          {milestone.description}
                        </p>

                        {/* Submitted Proof Link */}
                        {milestone.proofUri && (
                          <div className="pt-1 flex items-center gap-1.5 text-teal-400 font-mono">
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>Teslim Kanıtı:</span>
                            <a
                              href={milestone.proofUri}
                              target="_blank"
                              rel="noreferrer"
                              className="underline hover:text-teal-300 truncate max-w-xs"
                            >
                              {milestone.proofUri}
                            </a>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Milestone State Actions */}
                    <div className="flex items-center gap-2 sm:self-center shrink-0 mt-2 sm:mt-0">
                      
                      {isApproved && (
                        <span className="font-medium text-emerald-400 text-xs">
                          Ödeme Tamamlandı ({milestone.amountApt} APT)
                        </span>
                      )}

                      {/* Contractor submit proof button */}
                      {(isInProgress || isPending) && escrow.status === 'active' && (
                        <button
                          onClick={() => {
                            setSubmittingMilestoneId(milestone.id);
                            setProofInput(
                              `https://github.com/aptos-projects/submission/commit/${Math.random().toString(16).slice(2, 9)}`
                            );
                          }}
                          className="px-3 py-1.5 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          <span>Kanıt Sun</span>
                        </button>
                      )}

                      {/* Client approve & release payment button */}
                      {isSubmitted && escrow.status === 'active' && (
                        <button
                          onClick={() => handleApprove(milestone.id)}
                          className="px-3 py-1.5 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Onayla & {milestone.amountApt} APT Serbest Bırak</span>
                        </button>
                      )}

                    </div>

                  </div>

                  {/* Submit Proof Input Form Dropdown */}
                  {submittingMilestoneId === milestone.id && (
                    <form
                      onSubmit={(e) => handleProofSubmit(e, milestone.id)}
                      className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2.5"
                    >
                      <label className="block text-[11px] text-slate-300 font-medium">
                        Tamamlanan İş Kanıtı (GitHub PR linki, IPFS hash'i veya Testnet Tx Hash):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={proofInput}
                          onChange={(e) => setProofInput(e.target.value)}
                          placeholder="https://github.com/... veya https://explorer.aptoslabs.com/txn/..."
                          className="flex-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-teal-500"
                          required
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs shrink-0"
                        >
                          Gönder
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubmittingMilestoneId(null)}
                          className="px-2 py-1.5 rounded hover:bg-slate-800 text-slate-400 text-xs"
                        >
                          Vazgeç
                        </button>
                      </div>
                    </form>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Raise Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Uyuşmazlık Bildirimi</span>
              </h4>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Uyuşmazlık bildirildiğinde kalan bakiye dondurulur ve belirlenen hakem ({escrow.arbitratorName}) inceleme yaparak karar verene kadar hiçbir taraf fon çekemez.
            </p>
            <form onSubmit={handleRaiseDisputeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Uyuşmazlık Nedeni:</label>
                <textarea
                  rows={3}
                  value={disputeInput}
                  onChange={(e) => setDisputeInput(e.target.value)}
                  placeholder="Gereksinimlerin karşılanmaması, teslimatta gecikme veya standart dışı kod teslimi..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950"
                >
                  Uyuşmazlığı Başlat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Dispute Modal (Arbitrator) */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-400" />
                <span>Hakem Kararı & Fon Dağıtımı</span>
              </h4>
              <button
                onClick={() => setShowResolveModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="text-xs text-slate-300">
              Kalan Kilitli Tutar:{' '}
              <strong className="text-white font-mono">{(escrow.totalApt - escrow.releasedApt).toFixed(2)} APT</strong>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">
                  Müşteriye İade Edilecek Tutar (APT):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max={escrow.totalApt - escrow.releasedApt}
                  value={clientRefundInput}
                  onChange={(e) => setClientRefundInput(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-teal-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">
                  Yükleniciye Ödenecek Tutar (APT):
                </label>
                <div className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-teal-300 font-mono">
                  {Math.max(0, (escrow.totalApt - escrow.releasedApt) - Number(clientRefundInput)).toFixed(2)} APT
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Hakem Gerekçeli Karar Notu:</label>
                <textarea
                  rows={2}
                  value={arbitratorNote}
                  onChange={(e) => setArbitratorNote(e.target.value)}
                  placeholder="Yapılan teknik denetim sonucunda teslim edilen aşamanın kısmi karşılığı..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-3 py-1.5 rounded text-slate-400 hover:text-white"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950"
                >
                  Kararı Uygula & Dağıt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
