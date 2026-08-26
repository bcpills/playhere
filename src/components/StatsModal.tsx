import React from 'react';
import { BarChart2, Coins, Trophy, Zap, ShieldAlert, Sparkles, Lock, Flame } from 'lucide-react';
import { CasinoStats } from '../types';
import { formatCompactWager } from '../utils/leaderboard';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: CasinoStats;
  currentBalance: number;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  currentBalance,
}) => {
  if (!isOpen) return null;

  const isNetPositive = stats.netProfit >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-zinc-100">
                Career Casino Dossier
              </h3>
              <p className="text-xs text-zinc-400">
                Your lifelong track record at ChipZone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        {/* Primary Net Metric */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between mb-4">
          <div>
            <div className="text-xs uppercase font-bold text-zinc-400">All-Time Net Profit</div>
            <div className={`text-2xl font-black font-mono mt-0.5 ${isNetPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isNetPositive ? `+${stats.netProfit.toLocaleString()}` : stats.netProfit.toLocaleString()} <span className="text-xs font-normal">CHIPS</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${
            isNetPositive 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          }`}>
            {isNetPositive ? 'In the Green 📈' : 'Down Bad 📉'}
          </div>
        </div>

        {/* 2x2 Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div 
            className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 group cursor-help transition-all"
            title={`${stats.totalWagered.toLocaleString()} chips total career wagered`}
          >
            <span className="text-zinc-500 font-bold uppercase text-[10px] flex items-center justify-between">
              <span>Total Wagered</span>
              <Flame className="w-3 h-3 text-purple-400 opacity-60" />
            </span>
            <div className="text-base font-black text-purple-300 font-mono mt-1 flex items-baseline gap-1.5">
              <span>{formatCompactWager(stats.totalWagered)}</span>
              <span className="text-[10px] text-zinc-500 font-normal font-sans">
                ({stats.totalWagered.toLocaleString()})
              </span>
            </div>
          </div>

          <div 
            className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 group cursor-help transition-all"
            title={`${stats.totalWon.toLocaleString()} chips total career payout`}
          >
            <span className="text-zinc-500 font-bold uppercase text-[10px] flex items-center justify-between">
              <span>Total Won</span>
              <Coins className="w-3 h-3 text-amber-400 opacity-60" />
            </span>
            <div className="text-base font-black text-amber-300 font-mono mt-1 flex items-baseline gap-1.5">
              <span>{formatCompactWager(stats.totalWon)}</span>
              <span className="text-[10px] text-zinc-500 font-normal font-sans">
                ({stats.totalWon.toLocaleString()})
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <span className="text-zinc-500 font-bold uppercase text-[10px]">Biggest Single Win</span>
            <div className="text-base font-black text-emerald-400 font-mono mt-1">
              {stats.biggestWin.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <span className="text-zinc-500 font-bold uppercase text-[10px]">Biggest Multiplier</span>
            <div className="text-base font-black text-purple-300 font-mono mt-1">
              {stats.biggestMultiplier}x
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <span className="text-zinc-500 font-bold uppercase text-[10px]">Blackjack Hands</span>
            <div className="text-base font-black text-zinc-200 font-mono mt-1">
              {stats.handsPlayedBlackjack}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <span className="text-zinc-500 font-bold uppercase text-[10px]">40-Ball Keno Rounds</span>
            <div className="text-base font-black text-zinc-200 font-mono mt-1">
              {stats.roundsPlayedKeno}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <span className="text-zinc-500 font-bold uppercase text-[10px]">Crates Opened</span>
            <div className="text-base font-black text-zinc-200 font-mono mt-1">
              {stats.cratesOpened}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <span className="text-zinc-500 font-bold uppercase text-[10px]">Side Bets Hit</span>
            <div className="text-base font-black text-yellow-300 font-mono mt-1">
              {stats.sideBetWinsBlackjack}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <span className="text-zinc-500 font-bold uppercase text-[10px]">ATM Bailouts</span>
            <div className="text-base font-black text-red-400 font-mono mt-1">
              {stats.bailoutCount}
            </div>
          </div>
        </div>

        {/* Tournament Rules Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px]">
              Daily chip bankroll is fixed at 1,000 chips (refills at 12:00 AM EST). No resets.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
