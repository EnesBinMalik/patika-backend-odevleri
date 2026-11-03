/**
 * @license
 * Copyright 2026 Enes Öztürk — tüm hakları saklıdır
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useRef, useState } from 'react';
import { soundFx } from '../services/soundFx';
import { Activity, Radio, BarChart3 } from 'lucide-react';

interface DataStreamCanvasProps {
  overclockMultiplier: number;
}

interface TelemetryPacket {
  id: string;
  time: string;
  hex: string;
  protocol: string;
  latency: number;
  status: 'GEN' | 'QUEUED' | 'LOOP';
}

export const DataStreamCanvas: React.FC<DataStreamCanvasProps> = ({ overclockMultiplier }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewMode, setViewMode] = useState<'wave' | 'spectrum' | 'packets'>('wave');
  const [packets, setPackets] = useState<TelemetryPacket[]>([]);
  const [throughputMbps, setThroughputMbps] = useState<number>(486.2);
  const [avgLatency, setAvgLatency] = useState<number>(18);
  const [packetLoss, setPacketLoss] = useState<number>(0.0);
  // GERÇEK ölçüm: requestAnimationFrame kare aralığından hesaplanan render FPS
  const [renderFps, setRenderFps] = useState<number>(0);

  // Keep animated phase
  const phaseRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Canvas visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;
    let frameCount = 0;
    let windowStart = 0;

    const render = (timestamp: number) => {
      if (!isMounted) return;

      if (windowStart === 0) {
        windowStart = timestamp;
      }
      frameCount += 1;
      const windowMs = timestamp - windowStart;
      if (windowMs >= 500) {
        setRenderFps(Math.round((frameCount * 1000) / windowMs));
        frameCount = 0;
        windowStart = timestamp;
      }

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // Cyber Grid Background on canvas
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const speed = 0.05 * overclockMultiplier;
      phaseRef.current += speed;
      const phase = phaseRef.current;

      if (viewMode === 'wave') {
        // Multi-frequency oscilloscope
        const midY = height / 2;

        // Channel 1: Cyan primary carrier wave
        ctx.beginPath();
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(0, 243, 255, 0.7)';
        ctx.shadowBlur = 10;

        for (let x = 0; x < width; x++) {
          const normX = x / width;
          const y =
            midY +
            Math.sin(normX * 14 + phase) * 26 * Math.sin(normX * 3 + phase * 0.5) +
            Math.sin(normX * 28 + phase * 1.5) * 8;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Channel 2: Emerald secondary harmonic
        ctx.beginPath();
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = 'rgba(0, 255, 102, 0.6)';
        ctx.shadowBlur = 8;

        for (let x = 0; x < width; x++) {
          const normX = x / width;
          const y =
            midY +
            Math.cos(normX * 10 - phase * 0.8) * 18 * Math.cos(normX * 4 + phase * 0.3) +
            Math.sin(normX * 36 - phase * 2) * 6;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Center zero axis
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.2)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, midY);
        ctx.lineTo(width, midY);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (viewMode === 'spectrum') {
        // Spectrum Audio / Telemetry Frequency Analyzer Bars
        const barCount = 36;
        const barWidth = Math.max(3, (width / barCount) - 4);
        const maxHeight = height * 0.85;

        for (let i = 0; i < barCount; i++) {
          const normI = i / barCount;
          // Calculate animated amplitude
          const noise = Math.sin(normI * 12 + phase * 2) * Math.cos(normI * 8 - phase * 1.5);
          const amp = Math.max(0.12, Math.abs(noise)) * maxHeight * (0.6 + 0.4 * Math.sin(normI * Math.PI));
          const barHeight = amp;
          const x = i * (barWidth + 4) + 4;
          const y = height - barHeight - 4;

          // Gradient color: Cyan to Emerald
          const grad = ctx.createLinearGradient(x, y, x, height);
          grad.addColorStop(0, '#00f3ff');
          grad.addColorStop(0.7, '#00ff66');
          grad.addColorStop(1, 'rgba(0, 255, 102, 0.1)');

          ctx.fillStyle = grad;
          ctx.shadowColor = 'rgba(0, 243, 255, 0.4)';
          ctx.shadowBlur = 6;
          ctx.fillRect(x, y, barWidth, barHeight);

          // Top peak cap
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, Math.max(4, y - 2), barWidth, 2);
        }
      } else {
        // Matrix / Packet Pulse Mode
        const colCount = Math.floor(width / 20);
        ctx.font = '10px "Share Tech Mono", monospace';
        ctx.fillStyle = 'rgba(0, 255, 102, 0.85)';
        ctx.shadowColor = 'rgba(0, 255, 102, 0.5)';
        ctx.shadowBlur = 4;

        for (let c = 0; c < colCount; c++) {
          const colX = c * 20 + 8;
          const yOffset = ((phase * 120 + c * 47) % height);
          const hexSample = Math.floor(Math.sin(c + phase) * 255).toString(16).toUpperCase().padStart(2, '0');
          ctx.fillText(hexSample, colX, yOffset);
          ctx.fillStyle = 'rgba(0, 243, 255, 0.4)';
          ctx.fillText(Math.floor((c * 7) % 9).toString(), colX, (yOffset + 18) % height);
          ctx.fillStyle = 'rgba(0, 255, 102, 0.85)';
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [viewMode, overclockMultiplier]);

  // Telemetry stream simulated packets generator
  useEffect(() => {
    const protocols = ['DEMO-A', 'DEMO-B', 'DEMO-C', 'DEMO-D', 'DEMO-E'];
    const statuses: Array<'GEN' | 'QUEUED' | 'LOOP'> = ['GEN', 'QUEUED', 'LOOP'];

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false }) + '.' + Math.floor(now.getMilliseconds() / 10);
      const hexSample = '0x' + Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase().padStart(6, '0');
      const protocol = protocols[Math.floor(Math.random() * protocols.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const latency = Math.floor(12 + Math.random() * 14);

      setPackets(prev => {
        const next = [
          {
            id: Math.random().toString(36).substring(2, 9),
            time: timeStr,
            hex: hexSample,
            protocol,
            latency,
            status,
          },
          ...prev.slice(0, 7) // keep latest 8 packets
        ];
        return next;
      });

      // Update throughput & latency metrics with jitter
      setThroughputMbps(+(480 * overclockMultiplier + (Math.random() * 30 - 15)).toFixed(1));
      setAvgLatency(Math.floor(16 / (overclockMultiplier > 1 ? 1.2 : 1) + Math.random() * 6));
      setPacketLoss(+(Math.random() < 0.05 ? 0.01 : 0.0).toFixed(2));
    }, 600 / overclockMultiplier);

    return () => clearInterval(interval);
  }, [overclockMultiplier]);

  const handleModeChange = (mode: 'wave' | 'spectrum' | 'packets') => {
    soundFx.play('click');
    setViewMode(mode);
  };

  return (
    <div className="cyber-glass rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
      {/* Header telemetry info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#00f3ff] animate-pulse" />
          <h2 className="font-orbitron text-sm font-bold tracking-wider text-slate-100 uppercase">
            Data Stream // Telemetry
          </h2>
        </div>
        <div className="flex items-center gap-2 font-mono-tech text-xs">
          <span
            className="text-[9px] px-1.5 py-0.5 rounded border border-amber-500/40 text-amber-300 tracking-widest"
            title="Aşağıdaki throughput/latency/packet değerleri Math.random() ile üretilir; gerçek ağ ölçümü değildir"
          >
            SİMÜLASYON
          </span>
          <span className="text-slate-400">HIZ:</span>
          <span className="neon-text-cyan font-bold tabular-nums">{overclockMultiplier.toFixed(1)}x</span>
        </div>
      </div>

      {/* Visualizer Mode Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-cyan-500/20">
        <button
          onClick={() => handleModeChange('wave')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
            viewMode === 'wave'
              ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/40 shadow-[0_0_12px_rgba(0,243,255,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Waveform</span>
        </button>

        <button
          onClick={() => handleModeChange('spectrum')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
            viewMode === 'spectrum'
              ? 'bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/40 shadow-[0_0_12px_rgba(0,255,102,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Spectrum</span>
        </button>

        <button
          onClick={() => handleModeChange('packets')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
            viewMode === 'packets'
              ? 'bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/40 shadow-[0_0_12px_rgba(0,243,255,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Matrix Pulse</span>
        </button>
      </div>

      {/* HTML5 Canvas Viewport */}
      <div className="relative w-full h-36 bg-black/60 rounded-xl overflow-hidden border border-cyan-500/20 shadow-inner">
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-crosshair"
          title="Interactive Telemetry Oscilloscope"
        />

        {/* Dynamic Watermark / Channel Info */}
        <div className="absolute top-2 left-2.5 flex items-center gap-2 pointer-events-none">
          <span className="text-[10px] font-mono-tech text-[#00f3ff]/80 tracking-wider">
            CH-1: CARRIER (CYAN)
          </span>
          <span className="text-[10px] font-mono-tech text-[#00ff66]/80 tracking-wider">
            CH-2: HARMONIC (EMERALD)
          </span>
        </div>

        <div className="absolute bottom-2 right-2.5 pointer-events-none">
          <span
            className="text-[10px] font-mono-tech text-slate-400 tracking-wider tabular-nums"
            title="requestAnimationFrame karelerinden ölçülen gerçek render FPS"
          >
            RENDER: {renderFps > 0 ? renderFps : '—'} FPS
          </span>
        </div>
      </div>

      {/* Live Telemetry KPI Metrics Strip — hepsi Math.random() ile üretilir */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-black/40 border border-cyan-500/15 rounded-xl p-2.5 flex flex-col" title="Rastgele üretilen dekoratif değer — gerçek ağ ölçümü değil">
          <span className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-wider">Throughput (sim)</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-orbitron font-bold text-sm text-cyan-300 tabular-nums">{throughputMbps}</span>
            <span className="text-[10px] font-mono-tech text-cyan-400/80">Mbps</span>
          </div>
        </div>

        <div className="bg-black/40 border border-emerald-500/15 rounded-xl p-2.5 flex flex-col" title="Rastgele üretilen dekoratif değer — gerçek ağ ölçümü değil">
          <span className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-wider">Ping Latency (sim)</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-orbitron font-bold text-sm text-emerald-300 tabular-nums">{avgLatency}</span>
            <span className="text-[10px] font-mono-tech text-emerald-400/80">ms</span>
          </div>
        </div>

        <div className="bg-black/40 border border-cyan-500/15 rounded-xl p-2.5 flex flex-col" title="Rastgele üretilen dekoratif değer — gerçek ağ ölçümü değil">
          <span className="text-[10px] font-mono-tech text-slate-400 uppercase tracking-wider">Loss Rate (sim)</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-orbitron font-bold text-sm text-slate-200 tabular-nums">{packetLoss}%</span>
            <span className="text-[10px] font-mono-tech text-amber-400">DEKOR</span>
          </div>
        </div>
      </div>

      {/* Live Telemetry Packets Feed */}
      <div className="flex flex-col gap-1.5 mt-1">
        <div className="flex items-center justify-between text-[11px] font-mono-tech text-slate-400 px-1">
          <span>PACKET WATERFALL</span>
          <span className="text-amber-400/80">YEREL ÜRETİM · AĞ YOK</span>
        </div>

        <div className="flex flex-col gap-1 max-h-28 overflow-y-auto no-scrollbar font-mono-tech text-[11px]">
          {packets.slice(0, 4).map((pkt) => (
            <div
              key={pkt.id}
              className="flex items-center justify-between bg-black/30 border border-cyan-500/10 hover:border-cyan-500/30 px-2 py-1 rounded-lg text-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[10px]">{pkt.time}</span>
                <span className="text-[#00f3ff] font-semibold">{pkt.hex}</span>
                <span className="text-slate-400 text-[10px] hidden sm:inline">{pkt.protocol}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-[10px]">{pkt.latency}ms</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                  {pkt.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
