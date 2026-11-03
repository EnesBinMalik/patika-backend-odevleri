import React from 'react';
import { BatteryState } from '../hooks/useDeviceSensors';
import { soundFx } from '../services/soundFx';
import { Zap, BatteryCharging, Battery, Flame, Gauge, RefreshCw } from 'lucide-react';

interface PowerRingWidgetProps {
  battery: BatteryState;
  onToggleCharging: () => void;
  onAdjustLevel: (delta: number) => void;
}

export const PowerRingWidget: React.FC<PowerRingWidgetProps> = ({
  battery,
  onToggleCharging,
  onAdjustLevel,
}) => {
  // SVG circular geometry
  const size = 150;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (battery.level / 100) * circumference;

  const isLow = battery.level <= 20;

  // Battery Status API yalnızca gerçek modda değer verir; Infinity = tarayıcı bilmiyor
  const secondsToLabel = (value: number): string | null => {
    if (!Number.isFinite(value) || value <= 0) return null;
    const totalMinutes = Math.round(value / 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return hrs > 0 ? `${hrs}s ${mins}dk` : `${mins}dk`;
  };
  const remainingLabel = battery.charging
    ? secondsToLabel(battery.chargingTime)
    : secondsToLabel(battery.dischargingTime);

  const handleChargeToggle = () => {
    soundFx.play('toggle');
    onToggleCharging();
  };

  const handleAdjust = (delta: number) => {
    soundFx.play('click');
    onAdjustLevel(delta);
  };

  return (
    <div className="cyber-glass rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#00ff66]" />
          <h2 className="font-orbitron text-sm font-bold tracking-wider text-slate-100 uppercase">
            Power Core // Battery
          </h2>
        </div>
        <div className="flex items-center gap-1.5 font-mono-tech text-xs" title={battery.isRealApi ? 'navigator.getBattery() gerçek API’den okunuyor' : 'Bu tarayıcıda Battery Status API yok; gösterilen değerler dekoratiftir'}>
          <span className="text-slate-400">SRC:</span>
          <span className={battery.isRealApi ? 'text-emerald-400' : 'text-cyan-400'}>
            {battery.isRealApi ? 'HARDWARE_API' : 'DEMO_DEGERLER'}
          </span>
        </div>
      </div>

      {/* Main Center Ring & Metrics */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
        {/* Glowing Circular SVG Ring */}
        <div className="relative flex items-center justify-center">
          <svg
            width={size}
            height={size}
            className="transform -rotate-90 drop-shadow-[0_0_15px_rgba(0,243,255,0.25)]"
          >
            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Glowing Accent Ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isLow ? '#ff0055' : 'url(#cyberPowerGradient)'}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />

            {/* SVG Linear Gradient Definition */}
            <defs>
              <linearGradient id="cyberPowerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f3ff" />
                <stop offset="100%" stopColor="#00ff66" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Info Inside Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {battery.charging ? (
              <BatteryCharging className="w-6 h-6 text-[#00ff66] animate-pulse" />
            ) : (
              <Battery className={`w-6 h-6 ${isLow ? 'text-rose-500' : 'text-[#00f3ff]'}`} />
            )}
            <div className="flex items-baseline justify-center">
              <span className="font-orbitron text-2xl font-black text-white tabular-nums tracking-tight">
                {battery.level}
              </span>
              <span className="text-xs font-mono-tech text-cyan-400 font-semibold">%</span>
            </div>
            <span className="text-[10px] font-mono-tech tracking-wider uppercase text-slate-400">
              {battery.charging ? 'SUPERCHARGING' : isLow ? 'LOW POWER' : 'DISCHARGING'}
            </span>
          </div>
        </div>

        {/* Telemetry Sensor Readouts */}
        <div className="flex flex-col gap-2 w-full sm:w-48">
          <div
            className="bg-black/40 border border-cyan-500/15 rounded-xl p-2.5 flex items-center justify-between"
            title="Batarya API gerilim sunmaz; bu değer seviyeden türetilen tahmindir"
          >
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#00f3ff]" />
              <span className="text-[11px] font-mono-tech text-slate-300">Voltage (tahmini)</span>
            </div>
            <span className="font-orbitron text-xs font-bold text-white tabular-nums">
              {battery.voltage} V
            </span>
          </div>

          <div
            className="bg-black/40 border border-cyan-500/15 rounded-xl p-2.5 flex items-center justify-between"
            title="Batarya API sıcaklık sunmaz; şarj durumu üzerinden modellenmiş dekoratif değer"
          >
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-mono-tech text-slate-300">Core Temp (model)</span>
            </div>
            <span className="font-orbitron text-xs font-bold text-amber-300 tabular-nums">
              {battery.temperature}°C
            </span>
          </div>

          <div className="bg-black border border-emerald-500/15 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#00ff66]" />
              <span className="text-[11px] font-mono-tech text-slate-300">
                {battery.charging ? 'Dolu Kalan' : 'Bitme Süresi'}
              </span>
            </div>
            <span className="font-orbitron text-xs font-bold text-[#00ff66] tabular-nums">
              {battery.isRealApi && remainingLabel ? remainingLabel : 'API VERMEZ'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Sensor & Power Controls */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-cyan-500/10">
        <button
          onClick={handleChargeToggle}
          className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all ${
            battery.charging
              ? 'bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/50 shadow-[0_0_15px_rgba(0,255,102,0.3)]'
              : 'bg-black/40 text-slate-300 hover:text-white border border-cyan-500/20 hover:border-cyan-500/40'
          }`}
        >
          <BatteryCharging className="w-4 h-4" />
          <span>{battery.charging ? 'UNPLUG CELL' : 'PLUG IN CHARGER'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleAdjust(-10)}
            disabled={battery.level <= 10}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-black/40 border border-cyan-500/20 text-slate-300 hover:text-white hover:border-cyan-500/40 text-xs font-mono-tech disabled:opacity-30"
            title="Simulate Battery Drain"
          >
            -10%
          </button>
          <button
            onClick={() => handleAdjust(10)}
            disabled={battery.level >= 100}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-black/40 border border-cyan-500/20 text-slate-300 hover:text-white hover:border-cyan-500/40 text-xs font-mono-tech disabled:opacity-30"
            title="Simulate Battery Boost"
          >
            +10%
          </button>
        </div>
      </div>
    </div>
  );
};
