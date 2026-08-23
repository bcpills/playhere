import React from 'react';
import { GameTab } from '../types';
import { 
  Spade, 
  Dices, 
  Package, 
  Trophy, 
  ShieldAlert, 
  BarChart2, 
  HelpCircle, 
  Volume2, 
  VolumeX,
  Coins,
  Sparkles
} from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  balance: number;
  netProfit: number;
  currentTab: GameTab;
  onTabChange: (tab: GameTab) => void;
  onOpenBailout: () => void;
  onOpenStats: () => void;
  onOpenRules: () => void;
  inventoryCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  balance,
  netProfit,
  currentTab,
  onTabChange,
  onOpenBailout,
  onOpenStats,
  onOpenRules,
  inventoryCount,
  soundEnabled,
  onToggleSound,
}) => {
  const tabs = [
    { id: 'blackjack' as GameTab, label: 'Blackjack', icon: Spade, badge: 'Side Bets' },
    { id: 'keno' as GameTab, label: 'Keno Lounge', icon: Dices, badge: '95% RTP' },
    { id: 'unboxer' as GameTab, label: 'Loot Crates', icon: Package, badge: 'CS Cases' },
    { id: 'inventory' as GameTab, label: 'Vault', icon: Trophy, count: inventoryCount },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        {/* Top Tier: Brand, Balance, Actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Logo / Title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center text-lg sm:text-xl font-black text-amber-400">
                🃏
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm sm:text-lg font-black tracking-wider uppercase text-zinc-100 flex items-center gap-1.5 leading-none">
                <span>The Bullshit Casino</span>
              </h1>
              <span className="text-[10px] text-amber-400/90 font-medium tracking-tight mt-0.5">
                Provably Satirical • High Stakes
              </span>
            </div>
          </div>

          {/* Balance & Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Balance Pill */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-2xl bg-zinc-900 border border-zinc-700 shadow-inner">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                🪙
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider hidden sm:block">
                  Bankroll
                </span>
                <span className="text-xs sm:text-sm font-black text-amber-300 font-mono leading-none">
                  {balance.toLocaleString()}
                </span>
              </div>
            </div>

            {/* ATM Bailout Button */}
            <button
              id="header-bailout-btn"
              onClick={() => {
                sound.playChip();
                onOpenBailout();
              }}
              title="Emergency ATM of Shame Bailout"
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-500/50 text-red-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span className="hidden md:inline">ATM Bailout</span>
            </button>

            {/* Stats Button */}
            <button
              onClick={() => {
                sound.playChip();
                onOpenStats();
              }}
              title="Career Dossier"
              className="p-1.5 sm:p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
            </button>

            {/* Rules Button */}
            <button
              onClick={() => {
                sound.playChip();
                onOpenRules();
              }}
              title="Rules & Paytables"
              className="p-1.5 sm:p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => {
                onToggleSound();
                sound.playChip();
              }}
              title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
              className="p-1.5 sm:p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <nav className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-2.5 overflow-x-auto no-scrollbar py-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => {
                  sound.playChip();
                  onTabChange(tab.id);
                }}
                className={`flex-1 min-w-[76px] sm:min-w-[120px] flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all relative ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 font-black'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/90 border border-zinc-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                <span className="truncate">{tab.label}</span>

                {tab.badge && (
                  <span className={`hidden sm:inline-block text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                    isActive ? 'bg-zinc-950 text-amber-300' : 'bg-zinc-800 text-amber-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}

                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? 'bg-zinc-950 text-amber-300' : 'bg-purple-600 text-white'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
