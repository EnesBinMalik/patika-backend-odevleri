import React from 'react';
import { soundFx } from '../services/soundFx';
import { Sliders, Shield, Wifi, EyeOff, Sparkles, Cpu, Compass } from 'lucide-react';
import { GyroState } from '../hooks/useDeviceSensors';

interface CyberControlsWidgetProps {
  overclockMultiplier: number;
  onOverclockChange: (val: number) => void;
  gyro: GyroState;
  onLaunchMatrix: () => void;
  stealthMode: boolean;
  onToggleStealth: () => void;
}

export const CyberControlsWidget: React.FC<CyberControlsWidgetProps> = ({
  overclockMultiplier,
  onOverclockChange,
  gyro,
  onLaunchMatrix,
  stealthMode,
  onToggleStealth,
}) => {
  const [neuralMesh, setNeuralMesh] = React.useState<boolean>(true);
  const [firewall, setFirewall] = React.useState<boolean>(true);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onOverclockChange(val);
    soundFx.play('click');
  };

  const handleToggleMesh = () => {
    soundFx.play('toggle');
    setNeuralMesh(!neuralMesh);
  };

  const handleToggleFirewall = () => {
    soundFx.play('toggle');
    setFirewall(!firewall);
  };

  return (
    <div className="cyber-glass rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#00f3ff]" />
          <h2 className="font-orbitron text-sm font-bold tracking-wider text-slate-100 uppercase">
            Cyber Diagnostics & Toggles
          </h2>
        </div>
        <span className="text-[10px] font-mono-tech text-emerald-400" title="Görsel durum etiketi — gerçek bir tanı sonucu değil">
          GÖRSEL DURUM
        </span>
      </div>

      {/* Core Clock Overclock Slider */}
      <div className="bg-black/40 border border-cyan-500/15 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between font-mono-tech text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Cpu className="w-4 h-4 text-[#00f3ff]" />
            <span>ANİMASYON HIZI</span>
          </div>
          <span className="font-orbitron text-xs font-bold text-[#00f3ff] tabular-nums">
            {overclockMultiplier.toFixed(1)}x
          </span>
        </div>

        <input
          type="range"
          min="0.8"
          max="2.5"
          step="0.1"
          value={overclockMultiplier}
          onChange={handleSlider}
          className="w-full accent-[#00f3ff] cursor-pointer"
          aria-label="Canvas animasyon hızı çarpanı"
        />

        <div className="flex items-center justify-between text-[10px] font-mono-tech text-slate-500">
          <span>0.8x (yavaş)</span>
          <span>1.0x (normal)</span>
          <span className="text-[#00f3ff]">2.5x (hızlı)</span>
        </div>
        <p className="text-[10px] font-mono-tech text-slate-500 leading-snug">
          Bu kaydırıcı yalnızca canvas dalga/spektrum animasyonunun hızını değiştirir. Donanım
          saat frekansı üzerinde etkisi yoktur.
        </p>
      </div>

      {/* 4 Interactive Toggle Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {/* Stealth Protocol */}
        <button
          onClick={() => {
            soundFx.play('toggle');
            onToggleStealth();
          }}
          className={`min-h-[48px] p-2.5 rounded-xl border flex items-center gap-2 transition-all text-left ${
            stealthMode
              ? 'bg-[#ff0055]/20 text-rose-300 border-rose-500/50 shadow-[0_0_15px_rgba(255,0,85,0.3)]'
              : 'bg-black/35 text-slate-300 hover:text-white border-white/10'
          }`}
        >
          <EyeOff className="w-4 h-4 text-rose-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-orbitron font-semibold">Stealth Mode</span>
            <span className="text-[10px] font-mono-tech text-slate-400">
              {stealthMode ? 'CLOAK ACTIVE' : 'VISIBLE'}
            </span>
          </div>
        </button>

        {/* Neural Mesh */}
        <button
          onClick={handleToggleMesh}
          title="Görsel anahtar: hiçbir ağ bağlantısı kurmaz"
          className={`min-h-[48px] p-2.5 rounded-xl border flex items-center gap-2 transition-all text-left ${
            neuralMesh
              ? 'bg-[#00f3ff]/15 text-cyan-200 border-[#00f3ff]/40 shadow-[0_0_15px_rgba(0,243,255,0.2)]'
              : 'bg-black/35 text-slate-400 border-white/10'
          }`}
        >
          <Wifi className="w-4 h-4 text-[#00f3ff] shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-orbitron font-semibold">Neural Mesh</span>
            <span className="text-[10px] font-mono-tech text-slate-400">GÖRSEL ANAHTAR</span>
          </div>
        </button>

        {/* Quantum Firewall */}
        <button
          onClick={handleToggleFirewall}
          title="Görsel anahtar: gerçek bir güvenlik duvarını açıp kapatmaz"
          className={`min-h-[48px] p-2.5 rounded-xl border flex items-center gap-2 transition-all text-left ${
            firewall
              ? 'bg-[#00ff66]/15 text-emerald-200 border-[#00ff66]/40 shadow-[0_0_15px_rgba(0,255,102,0.2)]'
              : 'bg-black/35 text-slate-400 border-white/10'
          }`}
        >
          <Shield className="w-4 h-4 text-[#00ff66] shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-orbitron font-semibold">Shield Matrix</span>
            <span className="text-[10px] font-mono-tech text-slate-400">GÖRSEL ANAHTAR</span>
          </div>
        </button>

        {/* Matrix Rain Mode Trigger */}
        <button
          onClick={() => {
            soundFx.play('matrix');
            onLaunchMatrix();
          }}
          className="min-h-[48px] p-2.5 rounded-xl bg-black/40 hover:bg-[#00ff66]/20 border border-[#00ff66]/30 hover:border-[#00ff66]/60 text-slate-200 hover:text-white flex items-center gap-2 transition-all text-left shadow-[0_0_12px_rgba(0,255,102,0.15)]"
        >
          <Sparkles className="w-4 h-4 text-[#00ff66] shrink-0 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-xs font-orbitron font-semibold text-[#00ff66]">Matrix Rain</span>
            <span className="text-[10px] font-mono-tech text-slate-400">LAUNCH HUD</span>
          </div>
        </button>
      </div>

      {/* Tilt Sensor Telemetry Box */}
      <div
        className="bg-black/30 border border-cyan-500/15 rounded-xl p-2.5 flex items-center justify-between text-xs font-mono-tech"
        title={
          gyro.source === 'sensor'
            ? 'deviceorientation olaylarından gelen gerçek açı değerleri'
            : gyro.source === 'pointer'
              ? 'Fare/dokunma koordinatlarından türetiliyor — cihaz sensörü kullanılmıyor'
              : 'Henüz eğim olayı gelmedi'
        }
      >
        <div className="flex items-center gap-1.5 text-slate-400">
          <Compass className="w-4 h-4 text-[#00f3ff]" />
          <span>EĞİM KAYNAĞI:</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <span>X: <strong className="text-[#00f3ff] font-bold">{gyro.gamma}°</strong></span>
          <span>Y: <strong className="text-[#00ff66] font-bold">{gyro.beta}°</strong></span>
          <span className={`text-[10px] ${gyro.source === 'sensor' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {gyro.source === 'sensor' ? 'SENSÖR' : gyro.source === 'pointer' ? 'İMLEÇ' : 'BEKLENIYOR'}
          </span>
        </div>
      </div>
    </div>
  );
};
