import React, { useState } from 'react';
import { X, Plus, Trash2, ShieldCheck, ArrowRight, Wallet, AlertCircle } from 'lucide-react';
import { Milestone, Escrow } from '../types/escrow';
import { WalletState } from '../services/aptosService';
import { CONTRACTOR_PROFILES } from '../data/initialData';
import { IMAGES } from '../assets/images';

interface CreateEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletState;
  onCreateEscrow: (newEscrow: Escrow) => void;
}

export const CreateEscrowModal: React.FC<CreateEscrowModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onCreateEscrow,
}) => {
  const [title, setTitle] = useState('');
  const [contractorAddress, setContractorAddress] = useState(CONTRACTOR_PROFILES[0].address);
  const [contractorName, setContractorName] = useState(CONTRACTOR_PROFILES[0].name);
  const [arbitratorAddress, setArbitratorAddress] = useState(CONTRACTOR_PROFILES[1].address);
  const [arbitratorName, setArbitratorName] = useState(CONTRACTOR_PROFILES[1].name);
  const [deadline, setDeadline] = useState('2026-12-15');

  const [milestones, setMilestones] = useState<Array<{ title: string; description: string; amountApt: number }>>([
    {
      title: 'Aşama 1: Mimari & İlk Teslimat',
      description: 'Sözleşme taslağı ve arayüz prototipi teslimi',
      amountApt: 2.5,
    },
    {
      title: 'Aşama 2: Testnet Dağıtımı & Nihai Kabul',
      description: 'Aptos testnet entegrasyonu ve son kabul raporu',
      amountApt: 3.5,
    },
  ]);

  if (!isOpen) return null;

  const totalApt = milestones.reduce((sum, m) => sum + Number(m.amountApt || 0), 0);
  const hasEnoughBalance = wallet.balanceApt >= totalApt;

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: `Aşama ${milestones.length + 1}: Yeni Görev`,
        description: 'Aşama teslim şartları ve kanıt gereksinimleri',
        amountApt: 1.0,
      },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, field: string, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || totalApt <= 0) return;

    const formattedMilestones: Milestone[] = milestones.map((m, idx) => ({
      id: idx + 1,
      title: m.title,
      description: m.description,
      amountApt: Number(m.amountApt),
      status: idx === 0 ? 'in_progress' : 'pending',
    }));

    const newEscrow: Escrow = {
      id: `ESC-00${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      clientAddress: wallet.address,
      clientName: wallet.name,
      contractorAddress: contractorAddress.trim(),
      contractorName: contractorName.trim() || 'Aptos Geliştirici',
      contractorAvatar: IMAGES.contractorAvatar,
      arbitratorAddress: arbitratorAddress.trim(),
      arbitratorName: arbitratorName.trim() || 'Bağımsız Hakem',
      arbitratorAvatar: IMAGES.arbitratorAvatar,
      totalApt,
      releasedApt: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      deadline,
      milestones: formattedMilestones,
    };

    onCreateEscrow(newEscrow);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 my-8 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Yeni Emanet Kasası Oluştur</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Bu akış yerel simülasyon durumunu günceller; fonlar gerçekten bir Aptos sözleşmesine kilitlenmez.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* Project Title */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Proje / Sözleşme Başlığı *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Aptos Move Akıllı Sözleşme Geliştirme ve Güvenlik Denetimi"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-400 text-xs"
              required
            />
          </div>

          {/* Contractor & Arbitrator Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Contractor */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">
                Yüklenici Cüzdan Adresi (Contractor)
              </label>
              <input
                type="text"
                value={contractorAddress}
                onChange={(e) => setContractorAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-[11px] focus:outline-none focus:border-teal-400"
                required
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>İsim:</span>
                <input
                  type="text"
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                  className="bg-transparent text-right text-teal-300 focus:outline-none"
                />
              </div>
            </div>

            {/* Arbitrator */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">
                Bağımsız Hakem Adresi (Arbitrator)
              </label>
              <input
                type="text"
                value={arbitratorAddress}
                onChange={(e) => setArbitratorAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-[11px] focus:outline-none focus:border-teal-400"
                required
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>İsim:</span>
                <input
                  type="text"
                  value={arbitratorName}
                  onChange={(e) => setArbitratorName(e.target.value)}
                  className="bg-transparent text-right text-teal-300 focus:outline-none"
                />
              </div>
            </div>

          </div>

          {/* Deadline */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Hedef Tamamlanma Tarihi (Son Teslimat)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-teal-400"
              required
            />
          </div>

          {/* Milestones Configuration */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">
                Kilometre Taşları & Ödeme Dilimleri ({milestones.length})
              </span>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="flex items-center gap-1 text-teal-400 hover:text-teal-300 text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aşama Ekle</span>
              </button>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {milestones.map((milestone, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-300 text-[11px]">
                      Aşama {idx + 1}
                    </span>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(idx)}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                        title="Aşamayı Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-8">
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                        placeholder="Aşama başlığı..."
                        className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-400"
                        required
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={milestone.amountApt}
                          onChange={(e) => handleMilestoneChange(idx, 'amountApt', Number(e.target.value))}
                          placeholder="Tutar"
                          className="w-full px-2.5 py-1.5 pr-10 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-teal-400"
                          required
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">
                          APT
                        </span>
                      </div>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={milestone.description}
                    onChange={(e) => handleMilestoneChange(idx, 'description', e.target.value)}
                    placeholder="Teslim edilecek işin açıklaması..."
                    className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[11px] focus:outline-none focus:border-teal-400"
                  />
                </div>
              ))}
            </div>

          </div>

          {/* Financial Summary & Balance Check */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Kilitlenecek Toplam Tutar:</span>
              <span className="font-mono font-bold text-white text-sm tabular-nums">
                {totalApt.toFixed(2)} APT
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Cüzdan Bakiyeniz:</span>
              <span className="font-mono text-slate-300 tabular-nums">
                {wallet.balanceApt.toFixed(2)} APT
              </span>
            </div>

            {!hasEnoughBalance && (
              <div className="flex items-center gap-1.5 text-rose-400 text-[11px] pt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Yetersiz bakiye! Lütfen üst menüden "+1.0 APT" testnet musluğunu kullanın.</span>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={!hasEnoughBalance || totalApt <= 0}
              className="px-5 py-2 rounded-lg font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Kasayı Oluştur (yerel simülasyon)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
