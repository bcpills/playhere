import React from 'react';
import { GameTab, UserAccount, UserRole, CurrencyMode } from '../types';
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
  Clock,
  Bomb,
  Swords,
  Coins,
  Gift,
  Flame,
  Zap,
  DollarSign,
  Wallet,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { sound } from '../utils/audio';
import { isUserAdmin, isUserModerator, formatCompactWager } from '../utils/leaderboard';
import { getUnclaimedMilestoneCount } from '../utils/milestones';

interface HeaderProps {
  balance: number;
  cashBalance?: number;
  currencyMode: CurrencyMode;
  onToggleCurrencyMode: (mode: CurrencyMode) => void;
  netProfit: number;
  totalWagered: number;
  currentTab: GameTab;
  userAccount: UserAccount;
  onTabChange: (tab: GameTab) => void;
  onOpenBailout: () => void;
  onOpenStats: () => void;
  onOpenRules: () => void;
  onOpenAccount: () => void;
  onOpenMilestones: () => void;
  onClaimRakeback?: () => void;
  onToggleChat: () => void;
  onOpenPendingPayouts: () => void;
  onOpenCashier: () => void;
  onOpenPayForAdFree?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  pendingPayoutsCount: number;
  isChatOpen: boolean;
  onSwitchRole?: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  balance,
  cashBalance = 2.00,
  currencyMode,
  onToggleCurrencyMode,
  netProfit,
  totalWagered,
  currentTab,
  userAccount,
  onTabChange,
  onOpenBailout,
  onOpenStats,
  onOpenRules,
  onOpenAccount,
  onOpenMilestones,
  onClaimRakeback,
  onToggleChat,
  onOpenPendingPayouts,
  onOpenCashier,
  onOpenPayForAdFree,
  soundEnabled,
  onToggleSound,
  pendingPayoutsCount,
  isChatOpen,
  onSwitchRole,
}) => {
  const isAdmin = isUserAdmin(userAccount);
  const isMod = isUserModerator(userAccount);
  const unclaimedMilestones = getUnclaimedMilestoneCount(totalWagered, userAccount.claimedMilestoneCrates);
  const pendingGcRakeback = userAccount.unclaimedRakeback || 0;
  const pendingCashRakeback = userAccount.unclaimedCashRakeback || 0;
  const hasPendingRakeback = pendingGcRakeback > 0 || pendingCashRakeback > 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d091a]/95 backdrop-blur-md border-b border-purple-900/30 shadow-xl shadow-purple-950/20">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2">
        {/* Responsive Header Row: Brand, Currency Switcher, Cashier & Actions */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-3">
          
          {/* Left: Logo & Back to Lobby */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <div 
              onClick={() => {
                sound.playChip();
                onTabChange('home');
              }}
              className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-amber-500 to-yellow-400 p-0.5 shadow-md shadow-purple-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0d091a] rounded-[9px] flex items-center justify-center text-sm sm:text-base font-black text-amber-400">
                  🃏
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xs sm:text-sm font-black tracking-wider uppercase text-zinc-100 flex items-center gap-1 leading-none group-hover:text-purple-300 transition-colors">
                  <span className="bg-gradient-to-r from-zinc-100 via-purple-100 to-amber-200 bg-clip-text text-transparent">ChipZone</span>
                </h1>
                <span className="text-[8px] text-purple-400/80 font-medium tracking-tight mt-0.5 hidden md:block">
                  High-Stakes VIP
                </span>
              </div>
            </div>

            {/* Back to Lobby Floor Button (Shown when playing any game) */}
            {currentTab !== 'home' && (
              <button
                id="header-back-to-lobby-btn"
                onClick={() => {
                  sound.playChip();
                  onTabChange('home');
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer hover:border-purple-400 shrink-0"
              >
                <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Lobby</span>
              </button>
            )}
          </div>

          {/* Center: GLOBAL CURRENCY TOGGLE SWITCH (Real Cash vs Gold Coins) */}
          <div className="flex items-center justify-center shrink-0">
            <div className="bg-zinc-950/90 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-purple-500/30 shadow-inner flex items-center gap-0.5 sm:gap-1">
              
              {/* REAL MONEY CASH TOGGLE */}
              <button
                id="currency-toggle-cash"
                type="button"
                onClick={() => {
                  if (currencyMode !== 'cash') {
                    sound.playChip();
                    onToggleCurrencyMode('cash');
                  }
                }}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl text-xs font-black transition-all cursor-pointer ${
                  currencyMode === 'cash'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 shadow-md shadow-emerald-500/30 border border-emerald-300/60 scale-[1.02]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
                }`}
              >
                <DollarSign className={`w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5] ${currencyMode === 'cash' ? 'text-zinc-950' : 'text-emerald-400'}`} />
                <div className="flex items-center gap-1 leading-none">
                  <span className={`font-mono text-[11px] sm:text-xs font-black whitespace-nowrap ${currencyMode === 'cash' ? 'text-zinc-950' : 'text-emerald-400'}`}>
                    ${(typeof cashBalance === 'number' ? cashBalance : 2.00).toFixed(2)}
                  </span>
                  <span className={`text-[7px] sm:text-[8px] font-black uppercase hidden xs:inline ${currencyMode === 'cash' ? 'text-zinc-900' : 'text-emerald-500'}`}>
                    USD
                  </span>
                </div>
              </button>

              {/* GOLD COINS TOGGLE */}
              <button
                id="currency-toggle-gc"
                type="button"
                onClick={() => {
                  if (currencyMode !== 'gc') {
                    sound.playChip();
                    onToggleCurrencyMode('gc');
                  }
                }}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl text-xs font-black transition-all cursor-pointer ${
                  currencyMode === 'gc'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 shadow-md shadow-amber-500/30 border border-yellow-200/60 scale-[1.02]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
                }`}
              >
                <Coins className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${currencyMode === 'gc' ? 'text-zinc-950' : 'text-amber-400'}`} />
                <div className="flex items-center gap-1 leading-none">
                  <span className={`font-mono text-[11px] sm:text-xs font-black whitespace-nowrap ${currencyMode === 'gc' ? 'text-zinc-950' : 'text-amber-300'}`}>
                    {formatCompactWager(isNaN(balance) ? 1000000 : balance)}
                  </span>
                  <span className={`text-[7px] sm:text-[8px] font-black uppercase hidden xs:inline ${currencyMode === 'gc' ? 'text-zinc-900' : 'text-amber-500'}`}>
                    GC
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Right: Actions, Cashier, ATM, Profile & Extras */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            
            {/* REAL MONEY CASHIER BUTTON */}
            <button
              id="header-cashier-btn"
              onClick={() => {
                sound.playChip();
                onOpenCashier();
              }}
              title="Real Money Cashier: Crypto Deposits & Real Cashouts"
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-500/30 border border-emerald-300/50 cursor-pointer active:scale-98 transition-all shrink-0"
            >
              <DollarSign className="w-3.5 h-3.5 stroke-[3]" />
              <span className="text-[10px] sm:text-[11px] font-black hidden xs:inline">Cashier</span>
            </button>

            {/* ATM & REWARDS VAULT BUTTON */}
            <button
              id="header-bailout-btn"
              onClick={() => {
                sound.playChip();
                onOpenBailout();
              }}
              title="ATM Rewards & Stimulus Vault: Daily Dollar ($1.00 USD), Rakeback Vault, Emergency Bailouts"
              className="px-1.5 sm:px-2 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-300 text-xs font-bold flex items-center gap-1 transition-all shadow-sm cursor-pointer relative shrink-0"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[10px] font-black uppercase hidden lg:inline">ATM</span>
              {hasPendingRakeback && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>

            {/* LEVELING MILESTONES BUTTON */}
            <button
              id="header-milestones-btn"
              onClick={() => {
                sound.playChip();
                onOpenMilestones();
              }}
              title="Unlock free VIP Milestone Crates!"
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer shrink-0 ${
                unclaimedMilestones > 0
                  ? 'bg-amber-500 text-zinc-950 border-amber-300 shadow-md shadow-amber-500/30 animate-bounce'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-amber-300'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              {unclaimedMilestones > 0 && (
                <span className="px-1 py-0.2 rounded-full text-[8px] font-mono font-black bg-zinc-950 text-amber-300">
                  {unclaimedMilestones}
                </span>
              )}
            </button>

            {/* ADMIN / MOD PORTAL BUTTON */}
            {(isAdmin || isMod) && (
              <button
                id="header-admin-payouts-btn"
                onClick={() => {
                  sound.playChip();
                  onOpenPendingPayouts();
                }}
                title="Admin & Moderator Command Center"
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-purple-950/90 hover:bg-purple-900 border border-purple-500/60 text-purple-200 text-xs font-black uppercase tracking-wider transition-all shadow-md animate-in fade-in cursor-pointer shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                {pendingPayoutsCount > 0 && (
                  <span className="px-1 py-0.2 rounded-full text-[8px] font-mono font-black bg-amber-500 text-zinc-950">
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
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-1.5 rounded-xl border text-xs font-black uppercase transition-all cursor-pointer shrink-0 ${
                isChatOpen
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200 shadow-inner'
              }`}
            >
              <div className="relative">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </button>

            {/* Account Profile Button */}
            <button
              onClick={() => {
                sound.playChip();
                onOpenAccount();
              }}
              title="Gambler VIP Profile & Account"
              className="flex items-center gap-1 px-1.5 sm:px-2 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 transition-colors text-xs font-bold shadow-inner cursor-pointer shrink-0"
            >
              <div className="relative">
                <span className="text-xs sm:text-sm">{userAccount.avatar}</span>
                {userAccount.googleLinked && (
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-zinc-950 flex items-center justify-center p-0.5 border border-zinc-700">
                    <GoogleIcon className="w-2 h-2" />
                  </div>
                )}
              </div>
              <span className="hidden xl:inline text-[10px] font-black truncate max-w-[70px]">
                {userAccount.username || 'Gambler'}
              </span>
            </button>

            {/* Stats Button */}
            <button
              onClick={() => {
                sound.playChip();
                onOpenStats();
              }}
              title="Career Dossier"
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 transition-colors cursor-pointer shrink-0 hidden sm:block"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => {
                onToggleSound();
                sound.playChip();
              }}
              title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 transition-colors cursor-pointer shrink-0"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-500" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

