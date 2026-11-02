import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  RotateCcw, 
  Copy, 
  Check, 
  FileCode, 
  Terminal, 
  Flame, 
  ExternalLink,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { AptosService } from '../services/aptosService';
import { MoveTestItem } from '../types/escrow';
import { CONTRACT_ADDRESS, EXPLORER_URL } from '../data/initialData';

import escrowVaultSource from '../../contracts/sources/trust_escrow.move?raw';
import reputationSource from '../../contracts/sources/reputation_registry.move?raw';
import moveTomlSource from '../../contracts/Move.toml?raw';
import moveTestsSource from '../../contracts/tests/trust_escrow_tests.move?raw';

// Kaynak tek gerçek: contracts/ altındaki .move dosyaları. Vite ?raw importu ile
// derleme anında içeriği gömülür, böylece görüntüleyici asla bayat kopya göstermez.
const MOVE_VAULT_CODE = escrowVaultSource;
const MOVE_REPUTATION_CODE = reputationSource;
const MOVE_TOML_CODE = moveTomlSource;
const MOVE_TEST_CODE = moveTestsSource;

export const MoveStudio: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'vault' | 'reputation' | 'toml' | 'tests'>('vault');
  const [copied, setCopied] = useState(false);
  const [tests, setTests] = useState<MoveTestItem[]>(() => AptosService.getInitialTests());
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'Move Stüdyosu: kod görüntüleyici + test ANİMASYONU (gerçek CLI çalıştırılmaz).',
    'Paket dizini: /contracts (TrustEscrow v1.0.0)',
    'Ağ: Aptos Testnet (Fullnode: https://fullnode.testnet.aptoslabs.com/v1)',
  ]);

  const currentCode = {
    vault: MOVE_VAULT_CODE,
    reputation: MOVE_REPUTATION_CODE,
    toml: MOVE_TOML_CODE,
    tests: MOVE_TEST_CODE,
  }[activeCodeTab];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunTests = async () => {
    if (isRunningTests) return;
    setIsRunningTests(true);

    setTerminalLogs([
      '$ aptos move test --package-dir ./contracts        [SİMÜLASYON]',
      'INCLUDING DEPENDENCY AptosFramework',
      'BUILDING TrustEscrow v1.0.0 by Enes Öztürk',
      'Not: Bu panel animasyondur. Gas ve süre değerleri uydurulmuştur;',
      '     gerçek sonuç için aptos CLI ile `aptos move test` çalıştırın.',
      'Test dosyası: contracts/tests/trust_escrow_tests.move',
    ]);

    // Reset status to running
    setTests((prev) => prev.map((t) => ({ ...t, status: 'running' })));

    // Sequential test simulation
    for (let i = 0; i < tests.length; i++) {
      await new Promise((r) => setTimeout(r, 450));
      const test = tests[i];
      setTests((prev) =>
        prev.map((t, idx) => (idx === i ? { ...t, status: 'passed' } : t))
      );
      setTerminalLogs((prev) => [
        ...prev,
        `[ PASS ] ${test.module}::${test.name} (simüle Gas: ${test.gasUsed}, ${test.durationMs}ms)`,
      ]);
    }

    await new Promise((r) => setTimeout(r, 200));
    setTerminalLogs((prev) => [
      ...prev,
      '------------------------------------------------------------',
      `Simüle edilen sonuç: Total tests: ${tests.length}; passed: ${tests.length}; failed: 0`,
      'Doğrulama durumu: CONTRACT DERLENDİ Mİ? hayır (bu makinede aptos CLI yok).',
    ]);
    setIsRunningTests(false);
  };

  const totalGas = tests.reduce((sum, t) => sum + t.gasUsed, 0);
  const allPassed = tests.every((t) => t.status === 'passed');

  return (
    <div className="space-y-8">
      
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-teal-400" />
            <span>Aptos Move Akıllı Sözleşme Stüdyosu</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Geliştirici Enes Öztürk tarafından Aptos Testnet için yazılmış, kaynak korumalı Move sözleşmeleri ve test ortamı.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={EXPLORER_URL}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <span>Aptos Explorer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Code Inspector & Test Runner Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Code Viewer */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          
          {/* Code Tabs Header */}
          <div className="flex items-center justify-between bg-slate-950 px-4 py-2.5 border-b border-slate-800">
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setActiveCodeTab('vault')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeCodeTab === 'vault' ? 'bg-slate-800 text-teal-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                trust_escrow.move
              </button>
              <button
                onClick={() => setActiveCodeTab('reputation')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeCodeTab === 'reputation' ? 'bg-slate-800 text-teal-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                reputation_registry.move
              </button>
              <button
                onClick={() => setActiveCodeTab('tests')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeCodeTab === 'tests' ? 'bg-slate-800 text-teal-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                trust_escrow_tests.move
              </button>
              <button
                onClick={() => setActiveCodeTab('toml')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeCodeTab === 'toml' ? 'bg-slate-800 text-teal-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Move.toml
              </button>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors"
              title="Kodu Kopyala"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
            </button>
          </div>

          {/* Code Viewer Body */}
          <div className="p-4 bg-slate-950 text-slate-300 font-mono text-[12px] leading-relaxed overflow-x-auto max-h-[460px] flex-1">
            <pre>
              <code>{currentCode}</code>
            </pre>
          </div>

          {/* Module Footnote */}
          <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="font-mono">Paket: TrustEscrow (Aptos Testnet)</span>
            <span>İmza: Enes Öztürk</span>
          </div>

        </div>

        {/* Right: Test Execution Terminal & Test Cases */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Test Runner Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Move Birim Testleri (Unit Tests)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Aptos Move VM simülatörü üzerinde formal test yürütümü.
                </p>
              </div>

              <button
                onClick={handleRunTests}
                disabled={isRunningTests}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunningTests ? 'Testler Çalışıyor...' : 'Testleri Çalıştır'}</span>
              </button>
            </div>

            {/* Test Items List */}
            <div className="space-y-2">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-white">{test.name}</span>
                    <span className="shrink-0">
                      {test.status === 'passed' ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PASS</span>
                        </span>
                      ) : test.status === 'running' ? (
                        <span className="text-teal-400 font-mono animate-pulse">RUNNING...</span>
                      ) : (
                        <span className="text-slate-500 font-mono">IDLE</span>
                      )}
                    </span>
                  </div>

                  <p className="text-slate-400 text-[11px] leading-tight">
                    {test.description}
                  </p>

                  {test.status === 'passed' && (
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-3 pt-0.5">
                      <span>Simüle gas: {test.gasUsed}</span>
                      <span>Simüle süre: {test.durationMs}ms</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {allPassed && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-900/60 rounded-lg text-xs text-emerald-300 flex items-center justify-between">
                <span className="font-semibold">Simülasyon tamamlandı · {tests.length}/{tests.length} PASS (gerçekte çalıştırılmadı)</span>
                <span className="font-mono text-[11px]">Toplam simüle gaz: {totalGas} birim (ölçülmemiş)</span>
              </div>
            )}
          </div>

          {/* Aptos CLI Terminal Output Window */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-900 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-teal-400" />
                <span className="font-mono text-[11px]">aptos-move-terminal</span>
              </div>
              <span className="text-[11px] text-slate-500">bash</span>
            </div>

            <div className="p-3.5 font-mono text-[11px] text-slate-300 space-y-1 max-h-48 overflow-y-auto">
              {terminalLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes('[ PASS ]')
                      ? 'text-emerald-400'
                      : log.startsWith('$')
                      ? 'text-teal-300 font-semibold'
                      : 'text-slate-400'
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Aptos CLI Deployment & Compilation Steps Guide */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">
          Aptos CLI ile Yerel Derleme ve Testnet Dağıtım Rehberi
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Sözleşmeyi kendi terminalinizde derleyip doğrudan Aptos Testnet ağına göndermek için aşağıdaki standart Move CLI komutlarını sırasıyla uygulayabilirsiniz:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px]">1. Profil Yapılandırma & Test APT Alma:</div>
            <div className="text-teal-300">aptos init --network testnet</div>
            <div className="text-teal-300">aptos account fund-with-faucet --account default</div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px]">2. Derleme & Birim Testleri:</div>
            <div className="text-teal-300">cd contracts && aptos move compile</div>
            <div className="text-teal-300">aptos move test</div>
          </div>

          <div className="md:col-span-2 p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px]">3. Testnet'e Sözleşmeyi Yayınlama (Publish):</div>
            <div className="text-teal-300">
              aptos move publish --named-addresses trust_escrow=default --assume-yes
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
