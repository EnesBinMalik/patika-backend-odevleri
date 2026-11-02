/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { ArchitectureDiff } from './components/ArchitectureDiff';
import { AptosSimulator } from './components/AptosSimulator';
import { ContractViewer } from './components/ContractViewer';
import { DeploymentGuide } from './components/DeploymentGuide';
import { SubmissionReport } from './components/SubmissionReport';
import { SUBMISSION_REPORT } from './data/reportData';
import { 
  ShieldCheck, 
  Cpu, 
  ExternalLink, 
  Award, 
  Flame, 
  Code2, 
  Terminal, 
  Layers 
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'diff' | 'simulator' | 'code' | 'deployment' | 'report'>('diff');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 3-Zone Top Bar Contract */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onQuickAction={() => setActiveView('report')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Context Card */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-4xl">
            {/* Unboxed Metadata without pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="text-cyan-400 font-semibold">Aptos Move Akıllı Sözleşme Refaktörü</span>
              <span aria-hidden="true">·</span>
              <span>Doğrudan Kasa Adresi (vault_address) Mimarisi</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">6 birim test · 2 abort doğrulaması</span>
              <span aria-hidden="true">·</span>
              <span className="text-purple-300 font-medium">Hazırlayan: Enes Öztürk</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight">
              Aptos Vault: Doğrudan Kasa Adresi ile Yüksek Verimlilik ve Güvenli Yönetim
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              Bu platform, Aptos Vault akıllı sözleşmesinin <code className="text-cyan-300">get_vault_address</code> fonksiyonundan arındırılarak doğrudan <code className="text-cyan-300">vault_address</code> parametresi ile çalıştırılması, test edilmesi ve Devnet'e dağıtılması ödevinin çözümünü sunar: <strong className="text-slate-200">çalıştırılabilir bir Move paketi</strong>, <strong className="text-slate-200">istemci taraflı bir simülatör</strong> ve imzalı bir teslim raporu ile.
            </p>

            {/* Metric Row with Tabular Figures */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
              <div>
                <div className="text-xs text-slate-400">Depolama Okuması</div>
                <div className="text-lg sm:text-xl font-bold text-emerald-400 font-mono tabular-nums">
                  2 → 1 adım
                </div>
                <div className="text-[11px] text-slate-500">O(1) doğrudan borrow</div>
              </div>

              <div>
                <div className="text-xs text-slate-400">Birim Testleri</div>
                <div className="text-lg sm:text-xl font-bold text-cyan-400 font-mono tabular-nums">
                  6 test
                </div>
                <div className="text-[11px] text-slate-500">2 × expected_failure</div>
              </div>

              <div>
                <div className="text-xs text-slate-400">Dağıtım Hedefi</div>
                <div className="text-lg sm:text-xl font-bold text-slate-200 font-mono">
                  Aptos Devnet
                </div>
                <div className="text-[11px] text-slate-500">Remix + WELLDONE rehberi</div>
              </div>

              <div>
                <div className="text-xs text-slate-400">Bonus Fonksiyon</div>
                <div className="text-lg sm:text-xl font-bold text-purple-400 font-mono">
                  transfer_admin
                </div>
                <div className="text-[11px] text-slate-500">3 assert + olay yayını</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic View Display */}
        {activeView === 'diff' && <ArchitectureDiff />}
        {activeView === 'simulator' && <AptosSimulator />}
        {activeView === 'code' && <ContractViewer />}
        {activeView === 'deployment' && <DeploymentGuide />}
        {activeView === 'report' && <SubmissionReport />}
      </main>

      {/* Clean Quiet Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Aptos Vault v2 Mimarisi</span>
            <span>·</span>
            <span>Ödev Teslimi: <strong className="text-slate-200">Enes Öztürk</strong></span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <a
              href={SUBMISSION_REPORT.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>Aptos Devnet Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>·</span>
            <span>Aptos Move Framework 2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
