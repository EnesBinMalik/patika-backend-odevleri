import React, { useState } from 'react';
import { Wallet, Droplets, Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import { WalletState } from '../services/aptosService';
import { CONTRACT_ADDRESS } from '../data/initialData';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  wallet: WalletState;
  onClaimFaucet: () => void;
  isClaimingFaucet: boolean;
  onSwitchAccount: (role: 'developer' | 'contractor' | 'arbitrator') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  wallet,
  onClaimFaucet,
  isClaimingFaucet,
  onSwitchAccount,
}) => {
  const [copied, setCopied] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: 'escrows', label: 'Emanet Kasaları' },
    { id: 'create', label: 'Yeni Sözleşme' },
    { id: 'move-studio', label: 'Move Stüdyosu' },
    { id: 'reputation', label: 'İtibar & Ağ' },
    { id: 'docs', label: 'README & Rehber' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('escrows')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:border-teal-400 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white whitespace-nowrap block">
                  Aptos TrustEscrow
                </span>
                <span className="text-xs text-slate-400 block -mt-0.5">
                  Enes Öztürk İmzalı
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (1-line, whitespace-nowrap) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`whitespace-nowrap shrink-0 transition-colors relative py-1 text-xs sm:text-sm ${
                    active ? 'text-teal-400 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action & Wallet / Faucet */}
          <div className="flex items-center gap-3 shrink-0">
            {/* 1-Click Faucet Button */}
            <button
              onClick={onClaimFaucet}
              disabled={isClaimingFaucet}
              title="Aptos Testnet Musluğundan 1.0 APT talep et"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-teal-300 bg-teal-950/60 border border-teal-800/80 hover:bg-teal-900/50 hover:border-teal-700 transition-colors whitespace-nowrap disabled:opacity-50"
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>{isClaimingFaucet ? 'Musluk Aktarılıyor...' : '+1.0 APT Talep Et'}</span>
            </button>

            {/* Wallet Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 transition-colors whitespace-nowrap"
              >
                <Wallet className="w-3.5 h-3.5 text-teal-400" />
                <span className="font-mono tabular-nums">{wallet.balanceApt.toFixed(2)} APT</span>
                <span className="text-slate-500">|</span>
                <span className="font-mono text-slate-400">
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </span>
              </button>

              {/* Account Switcher & Details Dropdown */}
              {showAccountMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 text-xs text-slate-300 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="font-semibold text-white">Yerel hesap (cüzdan uzantısı bağlı değil)</span>
                    <span className="text-[11px] text-teal-400 font-mono">Aptos Testnet</span>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                      <div>
                        <div className="text-[11px] text-slate-400">Aktif Rol</div>
                        <div className="font-semibold text-white truncate max-w-[180px]">{wallet.name}</div>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                        title="Adresi Kopyala"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between px-1 text-[11px]">
                      <span className="text-slate-400">Bakiye</span>
                      <span className="font-mono font-bold text-white tabular-nums">{wallet.balanceApt.toFixed(4)} APT</span>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <div className="text-[11px] text-slate-400 mb-1.5">Rol Değiştir (Test Senaryosu):</div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => {
                            onSwitchAccount('developer');
                            setShowAccountMenu(false);
                          }}
                          className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-medium text-slate-200 text-center"
                        >
                          Enes (İşveren)
                        </button>
                        <button
                          onClick={() => {
                            onSwitchAccount('contractor');
                            setShowAccountMenu(false);
                          }}
                          className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-medium text-slate-200 text-center"
                        >
                          Ayşe (Geliştirici)
                        </button>
                        <button
                          onClick={() => {
                            onSwitchAccount('arbitrator');
                            setShowAccountMenu(false);
                          }}
                          className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-medium text-slate-200 text-center"
                        >
                          Mehmet (Hakem)
                        </button>
                      </div>
                    </div>

                    <a
                      href={`https://explorer.aptoslabs.com/account/${wallet.address}?network=testnet`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 rounded bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] transition-colors"
                    >
                      <span>Aptos Explorer'da İncele</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto py-2 border-t border-slate-800/60 text-xs">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1 rounded-md whitespace-nowrap shrink-0 transition-colors ${
                currentTab === item.id ? 'bg-teal-500/20 text-teal-300 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

      </div>
    </header>
  );
};
