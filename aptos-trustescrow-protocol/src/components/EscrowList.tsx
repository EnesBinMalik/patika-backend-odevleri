import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, ShieldCheck } from 'lucide-react';
import { Escrow } from '../types/escrow';
import { EscrowCard } from './EscrowCard';
import { WalletState } from '../services/aptosService';

interface EscrowListProps {
  escrows: Escrow[];
  wallet: WalletState;
  onOpenCreate: () => void;
  onSubmitProof: (escrowId: string, milestoneId: number, proofUri: string) => void;
  onApproveMilestone: (escrowId: string, milestoneId: number) => void;
  onRaiseDispute: (escrowId: string, reason: string) => void;
  onResolveDispute: (escrowId: string, clientRefund: number, contractorPayout: number, note: string) => void;
  onCancelEscrow: (escrowId: string) => void;
}

export const EscrowList: React.FC<EscrowListProps> = ({
  escrows,
  wallet,
  onOpenCreate,
  onSubmitProof,
  onApproveMilestone,
  onRaiseDispute,
  onResolveDispute,
  onCancelEscrow,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'disputed'>('all');

  const filteredEscrows = useMemo(() => {
    return escrows.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.contractorName.toLowerCase().includes(search.toLowerCase()) ||
        e.clientName.toLowerCase().includes(search.toLowerCase()) ||
        e.id.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (filter === 'all') return true;
      return e.status === filter;
    });
  }, [escrows, search, filter]);

  return (
    <div className="space-y-6">
      
      {/* Search and Segmented Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Proje başlığı, yüklenici veya kasa ID ara..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        {/* Filter Controls & Create CTA */}
        <div className="flex items-center gap-3">
          
          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap font-medium ${
                filter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tümü ({escrows.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap font-medium ${
                filter === 'active' ? 'bg-slate-800 text-teal-300 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap font-medium ${
                filter === 'completed' ? 'bg-slate-800 text-emerald-300 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tamamlanan
            </button>
            <button
              onClick={() => setFilter('disputed')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap font-medium ${
                filter === 'disputed' ? 'bg-slate-800 text-amber-300 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hakemde
            </button>
          </div>

          {/* New Escrow Button */}
          <button
            onClick={onOpenCreate}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-colors shrink-0 whitespace-nowrap shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Sözleşme</span>
          </button>

        </div>

      </div>

      {/* Escrow Cards List */}
      {filteredEscrows.length > 0 ? (
        <div className="space-y-4">
          {filteredEscrows.map((escrow) => (
            <EscrowCard
              key={escrow.id}
              escrow={escrow}
              wallet={wallet}
              onSubmitProof={onSubmitProof}
              onApproveMilestone={onApproveMilestone}
              onRaiseDispute={onRaiseDispute}
              onResolveDispute={onResolveDispute}
              onCancelEscrow={onCancelEscrow}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-slate-900/40 rounded-xl border border-slate-800/80 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-white">Eşleşen Emanet Kasası Bulunamadı</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Arama kriterlerinizi değiştirebilir veya projeniz için ilk Aptos akıllı sözleşme emanet kasasını oluşturabilirsiniz.
          </p>
          <button
            onClick={onOpenCreate}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>İlk Sözleşmeyi Başlat</span>
          </button>
        </div>
      )}

    </div>
  );
};
