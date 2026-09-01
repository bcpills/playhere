import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BaseSlotSymbol, BonusSummaryData } from './types';
import { ReelColumn } from './ReelColumn';
import { BonusBuyModal } from './BonusBuyModal';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  RotateCw, 
  Zap, 
  Square, 
  HelpCircle, 
  ShoppingBag, 
  Play,
  Flame,
  Award
} from 'lucide-react';

export const NEON_SYMBOLS: BaseSlotSymbol[] = [
  { id: 'wild', name: 'Diamond Wild', emoji: '💎', color: 'text-cyan-300', glow: 'shadow-cyan-500/50', payouts: [50, 200, 1000], isWild: true },
  { id: 'scatter', name: 'Gold Scatter', emoji: '⭐', color: 'text-yellow-300', glow: 'shadow-yellow-500/50', payouts: [10, 50, 250], isScatter: true },
  { id: 'seven', name: 'Lucky 7', emoji: '7️⃣', color: 'text-red-500', glow: 'shadow-red-500/50', payouts: [25, 100, 500] },
  { id: 'bell', name: 'Golden Bell', emoji: '🔔', color: 'text-amber-400', glow: 'shadow-amber-500/50', payouts: [15, 60, 250] },
  { id: 'clover', name: 'Four Leaf Clover', emoji: '🍀', color: 'text-emerald-400', glow: 'shadow-emerald-500/50', payouts: [10, 40, 150] },
  { id: 'bar', name: 'Gold Bar', emoji: '🪙', color: 'text-yellow-400', glow: 'shadow-yellow-500/50', payouts: [8, 30, 100] },
  { id: 'grape', name: 'Neon Grapes', emoji: '🍇', color: 'text-purple-400', glow: 'shadow-purple-500/50', payouts: [5, 20, 60] },
  { id: 'cherry', name: 'Lucky Cherry', emoji: '🍒', color: 'text-rose-400', glow: 'shadow-rose-500/50', payouts: [3, 10, 40] },
];

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

const CASH_BET_PRESETS = [0.20, 0.50, 1.00, 2.00, 5.00, 10.00, 20.00];
const GC_BET_PRESETS = [1000, 2500, 5000, 10000, 25000, 50000, 100000];

function getRandomNeonSymbol(forceScatter = false): BaseSlotSymbol {
  if (forceScatter) return NEON_SYMBOLS[1];
  const rand = Math.random() * 100;
  if (rand < 3.5) return NEON_SYMBOLS[0]; // Wild
  if (rand < 8.5) return NEON_SYMBOLS[1]; // Scatter
  if (rand < 18) return NEON_SYMBOLS[2];  // 777
  if (rand < 30) return NEON_SYMBOLS[3];  // Bell
  if (rand < 46) return NEON_SYMBOLS[4];  // Clover
  if (rand < 64) return NEON_SYMBOLS[5];  // Bar
  if (rand < 82) return NEON_SYMBOLS[6];  // Grape
  return NEON_SYMBOLS[7];                 // Cherry
}

function generateInitialGrid(): BaseSlotSymbol[][] {
  const grid: BaseSlotSymbol[][] = [];
  for (let c = 0; c < 5; c++) {
    const col: BaseSlotSymbol[] = [];
    for (let r = 0; r < 3; r++) {
      col.push(getRandomNeonSymbol());
    }
    grid.push(col);
  }
  return grid;
}

interface VegasNeonSlotsProps {
  currencyMode: 'gc' | 'cash';
  balance: number;
  cashBalance: number;
  onUpdateBalance: (amount: number | ((prev: number) => number)) => void;
  onUpdateCashBalance?: (amount: number | ((prev: number) => number)) => void;
  onAddRakeback: (wager: number) => void;
  onRecordWager: (amount: number, isCash: boolean) => void;
  onShowBonusSummary: (summary: BonusSummaryData) => void;
}

export const VegasNeonSlots: React.FC<VegasNeonSlotsProps> = ({
  currencyMode,
  balance,
  cashBalance,
  onUpdateBalance,
  onUpdateCashBalance,
  onAddRakeback,
  onRecordWager,
  onShowBonusSummary,
}) => {
  // Bet state
  const [cashBet, setCashBet] = useState<number>(0.20);
  const [gcBet, setGcBet] = useState<number>(1000);

  // Machine state
  const [grid, setGrid] = useState<BaseSlotSymbol[][]>(generateInitialGrid);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinningReels, setSpinningReels] = useState<boolean[]>([false, false, false, false, false]);
  const [winningLines, setWinningLines] = useState<{ lineIndex: number; symbol: BaseSlotSymbol; count: number; payout: number }[]>([]);
  const [lastWinAmount, setLastWinAmount] = useState<number>(0);
  const [turboMode, setTurboMode] = useState<boolean>(false);
  const [autoSpinCount, setAutoSpinCount] = useState<number>(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState<boolean>(false);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [isBonusBuyOpen, setIsBonusBuyOpen] = useState<boolean>(false);

  // Free Spins State
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(0);
  const [freeSpinsTotalWon, setFreeSpinsTotalWon] = useState<number>(0);
  const [isInFreeSpins, setIsInFreeSpins] = useState<boolean>(false);
  const [freeSpinsActiveBet, setFreeSpinsActiveBet] = useState<number>(0.20);
  const [freeSpinsCurrency, setFreeSpinsCurrency] = useState<'gc' | 'cash'>('cash');
  const [forcedBonusOutcome, setForcedBonusOutcome] = useState<boolean>(false);

  const activeBet = currencyMode === 'gc' ? gcBet : cashBet;
  const currentAvailableBalance = currencyMode === 'gc' ? balance : cashBalance;

  // Spin Engine
  const executeSpin = useCallback((isBoughtBonus = false, boughtBet?: number) => {
    if (isSpinning) return;

    const currentBet = isInFreeSpins 
      ? freeSpinsActiveBet 
      : (boughtBet ?? activeBet);
    const activeCurrency = isInFreeSpins ? freeSpinsCurrency : currencyMode;
    const isFree = isInFreeSpins;

    // Balance check if not free spins
    if (!isFree) {
      const wagerCost = isBoughtBonus ? currentBet * 100 : currentBet;
      const avail = activeCurrency === 'gc' ? balance : cashBalance;
      if (avail < wagerCost) {
        sound.playLose();
        setIsAutoSpinning(false);
        setAutoSpinCount(0);
        return;
      }

      // Deduct wager
      if (activeCurrency === 'gc') {
        onUpdateBalance(-wagerCost);
        onAddRakeback(wagerCost);
        onRecordWager(wagerCost, false);
      } else {
        if (onUpdateCashBalance) {
          onUpdateCashBalance(prev => Math.max(0, Number((prev - wagerCost).toFixed(2))));
        }
        onRecordWager(wagerCost, true);
      }
    }

    sound.playChip();
    setIsSpinning(true);
    setWinningLines([]);
    setSpinningReels([true, true, true, true, true]);

    // Generate outcome grid (or force 3+ scatters if bought)
    const nextGrid: BaseSlotSymbol[][] = [];
    const isTriggeringBonus = isBoughtBonus || forcedBonusOutcome;

    for (let c = 0; c < 5; c++) {
      const col: BaseSlotSymbol[] = [];
      for (let r = 0; r < 3; r++) {
        // Guarantee 3 scatters on columns 0, 2, 4 if bonus triggered
        if (isTriggeringBonus && (c === 0 || c === 2 || c === 4) && r === 1) {
          col.push(NEON_SYMBOLS[1]); // Scatter
        } else {
          col.push(getRandomNeonSymbol());
        }
      }
      nextGrid.push(col);
    }

    if (isTriggeringBonus) {
      setForcedBonusOutcome(false);
    }

    const reelDelay = turboMode ? 100 : 200;
    const totalSpinTime = turboMode ? 400 : 900;

    // Staggered reel stopping with realistic audio ticks
    for (let c = 0; c < 5; c++) {
      setTimeout(() => {
        setSpinningReels(prev => {
          const next = [...prev];
          next[c] = false;
          return next;
        });
        sound.playReelStop(c);
      }, totalSpinTime + c * reelDelay);
    }

    // Final win calculation after last reel locks
    setTimeout(() => {
      setGrid(nextGrid);
      setIsSpinning(false);

      // Evaluate 20 paylines
      let totalMultiplier = 0;
      const hitLines: { lineIndex: number; symbol: BaseSlotSymbol; count: number; payout: number }[] = [];

      PAYLINES.forEach((line, lineIdx) => {
        const firstSym = nextGrid[0][line[0]];
        let matchCount = 1;
        let matchSymbol = firstSym;

        if (firstSym.isWild) {
          for (let i = 1; i < 5; i++) {
            const sym = nextGrid[i][line[i]];
            if (!sym.isWild && !sym.isScatter) {
              matchSymbol = sym;
              break;
            }
          }
        }

        if (matchSymbol.isScatter) return;

        for (let i = 1; i < 5; i++) {
          const sym = nextGrid[i][line[i]];
          if (sym.id === matchSymbol.id || sym.isWild) {
            matchCount++;
          } else {
            break;
          }
        }

        if (matchCount >= 3) {
          const tierIdx = matchCount - 3;
          const lineMult = matchSymbol.payouts[tierIdx] || 0;
          if (lineMult > 0) {
            totalMultiplier += lineMult;
            hitLines.push({
              lineIndex: lineIdx,
              symbol: matchSymbol,
              count: matchCount,
              payout: lineMult,
            });
          }
        }
      });

      // Count Scatters across grid
      let scatterCount = 0;
      for (let c = 0; c < 5; c++) {
        for (let r = 0; r < 3; r++) {
          if (nextGrid[c][r].isScatter) scatterCount++;
        }
      }

      let bonusTriggeredNow = false;
      if (scatterCount >= 3 && !isInFreeSpins) {
        bonusTriggeredNow = true;
        sound.playBonusTrigger();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        setFreeSpinsLeft(10);
        setIsInFreeSpins(true);
        setFreeSpinsTotalWon(0);
        setFreeSpinsActiveBet(currentBet);
        setFreeSpinsCurrency(activeCurrency);
        totalMultiplier += scatterCount === 3 ? 10 : scatterCount === 4 ? 50 : 250;
      }

      // Apply 3x multiplier during free spins
      if (isInFreeSpins) {
        totalMultiplier *= 3;
      }

      setWinningLines(hitLines);

      // Award payout
      if (totalMultiplier > 0) {
        const winAmount = activeCurrency === 'gc'
          ? Math.round(currentBet * (totalMultiplier / 20))
          : Number((currentBet * (totalMultiplier / 20)).toFixed(2));

        setLastWinAmount(winAmount);

        if (activeCurrency === 'gc') {
          onUpdateBalance(winAmount);
        } else if (onUpdateCashBalance) {
          onUpdateCashBalance(prev => Number((prev + winAmount).toFixed(2)));
        }

        if (isInFreeSpins) {
          setFreeSpinsTotalWon(prev => prev + winAmount);
        }

        if (totalMultiplier >= 100) {
          sound.playBigWin();
          confetti({ particleCount: 100, spread: 70 });
        } else {
          sound.playWin();
        }
      } else {
        setLastWinAmount(0);
      }

      // Handle Free Spins decrement & completion
      if (isInFreeSpins && !bonusTriggeredNow) {
        setFreeSpinsLeft(prev => {
          const next = prev - 1;
          if (next <= 0) {
            setIsInFreeSpins(false);
            // Show Final Bonus Summary Modal!
            const totalAccumulated = freeSpinsTotalWon + (totalMultiplier > 0 
              ? (activeCurrency === 'gc' ? Math.round(currentBet * (totalMultiplier / 20)) : Number((currentBet * (totalMultiplier / 20)).toFixed(2))) 
              : 0);
            
            const multAchieved = currentBet > 0 ? (totalAccumulated / currentBet) : 0;

            setTimeout(() => {
              onShowBonusSummary({
                gameTitle: 'Lucky Neon 777 Slots',
                bonusType: 'free_spins',
                currencyMode: activeCurrency,
                totalWon: totalAccumulated,
                multiplier: multAchieved,
                totalSpinsOrOrbs: 10,
                featureDetails: '10 Free Spins Completed • 3× Multiplier Active on All Wins',
              });
            }, 600);
          }
          return Math.max(0, next);
        });
      }

      // Auto-spin decrement
      if (isAutoSpinning && autoSpinCount > 0 && !isInFreeSpins) {
        setAutoSpinCount(prev => prev - 1);
      }

    }, totalSpinTime + 4 * reelDelay + 100);

  }, [
    isSpinning, 
    isInFreeSpins, 
    freeSpinsActiveBet, 
    freeSpinsCurrency, 
    activeBet, 
    currencyMode, 
    balance, 
    cashBalance, 
    forcedBonusOutcome, 
    turboMode, 
    isAutoSpinning, 
    autoSpinCount, 
    freeSpinsTotalWon,
    onUpdateBalance, 
    onUpdateCashBalance, 
    onAddRakeback, 
    onRecordWager, 
    onShowBonusSummary
  ]);

  // AUTOMATIC FREE SPINS PLAYER
  // Free spins play automatically without requiring manual user input!
  useEffect(() => {
    if (!isInFreeSpins || isSpinning || freeSpinsLeft <= 0) return;

    const timer = setTimeout(() => {
      executeSpin();
    }, turboMode ? 600 : 1300);

    return () => clearTimeout(timer);
  }, [isInFreeSpins, isSpinning, freeSpinsLeft, executeSpin, turboMode]);

  // Regular Auto-spin loop
  useEffect(() => {
    if (!isAutoSpinning || autoSpinCount <= 0 || isSpinning || isInFreeSpins) return;
    const timer = setTimeout(() => {
      executeSpin();
    }, turboMode ? 400 : 1000);
    return () => clearTimeout(timer);
  }, [isAutoSpinning, autoSpinCount, isSpinning, isInFreeSpins, executeSpin, turboMode]);

  // Bonus Buy Trigger Handler
  const handleConfirmBonusBuy = (boughtBet: number) => {
    if (currencyMode === 'gc') {
      setGcBet(boughtBet);
    } else {
      setCashBet(boughtBet);
    }
    executeSpin(true, boughtBet);
  };

  // Keyboard shortcut Space to spin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpinning && !isInFreeSpins && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        executeSpin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, isInFreeSpins, executeSpin]);

  return (
    <div className="space-y-4 select-none">
      
      {/* Free Spins Alert Banner (Automatic Play Indicator) */}
      {isInFreeSpins && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-between shadow-xl shadow-amber-500/30 animate-pulse">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span>🌟 FREE SPINS BONUS IN PROGRESS (3× MULTIPLIER!)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">Won So Far: <strong>{freeSpinsCurrency === 'gc' ? `${freeSpinsTotalWon.toLocaleString()} GC` : `$${freeSpinsTotalWon.toFixed(2)}`}</strong></span>
            <span className="px-3 py-1 bg-zinc-950 text-amber-300 rounded-full font-mono text-xs shadow">
              {freeSpinsLeft} SPINS REMAINING
            </span>
          </div>
        </div>
      )}

      {/* MAIN SLOT MACHINE FRAME */}
      <div className="relative rounded-3xl bg-gradient-to-b from-zinc-950 via-[#110b22] to-zinc-950 border-4 border-amber-500/40 p-3 sm:p-6 shadow-2xl shadow-purple-950/60 overflow-hidden">
        
        {/* Neon Slot Machine Header Marquee */}
        <div className="flex items-center justify-between pb-3 mb-3 sm:mb-4 border-b border-purple-900/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-400">
              VEGAS GRAND • 20 LINES • 3× FREE SPINS
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono">
            <div>
              <span className="text-[9px] uppercase font-bold text-zinc-400 block leading-none">Last Win</span>
              <span className={`font-black text-xs sm:text-sm ${lastWinAmount > 0 ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`}>
                {lastWinAmount > 0 
                  ? (currencyMode === 'gc' ? `+${lastWinAmount.toLocaleString()} GC` : `+$${lastWinAmount.toFixed(2)} USD`)
                  : '0.00'
                }
              </span>
            </div>

            {/* Paytable & Help */}
            <button
              type="button"
              onClick={() => {
                sound.playChip();
                setShowPaytable(true);
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 cursor-pointer"
              title="Paytable & Rules"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5 REELS GRID WITH ANIMATED ROLLING STRIPS */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3 p-1 sm:p-2 rounded-2xl bg-zinc-950/90 border-2 border-purple-900/60 shadow-inner">
          {grid.map((reelCol, colIdx) => {
            // Find winning rows for this column
            const winRows = winningLines
              .filter(line => {
                const payline = PAYLINES[line.lineIndex];
                return payline[colIdx] !== undefined;
              })
              .map(line => PAYLINES[line.lineIndex][colIdx]);

            return (
              <ReelColumn
                key={colIdx}
                colIndex={colIdx}
                symbols={reelCol}
                stripSymbols={NEON_SYMBOLS}
                isSpinning={spinningReels[colIdx]}
                winningRows={winRows}
                currencyMode={currencyMode}
                activeBet={activeBet}
              />
            );
          })}
        </div>

        {/* CONTROLS BAR */}
        <div className="mt-4 pt-4 border-t border-purple-900/40 space-y-3">
          
          {/* Bet Selector & Feature Buy Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Bet Presets (Min $0.20 cash / 1000 GC) */}
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                Wager Per Spin (Min {currencyMode === 'gc' ? '1,000 GC' : '$0.20'})
              </span>
              <div className="flex items-center gap-1 mt-1 overflow-x-auto no-scrollbar py-0.5">
                {currencyMode === 'gc' ? (
                  GC_BET_PRESETS.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      disabled={isSpinning || isInFreeSpins}
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
                  ))
                ) : (
                  CASH_BET_PRESETS.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      disabled={isSpinning || isInFreeSpins}
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
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions: Feature Buy, Turbo, Auto */}
            <div className="flex items-center gap-2">
              {/* FEATURE BUY BUTTON */}
              <button
                type="button"
                disabled={isSpinning || isInFreeSpins}
                onClick={() => {
                  sound.playChip();
                  setIsBonusBuyOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50 border border-yellow-200/60"
              >
                <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Buy Bonus (100×)</span>
              </button>

              {/* Turbo Mode */}
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
                title="Turbo Spin Mode"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Turbo</span>
              </button>

              {/* Auto Spin */}
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
                  <span>Stop ({autoSpinCount})</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isInFreeSpins}
                  onClick={() => {
                    sound.playChip();
                    setAutoSpinCount(25);
                    setIsAutoSpinning(true);
                  }}
                  className="px-2.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Auto (25)</span>
                </button>
              )}
            </div>
          </div>

          {/* Big Spin Action Button */}
          <div className="flex items-center gap-3 pt-1">
            <button
              id="neon-slots-spin-btn"
              type="button"
              disabled={isSpinning || isInFreeSpins || currentAvailableBalance < activeBet}
              onClick={() => executeSpin()}
              className={`flex-1 py-4 rounded-2xl font-black text-sm sm:text-base uppercase tracking-widest shadow-2xl transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
                isInFreeSpins
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 cursor-wait animate-pulse'
                  : isSpinning
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
                {isInFreeSpins
                  ? `AUTO PLAYING FREE SPINS (${freeSpinsLeft} LEFT)`
                  : isSpinning 
                  ? 'SPINNING REELS...' 
                  : currentAvailableBalance < activeBet 
                  ? 'INSUFFICIENT BALANCE' 
                  : `SPIN (${currencyMode === 'gc' ? `${gcBet.toLocaleString()} GC` : `$${cashBet.toFixed(2)} USD`})`
                }
              </span>
            </button>
          </div>

        </div>

      </div>

      {/* Paytable Modal */}
      {showPaytable && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-zinc-950 border-2 border-amber-500/60 shadow-2xl p-5 sm:p-6 flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">📜</span>
                <h3 className="text-base font-black uppercase text-zinc-100">
                  Lucky Neon 777 Paytable & Rules
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
              <div>
                <h4 className="text-xs font-bold uppercase text-amber-400 mb-2.5">
                  Symbol Multipliers (Line Wins)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {NEON_SYMBOLS.map(sym => (
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

              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                <h4 className="text-xs font-bold uppercase text-purple-300">
                  Special Bonus Features
                </h4>
                <div className="text-xs text-zinc-300 space-y-1 leading-relaxed">
                  <p>• <strong>💎 Diamond Wild:</strong> Substitutes for any regular symbol to complete the highest paying winning payline.</p>
                  <p>• <strong>⭐ Gold Scatter:</strong> Hit 3+ Scatters to trigger <strong>10 Free Spins</strong> with an automatic <strong>3× multiplier</strong> on all line wins!</p>
                  <p>• <strong>Bonus Buy:</strong> Buy the 10 Free Spins Bonus round instantly for 100× your base bet ($20.00 on $0.20 min bet).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bonus Buy Modal */}
      <BonusBuyModal
        isOpen={isBonusBuyOpen}
        onClose={() => setIsBonusBuyOpen(false)}
        gameId="neon777"
        currencyMode={currencyMode}
        activeBet={activeBet}
        balance={balance}
        cashBalance={cashBalance}
        onConfirmBuy={handleConfirmBonusBuy}
      />

    </div>
  );
};
