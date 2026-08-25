import React, { useState, useEffect } from 'react';
import { 
  UserAccount, 
  CasinoStats, 
  InventoryItem, 
  LeaderboardCategory, 
  LeaderboardEntry,
  DailyWinnerRecord,
  AllTimePeakRecord,
  PlayerProfileData
} from '../types';
import { 
  getDailyLeaderboard, 
  getYesterdayWinner, 
  getVIPTierInfo,
  isUserAdmin
} from '../utils/leaderboard';
import { getTimeUntilEstMidnight } from '../utils/estTime';
import { sound } from '../utils/audio';
import { AdBanner } from './AdBanner';
import { 
  Trophy, 
  TrendingUp, 
  Zap, 
  Coins, 
  Clock, 
  Crown, 
  Award, 
  Sparkles, 
  ShieldCheck,
  Send,
  MessageSquare,
  Flame,
  Star,
  Layers
} from 'lucide-react';

interface DailyLeaderboardProps {
  userAccount: UserAccount;
  stats: CasinoStats;
  balance: number;
  dailyWinners: DailyWinnerRecord[];
  allTimePeaks: AllTimePeakRecord[];
  onOpenAccount: () => void;
  onOpenModeratorLog: () => void;
  onOpenPayForAdFree?: () => void;
  onInspectPlayer?: (player: PlayerProfileData) => void;
}

export const DailyLeaderboard: React.FC<DailyLeaderboardProps> = ({
  userAccount,
  stats,
  balance,
  dailyWinners,
  allTimePeaks,
  onOpenAccount,
  onOpenModeratorLog,
  onOpenPayForAdFree,
  onInspectPlayer,
}) => {
  const [activeView, setActiveView] = useState<'daily' | 'all-time'>('daily');
  const [category, setCategory] = useState<LeaderboardCategory>('profit');
  const [countdown, setCountdown] = useState<string>('');
  const isAdmin = isUserAdmin(userAccount);

  // Live ticking countdown timer to 12:00 AM EST
  useEffect(() => {
    const updateTime = () => {
      const { formatted } = getTimeUntilEstMidnight();
      setCountdown(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const yesterdayWinner = getYesterdayWinner(dailyWinners);
  const dailyEntries = getDailyLeaderboard(category, userAccount, stats, balance);
  const userDailyRank = dailyEntries.find(e => e.isUser);

  const top3Daily = dailyEntries.slice(0, 3);
  const remainingDaily = dailyEntries.slice(3);

  const categoryLabels: Record<LeaderboardCategory, { label: string; icon: React.ReactNode; desc: string }> = {
    profit: {
      label: 'Today’s Chip Height',
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      desc: 'Active chip balance & net worth today.',
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
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-8">
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
                Casino Tournament Leaderboards
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                12:00 AM EST RESET
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              1,000 daily starting chips. Highest daily chip height crowned champion and paid out manually!
            </p>
          </div>
        </div>

        {/* Live Reset Countdown & Mod Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          <div className="px-3.5 py-2 rounded-2xl bg-zinc-950/90 border border-zinc-800 shadow-inner flex items-center gap-2 text-xs">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <div className="flex flex-col text-right">
              <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                12:00 AM EST Reset In
              </span>
              <span className="text-xs font-mono font-black text-amber-300">
                {countdown || 'Calculating...'}
              </span>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                sound.playChip();
                onOpenModeratorLog();
              }}
              className="px-3 py-2 rounded-2xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/60 text-purple-200 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all animate-in fade-in"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Pending Payouts</span>
            </button>
          )}

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

      {/* YESTERDAY'S WINNER CROWNED CARD */}
      {yesterdayWinner && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-zinc-950 to-zinc-900 border-2 border-amber-500/50 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 text-8xl opacity-10 pointer-events-none">
            👑
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center">
                  <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-3xl">
                    {yesterdayWinner.avatar}
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-md">
                  <Crown className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 tracking-wider">
                    👑 Yesterday's Crowned Winner ({yesterdayWinner.formattedDate})
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <h3 className="text-base sm:text-lg font-black text-zinc-100">
                    {yesterdayWinner.username}
                  </h3>
                  <span className="text-xs font-bold text-amber-400">
                    • {yesterdayWinner.vipTier}
                  </span>
                </div>

                {/* Winner info */}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                    yesterdayWinner.payoutStatus === 'Paid'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {yesterdayWinner.payoutStatus === 'Paid' ? '✓ Payout Sent' : '⏳ Payout Pending'}
                  </span>
                  {isAdmin && (
                    <span className="text-[10px] text-zinc-400 font-mono">
                      ({yesterdayWinner.contactPlatform}: {yesterdayWinner.contactHandle})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-800 w-full sm:w-auto">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                Yesterday's Winning Total
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-amber-300">
                {yesterdayWinner.formattedScore}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                Logged for manual moderator payout
              </span>
            </div>
          </div>
        </div>
      )}

      {/* AD BANNER SLOT */}
      <AdBanner 
        placement="leaderboard-top" 
        isAdFree={userAccount.isAdFree}
        onGoAdFree={onOpenPayForAdFree}
      />

      {/* LEADERBOARD VIEW SWITCHER (Daily Tournament vs. Top 20 All-Time) */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playChip();
              setActiveView('daily');
            }}
            className={`px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeView === 'daily'
                ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Today’s Tournament</span>
          </button>

          <button
            onClick={() => {
              sound.playChip();
              setActiveView('all-time');
            }}
            className={`px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeView === 'all-time'
                ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>All-Time Top 20 Chip Heights</span>
          </button>
        </div>

        <span className="text-xs text-zinc-500 font-mono hidden md:inline">
          {activeView === 'daily' ? 'Resets 12:00 AM EST' : 'Permanent Hall of Fame'}
        </span>
      </div>

      {activeView === 'daily' ? (
        <>
          {/* Category Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
          {userDailyRank && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-950 border-2 border-amber-500/50 shadow-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-zinc-950 font-black text-sm font-mono flex items-center justify-center shadow-md">
                  #{userDailyRank.rank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-zinc-100">
                      {userAccount.avatar} {userAccount.username || 'You'}
                    </span>
                    <span className="text-[9px] px-2 py-0.2 rounded-full font-black uppercase bg-amber-500 text-zinc-950">
                      YOU
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400">
                    Your Current Standings: <strong className="text-amber-300 font-mono">{userDailyRank.formattedScore}</strong>
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                  Tournament Status
                </span>
                <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
                  {userDailyRank.rank === 1 ? '🥇 1st Place (Crown Contender)' : userDailyRank.rank <= 3 ? '🏆 Top 3 Leader' : 'Active Contender'}
                </span>
              </div>
            </div>
          )}

          {/* TOP 3 PODIUM CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
            {/* 2nd Place */}
            {top3Daily[1] && (
              <div className={`p-4 rounded-3xl border-2 flex flex-col justify-between text-center relative order-2 sm:order-1 ${
                top3Daily[1].isUser
                  ? 'bg-zinc-900 border-amber-400 ring-2 ring-amber-400/40 shadow-xl'
                  : 'bg-zinc-950/90 border-slate-700/80 shadow-lg'
              }`}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-400 text-zinc-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                  🥈 2nd Place
                </div>

                <div className="pt-2">
                  <span className="text-4xl block mb-2">{top3Daily[1].avatar}</span>
                  <h3 className="text-sm font-black text-zinc-100 truncate">
                    {top3Daily[1].username} {top3Daily[1].isUser && <span className="text-amber-400 text-xs">(YOU)</span>}
                  </h3>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    {top3Daily[1].vipTier}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800">
                  <div className="text-[10px] uppercase font-bold text-zinc-500">Current Score</div>
                  <div className="text-base font-mono font-black text-amber-300">
                    {top3Daily[1].formattedScore}
                  </div>
                </div>
              </div>
            )}

            {/* 1st Place (Champion) */}
            {top3Daily[0] && (
              <div className={`p-5 rounded-3xl border-2 flex flex-col justify-between text-center relative order-1 sm:order-2 sm:-translate-y-2 ${
                top3Daily[0].isUser
                  ? 'bg-zinc-900 border-amber-300 ring-4 ring-amber-400/50 shadow-2xl shadow-amber-500/20'
                  : 'bg-gradient-to-b from-amber-950/30 to-zinc-950 border-amber-500/60 shadow-2xl'
              }`}>
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 fill-current" />
                  <span>🥇 1st Place Contender</span>
                </div>

                <div className="pt-3">
                  <span className="text-5xl block mb-2">{top3Daily[0].avatar}</span>
                  <h3 className="text-base font-black text-zinc-100 truncate">
                    {top3Daily[0].username} {top3Daily[0].isUser && <span className="text-amber-300 text-xs">(YOU)</span>}
                  </h3>
                  <span className="text-xs text-amber-400 font-bold block mt-0.5">
                    {top3Daily[0].vipTier}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-500/30">
                  <div className="text-[10px] uppercase font-bold text-zinc-400">Leading Score</div>
                  <div className="text-lg font-mono font-black text-amber-300">
                    {top3Daily[0].formattedScore}
                  </div>
                  <div className="text-xs font-black text-emerald-400 mt-1">
                    👑 Crowns at 12:00 AM EST
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3Daily[2] && (
              <div className={`p-4 rounded-3xl border-2 flex flex-col justify-between text-center relative order-3 ${
                top3Daily[2].isUser
                  ? 'bg-zinc-900 border-amber-400 ring-2 ring-amber-400/40 shadow-xl'
                  : 'bg-zinc-950/90 border-amber-900/40 shadow-lg'
              }`}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-700 text-zinc-100 font-black text-[10px] uppercase tracking-wider shadow-md">
                  🥉 3rd Place
                </div>

                <div className="pt-2">
                  <span className="text-4xl block mb-2">{top3Daily[2].avatar}</span>
                  <h3 className="text-sm font-black text-zinc-100 truncate">
                    {top3Daily[2].username} {top3Daily[2].isUser && <span className="text-amber-400 text-xs">(YOU)</span>}
                  </h3>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    {top3Daily[2].vipTier}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800">
                  <div className="text-[10px] uppercase font-bold text-zinc-500">Current Score</div>
                  <div className="text-base font-mono font-black text-amber-300">
                    {top3Daily[2].formattedScore}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FULL DAILY LEADERBOARD TABLE */}
          <div className="rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl overflow-hidden">
            <div className="p-3.5 sm:p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-black uppercase text-zinc-200">
                  Daily Tournament Rankings ({dailyEntries.length} Active Degens)
                </h3>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                Live EST Tournament
              </span>
            </div>

            <div className="divide-y divide-zinc-800/60">
              {dailyEntries.map((entry) => {
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
                        {category === 'profit' ? 'Total Chips' : category === 'multiplier' ? 'Multiplier' : category === 'volume' ? 'Total Bets' : 'Vault Value'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* ALL-TIME TOP 20 CHIP HEIGHTS (HALL OF FAME) */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-950 to-zinc-900 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-lg">
                🏛️
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-zinc-100">
                  All-Time Top 20 Chip Heights (Hall of Fame)
                </h3>
                <p className="text-xs text-zinc-400">
                  The greatest chip peaks achieved in casino history. Reaching this table earns permanent prestige.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-500/30 hidden sm:inline">
              TOP 20 ALL-TIME
            </span>
          </div>

          <div className="rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl overflow-hidden">
            <div className="divide-y divide-zinc-800/60">
              {allTimePeaks.map((record) => {
                const tierInfo = getVIPTierInfo(record.vipTier);
                return (
                  <div
                    key={record.id}
                    className={`p-3.5 sm:px-5 flex items-center justify-between gap-3 transition-colors ${
                      record.isUser
                        ? 'bg-amber-500/15 border-l-4 border-amber-400'
                        : record.rank <= 3
                        ? 'bg-zinc-900/40 hover:bg-zinc-900/70'
                        : 'hover:bg-zinc-900/30'
                    }`}
                  >
                    {/* Rank + User Info */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className={`w-8 text-center font-mono font-black text-sm sm:text-base ${
                        record.rank === 1
                          ? 'text-yellow-400 text-lg font-black'
                          : record.rank === 2
                          ? 'text-slate-300'
                          : record.rank === 3
                          ? 'text-amber-600'
                          : 'text-zinc-500'
                      }`}>
                        #{record.rank}
                      </span>

                      <span className="text-2xl sm:text-3xl shrink-0">{record.avatar}</span>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-black text-zinc-100">
                            {record.username}
                          </span>
                          {record.isUser && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500 text-zinc-950">
                              YOU
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                          <span className={`font-bold ${tierInfo.text}`}>{record.vipTier}</span>
                          <span>•</span>
                          <span>Achieved {record.dateAchieved}</span>
                        </div>
                      </div>
                    </div>

                    {/* Peak Chips Record */}
                    <div className="text-right">
                      <div className="text-sm sm:text-base font-mono font-black text-amber-300">
                        {record.formattedScore} Chips
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Rules & Transparency Footer */}
      <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-[11px]">
            The tournament resets every night at <strong>12:00 AM EST</strong>. Yesterday's winner is archived and paid out manually via Discord or Telegram.
          </span>
        </div>
      </div>
    </div>
  );
};
