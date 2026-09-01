import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CasinoStats } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  RotateCw, 
  Zap, 
  Flame, 
  Volume2, 
  VolumeX, 
  Info, 
  Award, 
  Coins, 
  DollarSign, 
  HelpCircle,
  Play,
  Square,
  Trophy,
  ChevronRight,
  ShieldCheck,
  Star
} from 'lucide-react';

interface SlotsGameProps {
  balance: number; // Gold coins balance
  cashBalance?: number; // USD Cash balance
  onUpdateBalance: (amount: number | ((prev: number) => number)) => void;
  onUpdateCashBalance?: (amount: number | ((prev: number) => number)) => void;
  stats: CasinoStats;
  onUpdateStats: React.Dispatch<React.SetStateAction<CasinoStats>>;
  onAddRakeback: (wager: number) => void;
}

export interface SlotSymbol {
  id: string;
  name: string;
  emoji: string;
  color: string;
  glow: string;
  payouts: [number, number, number]; // 3-match, 4-match, 5-match multipliers
  isWild?: boolean;
  isScatter?: boolean;
}

export const SLOT_SYMBOLS: SlotSymbol[] = [
  { id: 'wild', name: 'Diamond Wild', emoji: '💎', color: 'text-cyan-300', glow: 'shadow-cyan-500/50', payouts: [50, 200, 1000], isWild: true },
  { id: 'scatter', name: 'Gold Scatter', emoji: '⭐', color: 'text-yellow-300', glow: 'shadow-yellow-500/50', payouts: [10, 50, 250], isScatter: true },
  { id: 'seven', name: 'Lucky 7', emoji: '7️⃣', color: 'text-red-500', glow: 'shadow-red-500/50', payouts: [25, 100, 500] },
  { id: 'bell', name: 'Golden Bell', emoji: '🔔', color: 'text-amber-400', glow: 'shadow-amber-500/50', payouts: [15, 60, 250] },
  { id: 'clover', name: 'Four Leaf Clover', emoji: '🍀', color: 'text-emerald-400', glow: 'shadow-emerald-500/50', payouts: [10, 40, 150] },
  { id: 'bar', name: 'Gold Bar', emoji: '🪙', color: 'text-yellow-400', glow: 'shadow-yellow-500/50', payouts: [8, 30, 100] },
  { id: 'grape', name: 'Neon Grapes', emoji: '🍇', color: 'text-purple-400', glow: 'shadow-purple-500/50', payouts: [5, 20, 60] },
  { id: 'cherry', name: 'Lucky Cherry', emoji: '🍒', color: 'text-rose-400', glow: 'shadow-rose-500/50', payouts: [3, 10, 40] },
];

// 20 Paylines across 5 reels x 3 rows (indices 0, 1, 2 for rows on each reel 0 to 4)
const PAYLINES: [number, number, number, number, number][] = [
  [1, 1, 1, 1, 1], // Center line (1)
  [0, 0, 0, 0, 0], // Top line (2)
  [2, 2, 2, 2, 2], // Bottom line (3)
  [0, 1, 2, 1, 0], // V-shape downwards (4)
  [2, 1, 0, 1, 2], // V-shape upwards (5)
  [0, 0, 1, 2, 2], // Diagonal down (6)
  [2, 2, 1, 0, 0], // Diagonal up (7)
  [1, 0, 0, 0, 1], // Inverted bowl (8)
  [1, 2, 2, 2, 1], // Normal bowl (9)
  [0, 1, 0, 1, 0], // Top wave (10)
  [2, 1, 2, 1, 2], // Bottom wave (11)
  [1, 0, 1, 0, 1], // Middle wave top (12)
  [1, 2, 1, 2, 1], // Middle wave bottom (13)
  [0, 1, 1, 1, 0], // Top arch (14)
  [2, 1, 1, 1, 2], // Bottom arch (15)
  [0, 0, 2, 0, 0], // Crown top (16)
  [2, 2, 0, 2, 2], // Crown bottom (17)
  [1, 0, 2, 0, 1], // Diamond shape 1 (18)
  [1, 2, 0, 2, 1], // Diamond shape 2 (19)
  [0, 2, 0, 2, 0], // Zig zag (20)
];

const GC_BET_PRESETS = [100, 500, 1000, 5000, 10000, 25000, 50000, 100000];
const CASH_BET_PRESETS = [0.20, 0.50, 1.00, 2.00, 5.00, 10.00, 20.00];

function getRandomSymbol(): SlotSymbol {
  const rand = Math.random() * 100;
  if (rand < 3) return SLOT_SYMBOLS[0]; // Wild (3%)
  if (rand < 8) return SLOT_SYMBOLS[1]; // Scatter (5%)
  if (rand < 16) return SLOT_SYMBOLS[2]; // 777 (8%)
  if (rand < 28) return SLOT_SYMBOLS[3]; // Bell (12%)
  if (rand < 44) return SLOT_SYMBOLS[4]; // Clover (16%)
  if (rand < 62) return SLOT_SYMBOLS[5]; // Bar (18%)
  if (rand < 80) return SLOT_SYMBOLS[6]; // Grape (18%)
  return SLOT_SYMBOLS[7]; // Cherry (20%)
}

function generateInitialGrid(): SlotSymbol[][] {
  const grid: SlotSymbol[][] = [];
  for (let c = 0; c < 5; c++) {
    const col: SlotSymbol[] = [];
    for (let r = 0; r < 3; r++) {
      col.push(getRandomSymbol());
    }
    grid.push(col);
  }
  return grid;
}

export const SlotsGame: React.FC<SlotsGameProps> = ({
  balance,
  cashBalance = 5.0,
  onUpdateBalance,
  onUpdateCashBalance,
  stats,
  onUpdateStats,
  onAddRakeback,
}) => {
  // Currency Mode: Gold Coins (GC) vs Real Money ($USD)
  const [currencyMode, setCurrencyMode] = useState<'gc' | 'cash'>('gc');
  const [gcBet, setGcBet] = useState<number>(1000);
  const [cashBet, setCashBet] = useState<number>(1.00);

  // Game state
  const [grid, setGrid] = useState<SlotSymbol[][]>(generateInitialGrid);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinningReels, setSpinningReels] = useState<boolean[]>([false, false, false, false, false]);
  const [winningLines, setWinningLines] = useState<{ lineIndex: number; symbol: SlotSymbol; count: number; payout: number }[]>([]);
  const [lastWinAmount, setLastWinAmount] = useState<number>(0);
  const [showWinCelebration, setShowWinCelebration] = useState<boolean>(false);
  const [celebrationType, setCelebrationType] = useState<'normal' | 'big' | 'mega' | 'ultra'>('normal');

  // Free Spins Bonus Round
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(0);
  const [freeSpinsTotalWon, setFreeSpinsTotalWon] = useState<number>(0);
  const [isInFreeSpins, setIsInFreeSpins] = useState<boolean>(false);

  // Settings
  const [turboMode, setTurboMode] = useState<boolean>(false);
  const [autoSpinCount, setAutoSpinCount] = useState<number>(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState<boolean>(false);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);

  const activeBet = currencyMode === 'gc' ? gcBet : cashBet;
  const currentAvailableBalance = currencyMode === 'gc' ? balance : cashBalance;

  // Spin Engine
  const executeSpin = useCallback(() => {
    if (isSpinning) return;

    // In free spins, spin is free!
    if (!isInFreeSpins) {
      if (currentAvailableBalance < activeBet) {
        sound.playLose();
        setIsAutoSpinning(false);
        setAutoSpinCount(0);
        return;
      }

      // Deduct bet
      if (currencyMode === 'gc') {
        onUpdateBalance(-gcBet);
        onAddRakeback(gcBet);
        onUpdateStats(prev => ({
          ...prev,
          totalWagered: prev.totalWagered + gcBet,
          dailyWagerGoldCoins: (prev.dailyWagerGoldCoins || 0) + gcBet,
          roundsPlayedSlots: (prev.roundsPlayedSlots || 0) + 1,
        }));
      } else {
        if (onUpdateCashBalance) {
          onUpdateCashBalance(prev => Math.max(0, Number((prev - cashBet).toFixed(2))));
        }
        onUpdateStats(prev => ({
          ...prev,
          dailyWagerCash: (prev.dailyWagerCash || 0) + cashBet,
          roundsPlayedSlots: (prev.roundsPlayedSlots || 0) + 1,
        }));
      }
    }

    sound.playChip();
    setIsSpinning(true);
    setWinningLines([]);
    setShowWinCelebration(false);
    setSpinningReels([true, true, true, true, true]);

    // Generate new final outcome grid
    const nextGrid: SlotSymbol[][] = [];
    for (let c = 0; c < 5; c++) {
      const col: SlotSymbol[] = [];
      for (let r = 0; r < 3; r++) {
        col.push(getRandomSymbol());
      }
      nextGrid.push(col);
    }

    const reelDelay = turboMode ? 100 : 250;
    const totalSpinTime = turboMode ? 500 : 1200;

    // Sequentially stop reels
    for (let c = 0; c < 5; c++) {
      setTimeout(() => {
        setSpinningReels(prev => {
          const next = [...prev];
          next[c] = false;
          return next;
        });
        sound.playChip();
      }, totalSpinTime + c * reelDelay);
    }

    // Final evaluation after all reels stop
    setTimeout(() => {
      setGrid(nextGrid);
      setIsSpinning(false);

      // Evaluate paylines
      let totalPayoutMultiplier = 0;
      const hitLines: { lineIndex: number; symbol: SlotSymbol; count: number; payout: number }[] = [];

      // Check 20 paylines
      PAYLINES.forEach((line, lineIdx) => {
        const firstSym = nextGrid[0][line[0]];
        let matchCount = 1;
        let matchSymbol = firstSym;

        // If first is wild, match next non-wild
        if (firstSym.isWild) {
          for (let i = 1; i < 5; i++) {
            const sym = nextGrid[i][line[i]];
            if (!sym.isWild && !sym.isScatter) {
              matchSymbol = sym;
              break;
            }
          }
        }

        if (matchSymbol.isScatter) return; // Scatters evaluate separately

        for (let i = 1; i < 5; i++) {
          const sym = nextGrid[i][line[i]];
          if (sym.id === matchSymbol.id || sym.isWild) {
            matchCount++;
          } else {
            break;
          }
        }

        if (matchCount >= 3) {
          const tierIdx = matchCount - 3; // 0 for 3-match, 1 for 4-match, 2 for 5-match
          const lineMult = matchSymbol.payouts[tierIdx] || 0;
          if (lineMult > 0) {
            totalPayoutMultiplier += lineMult;
            hitLines.push({
              lineIndex: lineIdx,
              symbol: matchSymbol,
              count: matchCount,
              payout: lineMult,
            });
          }
        }
      });

      // Check Scatters count across entire 5x3 grid
      let scatterCount = 0;
      for (let c = 0; c < 5; c++) {
        for (let r = 0; r < 3; r++) {
          if (nextGrid[c][r].isScatter) {
            scatterCount++;
          }
        }
      }

      if (scatterCount >= 3) {
        // Trigger 10 Free Spins!
        sound.playWin(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
        setFreeSpinsLeft(prev => prev + 10);
        setIsInFreeSpins(true);
        totalPayoutMultiplier += scatterCount === 3 ? 10 : scatterCount === 4 ? 50 : 250;
      }

      // Free Spins Multiplier (3x during bonus!)
      if (isInFreeSpins) {
        totalPayoutMultiplier *= 3;
      }

      setWinningLines(hitLines);

      if (totalPayoutMultiplier > 0) {
        const winAmount = currencyMode === 'gc' 
          ? Math.round(gcBet * (totalPayoutMultiplier / 20)) 
          : Number(((cashBet * (totalPayoutMultiplier / 20))).toFixed(2));

        setLastWinAmount(winAmount);

        if (currencyMode === 'gc') {
          onUpdateBalance(winAmount);
          onUpdateStats(prev => ({
            ...prev,
            totalWon: prev.totalWon + winAmount,
            biggestWin: Math.max(prev.biggestWin, winAmount),
            biggestMultiplier: Math.max(prev.biggestMultiplier, totalPayoutMultiplier),
          }));
        } else {
          if (onUpdateCashBalance) {
            onUpdateCashBalance(prev => Number((prev + winAmount).toFixed(2)));
          }
          onUpdateStats(prev => ({
            ...prev,
            biggestMultiplier: Math.max(prev.biggestMultiplier, totalPayoutMultiplier),
          }));
        }

        if (isInFreeSpins) {
          setFreeSpinsTotalWon(prev => prev + winAmount);
        }

        // Celebration tier
        const mult = totalPayoutMultiplier / 20;
        if (mult >= 50) {
          setCelebrationType('ultra');
          setShowWinCelebration(true);
          sound.playBigWin();
          confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
        } else if (mult >= 20) {
          setCelebrationType('mega');
          setShowWinCelebration(true);
          sound.playBigWin();
          confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
        } else if (mult >= 5) {
          setCelebrationType('big');
          setShowWinCelebration(true);
          sound.playWin(true);
        } else {
          sound.playWin();
        }
      } else {
        setLastWinAmount(0);
      }

      // Handle Free Spins Decrement
      if (isInFreeSpins) {
        setFreeSpinsLeft(prev => {
          const next = prev - 1;
          if (next <= 0) {
            setIsInFreeSpins(false);
          }
          return Math.max(0, next);
        });
      }

      // Handle Auto-spin decrement
      if (isAutoSpinning && autoSpinCount > 0) {
        setAutoSpinCount(prev => prev - 1);
      }

    }, totalSpinTime + 4 * reelDelay + 100);

  }, [
    isSpinning, 
    isInFreeSpins, 
    currentAvailableBalance, 
    activeBet, 
    currencyMode, 
    gcBet, 
    cashBet, 
    turboMode, 
    isAutoSpinning, 
    autoSpinCount, 
    onUpdateBalance, 
    onUpdateCashBalance, 
    onAddRakeback, 
    onUpdateStats
  ]);

  // Auto spin loop trigger
  useEffect(() => {
    if (!isAutoSpinning || autoSpinCount <= 0 || isSpinning) return;
    const timer = setTimeout(() => {
      executeSpin();
    }, turboMode ? 400 : 1000);
    return () => clearTimeout(timer);
  }, [isAutoSpinning, autoSpinCount, isSpinning, executeSpin, turboMode]);

  // Keyboard shortcut: Spacebar to spin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpinning && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        executeSpin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, executeSpin]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 pb-8 select-none">
      
      {/* Top Banner with Dual Currency Mode Selector & Free Spins Alert */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-950/80 via-zinc-950 to-amber-950/70 border-2 border-amber-500/50 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute top-0 right-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-xl shadow-amber-500/30 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-2xl font-black">
              🎰
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-xl font-black uppercase tracking-wider text-zinc-100 flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                  Lucky Neon 777 Slots
                </span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                96.8% RTP
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              5 Reels × 20 Paylines. Hit 3+ Scatters for 10 Free Spins with 3× Multiplier!
            </p>
          </div>
        </div>

        {/* Currency Switcher & Paytable button */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end relative z-10">
          {/* Dual Currency Pill */}
          <div className="flex items-center p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800 shadow-inner">
            <button
              type="button"
              onClick={() => {
                sound.playChip();
                setCurrencyMode('gc');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                currencyMode === 'gc'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Gold Coins</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playChip();
                setCurrencyMode('cash');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                currencyMode === 'cash'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 stroke-[3]" />
              <span>Real Cash ($)</span>
            </button>
          </div>

          {/* Paytable Rules Button */}
          <button
            type="button"
            onClick={() => {
              sound.playChip();
              setShowPaytable(true);
            }}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 transition-colors cursor-pointer"
            title="View Symbol Paytable & 20 Paylines"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Free Spins Alert Banner */}
      {isInFreeSpins && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-between shadow-xl shadow-amber-500/30 animate-pulse">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>🌟 FREE SPINS BONUS ACTIVE (3× WIN MULTIPLIER!)</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Total Bonus Won: {currencyMode === 'gc' ? `${freeSpinsTotalWon.toLocaleString()} GC` : `$${freeSpinsTotalWon.toFixed(2)}`}</span>
            <span className="px-2.5 py-0.5 bg-zinc-950 text-amber-300 rounded-full font-mono text-xs">
              {freeSpinsLeft} SPINS LEFT
            </span>
          </div>
        </div>
      )}

      {/* MAIN SLOT MACHINE FRAME */}
      <div className="relative rounded-3xl bg-gradient-to-b from-zinc-950 via-[#120d24] to-zinc-950 border-4 border-amber-500/40 p-4 sm:p-6 shadow-2xl shadow-purple-950/60 overflow-hidden">
        
        {/* Neon Slot Machine Header Marquee */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-900/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
              VEGAS GRAND SLOTS • 20 LINES ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-[9px] uppercase font-bold text-zinc-400 block leading-none">Last Spin Win</span>
              <span className={`font-black text-sm ${lastWinAmount > 0 ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`}>
                {lastWinAmount > 0 
                  ? (currencyMode === 'gc' ? `+${lastWinAmount.toLocaleString()} GC` : `+$${lastWinAmount.toFixed(2)} USD`)
                  : '0.00'
                }
              </span>
            </div>

            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-zinc-400 block leading-none">Your Bankroll</span>
              <span className="font-black text-sm text-amber-300">
                {currencyMode === 'gc' 
                  ? `${balance.toLocaleString()} GC` 
                  : `$${cashBalance.toFixed(2)} USD`
                }
              </span>
            </div>
          </div>
        </div>

        {/* 5 REELS GRID */}
        <div className="relative p-2 sm:p-3 rounded-2xl bg-zinc-950/90 border-2 border-purple-900/60 shadow-inner grid grid-cols-5 gap-1.5 sm:gap-3">
          {grid.map((reelCol, colIdx) => (
            <div 
              key={colIdx}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-zinc-900/90 border border-purple-900/40 p-1 sm:p-2 flex flex-col gap-1.5 sm:gap-2.5 transition-all ${
                spinningReels[colIdx] ? 'blur-[1px] opacity-80' : ''
              }`}
            >
              {reelCol.map((symbol, rowIdx) => {
                // Check if this cell is part of any winning payline
                const isWinningCell = winningLines.some(line => {
                  const payline = PAYLINES[line.lineIndex];
                  return payline[colIdx] === rowIdx;
                });

                return (
                  <motion.div
                    key={`${colIdx}-${rowIdx}`}
                    animate={isWinningCell ? { scale: [1, 1.1, 1], rotate: [0, -3, 3, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className={`h-16 sm:h-24 rounded-xl flex flex-col items-center justify-center p-1 relative transition-all ${
                      isWinningCell 
                        ? 'bg-gradient-to-b from-amber-500/30 via-yellow-500/20 to-amber-500/30 border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-lg' 
                        : 'bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-2xl sm:text-4xl drop-shadow-md">
                      {symbol.emoji}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase text-zinc-400 truncate max-w-full text-center mt-0.5">
                      {symbol.name.split(' ')[0]}
                    </span>

                    {symbol.isWild && (
                      <span className="absolute top-1 right-1 text-[8px] font-black px-1 rounded bg-cyan-500 text-zinc-950">
                        WILD
                      </span>
                    )}
                    {symbol.isScatter && (
                      <span className="absolute top-1 right-1 text-[8px] font-black px-1 rounded bg-amber-500 text-zinc-950">
                        BONUS
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>

        {/* WIN CELEBRATION POPUP OVERLAY */}
        <AnimatePresence>
          {showWinCelebration && (
            <motion.div 
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="absolute inset-0 z-30 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center pointer-events-none"
            >
              <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-500 via-yellow-400 to-amber-600 text-zinc-950 border-4 border-yellow-200 shadow-2xl shadow-amber-500/60 max-w-sm w-full animate-bounce">
                <span className="text-4xl sm:text-5xl block mb-1">
                  {celebrationType === 'ultra' ? '👑 MEGA JACKPOT 👑' : celebrationType === 'mega' ? '🌟 ULTRA WIN 🌟' : '🎉 BIG WIN 🎉'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-wider">
                  +{lastWinAmount.toLocaleString()} {currencyMode === 'gc' ? 'GC' : 'USD'}
                </h3>
                <span className="text-xs font-black uppercase text-zinc-900 block mt-1">
                  {winningLines.length} Winning Paylines Connected!
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM CONTROLS BAR */}
        <div className="mt-4 pt-4 border-t border-purple-900/40 space-y-3">
          
          {/* Bet Selector & Quick Presets */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            
            {/* Bet Amount Box */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Total Wager (20 Lines)</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {currencyMode === 'gc' ? (
                    <div className="flex items-center gap-1">
                      {GC_BET_PRESETS.map(preset => (
                        <button
                          key={preset}
                          type="button"
                          disabled={isSpinning}
                          onClick={() => {
                            sound.playChip();
                            setGcBet(preset);
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black font-mono transition-all cursor-pointer disabled:opacity-50 ${
                            gcBet === preset
                              ? 'bg-amber-500 text-zinc-950 font-black'
                              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                          }`}
                        >
                          {preset >= 1000 ? `${preset / 1000}k` : preset}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {CASH_BET_PRESETS.map(preset => (
                        <button
                          key={preset}
                          type="button"
                          disabled={isSpinning}
                          onClick={() => {
                            sound.playChip();
                            setCashBet(preset);
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black font-mono transition-all cursor-pointer disabled:opacity-50 ${
                            cashBet === preset
                              ? 'bg-emerald-500 text-zinc-950 font-black'
                              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                          }`}
                        >
                          ${preset.toFixed(2)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Turbo & Auto-spin toggles */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playChip();
                  setTurboMode(prev => !prev);
                }}
                className={`px-2.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 border transition-all cursor-pointer ${
                  turboMode 
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20' 
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
                title="Turbo Spin Mode (Faster Reel Stops)"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Turbo</span>
              </button>

              {/* Auto Spin Trigger */}
              {isAutoSpinning ? (
                <button
                  type="button"
                  onClick={() => {
                    sound.playChip();
                    setIsAutoSpinning(false);
                    setAutoSpinCount(0);
                  }}
                  className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-600/30 cursor-pointer animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Stop Auto ({autoSpinCount})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    sound.playChip();
                    setAutoSpinCount(25);
                    setIsAutoSpinning(true);
                  }}
                  className="px-2.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Auto (25)</span>
                </button>
              )}
            </div>
          </div>

          {/* Big Spin Action Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              id="slots-spin-btn"
              type="button"
              disabled={isSpinning || currentAvailableBalance < activeBet}
              onClick={executeSpin}
              className={`flex-1 py-4 rounded-2xl font-black text-sm sm:text-base uppercase tracking-widest shadow-2xl transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
                isSpinning
                  ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                  : currentAvailableBalance < activeBet
                  ? 'bg-red-950/60 text-red-400 border border-red-500/40 cursor-not-allowed'
                  : currencyMode === 'gc'
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 shadow-amber-500/30 hover:scale-101'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 shadow-emerald-500/30 hover:scale-101'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>
                {isSpinning 
                  ? 'SPINNING REELS...' 
                  : currentAvailableBalance < activeBet 
                  ? 'INSUFFICIENT BALANCE' 
                  : `SPIN (${currencyMode === 'gc' ? `${gcBet.toLocaleString()} GC` : `$${cashBet.toFixed(2)} USD`})`
                }
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
            <span>Tip: Press <strong>Spacebar</strong> to spin quickly.</span>
            <span>Accrues <strong>10% instant rakeback</strong> into your Vault on every wager.</span>
          </div>

        </div>

      </div>

      {/* PAYTABLE & RULES MODAL */}
      {showPaytable && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-zinc-950 border-2 border-amber-500/60 shadow-2xl p-5 sm:p-6 flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">📜</span>
                <h3 className="text-base font-black uppercase text-zinc-100">
                  Lucky Neon 777 Paytable & Paylines
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPaytable(false)}
                className="text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {/* Symbol Payouts */}
              <div>
                <h4 className="text-xs font-bold uppercase text-amber-400 mb-2.5">
                  Symbol Multipliers (Line Wins)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SLOT_SYMBOLS.map(sym => (
                    <div key={sym.id} className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
                      <span className="text-2xl block mb-1">{sym.emoji}</span>
                      <span className="text-[11px] font-bold text-white block">{sym.name}</span>
                      <div className="text-[10px] text-zinc-400 font-mono mt-1 space-y-0.5">
                        <div>5 Match: <strong className="text-amber-300">{sym.payouts[2]}×</strong></div>
                        <div>4 Match: <strong className="text-amber-300">{sym.payouts[1]}×</strong></div>
                        <div>3 Match: <strong className="text-amber-300">{sym.payouts[0]}×</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Features */}
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                <h4 className="text-xs font-bold uppercase text-purple-300">
                  Special Bonus Features
                </h4>
                <div className="text-xs text-zinc-300 space-y-1 leading-relaxed">
                  <p>• <strong>💎 Diamond Wild:</strong> Substitutes for any regular symbol to complete the highest paying winning payline.</p>
                  <p>• <strong>⭐ Gold Scatter:</strong> Hit 3 or more Scatters anywhere on the screen to trigger <strong>10 Free Spins</strong> with an instant <strong>3× multiplier</strong> on all line wins!</p>
                  <p>• <strong>20 Fixed Paylines:</strong> Payouts calculate from left to right across all 20 lines. Multiple line wins are added together.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
