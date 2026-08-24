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
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950/30 via-[#0d091a] to-zinc-950 border border-purple-900/40 p-4 sm:p-6 shadow-2xl shadow-purple-950/20">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            {/* Clickable Profile Avatar */}
            <div 
              onClick={() => {
                sound.playChip();
                onOpenAccount();
              }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600/40 via-amber-600/30 to-yellow-400/30 border-2 border-purple-400/50 flex items-center justify-center text-3xl shadow-xl shadow-purple-950/40 shrink-0 cursor-pointer hover:scale-105 transition-transform"
              title="Click to edit VIP Profile & Payout Handle"
            >
              {userAccount.avatar}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm sm:text-base font-black text-zinc-100">
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
                  <span className={`text-[10px] font-mono px-2 py-0.2 rounded flex items-center gap-1 ${
                    userAccount.contactPlatform === 'discord'
                      ? 'bg-[#5865F2]/20 text-indigo-300'
                      : 'bg-[#229ED9]/20 text-sky-300'
                  }`}>
                    {userAccount.contactPlatform === 'discord' ? <MessageSquare className="w-2.5 h-2.5" /> : <Send className="w-2.5 h-2.5" />}
                    <span>{userAccount.contactHandle}</span>
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-xl font-black tracking-wide uppercase bg-gradient-to-r from-zinc-100 via-purple-100 to-amber-200 bg-clip-text text-transparent">
                ChipZone Lounge
              </h2>
              <p className="text-xs text-zinc-400 max-w-xl">
                1,000 daily starting chips. 12:00 AM EST reset. 5 ATM reloads (100 chips each). No resets.
              </p>
            </div>
          </div>

          {/* Quick Bankroll & Reset Status */}
          <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2.5 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-inner">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">
                Daily Bankroll
              </span>
              <span className="text-lg sm:text-xl font-black text-amber-300 font-mono leading-none">
                {balance.toLocaleString()} <span className="text-xs text-amber-500 font-normal">Chips</span>
              </span>
            </div>

            <div className="flex flex-col text-right pl-2 border-l border-zinc-800">
              <span className="text-[9px] uppercase font-bold text-zinc-500 flex items-center gap-1 justify-end">
                <Clock className="w-2.5 h-2.5 text-amber-400" />
                <span>12 AM EST</span>
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
                className="px-3 py-1.5 rounded-xl bg-red-950 hover:bg-red-900 border border-red-500/50 text-red-300 text-xs font-black uppercase tracking-wider flex items-center gap-1 animate-pulse shadow-md"
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

      {/* Main Game & Feature Portals (Bento Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* 1. Classic Blackjack Card */}
        <div 
          id="portal-blackjack"
          onClick={() => {
            sound.playChip();
            onNavigate('blackjack');
          }}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800 hover:border-amber-500/50 p-4 sm:p-5 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 transform hover:-translate-y-0.5 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-xl shadow-md text-zinc-950">
                  <Spade className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-zinc-100 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                    <span>Blackjack & Side Bets</span>
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400">PAYS 3:2 • 6-DECK SHOE</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-950/80 text-purple-300 border border-purple-500/40">
                1000:1 Max
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Classic casino blackjack with real split hands, double downs, and three lucrative side bets: <strong>21+3</strong> (100:1), <strong>Perfect Pairs</strong> (25:1), and <strong>Lucky Ladies</strong> (1000:1).
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-950 text-zinc-300 border border-zinc-800">
                🃏 21+3 Poker
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-950 text-zinc-300 border border-zinc-800">
                👥 Pairs Match
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-950 text-zinc-300 border border-zinc-800">
                👸 Lucky Queens
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-mono text-[11px]">
              {stats.handsPlayedBlackjack} Hands Played
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-black uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              <span>Play Blackjack</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* 2. 40-Ball Keno Lounge Card */}
        <div 
          id="portal-keno"
          onClick={() => {
            sound.playChip();
            onNavigate('keno');
          }}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800 hover:border-amber-500/50 p-4 sm:p-5 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 transform hover:-translate-y-0.5 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-xl shadow-md text-zinc-950">
                  <Dices className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-zinc-100 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                    <span>40-Ball Keno Lounge</span>
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400">10-BALL DRAW • 3 MODES</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                3-Hit Payouts
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Compact 40-number board with 10 drawn balls. Play in <strong>Safe Grinder</strong>, <strong>Classic Vegas</strong>, or <strong>Bullshit Degen</strong> volatility modes with guaranteed payouts on 3 hits.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-950 text-emerald-400 border border-zinc-800">
                🛡️ Safe (Low Risk)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-950 text-amber-400 border border-zinc-800">
                ⚖️ Classic (~95% RTP)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-950 text-rose-400 border border-zinc-800">
                🔥 Degen (3,000,000x)
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-mono text-[11px]">
              {stats.roundsPlayedKeno} Rounds Drawn
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-black uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              <span>Play Keno</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* 3. CS-Style Loot Crate Unboxer Card */}
        <div 
          id="portal-unboxer"
          onClick={() => {
            sound.playChip();
            onNavigate('unboxer');
          }}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800 hover:border-amber-500/50 p-4 sm:p-5 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 transform hover:-translate-y-0.5 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-xl shadow-md text-zinc-950">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-zinc-100 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                    <span>Loot Crate Unboxer</span>
                  </h3>
                  <span className="text-[10px] font-mono text-purple-400">7 TIERED CASES • SPIN WHEEL</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-950/80 text-amber-300 border border-amber-500/40">
                10 to 5,000 Chips
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Spin the horizontal roulette wheel across 7 tiers from budget Bum Bags up to Sovereign Reliquaries and Diamond Whale Coffers.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-950 text-zinc-300 border border-zinc-800">
                📦 Bum Bag (10c)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-950 text-blue-400 border border-zinc-800">
                💎 Whale (1,000c)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-950 text-amber-300 border border-zinc-800">
                👑 Sovereign (5,000c)
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-mono text-[11px]">
              {stats.cratesOpened} Crates Opened
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-black uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              <span>Open Cases</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* 4. Daily Leaderboard & Hall of Fame Card */}
        <div 
          id="portal-leaderboard"
          onClick={() => {
            sound.playChip();
            onNavigate('leaderboard');
          }}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800 hover:border-amber-500/50 p-4 sm:p-5 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 transform hover:-translate-y-0.5 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-xl shadow-md text-zinc-950">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-zinc-100 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                    <span>Tournament & Top 20</span>
                  </h3>
                  <span className="text-[10px] font-mono text-amber-400">12:00 AM EST RESET</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                Manual Payouts
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Compete daily for the crown and reach the <strong>All-Time Top 20 Hall of Fame</strong>. Winners logged directly for casino moderators.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-950 text-emerald-400 border border-zinc-800">
                🏆 Yesterday's Winner
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-950 text-amber-400 border border-zinc-800">
                ⭐ Top 20 Peak Heights
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-950 text-purple-400 border border-zinc-800">
                🛡️ Moderator Portal
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-mono text-[11px]">
              Daily 1,000 Chip Cycle
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-black uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              <span>View Leaderboard</span>
              <ChevronRight className="w-4 h-4" />
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
