/**
 * @license
 * Copyright 2026 Enes Öztürk — tüm hakları saklıdır
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { soundFx } from '../services/soundFx';
import { LayoutDashboard, Activity, FileText, Award, Terminal as TerminalIcon } from 'lucide-react';

export type ActiveTab = 'hud' | 'stream' | 'notes' | 'architect';

interface MobileTabBarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  isTerminalOpen: boolean;
  onToggleTerminal: () => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeTab,
  onChangeTab,
  isTerminalOpen,
  onToggleTerminal,
}) => {
  const handleTabClick = (tab: ActiveTab) => {
    soundFx.play('click');
    onChangeTab(tab);
  };

  const handleTerminalClick = () => {
    soundFx.play('toggle');
    onToggleTerminal();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#050812]/90 backdrop-blur-2xl border-t border-cyan-500/25 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-2">
        {/* Tab 1: HUD */}
        <button
          onClick={() => handleTabClick('hud')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-all ${
            activeTab === 'hud' ? 'text-[#00f3ff]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeTab === 'hud' ? 'drop-shadow-[0_0_8px_rgba(0,243,255,0.7)]' : ''}`} />
          <span className="text-[10px] font-mono-tech mt-1 tracking-tight font-semibold">HUD</span>
        </button>

        {/* Tab 2: Stream */}
        <button
          onClick={() => handleTabClick('stream')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-all ${
            activeTab === 'stream' ? 'text-[#00f3ff]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className={`w-5 h-5 ${activeTab === 'stream' ? 'drop-shadow-[0_0_8px_rgba(0,243,255,0.7)]' : ''}`} />
          <span className="text-[10px] font-mono-tech mt-1 tracking-tight font-semibold">STREAM</span>
        </button>

        {/* Center Prominent Terminal Drawer Trigger */}
        <div className="flex items-center justify-center -mt-4">
          <button
            onClick={handleTerminalClick}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all transform active:scale-95 shadow-lg ${
              isTerminalOpen
                ? 'bg-[#00ff66] text-black shadow-[0_0_20px_rgba(0,255,102,0.8)] border border-white'
                : 'bg-black/80 text-[#00f3ff] border-2 border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.4)]'
            }`}
            title="Open Interactive Cyber Terminal Drawer"
          >
            <TerminalIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tab 3: Notes */}
        <button
          onClick={() => handleTabClick('notes')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-all ${
            activeTab === 'notes' ? 'text-[#00f3ff]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className={`w-5 h-5 ${activeTab === 'notes' ? 'drop-shadow-[0_0_8px_rgba(0,243,255,0.7)]' : ''}`} />
          <span className="text-[10px] font-mono-tech mt-1 tracking-tight font-semibold">NOTES</span>
        </button>

        {/* Tab 4: Architect */}
        <button
          onClick={() => handleTabClick('architect')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-all ${
            activeTab === 'architect' ? 'text-[#00ff66]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className={`w-5 h-5 ${activeTab === 'architect' ? 'drop-shadow-[0_0_8px_rgba(0,255,102,0.7)]' : ''}`} />
          <span className="text-[10px] font-mono-tech mt-1 tracking-tight font-semibold">ENES</span>
        </button>
      </div>
    </nav>
  );
};
