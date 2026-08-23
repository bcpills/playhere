import React from 'react';
import { GameTab, CasinoStats, InventoryItem, UserAccount } from '../types';
import { 
  Spade, 
  Dices, 
  Package, 
  Trophy, 
  ShieldAlert, 
  TrendingUp, 
  Sparkles, 
  Award, 
  Flame, 
  ChevronRight,
  HelpCircle,
  BarChart2,
  Crown,
  Gift,
  Zap,
  Clock
} from 'lucide-react';
import { sound } from '../utils/audio';
import { getVIPTier, getVIPTierInfo, getTimeUntilDailyReset } from '../utils/leaderboard';

interface LobbyHomeProps {
  balance: number;
  netProfit: number;
  stats: CasinoStats;
  inventory: InventoryItem[];
  userAccount: UserAccount;
  onNavigate: (tab: GameTab) => void;
  onOpenBailout: () => void;
  onOpenStats: () => void;
  onOpenRules: () => void;
  onOpenAccount: () => void;
}

export const LobbyHome: React.FC<LobbyHomeProps> = ({
  balance,
  netProfit,
  stats,
  inventory,
  userAccount,
  onNavigate,
  onOpenBailout,
  onOpenStats,
  onOpenRules,
  onOpenAccount,
}) => {
  const vaultValue = inventory.reduce((sum, item) => sum + item.item.value, 0);
  const vipTier = getVIPTier(stats.totalWagered);
  const tierInfo = getVIPTierInfo(vipTier);

  const ONE_DAY_MS = 86400000;
  const canClaimDaily = Date.now() - (userAccount.lastDailyClaim || 0) >= ONE_DAY_MS;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 p-4 sm:p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            {/* Clickable Profile Avatar */}
            <div 
              onClick={() => {
                sound.playChip();
                onOpenAccount();
              }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600/30 to-yellow-400/20 border-2 border-amber-400/50 flex items-center justify-center text-3xl shadow-xl shrink-0 cursor-pointer hover:scale-105 transition-transform"
              title="Click to edit VIP Profile & Claim Daily Bonus"
            >
              {userAccount.avatar}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm sm:text-base font-black text-zinc-100">
                  {userAccount.username}
                </span>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${tierInfo.badgeBg}`}>
                  {vipTier}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Session: <strong className={netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{netProfit >= 0 ? `+${netProfit.toLocaleString()}` : netProfit.toLocaleString()}</strong>
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black tracking-wide text-zinc-200 uppercase">
                The Bullshit Casino Lounge
              </h2>
              <p className="text-xs text-zinc-400 max-w-xl">
                High-volatility 40-ball Keno, multi-side-bet Vegas Blackjack, and authentic animated CS-style loot crate unboxing.
              </p>
            </div>
          </div>

          {/* Quick Bankroll & Daily Claim Action */}
          <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2.5 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-inner">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">
                Current Bankroll
              </span>
              <span className="text-lg sm:text-xl font-black text-amber-300 font-mono leading-none">
                {balance.toLocaleString()} <span className="text-xs text-amber-500 font-normal">Chips</span>
              </span>
            </div>

            {canClaimDaily && (
              <button
                onClick={() => {
                  sound.playChip();
                  onOpenAccount();
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 animate-pulse shadow-md"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Daily Bonus</span>
              </button>
            )}

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

        {/* 4. Daily Leaderboard Portal Card */}
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
                    <span>Daily Leaderboard</span>
                  </h3>
                  <span className="text-[10px] font-mono text-amber-400">4 CATEGORIES • LIVE RANKS</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                +2,500 1st Prize
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Climb the ranks in Daily Net Profit, Max Multipliers, Total Wager Volume, and Trophy Vault Worth. Daily midnight UTC prize distribution!
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-950 text-emerald-400 border border-zinc-800">
                📈 Top Profit
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-950 text-amber-400 border border-zinc-800">
                ⚡ Multipliers
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-950 text-purple-400 border border-zinc-800">
                🎰 High Rollers
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-mono text-[11px]">
              Season Ends at 00:00 UTC
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-black uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              <span>View Leaderboard</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Career Quick Stats & Quick Actions Toolbar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-inner">
        <div className="flex flex-col p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-center">
          <span className="text-[9px] uppercase font-bold text-zinc-500">Total Wagered</span>
          <span className="text-xs sm:text-sm font-black text-zinc-200 font-mono">{stats.totalWagered.toLocaleString()}</span>
        </div>

        <div className="flex flex-col p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-center">
          <span className="text-[9px] uppercase font-bold text-zinc-500">Total Won</span>
          <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">{stats.totalWon.toLocaleString()}</span>
        </div>

        <div className="flex flex-col p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-center">
          <span className="text-[9px] uppercase font-bold text-zinc-500">Biggest Win</span>
          <span className="text-xs sm:text-sm font-black text-amber-300 font-mono">{stats.biggestWin.toLocaleString()}</span>
        </div>

        <div className="flex flex-col p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-center">
          <span className="text-[9px] uppercase font-bold text-zinc-500">Max Multiplier</span>
          <span className="text-xs sm:text-sm font-black text-purple-300 font-mono">{stats.biggestMultiplier > 0 ? `${stats.biggestMultiplier}x` : '—'}</span>
        </div>
      </div>

      {/* Bottom Hub Actions: Rules, Dossier, ATM */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-[11px]">Fair ~95% RTP calibrated on all games. Real simulated card shoe & RNG.</span>
        </div>

        <div className="flex items-center gap-2">
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

