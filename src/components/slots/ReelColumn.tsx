import React from 'react';
import { motion } from 'motion/react';
import { BaseSlotSymbol } from './types';

interface ReelColumnProps {
  colIndex: number;
  symbols: BaseSlotSymbol[];
  stripSymbols: BaseSlotSymbol[];
  isSpinning: boolean;
  winningRows: number[]; // row indices (0, 1, 2) that are part of a winning payline
  lockedRows?: Record<number, boolean>; // for Hold & Win locked positions
  currencyMode: 'gc' | 'cash';
  activeBet: number;
}

export const ReelColumn: React.FC<ReelColumnProps> = ({
  colIndex,
  symbols,
  stripSymbols,
  isSpinning,
  winningRows,
  lockedRows = {},
  currencyMode,
  activeBet,
}) => {
  return (
    <div 
      className={`relative overflow-hidden rounded-xl bg-gradient-to-b from-zinc-950 via-[#100b1e] to-zinc-950 border border-purple-900/40 p-1 sm:p-2 h-[260px] sm:h-[340px] flex flex-col justify-between select-none shadow-inner`}
    >
      {/* Top and Bottom Vignette Overlays for Depth / 3D Cylinder look */}
      <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />

      {isSpinning ? (
        /* FAST ROLLING STRIP ANIMATION WITH MOTION BLUR & SPEED LINES */
        <div className="relative w-full h-full overflow-hidden flex flex-col justify-center items-center">
          {/* Subtle spinning speed lines overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none z-10" />
          
          <motion.div
            animate={{ y: ['-50%', '0%'] }}
            transition={{ repeat: Infinity, duration: 0.14, ease: 'linear' }}
            className="flex flex-col gap-2 sm:gap-3 items-center w-full filter blur-[1.5px] opacity-85"
          >
            {/* Doubled strip for seamless infinite vertical scroll */}
            {[...stripSymbols, ...stripSymbols].map((sym, idx) => (
              <div
                key={`${colIndex}-strip-${idx}`}
                className="w-full h-16 sm:h-22 rounded-xl bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 border border-purple-900/40 flex flex-col items-center justify-center p-1 shrink-0 shadow-sm"
              >
                <span className="text-2xl sm:text-3xl filter saturate-150 transform scale-105">
                  {sym.emoji}
                </span>
                <span className="text-[8px] font-black uppercase text-zinc-500 truncate max-w-full">
                  {sym.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      ) : (
        /* STOPPED REEL STATE WITH ACCURATE SYMBOL LANDING & MECHANICAL SPRING BOUNCE */
        <motion.div
          key={`reel-${colIndex}-${symbols.map(s => s.id + (s.orbValue || '')).join('-')}`}
          initial={{ y: -42, opacity: 0.75, filter: 'blur(2px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={{ type: 'spring', damping: 14, stiffness: 250, mass: 0.8 }}
          className="flex flex-col gap-1.5 sm:gap-2.5 h-full justify-between"
        >
          {symbols.map((sym, rowIdx) => {
            const isWinning = winningRows.includes(rowIdx);
            const isLocked = !!lockedRows[rowIdx];
            const isSunOrb = !!sym.isBonusOrb;

            // Calculate displayed value on Sun/Fire orbs
            let orbCashText = '';
            if (isSunOrb && sym.orbValue) {
              if (sym.jackpotType) {
                orbCashText = sym.jackpotType.toUpperCase();
              } else {
                const orbAmount = currencyMode === 'gc' 
                  ? Math.round(activeBet * sym.orbValue) 
                  : (activeBet * sym.orbValue);
                orbCashText = currencyMode === 'gc' 
                  ? `${orbAmount.toLocaleString()} GC` 
                  : `$${orbAmount.toFixed(2)}`;
              }
            }

            return (
              <motion.div
                key={`${colIndex}-${rowIdx}-${sym.id}`}
                animate={
                  isWinning
                    ? { scale: [1, 1.08, 1], rotate: [0, -2, 2, 0] }
                    : isLocked
                    ? { scale: [1, 1.03, 1] }
                    : {}
                }
                transition={
                  isWinning
                    ? { repeat: Infinity, duration: 0.8 }
                    : isLocked
                    ? { repeat: Infinity, duration: 1.5 }
                    : {}
                }
                className={`relative h-18 sm:h-24 rounded-xl flex flex-col items-center justify-center p-1 transition-all ${
                  isLocked
                    ? 'bg-gradient-to-br from-amber-500/40 via-red-600/30 to-amber-900/50 border-2 border-amber-400 shadow-lg shadow-amber-500/40 ring-1 ring-yellow-300'
                    : isWinning
                    ? 'bg-gradient-to-b from-amber-500/30 via-yellow-500/20 to-amber-500/30 border-2 border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/30'
                    : 'bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* Visual Glow for Specials */}
                {isSunOrb && (
                  <div className="absolute inset-0 bg-amber-500/10 rounded-xl blur-sm pointer-events-none" />
                )}

                {/* Symbol Emoji */}
                <span className={`text-2xl sm:text-4xl drop-shadow-md relative z-10 transition-transform ${isSunOrb ? 'scale-110' : ''}`}>
                  {sym.emoji}
                </span>

                {/* Symbol Name or Orb Value Label */}
                {isSunOrb ? (
                  <div className="relative z-10 mt-0.5 text-center">
                    {sym.jackpotType ? (
                      <span className={`px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black uppercase font-mono shadow ${
                        sym.jackpotType === 'major' 
                          ? 'bg-purple-600 text-white' 
                          : sym.jackpotType === 'minor' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-emerald-600 text-white'
                      }`}>
                        {sym.jackpotType.toUpperCase()} ({sym.orbValue}×)
                      </span>
                    ) : (
                      <span className="text-[9px] sm:text-[10px] font-black text-amber-300 font-mono tracking-tight block">
                        {orbCashText || `${sym.orbValue}×`}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-zinc-400 truncate max-w-full text-center mt-0.5 relative z-10">
                    {sym.name.split(' ')[0]}
                  </span>
                )}

                {/* Badges */}
                {sym.isWild && (
                  <span className="absolute top-1 right-1 text-[7px] sm:text-[8px] font-black px-1 rounded bg-cyan-500 text-zinc-950 shadow">
                    WILD
                  </span>
                )}
                {sym.isScatter && (
                  <span className="absolute top-1 right-1 text-[7px] sm:text-[8px] font-black px-1 rounded bg-amber-500 text-zinc-950 shadow animate-pulse">
                    BONUS
                  </span>
                )}
                {isLocked && (
                  <span className="absolute top-1 left-1 text-[7px] sm:text-[8px] font-black px-1 rounded bg-red-600 text-white shadow">
                    LOCKED
                  </span>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};
