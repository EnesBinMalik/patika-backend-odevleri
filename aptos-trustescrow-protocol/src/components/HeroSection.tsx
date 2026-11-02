import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, ExternalLink, ArrowRight, Code2, Sparkles, Scale } from 'lucide-react';
import { CONTRACT_ADDRESS, EXPLORER_URL, DEVELOPER_PROFILE } from '../data/initialData';
import { IMAGES } from '../assets/images';

interface HeroSectionProps {
  onOpenCreate: () => void;
  onOpenStudio: () => void;
  totalTvlApt: number;
  activeCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenCreate,
  onOpenStudio,
  totalTvlApt,
  activeCount,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative border-b border-slate-800 bg-slate-950 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-950/20 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 relative z-10">
        
        {/* Top metadata line (zero-pill discipline) */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-4">
          <span className="font-semibold text-teal-400">Aptos Blockchain Capstone Projesi</span>
          <span aria-hidden="true">·</span>
          <span>Geliştirici: <strong className="text-white font-medium">Enes Öztürk</strong></span>
          <span aria-hidden="true">·</span>
          <span>Aptos Testnet hedefli · bu depoda dağıtılmadı</span>
          <span aria-hidden="true">·</span>
          <span>Move Resource Safety</span>
        </div>

        {/* 2-Column Split: Content & Visual Anchor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
              Aptos'ta Kilometre Taşı Tabanlı Merkeziyetsiz Emanet Protokolü
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Web3 serbest çalışanları, hibe fonları ve proje ekipleri için hızlı kesinleşme hedefleyen Aptos zincirinde, Move kaynak modeliyle güvence altına alınmış hakem denetimli aşamalı ödeme akışı.
            </p>

            {/* Contract address bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 font-medium whitespace-nowrap">Demo hesap adresi:</span>
              <span className="font-mono text-teal-300 truncate max-w-md tabular-nums select-all">
                {CONTRACT_ADDRESS}
              </span>
              <div className="flex items-center gap-1 sm:ml-auto shrink-0">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                  title="Hesap adresini kopyala"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                </button>
                <a
                  href={EXPLORER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                  title="Aptos Explorer'da Aç"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Explorer</span>
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenCreate}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
              >
                <span>Yeni Emanet Kasası Oluştur</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenStudio}
                className="px-5 py-2.5 rounded-lg text-sm font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Code2 className="w-4 h-4 text-teal-400" />
                <span>Move Sözleşme Kodları & Testleri</span>
              </button>
            </div>

          </div>

          {/* Right Column: Visual Anchor */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
              <img
                src={IMAGES.heroImage}
                alt="Aptos TrustEscrow Güvenli Kriptografik Kasa"
                className="w-full h-64 sm:h-80 object-cover transform group-hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-4 right-4 text-xs text-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={DEVELOPER_PROFILE.avatar}
                    alt={DEVELOPER_PROFILE.name}
                    className="w-7 h-7 rounded-full object-cover border border-teal-400"
                  />
                  <div>
                    <div className="font-semibold text-white">Enes Öztürk</div>
                    <div className="text-[11px] text-slate-400">Akıllı Sözleşme Mimarı</div>
                  </div>
                </div>

                <div className="font-mono text-teal-300 text-right">
                  <div className="text-[11px] text-slate-400">Kaynak</div>
                  <div className="font-medium">Move 2 · derlenmedi</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 4-Item Metric Strip (Single full-width row below hero split) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-800/80">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Toplam Kilitli Değer (TVL)</div>
            <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
              {totalTvlApt.toFixed(2)} <span className="text-sm font-sans text-teal-400 font-normal">APT</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">Arayüz durumu · zincirden okunmadı</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Aktif Emanet Kasaları</div>
            <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
              {activeCount} <span className="text-sm font-sans text-teal-400 font-normal">Kasa</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Aşamalı ödeme takibinde</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Aptos Blok Süresi (platform)</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
              &lt; 1 <span className="text-sm font-sans text-emerald-400 font-normal">sn</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Block-STM · bu projede ölçülmedi</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Move Birim Testi</div>
            <div className="text-2xl font-bold font-mono text-teal-300 mt-1 tabular-nums">
              2 <span className="text-sm font-sans text-teal-400 font-normal">test</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">tests/trust_escrow_tests.move</div>
          </div>
        </div>

      </div>
    </div>
  );
};
