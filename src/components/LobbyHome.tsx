import React, { useState, useEffect } from 'react';
import { GameTab, CasinoStats, InventoryItem, UserAccount, DailyWinnerRecord, PlayerProfileData } from '../types';
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
  Send,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { sound } from '../utils/audio';
import { getVIPTier, getVIPTierInfo, getYesterdayWinner, isUserAdmin } from '../utils/leaderboard';
import { getTimeUntilEstMidnight } from '../utils/estTime';
import { AdBanner } from './AdBanner';

interface LobbyHomeProps {
  balance: number;
  netProfit: number;
  stats: CasinoStats;
  inventory: InventoryItem[];
  userAccount: UserAccount;
  dailyWinners: DailyWinnerRecord[];
  onNavigate: (tab: GameTab) => void;
  onOpenBailout: () => void;
  onOpenStats: () => void;
  onOpenRules: () => void;
  onOpenAccount: () => void;
  onOpenModeratorLog: () => void;
  onOpenPayForAdFree?: () => void;
  onInspectPlayer?: (player: PlayerProfileData) => void;
  onToggleChat?: () => void;
}

export const LobbyHome: React.FC<LobbyHomeProps> = ({
  balance,
  netProfit,
  stats,
  inventory,
  userAccount,
  dailyWinners,
  onNavigate,
  onOpenBailout,
  onOpenStats,
  onOpenRules,
  onOpenAccount,
  onOpenModeratorLog,
  onOpenPayForAdFree,
  onInspectPlayer,
  onToggleChat,
}) => {
  const [countdown, setCountdown] = useState<string>('');
  const isAdmin = isUserAdmin(userAccount);

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
      {/* VIP Lounge Hero Banner (Distinct Plush Penthouse Lounge Aesthetic) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950/50 via-zinc-950 to-[#0c0817] border-2 border-purple-500/40 p-5 sm:p-7 shadow-2xl shadow-purple-950/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top Lounge Bar Header */}
        <div className="relative z-10 flex items-center justify-between pb-3 mb-4 border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-purple-300">
              CHIPZONE HIGH-ROLLER LOUNGE
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-full">
            VIP FLOOR ACCESS
          </span>
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
              title="Click to edit VIP Profile & Payout Handle"
            >
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-3xl">
                {userAccount.avatar}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base sm:text-lg font-black text-zinc-100">
                  {userAccount.username || 'Gambler'}
                </span>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${tierInfo.badgeBg}`}>
                  {vipTier}
                </span>

                {userAccount.googleLinked && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <GoogleIcon className="w-2.5 h-2.5" />
                    <span>Google Verified</span>
                  </span>
                )}

                {userAccount.contactHandle && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 ${
                    userAccount.contactPlatform === 'discord'
                      ? 'bg-[#5865F2]/20 text-indigo-300 border border-[#5865F2]/40'
                      : 'bg-[#229ED9]/20 text-sky-300 border border-[#229ED9]/40'
                  }`}>
                    {userAccount.contactPlatform === 'discord' ? <MessageSquare className="w-2.5 h-2.5" /> : <Send className="w-2.5 h-2.5" />}
                    <span>{userAccount.contactHandle}</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
                Welcome to your casino headquarters. Start with <strong className="text-amber-300 font-mono">1,000 chips</strong> every day at 12:00 AM EST with <strong className="text-purple-300">5 ATM Bailouts</strong> (100 chips each). No resets.
              </p>
            </div>
          </div>

          {/* Quick Bankroll & Reset Status */}
          <div className="w-full lg:w-auto flex items-center justify-between lg:justify-end gap-3 p-3.5 rounded-2xl bg-zinc-950/90 border border-purple-500/30 shadow-xl">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-black text-purple-300 tracking-wider">
                Daily Bankroll
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono leading-tight">
                {balance.toLocaleString()} <span className="text-xs text-amber-500 font-normal">Chips</span>
              </span>
            </div>

            <div className="flex flex-col text-right pl-3 border-l border-zinc-800">
              <span className="text-[9px] uppercase font-bold text-zinc-400 flex items-center gap-1 justify-end">
                <Clock className="w-2.5 h-2.5 text-amber-400" />
                <span>12 AM EST Reset</span>
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {countdown || 'Active'}
              </span>
            </div>

            {balance <= 100 && (
              <button
                onClick={() => {
                  sound.playChip();
                  onOpenBailout();
                }}
                className="px-3 py-2 rounded-xl bg-red-950 hover:bg-red-900 border border-red-500/60 text-red-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse shadow-lg cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>ATM</span>
              </button>
            )}
          </div>
        </div>
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
              <span className="font-bold text-zinc-400">Yesterday's Crowned Winner:</span>
              <strong className="text-zinc-100 font-black">{yesterdayWinner.username}</strong>
              <span className="text-amber-300 font-mono font-bold">({yesterdayWinner.formattedScore})</span>
              <span className="text-[10px] text-zinc-500 font-mono">
                via {yesterdayWinner.contactPlatform}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-amber-400 font-bold text-xs shrink-0">
            <span>Leaderboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* CASINO FLOOR: ROWS OF GAME BOXES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <span>Casino Floor Tables</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
              3 Games • 1 Arena
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 hidden sm:inline font-mono">
            Select any table box to enter
          </span>
        </div>

        {/* GAME ROW BOX 1: BLACKJACK & SIDE BETS */}
        <div 
          id="portal-blackjack"
          onClick={() => {
            sound.playChip();
            onNavigate('blackjack');
          }}
          className="group relative overflow-hidden rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/60 p-3.5 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/10"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
            {/* Left Info & Icon Box */}
            <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
              {/* Emblem Box */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-400/50 flex flex-col items-center justify-center text-zinc-950 shadow-md shrink-0 group-hover:scale-105 transition-transform">
                <Spade className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase tracking-tighter">Table 1</span>
              </div>

              {/* Middle Content */}
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm sm:text-base font-black uppercase text-zinc-100 group-hover:text-amber-300 transition-colors">
                    Blackjack & Side Bets
                  </h4>
                  <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                    Pays 3:2
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 hidden xs:inline">
                    6-Deck Shoe
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-md bg-purple-950/80 text-purple-300 border border-purple-500/40">
                    1000:1 Max
                  </span>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-1 sm:line-clamp-none">
                  Vegas rules blackjack with double downs, splits, plus <strong>21+3</strong> (100:1), <strong>Perfect Pairs</strong> (25:1), and <strong>Lucky Ladies</strong> (1000:1).
                </p>

                {/* Feature Chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="text-[10px] px-2 py-0.2 rounded bg-zinc-950 text-zinc-300 border border-zinc-800">
                    🃏 21+3 Poker
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-zinc-950 text-zinc-300 border border-zinc-800">
                    👥 Pairs Match
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-zinc-950 text-zinc-300 border border-zinc-800">
                    👸 Lucky Queens
                  </span>
                </div>
              </div>
            </div>

            {/* Right Action & Stats Box */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
              <span className="text-[11px] font-mono text-zinc-400">
                {stats.handsPlayedBlackjack} Hands Played
              </span>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-amber-500 group-hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/20 group-hover:translate-x-0.5 transition-all cursor-pointer"
              >
                <span>Play Table</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* GAME ROW BOX 2: 40-BALL KENO LOUNGE */}
        <div 
          id="portal-keno"
          onClick={() => {
            sound.playChip();
            onNavigate('keno');
          }}
          className="group relative overflow-hidden rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-500/60 p-3.5 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/10"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
            {/* Left Info & Icon Box */}
            <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
              {/* Emblem Box */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 border border-emerald-400/50 flex flex-col items-center justify-center text-zinc-950 shadow-md shrink-0 group-hover:scale-105 transition-transform">
                <Dices className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase tracking-tighter">Table 2</span>
              </div>

              {/* Middle Content */}
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm sm:text-base font-black uppercase text-zinc-100 group-hover:text-emerald-300 transition-colors">
                    40-Ball Keno Lounge
                  </h4>
                  <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                    10-Ball Draw
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 hidden xs:inline">
                    3 Modes
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-md bg-amber-950/80 text-amber-300 border border-amber-500/40">
                    3-Hit Payouts
                  </span>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-1 sm:line-clamp-none">
                  Compact 40-number board with 10 drawn balls. Play in <strong>Safe Grinder</strong>, <strong>Classic Vegas (~95% RTP)</strong>, or <strong>Bullshit Degen (3,000,000x)</strong>.
                </p>

                {/* Feature Chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="text-[10px] px-2 py-0.2 rounded bg-zinc-950 text-emerald-400 border border-zinc-800">
                    🛡️ Safe
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-zinc-950 text-amber-400 border border-zinc-800">
                    ⚖️ Classic (~95% RTP)
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-zinc-950 text-rose-400 border border-zinc-800">
                    🔥 Degen (3,000,000x)
                  </span>
                </div>
              </div>
            </div>

            {/* Right Action & Stats Box */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
              <span className="text-[11px] font-mono text-zinc-400">
                {stats.roundsPlayedKeno} Rounds Drawn
              </span>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-600/20 group-hover:translate-x-0.5 transition-all cursor-pointer"
              >
                <span>Play Keno</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* GAME ROW BOX 3: CS-STYLE LOOT CRATE UNBOXER */}
        <div 
          id="portal-unboxer"
          onClick={() => {
            sound.playChip();
            onNavigate('unboxer');
          }}
          className="group relative overflow-hidden rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-purple-500/60 p-3.5 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/10"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
            {/* Left Info & Icon Box */}
            <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
              {/* Emblem Box */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-700 border border-purple-400/50 flex flex-col items-center justify-center text-zinc-950 shadow-md shrink-0 group-hover:scale-105 transition-transform">
                <Package className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase tracking-tighter">Vault 3</span>
              </div>

              {/* Middle Content */}
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm sm:text-base font-black uppercase text-zinc-100 group-hover:text-purple-300 transition-colors">
                    Loot Crate Unboxer
                  </h4>
                  <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-md bg-purple-950/80 text-purple-300 border border-purple-500/40">
                    7 Tier Cases
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 hidden xs:inline">
                    Spin Wheel
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-md bg-amber-950/80 text-amber-300 border border-amber-500/40">
                    10 to 5,000 Chips
                  </span>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-1 sm:line-clamp-none">
                  Spin the horizontal CS-style roulette wheel across 7 tiers from budget Bum Bags up to Sovereign Reliquaries and Diamond Whale Coffers.
                </p>

                {/* Feature Chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="text-[10px] px-2 py-0.2 rounded bg-zinc-950 text-zinc-300 border border-zinc-800">
                    📦 Bum Bag (10c)
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-zinc-950 text-blue-400 border border-zinc-800">
                    💎 Whale (1,000c)
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-zinc-950 text-amber-300 border border-zinc-800">
                    👑 Sovereign (5,000c)
                  </span>
                </div>
              </div>
            </div>

            {/* Right Action & Stats Box */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
              <span className="text-[11px] font-mono text-zinc-400">
                {stats.cratesOpened} Crates Opened
              </span>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-purple-600 group-hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-purple-600/20 group-hover:translate-x-0.5 transition-all cursor-pointer"
              >
                <span>Open Crates</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* GAME ROW BOX 4: DAILY TOURNAMENT & HALL OF FAME */}
        <div 
          id="portal-leaderboard"
          onClick={() => {
            sound.playChip();
            onNavigate('leaderboard');
          }}
          className="group relative overflow-hidden rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-yellow-500/60 p-3.5 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-yellow-500/10"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
            {/* Left Info & Icon Box */}
            <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
              {/* Emblem Box */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 border border-yellow-300/50 flex flex-col items-center justify-center text-zinc-950 shadow-md shrink-0 group-hover:scale-105 transition-transform">
                <Crown className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase tracking-tighter">Arena 4</span>
              </div>

              {/* Middle Content */}
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm sm:text-base font-black uppercase text-zinc-100 group-hover:text-yellow-300 transition-colors">
                    Tournament & Top 20 Hall of Fame
                  </h4>
                  <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-md bg-amber-950/80 text-amber-300 border border-amber-500/40">
                    12:00 AM EST Reset
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 hidden xs:inline">
                    Daily Cycle
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    Manual Payouts
                  </span>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-1 sm:line-clamp-none">
                  Compete daily for the crown and secure your place in the <strong>All-Time Top 20 Hall of Fame</strong>. Winners logged directly for casino moderators.
                </p>

                {/* Feature Chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="text-[10px] px-2 py-0.2 rounded bg-zinc-950 text-emerald-400 border border-zinc-800">
                    🏆 Daily Crown Contest
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-zinc-950 text-amber-400 border border-zinc-800">
                    ⭐ Top 20 Peaks
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-zinc-950 text-purple-400 border border-zinc-800">
                    🛡️ Moderator Portal
                  </span>
                </div>
              </div>
            </div>

            {/* Right Action & Stats Box */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
              <span className="text-[11px] font-mono text-zinc-400">
                Daily 1,000 Chip Cycle
              </span>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 group-hover:from-amber-400 group-hover:to-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-yellow-500/20 group-hover:translate-x-0.5 transition-all cursor-pointer"
              >
                <span>Leaderboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
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

      {/* Bottom Hub Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-[11px]">No resets. Start with 1,000 chips at 12:00 AM EST every day.</span>
        </div>

        <div className="flex items-center gap-2">
          {onToggleChat && (
            <button
              onClick={() => {
                sound.playChip();
                onToggleChat();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[11px]"
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
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/60 font-black text-[11px] shadow-sm animate-in fade-in"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Pending Payouts</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playChip();
              onOpenRules();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold text-[11px]"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Rules & Odds</span>
          </button>

          <button
            onClick={() => {
              sound.playChip();
              onOpenStats();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold text-[11px]"
          >
            <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Career Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
};
