/**
 * @license
 * Copyright 2026 Enes Öztürk — tüm hakları saklıdır
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { soundFx } from '../services/soundFx';
import { Volume2, VolumeX, Compass, Eye, Shield, Radio } from 'lucide-react';
import { GyroState } from '../hooks/useDeviceSensors';

interface MobileTopBarProps {
  currentTime: string;
  decorativeJitter: string;
  isMuted: boolean;
  onToggleMute: () => void;
  scanlinesEnabled: boolean;
  onToggleScanlines: () => void;
  gyro: GyroState;
  onRequestGyro: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  currentTime,
  decorativeJitter,
  isMuted,
  onToggleMute,
  scanlinesEnabled,
  onToggleScanlines,
  gyro,
  onRequestGyro,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#05050a]/85 backdrop-blur-xl border-b border-cyan-500/20 px-3 sm:px-6 py-2.5 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#00f3ff]/10 border border-[#00f3ff]/40 flex items-center justify-center text-[#00f3ff] shadow-[0_0_12px_rgba(0,243,255,0.25)] shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-orbitron font-bold text-xs sm:text-sm tracking-wide text-white truncate">
                AuraSync
              </span>
              <span className="text-[10px] font-mono-tech text-[#00f3ff] font-semibold hidden xs:inline">
                // Cyber-Glass
              </span>
            </div>
            <span className="text-[9px] font-mono-tech text-slate-400 truncate">
              Arch: Enes Öztürk
            </span>
          </div>
        </div>

        {/* Center Zone: Live System Clock */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-black/40 border border-cyan-500/15 rounded-lg font-mono-tech text-xs">
          <span className="text-slate-400">SYS_TIME:</span>
          <span className="text-[#00f3ff] font-bold tabular-nums">{currentTime || '00:00:00'}</span>
          <span className="text-slate-500">·</span>
          <span
            className="text-emerald-400 font-bold tabular-nums text-[10px]"
            title="Dekoratif sayı — ölçüm değil, estetik amaçlı rastgele üretilir"
          >
            {decorativeJitter}
          </span>
          <span className="text-[9px] text-slate-600 tracking-widest">DECOR</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Gyroscope Sensor Trigger */}
          <button
            onClick={() => {
              soundFx.play('click');
              onRequestGyro();
            }}
            className={`min-h-[40px] px-2 sm:px-2.5 rounded-lg flex items-center gap-1 text-[11px] font-mono-tech transition-all ${
              gyro.source === 'sensor'
                ? 'bg-[#00ff66]/15 text-[#00ff66] border border-[#00ff66]/30'
                : 'bg-black/40 text-slate-400 hover:text-slate-200 border border-white/5'
            }`}
            title={
              gyro.source === 'sensor'
                ? 'Gerçek deviceorientation sensörü aktif'
                : gyro.source === 'pointer'
                  ? 'Sensör yok: eğim fare/dokunma ile taklit ediliyor'
                  : 'Eğim kaynağı bekleniyor'
            }
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {gyro.source === 'sensor' ? 'GYRO AKTİF' : 'GYRO 3D'}
            </span>
          </button>

          {/* Scanlines Overlay Toggle */}
          <button
            onClick={() => {
              soundFx.play('toggle');
              onToggleScanlines();
            }}
            className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg transition-all ${
              scanlinesEnabled
                ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/40 shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                : 'bg-black/40 text-slate-400 hover:text-slate-200 border border-white/5'
            }`}
            title="Toggle CRT Scanline Overlay"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Audio Synthesizer Mute Toggle */}
          <button
            onClick={() => {
              onToggleMute();
            }}
            className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg transition-all ${
              !isMuted
                ? 'bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/40 shadow-[0_0_10px_rgba(0,255,102,0.2)]'
                : 'bg-black/40 text-slate-500 hover:text-slate-300 border border-white/5'
            }`}
            title={isMuted ? 'Unmute Cyber Audio' : 'Mute Cyber Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
