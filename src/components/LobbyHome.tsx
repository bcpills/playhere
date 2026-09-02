import React, { useState, useEffect } from 'react';
import { GameTab, CasinoStats, UserAccount, DailyWinnerRecord, PlayerProfileData } from '../types';
import { GoogleIcon } from './GoogleIcon';
import { 
  Spade, 
  Dices, 
  Package, 
  Trophy, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight, 
  HelpCircle, 
  BarChart2, 
  Crown, 
  Clock, 
  ShieldCheck, 
  Bomb, 
  Swords, 
  Coins, 
  DollarSign, 
  Flame, 
  Zap,
  MessageSquare,
  Gift,
  ArrowUpRight,
  Wallet
} from 'lucide-react';
import { sound } from '../utils/audio';
import { getVIPTier, getVIPTierInfo, getYesterdayWinner, isUserAdmin, formatCompactWager } from '../utils/leaderboard';
import { getTimeUntilEstMidnight } from '../utils/estTime';
import { AdBanner } from './AdBanner';
import { getUnclaimedMilestoneCount } from '../utils/milestones';

interface LobbyHomeProps {
  balance: number;
  cashBalance?: number;
  netProfit: number;
  stats: CasinoStats;
  userAccount: UserAccount;
  dailyWinners: DailyWinnerRecord[];
  onNavigate: (tab: GameTab) => void;
  onOpenBailout: () => void;
  onOpenStats: () => void;
  onOpenRules: () => void;
  onOpenAccount: () => void;
  onOpenMilestones?: () => void;
  onClaimRakeback?: (mode?: 'gc' | 'cash') => void;
  onOpenModeratorLog: () => void;
  onOpenCashier?: () => void;
  onOpenPayForAdFree?: () => void;
  onInspectPlayer?: (player: PlayerProfileData) => void;
  onToggleChat?: () => void;
}

export const LobbyHome: React.FC<LobbyHomeProps> = ({
  balance,
  cashBalance = 2.00,
  netProfit,
  stats,
  userAccount,
  dailyWinners,
  onNavigate,
  onOpenBailout,
  onOpenStats,
  onOpenRules,
  onOpenAccount,
  onOpenMilestones,
  onClaimRakeback,
  onOpenModeratorLog,
  onOpenCashier,
  onOpenPayForAdFree,
  onInspectPlayer,
  onToggleChat,
}) => {
  const [countdown, setCountdown] = useState<string>('');
  const isAdmin = isUserAdmin(userAccount);
  const unclaimedMilestones = getUnclaimedMilestoneCount(stats.totalWagered, userAccount.claimedMilestoneCrates);
  const pendingGcRakeback = userAccount.unclaimedRakeback || 0;
  const pendingCashRakeback = userAccount.unclaimedCashRakeback || 0;
  const hasRakeback = pendingGcRakeback > 0 || pendingCashRakeback > 0;

  useEffect(() => {
    const updateTime = () => {
      const { formatted } = getTimeUntilEstMidnight();
      setCountdown(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const vipTier = getVIPTier(stats.totalWagered);
  const tierInfo = getVIPTierInfo(vipTier);
  const yesterdayWinner = getYesterdayWinner(dailyWinners);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-5 pb-8">
      
      {/* VIP LOUNGE HERO HEADER (REAL MONEY PRIMARY, GOLD COINS SECONDARY) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#120b24] via-zinc-950 to-[#0a0714] border border-purple-500/30 p-4 sm:p-6 shadow-2xl shadow-purple-950/30">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6">
          
          {/* User Profile & VIP Info */}
          <div className="flex items-center gap-3.5">
            <div 
              onClick={() => {
                sound.playChip();
                onOpenAccount();
              }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-amber-500 to-emerald-400 p-0.5 shadow-lg shadow-purple-950/50 shrink-0 cursor-pointer hover:scale-105 transition-all group"
              title="Click to edit VIP Profile & Settings"
            >
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-2xl sm:text-3xl">
                {userAccount.avatar}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 
                  onClick={() => {
                    sound.playChip();
                    onOpenAccount();
                  }}
                  className="text-base sm:text-xl font-black tracking-wide text-zinc-100 uppercase hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  {userAccount.username || 'Gambler'}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase border font-mono ${tierInfo.badgeBg}`}>
                  {tierInfo.tier}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-zinc-400">
                <span>VIP Perk: <strong className="text-emerald-400 font-bold">{tierInfo.perk}</strong></span>
                <span>•</span>
                <span>Vol: <strong className="text-zinc-300 font-mono">{formatCompactWager(stats.totalWagered)} GC</strong></span>
              </div>
            </div>
          </div>

          {/* Primary Real Cash & Secondary GC Bankroll */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            
            {/* Primary: Real Cash Balance Box */}
            <div className="flex-1 sm:flex-none p-3 px-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-zinc-900/90 to-zinc-900 border-2 border-emerald-500/50 text-left min-w-[150px] shadow-lg shadow-emerald-950/40 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400">
                  Real Cash
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-300 my-0.5">
                ${cashBalance.toFixed(2)} <span className="text-xs font-normal text-emerald-400/80">USD</span>
              </div>
              {onOpenCashier && (
                <div className="flex items-center gap-2 pt-1 border-t border-emerald-500/20">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playChip();
                      onOpenCashier();
                    }}
                    className="text-[10px] font-black uppercase text-emerald-400 hover:text-emerald-200 flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Deposit</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                  <span className="text-zinc-600">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playChip();
                      onOpenCashier();
                    }}
                    className="text-[10px] font-black uppercase text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    Cashout
                  </button>
                </div>
              )}
            </div>

            {/* Secondary: Gold Coins (Subtle Practice / Fun Balance) */}
            <div className="flex-1 sm:flex-none p-3 px-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left min-w-[130px] flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] uppercase font-bold text-zinc-500">
                  Gold Coins
                </span>
                <span className="text-[8px] font-mono text-zinc-500 bg-zinc-800 px-1.5 py-0.2 rounded">
                  Free Play
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-zinc-300 my-0.5">
                {(isNaN(balance) ? 1000000 : balance).toLocaleString()} <span className="text-[10px] text-zinc-500">GC</span>
              </div>
              <span className="text-[9px] text-zinc-500">
                Comp & Wager Races
              </span>
            </div>

            {/* Quick ATM / Daily Reload Button */}
            <button
              type="button"
              onClick={() => {
                sound.playChip();
                onOpenBailout();
              }}
              className="p-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-purple-500/40 hover:border-purple-400 text-white font-black text-xs uppercase tracking-wider flex flex-col justify-center items-center gap-0.5 cursor-pointer transition-all shadow-md shrink-0 w-full sm:w-auto"
            >
              <div className="flex items-center gap-1.5 text-amber-300">
                <Gift className="w-3.5 h-3.5" />
                <span className="text-[11px]">Daily Reload</span>
              </div>
              <span className="text-[9px] text-zinc-400 font-mono">{countdown || 'Midnight EST'}</span>
            </button>

          </div>
        </div>
      </div>

      {/* RAKEBACK NOTIFICATION BANNER (REAL CASH & GC RAKEBACK) */}
      {hasRakeback && onClaimRakeback && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-emerald-950/40 border-2 border-purple-500/60 shadow-lg shadow-purple-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xl shrink-0">
              💎
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black uppercase text-zinc-100">
                  Unclaimed Instant Rakeback
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Ready to Claim
                </span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs">
                {pendingCashRakeback > 0 && (
                  <span className="font-mono font-black text-emerald-400">
                    +${pendingCashRakeback.toFixed(2)} USD Cash
                  </span>
                )}
                {pendingCashRakeback > 0 && pendingGcRakeback > 0 && <span className="text-zinc-600">•</span>}
                {pendingGcRakeback > 0 && (
                  <span className="font-mono font-bold text-amber-300">
                    +{pendingGcRakeback.toLocaleString()} GC
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {pendingCashRakeback > 0 && (
              <button
                type="button"
                onClick={() => onClaimRakeback('cash')}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 cursor-pointer transition-all active:scale-95"
              >
                Claim Cash (${pendingCashRakeback.toFixed(2)})
              </button>
            )}
            {pendingGcRakeback > 0 && (
              <button
                type="button"
                onClick={() => onClaimRakeback('gc')}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 cursor-pointer transition-all active:scale-95"
              >
                Claim GC
              </button>
            )}
          </div>
        </div>
      )}

      {/* CLEAN 2-COLUMN PROMO STRIP (DAILY DOLLAR & DAILY WAGER RACE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        {/* PROMO 1: DAILY DOLLAR + 100K GC */}
        <div 
          onClick={() => {
            sound.playChip();
            onOpenBailout();
          }}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/40 hover:border-emerald-400 cursor-pointer transition-all flex items-center justify-between gap-3 shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
              💵
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase text-zinc-100 group-hover:text-emerald-300 transition-colors">
                  Daily Dollar ($1.00 USD)
                </span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  12:00 AM EST
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Free $1.00 cash + 100k GC added to your bankroll every midnight.
              </p>
            </div>
          </div>

          <div className="text-emerald-400 text-xs font-bold shrink-0 flex items-center gap-0.5">
            <span>Claim</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* PROMO 2: DAILY WAGER RACE WINNER */}
        <div 
          onClick={() => {
            sound.playChip();
            onNavigate('leaderboard');
          }}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/40 hover:border-amber-400 cursor-pointer transition-all flex items-center justify-between gap-3 shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
              👑
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase text-zinc-100 group-hover:text-amber-300 transition-colors">
                  Daily Wager Race
                </span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  Cash Prizes
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-[220px]">
                {yesterdayWinner ? `Crown: ${yesterdayWinner.username} (${yesterdayWinner.formattedScore})` : 'Climb rankings with daily wager volume!'}
              </p>
            </div>
          </div>

          <div className="text-amber-400 text-xs font-bold shrink-0 flex items-center gap-0.5">
            <span>Standings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* CASINO FLOOR: 8 DISTINCT GAMES */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
              <span>Casino Games Floor</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono font-bold">
              Real Money & Free Play
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 hidden sm:inline font-mono">
            Instant Real Cash Payouts • Low Min Bets
          </span>
        </div>

        {/* CASINO GAMES GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          
          {/* GAME 1: SOLAR INFERNO HOLD & WIN */}
          <div 
            id="portal-slots-holdwin"
            onClick={() => {
              sound.playChip();
              onNavigate('slots');
            }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-950/40 via-zinc-900/90 to-zinc-950 border border-red-500/40 hover:border-red-400 p-3.5 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-red-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-1.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-zinc-950 shadow-md font-black text-lg shrink-0">
                  🔥
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-mono">
                    Hold & Win
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-red-400 block">
                  1,000× Grand
                </span>
                <h4 className="text-xs sm:text-sm font-black uppercase text-zinc-100 group-hover:text-red-300 transition-colors">
                  Solar Inferno
                </h4>
              </div>

              <p className="text-[10px] text-zinc-400 mt-1 leading-snug line-clamp-2">
                Lock 6+ Fiery Solar Orbs, 3-Respins bonus, & Major/Grand Jackpots!
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-1">
              <span className="text-[9px] font-mono text-emerald-400 font-bold">
                Min $0.10
              </span>
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-400 text-zinc-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-0.5 cursor-pointer transition-all"
              >
                <span>Play</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* GAME 2: LUCKY NEON 777 SLOTS */}
          <div 
            id="portal-slots"
            onClick={() => {
              sound.playChip();
              onNavigate('slots');
            }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/40 via-zinc-900/90 to-zinc-950 border border-amber-500/40 hover:border-amber-400 p-3.5 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-1.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-zinc-950 shadow-md font-black text-lg shrink-0">
                  🎰
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                    10 Free Spins
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 block">
                  3× Multiplier
                </span>
                <h4 className="text-xs sm:text-sm font-black uppercase text-zinc-100 group-hover:text-amber-300 transition-colors">
                  Lucky Neon 777
                </h4>
              </div>

              <p className="text-[10px] text-zinc-400 mt-1 leading-snug line-clamp-2">
                20-line classic video slot, Scatter bonus round, & feature buy!
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-1">
              <span className="text-[9px] font-mono text-emerald-400 font-bold">
                Min $0.20
              </span>
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-0.5 cursor-pointer transition-all"
              >
                <span>Play</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* GAME 3: MINES */}
          <div 
            id="portal-mines"
            onClick={() => {
              sound.playChip();
              onNavigate('mines');
            }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-950/30 via-zinc-900/90 to-zinc-950 border border-rose-500/40 hover:border-rose-400 p-3.5 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-rose-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-1.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center text-white shadow-md shrink-0">
                  <Bomb className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/50 font-mono">
                  5x5 Grid
                </span>
              </div>

              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-rose-400 block">
                  5,000,000× Max
                </span>
                <h4 className="text-xs sm:text-sm font-black uppercase text-zinc-100 group-hover:text-rose-300 transition-colors">
                  Mines
                </h4>
              </div>

              <p className="text-[10px] text-zinc-400 mt-1 leading-snug line-clamp-2">
                Uncover diamonds, dodge bombs, and cash out multipliers anytime!
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-1">
              <span className="text-[9px] font-mono text-emerald-400 font-bold">
                Min $0.10
              </span>
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-zinc-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-0.5 cursor-pointer transition-all"
              >
                <span>Play</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* GAME 4: BLACKJACK */}
          <div 
            id="portal-blackjack"
            onClick={() => {
              sound.playChip();
              onNavigate('blackjack');
            }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/30 via-zinc-900/90 to-zinc-950 border border-emerald-500/40 hover:border-emerald-400 p-3.5 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-1.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-zinc-950 shadow-md shrink-0">
                  <Spade className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 font-mono">
                  Pays 3:2
                </span>
              </div>

              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 block">
                  Vegas Felt
                </span>
                <h4 className="text-xs sm:text-sm font-black uppercase text-zinc-100 group-hover:text-emerald-300 transition-colors">
                  Blackjack
                </h4>
              </div>

              <p className="text-[10px] text-zinc-400 mt-1 leading-snug line-clamp-2">
                6-deck shoe with splits, doubles, 21+3, & 1000:1 Queens side bets.
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-1">
              <span className="text-[9px] font-mono text-emerald-400 font-bold">
                Min $1.00
              </span>
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-0.5 cursor-pointer transition-all"
              >
                <span>Deal</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* GAME 5: COINFLIP */}
          <div 
            id="portal-coinflip"
            onClick={() => {
              sound.playChip();
              onNavigate('coinflip');
            }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-950/30 via-zinc-900/90 to-zinc-950 border border-yellow-500/40 hover:border-yellow-400 p-3.5 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-yellow-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-1.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-zinc-950 shadow-md shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-yellow-950/80 text-yellow-300 border border-yellow-500/50 font-mono">
                  50/50 Instant
                </span>
              </div>

              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-yellow-400 block">
                  Streak Double-Up
                </span>
                <h4 className="text-xs sm:text-sm font-black uppercase text-zinc-100 group-hover:text-yellow-300 transition-colors">
                  Coinflip
                </h4>
              </div>

              <p className="text-[10px] text-zinc-400 mt-1 leading-snug line-clamp-2">
                Pick Heads or Tails. Consecutive streak multipliers & instant cashout!
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-1">
              <span className="text-[9px] font-mono text-emerald-400 font-bold">
                Min $0.10
              </span>
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-0.5 cursor-pointer transition-all"
              >
                <span>Flip</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* GAME 6: DICE DUELS */}
          <div 
            id="portal-dice-duels"
            onClick={() => {
              sound.playChip();
              onNavigate('dice-duels');
            }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/30 via-zinc-900/90 to-zinc-950 border border-indigo-500/40 hover:border-indigo-400 p-3.5 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-1.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center text-white shadow-md shrink-0">
                  <Swords className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/50 font-mono">
                  Arena Clash
                </span>
              </div>

              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 block">
                  PvP Duels
                </span>
                <h4 className="text-xs sm:text-sm font-black uppercase text-zinc-100 group-hover:text-indigo-300 transition-colors">
                  Dice Duels
                </h4>
              </div>

              <p className="text-[10px] text-zinc-400 mt-1 leading-snug line-clamp-2">
                1v1 rollouts or Best-of-3 arena clashes with streak multipliers!
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-1">
              <span className="text-[9px] font-mono text-emerald-400 font-bold">
                Min $0.50
              </span>
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-zinc-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-0.5 cursor-pointer transition-all"
              >
                <span>Play</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* GAME 7: KENO */}
          <div 
            id="portal-keno"
            onClick={() => {
              sound.playChip();
              onNavigate('keno');
            }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-950/30 via-zinc-900/90 to-zinc-950 border border-teal-500/40 hover:border-teal-400 p-3.5 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-teal-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-1.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-700 flex items-center justify-center text-zinc-950 shadow-md shrink-0">
                  <Dices className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-950/80 text-teal-300 border border-teal-500/50 font-mono">
                  10-Ball Draw
                </span>
              </div>

              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-teal-400 block">
                  3,000,000× Max
                </span>
                <h4 className="text-xs sm:text-sm font-black uppercase text-zinc-100 group-hover:text-teal-300 transition-colors">
                  Keno
                </h4>
              </div>

              <p className="text-[10px] text-zinc-400 mt-1 leading-snug line-clamp-2">
                40-ball lottery board with Safe, Vegas 95% RTP, or Degen mode!
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-1">
              <span className="text-[9px] font-mono text-emerald-400 font-bold">
                Min $0.10
              </span>
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-zinc-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-0.5 cursor-pointer transition-all"
              >
                <span>Play</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* GAME 8: LOOT CRATES */}
          <div 
            id="portal-unboxer"
            onClick={() => {
              sound.playChip();
              onNavigate('unboxer');
            }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950/30 via-zinc-900/90 to-zinc-950 border border-purple-500/40 hover:border-purple-400 p-3.5 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-1.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-zinc-950 shadow-md shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/50 font-mono">
                  Instant Drops
                </span>
              </div>

              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-purple-400 block">
                  Case Unboxing
                </span>
                <h4 className="text-xs sm:text-sm font-black uppercase text-zinc-100 group-hover:text-purple-300 transition-colors">
                  Loot Crates
                </h4>
              </div>

              <p className="text-[10px] text-zinc-400 mt-1 leading-snug line-clamp-2">
                Solo 1x-10x multi-openings, or 1v1 and 2v2 high-roller crate battles!
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-1">
              <span className="text-[9px] font-mono text-emerald-400 font-bold">
                Min $0.50
              </span>
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-0.5 cursor-pointer transition-all"
              >
                <span>Open</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Ad Banner placement */}
      <AdBanner 
        placement="lobby-strip" 
        isAdFree={userAccount.isAdFree} 
        onGoAdFree={onOpenPayForAdFree} 
      />

      {/* Clean Bottom Navigation Hub */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[11px]">Daily Reload: $1.00 USD + 100k GC every Midnight EST. Real Cashier active.</span>
        </div>

        <div className="flex items-center gap-2">
          {onToggleChat && (
            <button
              onClick={() => {
                sound.playChip();
                onToggleChat();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold text-[11px] cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Lounge Chat</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => {
                sound.playChip();
                onOpenModeratorLog();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/60 font-black text-[11px] shadow-sm animate-in fade-in cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin Approvals</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playChip();
              onOpenRules();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold text-[11px] cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Rules & Odds</span>
          </button>

          <button
            onClick={() => {
              sound.playChip();
              onOpenStats();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold text-[11px] cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Career Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
};
