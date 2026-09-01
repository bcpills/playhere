import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, Flame, CheckCircle, ArrowRight } from 'lucide-react';
import { BonusSummaryData } from './types';
import { sound } from '../../utils/audio';

interface BonusSummaryModalProps {
  data: BonusSummaryData | null;
  onCollect: () => void;
}

export const BonusSummaryModal: React.FC<BonusSummaryModalProps> = ({
  data,
  onCollect,
}) => {
  const [animatedWon, setAnimatedWon] = useState<number>(0);

  useEffect(() => {
    if (!data) return;

    sound.playBigWin();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
    });

    // Counting animation
    const target = data.totalWon;
    const duration = 1200;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      const current = data.currencyMode === 'gc' 
        ? Math.round(target * progress) 
        : Number((target * progress).toFixed(2));
      
      setAnimatedWon(current);

      if (progress >= 1) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [data]);

  if (!data) return null;

  const isHoldAndWin = data.bonusType === 'hold_and_win';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        className={`w-full max-w-md rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl border-4 ${
          isHoldAndWin
            ? 'bg-gradient-to-b from-[#1a0808] via-zinc-950 to-[#220a0a] border-amber-500 shadow-amber-500/50'
            : 'bg-gradient-to-b from-[#120824] via-zinc-950 to-[#180b30] border-yellow-400 shadow-yellow-500/50'
        }`}
      >
        {/* Radiant background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Trophy / Fire Icon */}
        <div className="relative z-10 mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-1 shadow-2xl shadow-amber-500/40 flex items-center justify-center mb-4">
          <div className="w-full h-full bg-zinc-950 rounded-[20px] flex items-center justify-center text-3xl sm:text-4xl">
            {isHoldAndWin ? '🔥' : '👑'}
          </div>
        </div>

        {/* Title */}
        <div className="relative z-10 space-y-1 mb-4">
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-amber-400 block">
            {data.gameTitle}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
            {isHoldAndWin ? 'HOLD & WIN BONUS COMPLETE' : 'FREE SPINS COMPLETED'}
          </h2>
          <p className="text-xs text-zinc-400 font-medium">
            {data.featureDetails}
          </p>
        </div>

        {/* Big Won Display Box */}
        <div className="relative z-10 p-5 rounded-2xl bg-zinc-900/90 border-2 border-amber-500/50 shadow-inner mb-5">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
            Total Feature Payout
          </span>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-emerald-400">
            {data.currencyMode === 'gc'
              ? `+${animatedWon.toLocaleString()} GC`
              : `+$${animatedWon.toFixed(2)} USD`}
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
              {data.multiplier.toFixed(1)}× Total Bet
            </span>
            {data.jackpotHit && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono animate-pulse">
                {data.jackpotHit.toUpperCase()} JACKPOT
              </span>
            )}
          </div>
        </div>

        {/* Collect Button */}
        <button
          type="button"
          onClick={() => {
            sound.playProfit();
            onCollect();
          }}
          className="relative z-10 w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-sm sm:text-base uppercase tracking-widest shadow-xl shadow-amber-500/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle className="w-5 h-5 fill-current" />
          <span>Collect & Return to Game</span>
        </button>
      </motion.div>
    </div>
  );
};
