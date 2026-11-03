/**
 * @license
 * Copyright 2026 Enes Öztürk — tüm hakları saklıdır
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { soundFx } from '../services/soundFx';
import { 
  Fingerprint, 
  Download, 
  Award,
  CheckCircle2
} from 'lucide-react';

interface ArchitectHUDProps {
  onDownloadStandalone: () => void;
}

export const ArchitectHUD: React.FC<ArchitectHUDProps> = ({ onDownloadStandalone }) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  const handleBiometricScan = () => {
    soundFx.play('chirp');
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsVerified(true);
      soundFx.play('success');
      setTimeout(() => setIsVerified(false), 4000);
    }, 1200);
  };

  return (
    <div className="cyber-glass-emerald rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
      {/* Decorative ambient accent */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00ff66]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Primary Signature Branding */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00ff66]/15 border border-[#00ff66]/40 flex items-center justify-center text-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.25)]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron text-xs font-bold tracking-wider text-[#00ff66]">
                ARCHITECT SIGNATURE
              </span>
              <span
                className="text-[10px] font-mono-tech px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded"
                title="İmza beyanı: kaynak kodu ve README'de yazar olarak Enes Öztürk belirtilir"
              >
                İMZA BEYANI
              </span>
            </div>
            <h1 className="font-orbitron text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
              Designed & Architected by Enes Öztürk
            </h1>
          </div>
        </div>

        {/* Biometric Scan Trigger Button */}
        <button
          onClick={handleBiometricScan}
          disabled={isScanning}
          title="Görsel animasyon: biyometrik kimlik doğrulaması yapmaz, veri toplamaz"
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-orbitron font-bold tracking-wider flex items-center justify-center gap-2 transition-all ${
            isVerified
              ? 'bg-[#00ff66] text-black shadow-[0_0_20px_rgba(0,255,102,0.6)]'
              : isScanning
              ? 'bg-[#00ff66]/30 text-[#00ff66] border border-[#00ff66] animate-pulse'
              : 'bg-black/50 text-slate-200 hover:text-white border border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_12px_rgba(0,255,102,0.15)]'
          }`}
        >
          {isVerified ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>IDENTITY AUTHENTICATED</span>
            </>
          ) : (
            <>
              <Fingerprint className={`w-4 h-4 text-[#00ff66] ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'SCANNING BIOMETRICS...' : 'VERIFY ARCHITECT'}</span>
            </>
          )}
        </button>
      </div>

      {/* System Architecture Specifications */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono-tech text-xs">
        <div className="bg-black/40 border border-emerald-500/15 rounded-xl p-3 flex flex-col gap-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
            <span>Teknoloji</span>
            <span className="text-[#00ff66]">React 19 + Vite</span>
          </div>
          <div className="text-slate-100 font-semibold">
            Tek sayfa, tamamen istemci tarafı
          </div>
          <div className="text-[10px] text-slate-400">
            Tailwind 4 · TypeScript · Canvas 2D · Web Audio API
          </div>
        </div>

        <div className="bg-black/40 border border-emerald-500/15 rounded-xl p-3 flex flex-col gap-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
            <span>Lead UI/UX Architect</span>
            <span className="text-[#00ff66]">Enes Öztürk</span>
          </div>
          <div className="text-slate-100 font-semibold">
            Cyberpunk & Glassmorphism Design
          </div>
          <div className="text-[10px] text-slate-400">
            Obsidian canvas (#05050a) · Neon Cyan & Emerald
          </div>
        </div>
      </div>

      {/* Standalone Single-File Export Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-emerald-500/15">
        <div className="text-xs font-mono-tech text-slate-400">
          Tek dosyalık dışa aktarım hazır · sunucuya veri göndermez, yalnızca Google Fonts ister.
        </div>

        <button
          onClick={onDownloadStandalone}
          className="min-h-[44px] px-4 py-2 bg-gradient-to-r from-[#00f3ff] to-[#00ff66] text-black font-orbitron font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT STANDALONE HTML</span>
        </button>
      </div>
    </div>
  );
};
