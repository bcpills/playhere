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
  Gift
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
  onClaimRakeback?: () => void;
  onOpenModeratorLog: () => void;
  onOpenCashier?: () => void;
  onOpenPayForAdFree?: () => void;
  onInspectPlayer?: (player: PlayerProfileData) => void;
  onToggleChat?: () => void;
}

export const LobbyHome: React.FC<LobbyHomeProps> = ({
  balance,
  cashBalance = 5.00,
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
  const pendingRakeback = userAccount.unclaimedRakeback || 0;

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
    <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-6">
      {/* VIP Lounge Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950/50 via-zinc-950 to-[#0c0817] border-2 border-purple-500/40 p-5 sm:p-7 shadow-2xl shadow-purple-950/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top Lounge Bar Header */}
        <div className="relative z-10 flex items-center justify-between pb-3 mb-4 border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-purple-300">
              CHIPZONE VIP CASINO & SPORTSBOOK
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-400 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-full">
              DUAL CURRENCY: GC & USD
            </span>
            {onOpenCashier && (
              <button
                type="button"
                onClick={() => {
                  sound.playChip();
                  onOpenCashier();
                }}
                className="px-2.5 py-0.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md shadow-emerald-500/20 cursor-pointer transition-all"
              >
                <DollarSign className="w-3 h-3" />
                <span>Real Money Cashier</span>
              </button>
            )}
          </div>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            {/* Clickable Profile Avatar */}
            <div 
              onClick={() => {
                sound.playChip();
                onOpenAccount();
              }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-amber-600 to-yellow-400 p-0.5 shadow-xl shadow-purple-950/50 shrink-0 cursor-pointer hover:scale-105 transition-all group"
              title="Click to edit VIP Profile & Settings"
            >
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-3xl">
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
                  className="text-lg sm:text-2xl font-black tracking-wide text-zinc-100 uppercase hover:text-purple-300 transition-colors cursor-pointer"
                >
                  {userAccount.username || 'Gambler'}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border font-mono ${tierInfo.badgeBg}`}>
                  {tierInfo.tier}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-zinc-400">
                <span>Wager Volume: <strong className="text-zinc-200 font-mono">{formatCompactWager(stats.totalWagered)} GC</strong></span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">{tierInfo.perk}</span>
              </div>
            </div>
          </div>

          {/* Quick Bankroll Overview Box */}
          <div className="flex flex-row sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="flex-1 sm:flex-none p-3 px-4 rounded-2xl bg-zinc-900/90 border border-purple-500/30 text-left min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Gold Coins</span>
              <span className="text-lg sm:text-xl font-black font-mono text-amber-300">
                {(isNaN(balance) ? 1000000 : balance).toLocaleString()}
              </span>
            </div>

            <div className="flex-1 sm:flex-none p-3 px-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 text-left min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Real Cash Balance</span>
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-400">
                ${cashBalance.toFixed(2)} USD
              </span>
            </div>

            {/* Quick ATM / Vault Launch */}
            <button
              type="button"
              onClick={() => {
                sound.playChip();
                onOpenBailout();
              }}
              className="p-3 px-4 rounded-2xl bg-gradient-to-r from-purple-900/80 to-amber-900/80 hover:from-purple-800 hover:to-amber-800 border border-amber-500/50 text-white font-black text-xs uppercase tracking-wider flex flex-col justify-center items-center gap-0.5 cursor-pointer transition-all shadow-lg shrink-0"
            >
              <div className="flex items-center gap-1 text-amber-300">
                <Gift className="w-4 h-4" />
                <span>Daily Dollar</span>
              </div>
              <span className="text-[9px] text-zinc-300 font-mono">{countdown || 'Midnight EST'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* DAILY DOLLAR & MIDNIGHT EST RELOAD BANNER */}
      <div 
        onClick={() => {
          sound.playChip();
          onOpenBailout();
        }}
        className="p-3.5 sm:px-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-zinc-900 to-amber-950/50 border-2 border-emerald-500/40 hover:border-emerald-400 cursor-pointer transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg shadow-emerald-950/30 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
            💵
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black uppercase text-zinc-100 group-hover:text-emerald-300 transition-colors">
                Claim Daily Dollar + 100,000 Coins Reload
              </span>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                12:00 AM EST Daily
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Free $1.00 USD cash balance & 100k Gold Coins added to your bankroll every single day.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-emerald-500 group-hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20 shrink-0"
        >
          <span>Claim in ATM Vault</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Yesterday's Winner Mini-Banner */}
      {yesterdayWinner && (
        <div 
          onClick={() => {
            sound.playChip();
            onNavigate('leaderboard');
          }}
          className="p-3 sm:px-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-zinc-900 to-zinc-950 border border-amber-500/30 hover:border-amber-500/60 cursor-pointer transition-all flex items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl shrink-0">👑</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-zinc-400">Yesterday's Crowned Wager Winner:</span>
              <strong className="text-zinc-100 font-black">{yesterdayWinner.username}</strong>
              <span className="text-amber-300 font-mono font-bold">({yesterdayWinner.formattedScore})</span>
              <span className={`text-[9px] px-2 py-0.2 rounded font-black uppercase ${
                yesterdayWinner.payoutStatus === 'Paid'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {yesterdayWinner.payoutStatus === 'Paid' ? '✓ Payout Sent' : '⏳ Payout Pending'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-amber-400 font-bold text-xs shrink-0">
            <span>Daily Wager Comp</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* CASINO FLOOR: 7 GAMES LIVE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <span>Casino Floor</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
              7 Games Live
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 hidden sm:inline font-mono">
            Original games with dual Gold Coin and Real Cash modes
          </span>
        </div>

        {/* CASINO FLOOR GAMES GRID (2-COL MOBILE, 3-COL DESKTOP) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
          
          {/* GAME 1: ORIGINAL SLOTS (FEATURED) */}
          <div 
            id="portal-slots"
            onClick={() => {
              sound.playChip();
              onNavigate('slots');
            }}
            className="col-span-2 md:col-span-1 group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-950/40 via-zinc-900/90 to-purple-950/40 border-2 border-amber-500/50 hover:border-amber-400 p-3.5 sm:p-5 cursor-pointer transition-all duration-200 hover:shadow-2xl hover:shadow-amber-500/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 border border-yellow-300/50 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform shrink-0 font-black text-xl">
                  🎰
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                    20 Paylines
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                    Real Cash
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                  Original Vegas Video Slots
                </span>
                <h4 className="text-sm sm:text-lg font-black uppercase text-zinc-100 group-hover:text-amber-300 transition-colors">
                  VIP Original Slots
                </h4>
              </div>

              <p className="text-[10px] sm:text-xs text-zinc-400 mt-1 leading-snug line-clamp-2">
                5-Reel classic video slot machine with 3x Scatter Free Spins, Wild 7s, and 500x Diamond Jackpot!
              </p>

              <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 text-amber-300 border border-zinc-800">
                  💎 500x Jackpot
                </span>
                <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 text-purple-300 border border-zinc-800">
                  ⚡ Free Spins Round
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 sm:mt-4 sm:pt-3.5 border-t border-amber-950/60 flex items-center justify-between gap-2">
              <span className="text-[9px] sm:text-xs font-mono text-zinc-400 truncate">
                {stats.roundsPlayedSlots || 0} Spins
              </span>
              <button
                type="button"
                className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1 shadow-md shadow-amber-500/20 group-hover:translate-x-0.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Spin</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* GAME 2: MINES */}
          <div 
            id="portal-mines"
            onClick={() => {
              sound.playChip();
              onNavigate('mines');
            }}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-rose-950/30 via-zinc-900/90 to-zinc-950 border-2 border-rose-500/40 hover:border-rose-400 p-3 sm:p-5 cursor-pointer transition-all duration-200 hover:shadow-2xl hover:shadow-rose-500/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 border border-rose-300/50 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 group-hover:scale-105 transition-transform shrink-0">
                  <Bomb className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/50 font-mono whitespace-nowrap">
                  5x5 Grid
                </span>
              </div>

              <div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-rose-400 block">
                  Multipliers
                </span>
                <h4 className="text-sm sm:text-lg font-black uppercase text-zinc-100 group-hover:text-rose-300 transition-colors">
                  Mines
                </h4>
              </div>

              <p className="text-[10px] sm:text-xs text-zinc-400 mt-1 leading-snug line-clamp-2">
                Uncover hidden diamonds, dodge the bombs, and cash out massive multipliers at any step!
              </p>

              <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 text-rose-300 border border-zinc-800">
                  💣 1-24 Mines
                </span>
                <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 text-emerald-300 border border-zinc-800">
                  💎 5,000,000×
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 sm:mt-4 sm:pt-3.5 border-t border-rose-950/60 flex items-center justify-between gap-2">
              <span className="text-[9px] sm:text-xs font-mono text-zinc-400 truncate">
                {stats.roundsPlayedMines || 0} Runs
              </span>
              <button
                type="button"
                className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1 shadow-md shadow-rose-500/20 group-hover:translate-x-0.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Play</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* GAME 3: BLACKJACK */}
          <div 
            id="portal-blackjack"
            onClick={() => {
              sound.playChip();
              onNavigate('blackjack');
            }}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-950/30 via-zinc-900/90 to-zinc-950 border-2 border-emerald-500/40 hover:border-emerald-400 p-3 sm:p-5 cursor-pointer transition-all duration-200 hover:shadow-2xl hover:shadow-emerald-500/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 border border-emerald-300/50 flex items-center justify-center text-zinc-950 shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform shrink-0">
                  <Spade className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 font-mono whitespace-nowrap">
                  Pays 3:2
                </span>
              </div>

              <div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                  Vegas Felt
                </span>
                <h4 className="text-sm sm:text-lg font-black uppercase text-zinc-100 group-hover:text-emerald-300 transition-colors">
                  Blackjack
                </h4>
              </div>

              <p className="text-[10px] sm:text-xs text-zinc-400 mt-1 leading-snug line-clamp-2">
                6-deck shoe with splits, doubles, 21+3 Poker (100:1), & 1000:1 Queens side bets.
              </p>

              <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 text-amber-300 border border-zinc-800">
                  🃏 21+3 Poker
                </span>
                <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 text-purple-300 border border-zinc-800">
                  👸 1000:1 Queens
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 sm:mt-4 sm:pt-3.5 border-t border-emerald-950/60 flex items-center justify-between gap-2">
              <span className="text-[9px] sm:text-xs font-mono text-zinc-400 truncate">
                {stats.handsPlayedBlackjack} Hands
              </span>
              <button
                type="button"
                className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1 shadow-md shadow-emerald-500/20 group-hover:translate-x-0.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Deal</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* GAME 4: COINFLIP */}
          <div 
            id="portal-coinflip"
            onClick={() => {
              sound.playChip();
              onNavigate('coinflip');
            }}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-yellow-950/30 via-zinc-900/90 to-zinc-950 border-2 border-yellow-500/40 hover:border-yellow-400 p-3 sm:p-5 cursor-pointer transition-all duration-200 hover:shadow-2xl hover:shadow-yellow-500/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 border border-yellow-300/50 flex items-center justify-center text-zinc-950 shadow-lg shadow-yellow-500/30 group-hover:scale-105 transition-transform shrink-0">
                  <Coins className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-yellow-950/80 text-yellow-300 border border-yellow-500/50 font-mono whitespace-nowrap">
                  50/50 Instant
                </span>
              </div>

              <div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-yellow-400 block">
                  Streak Double-Up
                </span>
                <h4 className="text-sm sm:text-lg font-black uppercase text-zinc-100 group-hover:text-yellow-300 transition-colors">
                  Classic Coinflip
                </h4>
              </div>

              <p className="text-[10px] sm:text-xs text-zinc-400 mt-1 leading-snug line-clamp-2">
                Pick Heads or Tails. 3D coin toss with consecutive streak multipliers and instant collect options!
              </p>

              <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 text-amber-300 border border-zinc-800">
                  👑 Heads
                </span>
                <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 text-purple-300 border border-zinc-800">
                  ⚡ Tails
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 sm:mt-4 sm:pt-3.5 border-t border-yellow-950/60 flex items-center justify-between gap-2">
              <span className="text-[9px] sm:text-xs font-mono text-zinc-400 truncate">
                {stats.roundsPlayedCoinflip || 0} Flips
              </span>
              <button
                type="button"
                className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1 shadow-md shadow-yellow-500/20 group-hover:translate-x-0.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Flip</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* GAME 5: DICE DUELS */}
          <div 
            id="portal-dice-duels"
            onClick={() => {
              sound.playChip();
              onNavigate('dice-duels');
            }}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-950/30 via-zinc-900/90 to-zinc-950 border-2 border-indigo-500/40 hover:border-indigo-400 p-3 sm:p-5 cursor-pointer transition-all duration-200 hover:shadow-2xl hover:shadow-indigo-500/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-700 border border-indigo-300/50 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform shrink-0">
                  <Swords className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/50 font-mono whitespace-nowrap">
                  PvP Arena
                </span>
              </div>

              <div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-400 block">
                  Dice Battles
                </span>
                <h4 className="text-sm sm:text-lg font-black uppercase text-zinc-100 group-hover:text-indigo-300 transition-colors">
                  Dice Duels
                </h4>
              </div>

              <p className="text-[10px] sm:text-xs text-zinc-400 mt-1 leading-snug line-clamp-2">
                Challenge opponents to 1v1 rollouts or Best-of-3 arena clashes with consecutive win multipliers!
              </p>

              <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 text-indigo-300 border border-zinc-800">
                  🎲 2-Dice Clash
                </span>
                <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 text-amber-300 border border-zinc-800">
                  ⚔️ Streak Multiplier
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 sm:mt-4 sm:pt-3.5 border-t border-indigo-950/60 flex items-center justify-between gap-2">
              <span className="text-[9px] sm:text-xs font-mono text-zinc-400 truncate">
                {stats.roundsPlayedDiceDuels || 0} Clashes
              </span>
              <button
                type="button"
                className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-zinc-950 font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1 shadow-md shadow-indigo-500/20 group-hover:translate-x-0.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Play</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* GAME 6: KENO */}
          <div 
            id="portal-keno"
            onClick={() => {
              sound.playChip();
              onNavigate('keno');
            }}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-teal-950/30 via-zinc-900/90 to-zinc-950 border-2 border-teal-500/40 hover:border-teal-400 p-3 sm:p-5 cursor-pointer transition-all duration-200 hover:shadow-2xl hover:shadow-teal-500/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-700 border border-teal-300/50 flex items-center justify-center text-zinc-950 shadow-lg shadow-teal-500/30 group-hover:scale-105 transition-transform shrink-0">
                  <Dices className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-950/80 text-teal-300 border border-teal-500/50 font-mono whitespace-nowrap">
                  10-Ball Draw
                </span>
              </div>

              <div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-teal-400 block">
                  Lottery Draw
                </span>
                <h4 className="text-sm sm:text-lg font-black uppercase text-zinc-100 group-hover:text-teal-300 transition-colors">
                  Keno
                </h4>
              </div>

              <p className="text-[10px] sm:text-xs text-zinc-400 mt-1 leading-snug line-clamp-2">
                40-ball board with 10 drawn balls. Safe Grinder, Vegas 95% RTP, or Degen (3,000,000x jackpot).
              </p>

              <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 text-emerald-400 border border-zinc-800">
                  🛡️ Safe
                </span>
                <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 text-amber-300 border border-zinc-800">
                  ⚖️ Vegas
                </span>
                <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 text-rose-400 border border-zinc-800">
                  🔥 3,000,000x
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 sm:mt-4 sm:pt-3.5 border-t border-teal-950/60 flex items-center justify-between gap-2">
              <span className="text-[9px] sm:text-xs font-mono text-zinc-400 truncate">
                {stats.roundsPlayedKeno} Draws
              </span>
              <button
                type="button"
                className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1 shadow-md shadow-teal-500/20 group-hover:translate-x-0.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Play</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* GAME 7: LOOT CRATES */}
          <div 
            id="portal-unboxer"
            onClick={() => {
              sound.playChip();
              onNavigate('unboxer');
            }}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-950/30 via-zinc-900/90 to-zinc-950 border-2 border-purple-500/40 hover:border-purple-400 p-3 sm:p-5 cursor-pointer transition-all duration-200 hover:shadow-2xl hover:shadow-purple-500/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-700 border border-purple-300/50 flex items-center justify-center text-zinc-950 shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform shrink-0">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/50 font-mono whitespace-nowrap">
                  Instant Drops
                </span>
              </div>

              <div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-purple-400 block">
                  Case Openings
                </span>
                <h4 className="text-sm sm:text-lg font-black uppercase text-zinc-100 group-hover:text-purple-300 transition-colors">
                  Loot Crates
                </h4>
              </div>

              <p className="text-[10px] sm:text-xs text-zinc-400 mt-1 leading-snug line-clamp-2">
                Solo multi-open up to 10× at once, or join 1v1 and 2v2 Crate Battles with auto chip payouts.
              </p>

              <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 text-amber-300 border border-zinc-800">
                  ⚡ Multi 1x-10x
                </span>
                <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 text-purple-300 border border-zinc-800">
                  ⚔️ Crate Battles
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 sm:mt-4 sm:pt-3.5 border-t border-purple-950/60 flex items-center justify-between gap-2">
              <span className="text-[9px] sm:text-xs font-mono text-zinc-400 truncate">
                {stats.cratesOpened} Crates
              </span>

              <button
                type="button"
                className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1 shadow-md shadow-purple-600/20 group-hover:translate-x-0.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Open</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* DAILY WAGER TOURNAMENT & LEADERBOARD PROMO */}
      <div 
        id="portal-leaderboard"
        onClick={() => {
          sound.playChip();
          onNavigate('leaderboard');
        }}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-500/40 hover:border-amber-400 p-3.5 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-zinc-950 shadow-md shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-black uppercase text-zinc-100 group-hover:text-amber-300 transition-colors">
                Daily Wager Race & Top 20 Hall of Fame
              </h4>
              <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                12:00 AM EST Winner Crown
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Wager Gold Coins to climb the leaderboard! Top wagerers receive real money cashout payouts at midnight EST. (Admins excluded).
            </p>
          </div>
        </div>

        <button
          type="button"
          className="px-3.5 py-1.5 rounded-xl bg-amber-500 group-hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1 shadow-md shadow-amber-500/20 shrink-0 cursor-pointer"
        >
          <span>View Wager Race</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Ad Banner placement */}
      <AdBanner 
        placement="lobby-strip" 
        isAdFree={userAccount.isAdFree} 
        onGoAdFree={onOpenPayForAdFree} 
      />

      {/* Bottom Hub Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-[11px]">No daily balance wiping. Reload $1.00 USD + 100k GC every Midnight EST. Real Money Cashier active.</span>
        </div>

        <div className="flex items-center gap-2">
          {onToggleChat && (
            <button
              onClick={() => {
                sound.playChip();
                onToggleChat();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[11px] cursor-pointer"
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
              <span>Admin Approvals & Balance Adjuster</span>
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
