import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Flame, DollarSign, Coins, X, Check, ShieldAlert } from 'lucide-react';
import { sound } from '../../utils/audio';

interface BonusBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: 'neon777' | 'holdAndWin';
  currencyMode: 'gc' | 'cash';
  activeBet: number;
  balance: number;
  cashBalance: number;
  onConfirmBuy: (bet: number) => void;
}

export const BonusBuyModal: React.FC<BonusBuyModalProps> = ({
  isOpen,
  onClose,
  gameId,
  currencyMode,
  activeBet,
  balance,
  cashBalance,
  onConfirmBuy,
}) => {
  // Preset bets per game & currency
  const isNeon = gameId === 'neon777';
  const multiplierCost = isNeon ? 100 : 120; // Neon is 100x ($20 on $0.20), Hold & Win is 120x ($12 on $0.10)

  const cashPresets = isNeon 
    ? [0.20, 0.50, 1.00, 2.00, 5.00, 10.00] 
    : [0.10, 0.25, 0.50, 1.00, 2.00, 5.00];

  const gcPresets = isNeon 
    ? [1000, 2500, 5000, 10000, 25000, 50000] 
    : [500, 1000, 2500, 5000, 10000, 25000];

  const [selectedBet, setSelectedBet] = useState<number>(() => {
    const list = currencyMode === 'gc' ? gcPresets : cashPresets;
    return list.includes(activeBet) ? activeBet : list[0];
  });

  if (!isOpen) return null;

  const totalCost = currencyMode === 'gc' 
    ? Math.round(selectedBet * multiplierCost) 
    : Number((selectedBet * multiplierCost).toFixed(2));

  const currentAvailable = currencyMode === 'gc' ? balance : cashBalance;
  const canAfford = currentAvailable >= totalCost;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className={`w-full max-w-lg rounded-3xl p-5 sm:p-7 relative overflow-hidden shadow-2xl border-4 ${
          isNeon
            ? 'bg-gradient-to-b from-[#170c2e] via-zinc-950 to-zinc-950 border-amber-500/70 shadow-purple-950/80'
            : 'bg-gradient-to-b from-[#240b0b] via-zinc-950 to-zinc-950 border-amber-500/70 shadow-amber-950/80'
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            sound.playChip();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${
            isNeon ? 'bg-gradient-to-br from-purple-500 to-amber-500 text-yellow-300' : 'bg-gradient-to-br from-amber-500 to-red-600 text-yellow-100'
          }`}>
            {isNeon ? '⭐' : '🔥'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                VIP Feature Buy
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                {multiplierCost}× Bet
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-wide text-white">
              {isNeon ? 'Buy 10 Free Spins Bonus' : 'Buy Hold & Win Respins Bonus'}
            </h3>
          </div>
        </div>

        {/* Feature Explanation */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 space-y-1.5 mb-4">
          {isNeon ? (
            <>
              <p>• <strong>Instant Guarantee:</strong> Triggers 3+ Gold Scatters on the next spin.</p>
              <p>• <strong>3× Win Multiplier:</strong> All 10 Free Spins have a 3× multiplier applied to every payline win.</p>
              <p>• <strong>Auto-Spinning:</strong> All 10 spins play out automatically and summarize your grand total at the end!</p>
            </>
          ) : (
            <>
              <p>• <strong>Instant Guarantee:</strong> Lands 6+ High-Value Solar Fire Orbs on the next spin.</p>
              <p>• <strong>Hold & Win Respins:</strong> Starts with 3 Respins; every newly landed orb locks and resets respins back to 3!</p>
              <p>• <strong>Grand Jackpot:</strong> Fill all 15 positions to win the massive 1,000× Grand Jackpot!</p>
            </>
          )}
        </div>

        {/* Base Bet Selector */}
        <div className="space-y-2 mb-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
            Select Base Bet (Min {isNeon ? '$0.20' : '$0.10'}):
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {(currencyMode === 'gc' ? gcPresets : cashPresets).map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  sound.playChip();
                  setSelectedBet(preset);
                }}
                className={`py-2 px-1 rounded-xl text-xs font-black font-mono transition-all cursor-pointer ${
                  selectedBet === preset
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {currencyMode === 'gc' 
                  ? (preset >= 1000 ? `${preset / 1000}k` : preset) 
                  : `$${preset.toFixed(2)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Total Cost Calculation Box */}
        <div className="p-4 rounded-2xl bg-zinc-950 border-2 border-amber-500/50 shadow-inner flex items-center justify-between gap-3 mb-5">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              Total Bonus Cost ({multiplierCost}× of {currencyMode === 'gc' ? `${selectedBet.toLocaleString()} GC` : `$${selectedBet.toFixed(2)}`})
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
              {currencyMode === 'gc' 
                ? `${totalCost.toLocaleString()} GC` 
                : `$${totalCost.toFixed(2)} USD`}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Your Bankroll</span>
            <span className={`text-xs sm:text-sm font-black font-mono ${canAfford ? 'text-zinc-300' : 'text-red-400'}`}>
              {currencyMode === 'gc' ? `${balance.toLocaleString()} GC` : `$${cashBalance.toFixed(2)} USD`}
            </span>
          </div>
        </div>

        {/* Confirm / Buy Button */}
        <button
          type="button"
          disabled={!canAfford}
          onClick={() => {
            if (!canAfford) return;
            sound.playBonusTrigger();
            onConfirmBuy(selectedBet);
            onClose();
          }}
          className={`w-full py-4 rounded-2xl font-black text-sm sm:text-base uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            canAfford
              ? isNeon
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 shadow-amber-500/30 active:scale-98'
                : 'bg-gradient-to-r from-amber-500 via-orange-400 to-red-500 hover:from-amber-400 hover:to-orange-300 text-zinc-950 shadow-red-500/30 active:scale-98'
              : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
          }`}
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>
            {canAfford 
              ? `CONFIRM & TRIGGER BONUS (${currencyMode === 'gc' ? `${totalCost.toLocaleString()} GC` : `$${totalCost.toFixed(2)} USD`})` 
              : 'INSUFFICIENT BALANCE'}
          </span>
        </button>
      </motion.div>
    </div>
  );
};
