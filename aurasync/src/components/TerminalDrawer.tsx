/**
 * @license
 * Copyright 2026 Enes Öztürk — tüm hakları saklıdır
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useEffect } from 'react';
import { soundFx } from '../services/soundFx';
import { TiltSource } from '../hooks/useDeviceSensors';
import { Terminal as TerminalIcon, ChevronDown, ChevronUp, CornerDownLeft, Sparkles, X } from 'lucide-react';

interface TerminalDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  onTriggerMatrix: () => void;
  onOverclockToggle: () => void;
  sessionUptime: string;
  batteryLevel: number;
  batteryIsRealApi: boolean;
  gyroSource: TiltSource;
}

interface CommandHistoryItem {
  id: string;
  type: 'cmd' | 'output' | 'error' | 'success';
  text: string;
}

export const TerminalDrawer: React.FC<TerminalDrawerProps> = ({
  isOpen,
  onToggle,
  onTriggerMatrix,
  onOverclockToggle,
  sessionUptime,
  batteryLevel,
  batteryIsRealApi,
  gyroSource,
}) => {
  const [inputVal, setInputVal] = useState<string>('');
  const [history, setHistory] = useState<CommandHistoryItem[]>([
    { id: '1', type: 'output', text: 'AuraSync // Cyber-Glass OS arayüz demosu hazır.' },
    { id: '2', type: 'output', text: 'Architect: Enes Öztürk · Bu konsolda bazı çıktılar görsel simülasyondur, (sim) ile işaretlenir.' },
    { id: '3', type: 'output', text: 'Type "help" or tap quick commands below to execute instructions.' },
  ]);

  const [cmdIndex, setCmdIndex] = useState<number>(-1);
  const [pastCommands, setPastCommands] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto scroll to bottom of terminal
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const executeCommand = (cmdRaw: string) => {
    const cmd = cmdRaw.trim().toLowerCase();
    if (!cmd) return;

    soundFx.play('click');
    setPastCommands(prev => [cmd, ...prev]);
    setCmdIndex(-1);

    const newHistory: CommandHistoryItem[] = [
      ...history,
      { id: Math.random().toString(), type: 'cmd', text: `> ${cmdRaw}` }
    ];

    switch (cmd) {
      case 'help': {
        newHistory.push({
          id: Math.random().toString(),
          type: 'output',
          text: `AVAILABLE COMMANDS:\n  • help       : Bu komut dizini\n  • status     : Gerçek oturum + tarayıcı durumu özeti\n  • matrix     : Matrix Digital Rain overlay'ini aç (canvas animasyonu)\n  • sync       : Veri senkronizasyonu simülasyonu (ağ yok)\n  • scan       : Gerçek tarayıcı yetenek taraması\n  • decrypt    : Kurgu metin açılımlı easter egg\n  • overclock  : Canvas animasyon hızını değiştir\n  • audio      : Web Audio API sentezleyiciyi aç/kapat\n  • clear      : Terminal geçmişini temizle\n  • about      : Enes Öztürk mimar künyesi`
        });
        soundFx.play('chirp');
        break;
      }

      case 'status': {
        newHistory.push({
          id: Math.random().toString(),
          type: 'success',
          text: `SYSTEM TELEMETRY SUMMARY:\n  • App        : AuraSync v1.0.0 · React + Vite · yalnızca tarayıcıda çalışır\n  • Architect  : Enes Öztürk\n  • Battery    : ${batteryLevel}% · ${batteryIsRealApi ? 'navigator.getBattery() (donanım API)' : 'DEMO DEĞER (bu tarayıcıda Batarya API yok)'}\n  • Uptime     : ${sessionUptime} (gerçek süre sayacı)\n  • Tilt       : ${gyroSource === 'sensor' ? 'deviceorientation (donanım sensörü)' : gyroSource === 'pointer' ? 'fare/dokunma taklidi' : 'henüz olay gelmedi'}\n  • Audio      : Web Audio API osilatörleri (harici ses dosyası yok)\n  • Data flow  : fetch/WebSocket yok — tek dış kaynak Google Fonts yazı tipleri\n  • Encryption : YOK — bu arayüz hiçbir veri şifrelemez`
        });
        soundFx.play('chirp');
        break;
      }

      case 'matrix': {
        newHistory.push({
          id: Math.random().toString(),
          type: 'success',
          text: 'MATRIX RAIN >> Tam ekran canvas animasyonu açılıyor (görsel efekt, gerçek akış verisi yok).'
        });
        soundFx.play('matrix');
        setTimeout(() => {
          onTriggerMatrix();
        }, 300);
        break;
      }

      case 'sync': {
        newHistory.push({
          id: Math.random().toString(),
          type: 'output',
          text: 'SYNC (SİMÜLASYON) >> 8 hayali düğümle el sıkışılıyor... animasyon sürüyor, ağa çıkılmıyor.'
        });
        setTimeout(() => {
          setHistory(prev => [
            ...prev,
            {
              id: Math.random().toString(),
              type: 'success',
              text: 'SYNC COMPLETE (SİMÜLASYON) >> 1.024 hayali sektör "doğruldu". Gerçek veri aktarımı yapılmadı.'
            }
          ]);
          soundFx.play('success');
        }, 600);
        break;
      }

      case 'scan': {
        // Gerçek tarayıcı yetenek taraması — ölçülebilen tek "scan" çıktısı budur
        let storageProbe = 'KAPALI';
        try {
          localStorage.setItem('aurasync_probe', '1');
          localStorage.removeItem('aurasync_probe');
          storageProbe = 'ÇALIŞIYOR';
        } catch {
          storageProbe = 'ERİŞİLEMİYOR';
        }

        const orientationApi =
          typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
            ? typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === 'function'
              ? 'VAR (iOS izin akışı gerekli)'
              : 'VAR (izin gerekmez)'
            : 'YOK';

        const audioApi =
          typeof window.AudioContext === 'function' ||
          typeof (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext === 'function'
            ? 'VAR'
            : 'YOK';

        newHistory.push({
          id: Math.random().toString(),
          type: 'success',
          text: `Tarayıcı özellik taraması (gerçek ölçüm):\n  • Battery API  : ${typeof (navigator as { getBattery?: unknown }).getBattery === 'function' ? 'VAR' : 'YOK (bu yüzden değerler demo)'}\n  • Orientation  : ${orientationApi}\n  • AudioContext : ${audioApi}\n  • localStorage : ${storageProbe}\n  • Viewport     : ${window.innerWidth}×${window.innerHeight} · DPR ${window.devicePixelRatio}\n  • Language     : ${navigator.language}\n  • Data flow    : 0 fetch/WebSocket — yalnızca Google Fonts CSS indirilir`
        });
        soundFx.play('chirp');
        break;
      }

      case 'decrypt': {
        newHistory.push({
          id: Math.random().toString(),
          type: 'output',
          text: 'DECRYPT (KURGU) >> Gerçek bir şifre çözülmüyor; bu komut sabit bir metni karakter karakter ekrana yazıyor.\n  [0x98A1] >>> 78%\n  METİN: "The future is glassmorphic — designed by Enes Öztürk."'
        });
        soundFx.play('success');
        break;
      }

      case 'overclock': {
        onOverclockToggle();
        newHistory.push({
          id: Math.random().toString(),
          type: 'success',
          text: 'ANİMASYON HIZI DEĞİŞTİRİLDİ >> Yalnızca canvas dalga/spektrum hızı etkilendi; donanım saati değişmedi.'
        });
        soundFx.play('alert');
        break;
      }

      case 'audio': {
        const isMuted = soundFx.toggleMute();
        newHistory.push({
          id: Math.random().toString(),
          type: 'output',
          text: `AUDIO SYNTHESIZER: ${isMuted ? 'MUTED' : 'ACTIVE'}`
        });
        break;
      }

      case 'about': {
        newHistory.push({
          id: Math.random().toString(),
          type: 'success',
          text: `AURASYNC // MOBILE CYBER-GLASS OS\nDesigned & Architected by Enes Öztürk\nYığın: React 19 · TypeScript · Vite · Tailwind 4 · Canvas 2D · Web Audio API\nGerçek: batarya API, deviceorientation, localStorage, rAF animasyon\nKurgu: terminal/sinyal rakamları, "quantum" ve "kernel" marka ifadeleri\nSürüm: 1.0.0 · veri isteği: 0 (yalnızca Google Fonts yüklenir)`
        });
        soundFx.play('chirp');
        break;
      }

      case 'clear': {
        setHistory([]);
        setInputVal('');
        return;
      }

      default: {
        newHistory.push({
          id: Math.random().toString(),
          type: 'error',
          text: `Command not recognized: "${cmdRaw}". Type "help" for valid directives.`
        });
        soundFx.play('beep');
        break;
      }
    }

    setHistory(newHistory);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (pastCommands.length > 0 && cmdIndex < pastCommands.length - 1) {
        const nextIdx = cmdIndex + 1;
        setCmdIndex(nextIdx);
        setInputVal(pastCommands[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cmdIndex > 0) {
        const nextIdx = cmdIndex - 1;
        setCmdIndex(nextIdx);
        setInputVal(pastCommands[nextIdx]);
      } else if (cmdIndex === 0) {
        setCmdIndex(-1);
        setInputVal('');
      }
    }
  };

  const quickCommands = ['help', 'status', 'matrix', 'sync', 'scan', 'decrypt', 'clear'];

  return (
    <div
      className={`fixed bottom-16 left-0 right-0 z-40 transition-all duration-300 ease-out max-w-3xl mx-auto px-3 sm:px-4 ${
        isOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-[#050810]/95 backdrop-blur-2xl border-2 border-[#00f3ff]/40 rounded-2xl shadow-[0_0_35px_rgba(0,243,255,0.25)] flex flex-col h-[380px] overflow-hidden">
        {/* Top Drawer Drag Handle & Bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-black/60 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-[#00ff66]" />
            <span className="font-orbitron text-xs font-bold tracking-wider text-slate-100">
              TERMINAL // CONSOLE
            </span>
            <span className="text-[10px] font-mono-tech text-emerald-400">
              [SHELL_LIVE]
            </span>
          </div>

          <button
            onClick={() => {
              soundFx.play('click');
              onToggle();
            }}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Minimize Terminal Drawer"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Terminal Output Stream */}
        <div
          ref={scrollRef}
          className="flex-1 p-3 overflow-y-auto font-mono-tech text-xs space-y-2 text-slate-200"
        >
          {history.map((item) => (
            <div key={item.id} className="leading-relaxed">
              {item.type === 'cmd' ? (
                <div className="text-[#00f3ff] font-semibold flex items-center gap-1.5">
                  <span>{item.text}</span>
                </div>
              ) : item.type === 'error' ? (
                <div className="text-rose-400 whitespace-pre-wrap">{item.text}</div>
              ) : item.type === 'success' ? (
                <div className="text-[#00ff66] whitespace-pre-wrap">{item.text}</div>
              ) : (
                <div className="text-slate-300 whitespace-pre-wrap">{item.text}</div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Tap Command Chips (Mobile-friendly) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border-t border-cyan-500/10 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono-tech text-slate-400 uppercase mr-1">QUICK:</span>
          {quickCommands.map((q) => (
            <button
              key={q}
              onClick={() => executeCommand(q)}
              className="min-h-[32px] px-2.5 py-0.5 rounded-lg bg-cyan-950/40 hover:bg-[#00f3ff]/20 text-[#00f3ff] border border-cyan-500/30 text-[11px] font-mono-tech tracking-wider uppercase transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input prompt bar */}
        <div className="flex items-center gap-2 p-2.5 bg-black/70 border-t border-cyan-500/20">
          <span className="font-mono-tech text-[#00ff66] font-bold text-sm pl-1">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type directive (e.g., status, matrix, sync)..."
            className="flex-1 bg-transparent font-mono-tech text-xs text-[#00f3ff] placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => executeCommand(inputVal)}
            className="min-h-[40px] px-3 py-1.5 bg-[#00f3ff]/20 hover:bg-[#00f3ff]/30 border border-[#00f3ff]/40 text-[#00f3ff] rounded-xl flex items-center gap-1 text-xs font-mono-tech font-bold transition-all shadow-[0_0_10px_rgba(0,243,255,0.2)]"
          >
            <span>EXEC</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
