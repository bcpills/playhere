import React from 'react';
import { GameTab, UserAccount } from '../types';
import { GoogleIcon } from './GoogleIcon';
import { 
  Home,
  Spade, 
  Dices, 
  Package, 
  Trophy, 
  ShieldAlert, 
  BarChart2, 
  HelpCircle, 
  Volume2, 
  VolumeX,
  Award,
  Crown,
  MessageSquare,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { sound } from '../utils/audio';
import { isUserAdmin } from '../utils/leaderboard';

interface HeaderProps {
  balance: number;
  netProfit: number;
  currentTab: GameTab;
  userAccount: UserAccount;
  onTabChange: (tab: GameTab) => void;
  onOpenBailout: () => void;
  onOpenStats: () => void;
  onOpenRules: () => void;
  onOpenAccount: () => void;
  onToggleChat: () => void;
  onOpenPendingPayouts: () => void;
  onOpenPayForAdFree?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  pendingPayoutsCount: number;
  isChatOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  balance,
  netProfit,
  currentTab,
  userAccount,
  onTabChange,
  onOpenBailout,
  onOpenStats,
  onOpenRules,
  onOpenAccount,
  onToggleChat,
  onOpenPendingPayouts,
  onOpenPayForAdFree,
  soundEnabled,
  onToggleSound,
  pendingPayoutsCount,
  isChatOpen,
}) => {
  const isAdmin = isUserAdmin(userAccount);

  const tabs = [
    { id: 'home' as GameTab, label: 'Lobby', icon: Home },
    { id: 'blackjack' as GameTab, label: 'Blackjack', icon: Spade },
    { id: 'keno' as GameTab, label: 'Keno', icon: Dices },
    { id: 'unboxer' as GameTab, label: 'Crates', icon: Package },
    { id: 'leaderboard' as GameTab, label: 'Leaderboard', icon: Crown },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d091a]/95 backdrop-blur-md border-b border-purple-900/30 shadow-xl shadow-purple-950/20">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
        {/* Top Tier: Brand, Balance, Admin Portal & Actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Logo / Title (Clickable to Lobby) */}
          <div 
            onClick={() => {
              sound.playChip();
              onTabChange('home');
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-amber-500 to-yellow-400 p-0.5 shadow-md shadow-purple-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0d091a] rounded-[9px] flex items-center justify-center text-base font-black text-amber-400">
                🃏
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xs sm:text-base font-black tracking-wider uppercase text-zinc-100 flex items-center gap-1.5 leading-none group-hover:text-purple-300 transition-colors">
                <span className="bg-gradient-to-r from-zinc-100 via-purple-100 to-amber-200 bg-clip-text text-transparent">ChipZone</span>
              </h1>
              <span className="text-[9px] text-purple-400/90 font-medium tracking-tight mt-0.5 hidden xs:block">
                High-Stakes VIP Lounge
              </span>
            </div>
          </div>

          {/* Actions & Balance (Scrollable by swiping on mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar shrink-0 max-w-[68%] sm:max-w-none py-0.5">
            {/* ADMIN-ONLY PENDING PAYOUTS BUTTON */}
            {isAdmin && (
              <button
                id="header-admin-payouts-btn"
                onClick={() => {
                  sound.playChip();
                  onOpenPendingPayouts();
                }}
                title="Admin & Moderator Portal"
                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-purple-500/60 text-purple-200 text-xs font-black uppercase tracking-wider transition-all shadow-md animate-in fade-in"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="hidden md:inline text-[11px]">Admin / Mod</span>
                {pendingPayoutsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black bg-amber-500 text-zinc-950">
                    {pendingPayoutsCount}
                  </span>
                )}
              </button>
            )}

            {/* LIVE CASINO CHAT TOGGLE BUTTON */}
            <button
              id="header-chat-btn"
              onClick={() => {
                sound.playChip();
                onToggleChat();
              }}
              title="Open Casino Lounge Chat"
              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-black uppercase transition-all ${
                isChatOpen
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200 shadow-inner'
              }`}
            >
              <div className="relative">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="hidden xs:inline text-[11px]">Chat</span>
            </button>

            {/* Account Profile Button */}
            <button
              onClick={() => {
                sound.playChip();
                onOpenAccount();
              }}
              title="Gambler VIP Profile & Account"
              className="shrink-0 flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 transition-colors text-xs font-bold shadow-inner"
            >
              <div className="relative">
                <span className="text-sm">{userAccount.avatar}</span>
                {userAccount.googleLinked && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-zinc-950 flex items-center justify-center p-0.5 border border-zinc-700">
                    <GoogleIcon className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>
              <span className="hidden sm:inline text-[11px] font-black truncate max-w-[80px]">
                {userAccount.username || 'Gambler'}
              </span>
            </button>

            {/* Balance Pill */}
            <div className="shrink-0 flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-700 shadow-inner">
              <span className="text-xs">🪙</span>
              <div className="flex flex-col text-right">
                <span className="text-[8px] uppercase font-bold text-zinc-400 tracking-wider hidden sm:block">
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
              title="Emergency ATM Bailout"
              className="shrink-0 p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-500/50 text-red-300 text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="hidden sm:inline text-[11px]">ATM</span>
            </button>

            {/* Stats Button */}
            <button
              onClick={() => {
                sound.playChip();
                onOpenStats();
              }}
              title="Career Dossier"
              className="shrink-0 p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 transition-colors"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>

            {/* Rules Button */}
            <button
              onClick={() => {
                sound.playChip();
                onOpenRules();
              }}
              title="Rules & Paytables"
              className="shrink-0 p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => {
                onToggleSound();
                sound.playChip();
              }}
              title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
              className="shrink-0 p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-500" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <nav className="flex items-center gap-1 sm:gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
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
                className={`flex-1 min-w-[64px] sm:min-w-[85px] flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all relative ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-black'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/90 border border-zinc-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                <span className="truncate text-[11px] sm:text-xs">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
