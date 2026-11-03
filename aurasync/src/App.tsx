/**
 * AuraSync // Mobile Cyber-Glass OS
 * Designed & Architected by Enes Öztürk
 *
 * Mobile-first, tamamen çevrimdışı çalışan bir cyber-glass arayüz demosu.
 *
 * GERÇEK (tarayıcı API ile doğrulanabilir):
 * - Battery Status API entegrasyonu (yoksa dekoratif demo değerlere düşer)
 * - deviceorientation ile 3D eğim; sensör yoksa fare/dokunma taklidi (kaynak etiketlenir)
 * - HTML5 Canvas + requestAnimationFrame görselleştirici
 * - Web Audio API osilatörleriyle üretilen sesler (harici ses dosyası yok)
 * - localStorage: notlar ve ses mute durumu
 * - Tamamen istemci tarafı; sunucu API'si / veri isteği yok (tek dış kaynak Google Fonts)
 *
 * DEKORATİF / SİMÜLASYON (ürün markası, ölçüm değil):
 * - Terminal çıktıları (status/sync/scan/decrypt), throughput/latency/packet rakamları
 * - "Overclock" kaydırıcısı yalnızca canvas animasyon hızını değiştirir
 * - Neural Mesh / Shield Matrix anahtarları görseldir, gerçek ağ veya güvenlik işlevi yoktur
 *
 * @license
 * Copyright 2026 Enes Öztürk — tüm hakları saklıdır
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useDeviceSensors } from './hooks/useDeviceSensors';
import { soundFx } from './services/soundFx';
import { MobileTopBar } from './components/MobileTopBar';
import { MobileTabBar, ActiveTab } from './components/MobileTabBar';
import { PowerRingWidget } from './components/PowerRingWidget';
import { DataStreamCanvas } from './components/DataStreamCanvas';
import { NeuralNotes } from './components/NeuralNotes';
import { CyberControlsWidget } from './components/CyberControlsWidget';
import { ArchitectHUD } from './components/ArchitectHUD';
import { TerminalDrawer } from './components/TerminalDrawer';
import { MatrixRainOverlay } from './components/MatrixRainOverlay';
import { 
  ShieldCheck, 
  Terminal as TerminalIcon, 
  Sparkles, 
  Compass, 
  Layers,
  Clock,
  Radio,
  Cpu
} from 'lucide-react';

export default function App() {
  const {
    battery,
    toggleCharging,
    adjustBatteryLevel,
    gyro,
    requestGyroPermission,
    currentTime,
    utcTime,
    sessionUptime,
    decorativeJitter,
  } = useDeviceSensors();

  // State Management
  const [activeTab, setActiveTab] = useState<ActiveTab>('hud');
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState<boolean>(false);
  const [scanlinesEnabled, setScanlinesEnabled] = useState<boolean>(true);
  const [stealthMode, setStealthMode] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundFx.getMuted());
  const [overclockMultiplier, setOverclockMultiplier] = useState<number>(1.0);

  // Play boot chime on first user click anywhere
  useEffect(() => {
    const handleFirstGesture = () => {
      soundFx.play('boot');
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });
    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, []);

  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleScanlines = () => {
    setScanlinesEnabled(!scanlinesEnabled);
  };

  const handleOverclockToggle = () => {
    setOverclockMultiplier(prev => (prev > 1.2 ? 1.0 : 2.2));
  };

  // Download Standalone Single-File HTML
  const handleDownloadStandalone = () => {
    soundFx.play('success');
    const link = document.createElement('a');
    link.href = '/aurasync-standalone.html';
    link.download = 'aurasync-cyber-os-enes-ozturk.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dynamic 3D tilt calculation based on gyroscope or pointer
  const tiltStyle: React.CSSProperties = {
    transform: `perspective(1000px) rotateY(${gyro.tiltX * 8}deg) rotateX(${-gyro.tiltY * 8}deg)`,
    transition: 'transform 0.12s ease-out',
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 relative select-none ${
        stealthMode ? 'bg-[#020205]' : 'bg-[#05050a]'
      } cyber-grid-bg`}
    >
      {/* Optional CRT Scanlines Effect */}
      {scanlinesEnabled && (
        <div className="scanlines-overlay fixed inset-0 z-20 pointer-events-none" />
      )}

      {/* Top Ambient Glow Spotlights */}
      <div className="fixed -top-32 left-1/4 w-96 h-96 bg-[#00f3ff]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 -right-32 w-80 h-80 bg-[#00ff66]/6 rounded-full blur-3xl pointer-events-none" />

      {/* Mobile-First Sticky App Header */}
      <MobileTopBar
        currentTime={currentTime}
        decorativeJitter={decorativeJitter}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        scanlinesEnabled={scanlinesEnabled}
        onToggleScanlines={handleToggleScanlines}
        gyro={gyro}
        onRequestGyro={requestGyroPermission}
      />

      {/* Main Responsive Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 pb-24 z-10">
        
        {/* Responsive Layout:
            On Mobile screens (< 1024px): renders the selected tab view with fluid animation.
            On Desktop/Tablet (>= 1024px): shows a cohesive multi-column Cyber OS dashboard while respecting tab focus.
        */}
        <div style={tiltStyle} className="transition-transform duration-100 ease-out">
          
          {/* Quick HUD Top Status Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 mb-3 bg-black/40 border border-cyan-500/15 rounded-xl font-mono-tech text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#00ff66] font-bold">●</span>
              <span className="text-slate-300">UPTIME:</span>
              <span className="text-[#00f3ff] font-bold tabular-nums">{sessionUptime}</span>
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-[11px]">
              <span className="hidden sm:inline">BUILD: <strong>AuraSync v1.0.0</strong></span>
              <span>·</span>
              <span className="text-slate-500">VERİ SUNUCUSU YOK</span>
              <span>·</span>
              <span className="neon-text-emerald">ENES ÖZTÜRK</span>
            </div>
          </div>

          {/* Mobile Tabbed View (Mobile-First Switcher) */}
          <div className="lg:hidden flex flex-col gap-4">
            {activeTab === 'hud' && (
              <div className="flex flex-col gap-4 animate-fadeIn">
                <PowerRingWidget
                  battery={battery}
                  onToggleCharging={toggleCharging}
                  onAdjustLevel={adjustBatteryLevel}
                />
                <CyberControlsWidget
                  overclockMultiplier={overclockMultiplier}
                  onOverclockChange={setOverclockMultiplier}
                  gyro={gyro}
                  onLaunchMatrix={() => setIsMatrixOpen(true)}
                  stealthMode={stealthMode}
                  onToggleStealth={() => setStealthMode(!stealthMode)}
                />
                <ArchitectHUD onDownloadStandalone={handleDownloadStandalone} />
              </div>
            )}

            {activeTab === 'stream' && (
              <div className="flex flex-col gap-4 animate-fadeIn">
                <DataStreamCanvas overclockMultiplier={overclockMultiplier} />
                <CyberControlsWidget
                  overclockMultiplier={overclockMultiplier}
                  onOverclockChange={setOverclockMultiplier}
                  gyro={gyro}
                  onLaunchMatrix={() => setIsMatrixOpen(true)}
                  stealthMode={stealthMode}
                  onToggleStealth={() => setStealthMode(!stealthMode)}
                />
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="flex flex-col gap-4 animate-fadeIn">
                <NeuralNotes />
              </div>
            )}

            {activeTab === 'architect' && (
              <div className="flex flex-col gap-4 animate-fadeIn">
                <ArchitectHUD onDownloadStandalone={handleDownloadStandalone} />
                <PowerRingWidget
                  battery={battery}
                  onToggleCharging={toggleCharging}
                  onAdjustLevel={adjustBatteryLevel}
                />
              </div>
            )}
          </div>

          {/* Desktop & Tablet Multi-Column Command Grid (>= 1024px) */}
          <div className="hidden lg:grid grid-cols-12 gap-4 items-start">
            {/* Left Column: Power Core + Cyber Controls */}
            <div className="col-span-5 flex flex-col gap-4">
              <PowerRingWidget
                battery={battery}
                onToggleCharging={toggleCharging}
                onAdjustLevel={adjustBatteryLevel}
              />
              <CyberControlsWidget
                overclockMultiplier={overclockMultiplier}
                onOverclockChange={setOverclockMultiplier}
                gyro={gyro}
                onLaunchMatrix={() => setIsMatrixOpen(true)}
                stealthMode={stealthMode}
                onToggleStealth={() => setStealthMode(!stealthMode)}
              />
              <ArchitectHUD onDownloadStandalone={handleDownloadStandalone} />
            </div>

            {/* Right Column: Data Stream Telemetry + Neural Notes */}
            <div className="col-span-7 flex flex-col gap-4">
              <DataStreamCanvas overclockMultiplier={overclockMultiplier} />
              <NeuralNotes />
            </div>
          </div>

        </div>
      </main>

      {/* Interactive Terminal Drawer */}
      <TerminalDrawer
        isOpen={isTerminalOpen}
        onToggle={() => setIsTerminalOpen(!isTerminalOpen)}
        onTriggerMatrix={() => {
          setIsTerminalOpen(false);
          setIsMatrixOpen(true);
        }}
        onOverclockToggle={handleOverclockToggle}
        sessionUptime={sessionUptime}
        batteryLevel={battery.level}
        batteryIsRealApi={battery.isRealApi}
        gyroSource={gyro.source}
      />

      {/* Full-Screen Matrix Digital Rain Overlay */}
      <MatrixRainOverlay
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
      />

      {/* Fixed Mobile Bottom Navigation Tab Bar */}
      <MobileTabBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        isTerminalOpen={isTerminalOpen}
        onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
      />
    </div>
  );
}
