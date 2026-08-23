import React, { useState, useEffect } from 'react';
import { UserAccount, CasinoStats, InventoryItem, LeaderboardCategory, LeaderboardEntry } from '../types';
import { 
  getDailyLeaderboard, 
  getTimeUntilDailyReset, 
  getVIPTierInfo 
} from '../utils/leaderboard';
import { sound } from '../utils/audio';
import { 
  Trophy, 
  TrendingUp, 
  Zap, 
  Coins, 
  Clock, 
  Crown, 
  Award, 
  Sparkles, 
  User, 
  ShieldCheck,
  Package
} from 'lucide-react';

interface DailyLeaderboardProps {
  userAccount: UserAccount;
  stats: CasinoStats;
  inventory: InventoryItem[];
  balance: number;
  onOpenAccount: () => void;
}

export const DailyLeaderboard: React.FC<DailyLeaderboardProps> = ({
  userAccount,
  stats,
  inventory,
  balance,
  onOpenAccount,
}) => {
  const [category, setCategory] = useState<LeaderboardCategory>('profit');
  const [countdown, setCountdown] = useState<string>('');

  // Ticking countdown timer to daily reset
  useEffect(() => {
    const updateTime = () => {
      const { formatted } = getTimeUntilDailyReset();
      setCountdown(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const leaderboardEntries = getDailyLeaderboard(category, userAccount, stats, inventory);
  const userRankEntry = leaderboardEntries.find(e => e.isUser);

  const top3 = leaderboardEntries.slice(0, 3);
  const remainingRanks = leaderboardEntries.slice(3);

  const categoryLabels: Record<LeaderboardCategory, { label: string; icon: React.ReactNode; desc: string }> = {
    profit: {
      label: 'Daily Net Profit',
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      desc: 'Top chip earners across all games today.',
    },
    multiplier: {
      label: 'Biggest Multiplier',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      desc: 'Highest single-round multiplier hit today.',
    },
    volume: {
      label: 'High-Roller Volume',
      icon: <Coins className="w-4 h-4 text-purple-400" />,
      desc: 'Total chips wagered in the casino today.',
    },
    vault: {
      label: 'Trophy Vault Net Worth',
      icon: <Trophy className="w-4 h-4 text-yellow-400" />,
      desc: 'Most valuable loot crate collections.',
    },
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-6">
      {/* Header Banner & Reset Timer */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-2xl font-black text-amber-400">
              🏆
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-zinc-100">
                Daily High-Roller Leaderboard
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                LIVE SEASON
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Compete against top casino degens. Top 3 finishers claim bonus chips at daily reset!
            </p>
          </div>
        </div>

        {/* Live Reset Countdown & User Standing */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          <div className="px-3.5 py-2 rounded-2xl bg-zinc-950/90 border border-zinc-800 shadow-inner flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <div className="flex flex-col text-right">
              <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                Resets In (00:00 UTC)
              </span>
              <span className="text-xs font-mono font-black text-amber-300">
                {countdown || 'Calculating...'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playChip();
              onOpenAccount();
            }}
            className="px-3 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span>{userAccount.avatar}</span>
            <span className="hidden sm:inline">Profile</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(Object.keys(categoryLabels) as LeaderboardCategory[]).map((cat) => {
          const info = categoryLabels[cat];
          const isSelected = category === cat;

          return (
            <button
              key={cat}
              id={`leaderboard-tab-${cat}`}
              onClick={() => {
                sound.playChip();
                setCategory(cat);
              }}
              className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                isSelected
                  ? 'bg-zinc-900 border-amber-400 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/10 scale-102'
                  : 'bg-zinc-950/80 border-zinc-800/90 hover:border-zinc-700 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                {info.icon}
                {isSelected && (
                  <span className="text-[9px] font-black uppercase text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded-md">
                    Active
                  </span>
                )}
              </div>
              <div>
                <div className={`text-xs font-black uppercase ${isSelected ? 'text-zinc-100' : 'text-zinc-300'}`}>
                  {info.label}
                </div>
                <div className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">
                  {info.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* User Current Standing Hero Bar */}
      {userRankEntry && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-950 border-2 border-amber-500/50 shadow-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-zinc-950 font-black text-sm font-mono flex items-center justify-center shadow-md">
              #{userRankEntry.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-zinc-100">
                  {userAccount.avatar} {userAccount.username}
                </span>
                <span className="text-[9px] px-2 py-0.2 rounded-full font-black uppercase bg-amber-500 text-zinc-950">
                  YOU
                </span>
              </div>
              <span className="text-xs text-zinc-400">
                Your Current Score: <strong className="text-amber-300 font-mono">{userRankEntry.formattedScore}</strong>
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">
              Estimated Daily Reward
            </span>
            <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
              {userRankEntry.rank === 1 ? '+2,500 Chips' : userRankEntry.rank === 2 ? '+1,500 Chips' : userRankEntry.rank === 3 ? '+750 Chips' : '+200 Chips'}
            </span>
          </div>
        </div>
      )}

      {/* TOP 3 PODIUM CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
        {/* 2nd Place */}
        {top3[1] && (
          <div className={`p-4 rounded-3xl border-2 flex flex-col justify-between text-center relative order-2 sm:order-1 ${
            top3[1].isUser
              ? 'bg-zinc-900 border-amber-400 ring-2 ring-amber-400/40 shadow-xl'
              : 'bg-zinc-950/90 border-slate-700/80 shadow-lg'
          }`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-400 text-zinc-950 font-black text-[10px] uppercase tracking-wider shadow-md">
              🥈 2nd Place
            </div>

            <div className="pt-2">
              <span className="text-4xl block mb-2">{top3[1].avatar}</span>
              <h3 className="text-sm font-black text-zinc-100 truncate">
                {top3[1].username} {top3[1].isUser && <span className="text-amber-400 text-xs">(YOU)</span>}
              </h3>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                {top3[1].vipTier}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800">
              <div className="text-[10px] uppercase font-bold text-zinc-500">Score</div>
              <div className="text-base font-mono font-black text-amber-300">
                {top3[1].formattedScore}
              </div>
              <div className="text-[10px] font-bold text-emerald-400 mt-1">
                Prize: +1,500 Chips
              </div>
            </div>
          </div>
        )}

        {/* 1st Place (Champion) */}
        {top3[0] && (
          <div className={`p-5 rounded-3xl border-2 flex flex-col justify-between text-center relative order-1 sm:order-2 sm:-translate-y-2 ${
            top3[0].isUser
              ? 'bg-zinc-900 border-amber-300 ring-4 ring-amber-400/50 shadow-2xl shadow-amber-500/20'
              : 'bg-gradient-to-b from-amber-950/30 to-zinc-950 border-amber-500/60 shadow-2xl'
          }`}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>🥇 1st Place Champion</span>
            </div>

            <div className="pt-3">
              <span className="text-5xl block mb-2 animate-bounce">{top3[0].avatar}</span>
              <h3 className="text-base font-black text-zinc-100 truncate">
                {top3[0].username} {top3[0].isUser && <span className="text-amber-300 text-xs">(YOU)</span>}
              </h3>
              <span className="text-xs text-amber-400 font-bold block mt-0.5">
                {top3[0].vipTier}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-500/30">
              <div className="text-[10px] uppercase font-bold text-zinc-400">Winning Score</div>
              <div className="text-lg font-mono font-black text-amber-300">
                {top3[0].formattedScore}
              </div>
              <div className="text-xs font-black text-emerald-400 mt-1">
                🏆 Grand Prize: +2,500 Chips
              </div>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <div className={`p-4 rounded-3xl border-2 flex flex-col justify-between text-center relative order-3 ${
            top3[2].isUser
              ? 'bg-zinc-900 border-amber-400 ring-2 ring-amber-400/40 shadow-xl'
              : 'bg-zinc-950/90 border-amber-900/40 shadow-lg'
          }`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-700 text-zinc-100 font-black text-[10px] uppercase tracking-wider shadow-md">
              🥉 3rd Place
            </div>

            <div className="pt-2">
              <span className="text-4xl block mb-2">{top3[2].avatar}</span>
              <h3 className="text-sm font-black text-zinc-100 truncate">
                {top3[2].username} {top3[2].isUser && <span className="text-amber-400 text-xs">(YOU)</span>}
              </h3>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                {top3[2].vipTier}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800">
              <div className="text-[10px] uppercase font-bold text-zinc-500">Score</div>
              <div className="text-base font-mono font-black text-amber-300">
                {top3[2].formattedScore}
              </div>
              <div className="text-[10px] font-bold text-emerald-400 mt-1">
                Prize: +750 Chips
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FULL LEADERBOARD TABLE */}
      <div className="rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs sm:text-sm font-black uppercase text-zinc-200">
              Complete Daily Rankings ({leaderboardEntries.length} Players)
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Updated Live
          </span>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {leaderboardEntries.map((entry) => {
            const tierInfo = getVIPTierInfo(entry.vipTier);
            return (
              <div
                key={entry.id}
                className={`p-3 sm:px-4 flex items-center justify-between gap-3 transition-colors ${
                  entry.isUser
                    ? 'bg-amber-500/10 border-l-4 border-amber-400'
                    : 'hover:bg-zinc-900/50'
                }`}
              >
                {/* Left: Rank & User Info */}
                <div className="flex items-center gap-3">
                  <span className={`w-7 text-center font-mono font-black text-xs sm:text-sm ${
                    entry.rank === 1
                      ? 'text-yellow-400 font-black text-base'
                      : entry.rank === 2
                      ? 'text-slate-300'
                      : entry.rank === 3
                      ? 'text-amber-600'
                      : 'text-zinc-500'
                  }`}>
                    #{entry.rank}
                  </span>

                  <span className="text-xl sm:text-2xl shrink-0">{entry.avatar}</span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-zinc-100">
                        {entry.username}
                      </span>
                      {entry.isUser && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500 text-zinc-950">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold ${tierInfo.text}`}>
                      {entry.vipTier}
                    </span>
                  </div>
                </div>

                {/* Right: Score */}
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-mono font-black text-amber-300">
                    {entry.formattedScore}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {category === 'profit' ? 'Net Chips' : category === 'multiplier' ? 'Multiplier' : category === 'volume' ? 'Total Bets' : 'Vault Net Worth'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rules & Integrity Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-[11px]">
            Daily leaderboards calculate all gameplay live in real time. Daily prizes are automatically awarded at midnight UTC.
          </span>
        </div>
      </div>
    </div>
  );
};
