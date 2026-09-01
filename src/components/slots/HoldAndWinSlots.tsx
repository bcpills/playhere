import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BaseSlotSymbol, BonusSummaryData } from './types';
import { ReelColumn } from './ReelColumn';
import { BonusBuyModal } from './BonusBuyModal';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Flame, 
  RotateCw, 
  Zap, 
  Square, 
  HelpCircle, 
  ShoppingBag, 
  Play,
  Trophy,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export const HOLD_WIN_SYMBOLS: BaseSlotSymbol[] = [
  { id: 'fire_wild', name: 'Inferno Wild', emoji: '🔥', color: 'text-amber-400', glow: 'shadow-amber-500/50', payouts: [60, 250, 1200], isWild: true },
  { id: 'pharaoh', name: 'Golden Pharaoh', emoji: '👑', color: 'text-yellow-300', glow: 'shadow-yellow-500/50', payouts: [40, 150, 600] },
  { id: 'anubis', name: 'Shadow Anubis', emoji: '🐺', color: 'text-purple-400', glow: 'shadow-purple-500/50', payouts: [25, 100, 400] },
  { id: 'eye', name: 'Eye of Ra', emoji: '👁️', color: 'text-cyan-400', glow: 'shadow-cyan-500/50', payouts: [20, 75, 250] },
  { id: 'scarab', name: 'Jeweled Scarab', emoji: '🪲', color: 'text-emerald-400', glow: 'shadow-emerald-500/50', payouts: [15, 50, 180] },
  { id: 'ankh', name: 'Solar Ankh', emoji: '☥', color: 'text-amber-300', glow: 'shadow-amber-500/50', payouts: [10, 35, 120] },
  { id: 'ace', name: 'Golden Ace', emoji: '🅰️', color: 'text-rose-400', glow: 'shadow-rose-500/50', payouts: [5, 15, 60] },
  { id: 'king', name: 'Royal King', emoji: '👑', color: 'text-indigo-400', glow: 'shadow-indigo-500/50', payouts: [4, 12, 50] },
];

// 25 Fixed Paylines for 5x3
const HOLD_WIN_PAYLINES: [number, number, number, number, number][] = [
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
  [1, 0, 2, 0, 1], // Diamond 1 (18)
  [1, 2, 0, 2, 1], // Diamond 2 (19)
  [0, 2, 0, 2, 0], // Zig zag (20)
  [0, 1, 2, 2, 2], // Hook bottom (21)
  [2, 1, 0, 0, 0], // Hook top (22)
  [0, 0, 0, 1, 2], // Corner down (23)
  [2, 2, 2, 1, 0], // Corner up (24)
  [1, 1, 0, 1, 1], // Inverted V (25)
];

const CASH_BET_PRESETS = [0.10, 0.25, 0.50, 1.00, 2.00, 5.00, 10.00];
const GC_BET_PRESETS = [500, 1000, 2500, 5000, 10000, 25000, 50000];

// Generates a Sun Fire Orb with realistic weighted multiplier or Jackpots
function generateSunOrb(): BaseSlotSymbol {
  const rand = Math.random() * 100;
  let orbVal = 1;
  let jackpot: 'mini' | 'minor' | 'major' | undefined = undefined;

  if (rand < 2) {
    jackpot = 'major';
    orbVal = 150;
  } else if (rand < 6) {
    jackpot = 'minor';
    orbVal = 50;
  } else if (rand < 14) {
    jackpot = 'mini';
    orbVal = 20;
  } else if (rand < 25) {
    orbVal = 15;
  } else if (rand < 40) {
    orbVal = 10;
  } else if (rand < 60) {
    orbVal = 5;
  } else if (rand < 80) {
    orbVal = 3;
  } else {
    orbVal = 2;
  }

  return {
    id: `sun_orb_${Date.now()}_${Math.random()}`,
    name: jackpot ? `${jackpot.toUpperCase()} Orb` : 'Sun Fire Orb',
    emoji: jackpot === 'major' ? '🔮' : jackpot === 'minor' ? '💎' : jackpot === 'mini' ? '🪙' : '☀️',
    color: 'text-amber-300',
    glow: 'shadow-amber-500/80',
    payouts: [0, 0, 0],
    isBonusOrb: true,
    orbValue: orbVal,
    jackpotType: jackpot,
  };
}

function getRandomHoldWinSymbol(allowOrbs = true): BaseSlotSymbol {
  const rand = Math.random() * 100;
  if (allowOrbs && rand < 14) {
    return generateSunOrb();
  }
  if (rand < 18) return HOLD_WIN_SYMBOLS[0]; // Wild
  if (rand < 28) return HOLD_WIN_SYMBOLS[1]; // Pharaoh
  if (rand < 40) return HOLD_WIN_SYMBOLS[2]; // Anubis
  if (rand < 55) return HOLD_WIN_SYMBOLS[3]; // Eye
  if (rand < 70) return HOLD_WIN_SYMBOLS[4]; // Scarab
  if (rand < 84) return HOLD_WIN_SYMBOLS[5]; // Ankh
  if (rand < 92) return HOLD_WIN_SYMBOLS[6]; // Ace
  return HOLD_WIN_SYMBOLS[7];                // King
}

function generateInitialHoldWinGrid(): BaseSlotSymbol[][] {
  const grid: BaseSlotSymbol[][] = [];
  for (let c = 0; c < 5; c++) {
    const col: BaseSlotSymbol[] = [];
    for (let r = 0; r < 3; r++) {
      col.push(getRandomHoldWinSymbol(true));
    }
    grid.push(col);
  }
  return grid;
}

interface HoldAndWinSlotsProps {
  currencyMode: 'gc' | 'cash';
  balance: number;
  cashBalance: number;
  onUpdateBalance: (amount: number | ((prev: number) => number)) => void;
  onUpdateCashBalance?: (amount: number | ((prev: number) => number)) => void;
  onAddRakeback: (wager: number) => void;
  onRecordWager: (amount: number, isCash: boolean) => void;
  onShowBonusSummary: (summary: BonusSummaryData) => void;
}

export const HoldAndWinSlots: React.FC<HoldAndWinSlotsProps> = ({
  currencyMode,
  balance,
  cashBalance,
  onUpdateBalance,
  onUpdateCashBalance,
  onAddRakeback,
  onRecordWager,
  onShowBonusSummary,
}) => {
  // Bet state (Min $0.10 cash / 500 GC)
  const [cashBet, setCashBet] = useState<number>(0.10);
  const [gcBet, setGcBet] = useState<number>(500);

  // Machine state
  const [grid, setGrid] = useState<BaseSlotSymbol[][]>(generateInitialHoldWinGrid);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinningReels, setSpinningReels] = useState<boolean[]>([false, false, false, false, false]);
  const [winningLines, setWinningLines] = useState<{ lineIndex: number; symbol: BaseSlotSymbol; count: number; payout: number }[]>([]);
  const [lastWinAmount, setLastWinAmount] = useState<number>(0);
  const [turboMode, setTurboMode] = useState<boolean>(false);
  const [autoSpinCount, setAutoSpinCount] = useState<number>(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState<boolean>(false);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [isBonusBuyOpen, setIsBonusBuyOpen] = useState<boolean>(false);

  // HOLD & WIN BONUS STATE
  const [isInHoldAndWin, setIsInHoldAndWin] = useState<boolean>(false);
  const [respinsLeft, setRespinsLeft] = useState<number>(0);
  const [lockedCells, setLockedCells] = useState<Record<string, BaseSlotSymbol>>({}); // key: `${c}-${r}`
  const [holdAndWinActiveBet, setHoldAndWinActiveBet] = useState<number>(0.10);
  const [holdAndWinCurrency, setHoldAndWinCurrency] = useState<'gc' | 'cash'>('cash');
  const [forcedBonusBuy, setForcedBonusBuy] = useState<boolean>(false);

  const activeBet = currencyMode === 'gc' ? gcBet : cashBet;
  const currentAvailableBalance = currencyMode === 'gc' ? balance : cashBalance;

  // Execute a standard spin or Hold & Win respin
  const executeSpin = useCallback((isBoughtBonus = false, boughtBet?: number) => {
    if (isSpinning) return;

    const currentBet = isInHoldAndWin 
      ? holdAndWinActiveBet 
      : (boughtBet ?? activeBet);
    const activeCurrency = isInHoldAndWin ? holdAndWinCurrency : currencyMode;

    // Check bankroll if not currently in Hold & Win respins
    if (!isInHoldAndWin) {
      const wagerCost = isBoughtBonus ? currentBet * 120 : currentBet;
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

    // Build outcome grid
    const nextGrid: BaseSlotSymbol[][] = [];
    const isTriggeringBonus = isBoughtBonus || forcedBonusBuy;

    if (isInHoldAndWin) {
      // In Hold & Win: locked positions stay locked with their existing orb!
      for (let c = 0; c < 5; c++) {
        const col: BaseSlotSymbol[] = [];
        for (let r = 0; r < 3; r++) {
          const key = `${c}-${r}`;
          if (lockedCells[key]) {
            col.push(lockedCells[key]);
          } else {
            // Chance to drop a new Sun Orb on this unlocked position
            const hitNewOrb = Math.random() < 0.28;
            if (hitNewOrb) {
              col.push(generateSunOrb());
            } else {
              col.push(getRandomHoldWinSymbol(false));
            }
          }
        }
        nextGrid.push(col);
      }
    } else {
      // Base Game Spin
      for (let c = 0; c < 5; c++) {
        const col: BaseSlotSymbol[] = [];
        for (let r = 0; r < 3; r++) {
          // If bonus buy was bought: force 6 high-value sun orbs
          if (isTriggeringBonus && (
            (c === 0 && r === 0) || 
            (c === 1 && r === 1) || 
            (c === 2 && r === 0) || 
            (c === 3 && r === 2) || 
            (c === 4 && r === 1) || 
            (c === 2 && r === 2)
          )) {
            col.push(generateSunOrb());
          } else {
            col.push(getRandomHoldWinSymbol(true));
          }
        }
        nextGrid.push(col);
      }
    }

    if (isTriggeringBonus) {
      setForcedBonusBuy(false);
    }

    const reelDelay = turboMode ? 90 : 180;
    const totalSpinTime = turboMode ? 350 : 800;

    // Staggered reel stop animation
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

    // Evaluation after all reels stop
    setTimeout(() => {
      setGrid(nextGrid);
      setIsSpinning(false);

      if (isInHoldAndWin) {
        // HOLD & WIN RESPIN EVALUATION
        const currentLocked = { ...lockedCells };
        let newlyLandedCount = 0;

        for (let c = 0; c < 5; c++) {
          for (let r = 0; r < 3; r++) {
            const key = `${c}-${r}`;
            const sym = nextGrid[c][r];
            if (sym.isBonusOrb && !currentLocked[key]) {
              currentLocked[key] = sym;
              newlyLandedCount++;
              sound.playCoinLock(!!sym.jackpotType);
            }
          }
        }

        setLockedCells(currentLocked);
        const totalLockedCount = Object.keys(currentLocked).length;

        // If new orbs landed, RESET respins to 3!
        if (newlyLandedCount > 0) {
          setRespinsLeft(3);
        } else {
          setRespinsLeft(prev => Math.max(0, prev - 1));
        }

        // Check if all 15 positions filled (GRAND JACKPOT!) or respins ran out
        const isGrandJackpot = totalLockedCount === 15;
        const isGameOver = (newlyLandedCount === 0 && respinsLeft <= 1) || isGrandJackpot;

        if (isGameOver) {
          // Bonus complete! Tally all locked orbs
          let totalOrbMultiplier = 0;
          let jackpotHit: 'mini' | 'minor' | 'major' | 'grand' | null = null;

          (Object.values(currentLocked) as BaseSlotSymbol[]).forEach(orb => {
            totalOrbMultiplier += (orb.orbValue || 0);
            if (orb.jackpotType) {
              jackpotHit = orb.jackpotType;
            }
          });

          if (isGrandJackpot) {
            totalOrbMultiplier += 1000; // 1,000x GRAND JACKPOT
            jackpotHit = 'grand';
          }

          const totalWon = activeCurrency === 'gc'
            ? Math.round(currentBet * totalOrbMultiplier)
            : Number((currentBet * totalOrbMultiplier).toFixed(2));

          setLastWinAmount(totalWon);

          // Credit balance
          if (activeCurrency === 'gc') {
            onUpdateBalance(totalWon);
          } else if (onUpdateCashBalance) {
            onUpdateCashBalance(prev => Number((prev + totalWon).toFixed(2)));
          }

          setIsInHoldAndWin(false);
          setLockedCells({});
          setRespinsLeft(0);

          setTimeout(() => {
            onShowBonusSummary({
              gameTitle: 'Solar Inferno: Hold & Win',
              bonusType: 'hold_and_win',
              currencyMode: activeCurrency,
              totalWon,
              multiplier: totalOrbMultiplier,
              totalSpinsOrOrbs: totalLockedCount,
              jackpotHit,
              featureDetails: isGrandJackpot
                ? '👑 15/15 ALL POSITIONS FILLED! 1,000× GRAND JACKPOT WON!'
                : `${totalLockedCount}/15 Fiery Sun Orbs Collected & Cash Multipliers Awarded`,
            });
          }, 600);
        }

      } else {
        // BASE GAME EVALUATION
        // 1. Check for 6+ Sun Orbs to trigger Hold & Win
        const foundOrbs: { c: number; r: number; sym: BaseSlotSymbol }[] = [];
        for (let c = 0; c < 5; c++) {
          for (let r = 0; r < 3; r++) {
            if (nextGrid[c][r].isBonusOrb) {
              foundOrbs.push({ c, r, sym: nextGrid[c][r] });
            }
          }
        }

        if (foundOrbs.length >= 6) {
          // Trigger Hold & Win feature!
          sound.playBonusTrigger();
          confetti({ particleCount: 140, spread: 80, origin: { y: 0.5 } });
          
          const initialLocked: Record<string, BaseSlotSymbol> = {};
          foundOrbs.forEach(item => {
            initialLocked[`${item.c}-${item.r}`] = item.sym;
          });

          setLockedCells(initialLocked);
          setIsInHoldAndWin(true);
          setRespinsLeft(3);
          setHoldAndWinActiveBet(currentBet);
          setHoldAndWinCurrency(activeCurrency);
          return;
        }

        // 2. Evaluate 25 Base Paylines
        let totalMultiplier = 0;
        const hitLines: { lineIndex: number; symbol: BaseSlotSymbol; count: number; payout: number }[] = [];

        HOLD_WIN_PAYLINES.forEach((line, lineIdx) => {
          const firstSym = nextGrid[0][line[0]];
          if (firstSym.isBonusOrb) return;

          let matchCount = 1;
          let matchSymbol = firstSym;

          if (firstSym.isWild) {
            for (let i = 1; i < 5; i++) {
              const sym = nextGrid[i][line[i]];
              if (!sym.isWild && !sym.isBonusOrb) {
                matchSymbol = sym;
                break;
              }
            }
          }

          if (matchSymbol.isBonusOrb) return;

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

        setWinningLines(hitLines);

        if (totalMultiplier > 0) {
          const winAmount = activeCurrency === 'gc'
            ? Math.round(currentBet * (totalMultiplier / 25))
            : Number((currentBet * (totalMultiplier / 25)).toFixed(2));

          setLastWinAmount(winAmount);

          if (activeCurrency === 'gc') {
            onUpdateBalance(winAmount);
          } else if (onUpdateCashBalance) {
            onUpdateCashBalance(prev => Number((prev + winAmount).toFixed(2)));
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

        // Auto-spin decrement
        if (isAutoSpinning && autoSpinCount > 0) {
          setAutoSpinCount(prev => prev - 1);
        }
      }

    }, totalSpinTime + 4 * reelDelay + 100);

  }, [
    isSpinning,
    isInHoldAndWin,
    respinsLeft,
    lockedCells,
    holdAndWinActiveBet,
    holdAndWinCurrency,
    activeBet,
    currencyMode,
    balance,
    cashBalance,
    forcedBonusBuy,
    turboMode,
    isAutoSpinning,
    autoSpinCount,
    onUpdateBalance,
    onUpdateCashBalance,
    onAddRakeback,
    onRecordWager,
    onShowBonusSummary
  ]);

  // AUTOMATIC HOLD & WIN RESPINS LOOP
  // All Hold & Win respins trigger and play automatically without requiring manual player clicks!
  useEffect(() => {
    if (!isInHoldAndWin || isSpinning || respinsLeft <= 0) return;

    const timer = setTimeout(() => {
      executeSpin();
    }, turboMode ? 700 : 1400);

    return () => clearTimeout(timer);
  }, [isInHoldAndWin, isSpinning, respinsLeft, executeSpin, turboMode]);

  // Regular Auto-spin loop
  useEffect(() => {
    if (!isAutoSpinning || autoSpinCount <= 0 || isSpinning || isInHoldAndWin) return;
    const timer = setTimeout(() => {
      executeSpin();
    }, turboMode ? 400 : 1000);
    return () => clearTimeout(timer);
  }, [isAutoSpinning, autoSpinCount, isSpinning, isInHoldAndWin, executeSpin, turboMode]);

  // Confirm Bonus Buy Handler (120x bet)
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
      if (e.code === 'Space' && !isSpinning && !isInHoldAndWin && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        executeSpin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, isInHoldAndWin, executeSpin]);

  return (
    <div className="space-y-4 select-none">
      
      {/* Jackpots Ticker Bar */}
      <div className="grid grid-cols-4 gap-2 text-center text-zinc-950 font-black font-mono uppercase text-xs">
        <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 border border-emerald-300 shadow-md">
          <span className="text-[9px] block text-emerald-950/80 font-sans font-bold">MINI JACKPOT</span>
          <span>20× ({currencyMode === 'gc' ? `${(activeBet * 20).toLocaleString()} GC` : `$${(activeBet * 20).toFixed(2)}`})</span>
        </div>
        <div className="p-2 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-400 border border-blue-300 shadow-md">
          <span className="text-[9px] block text-blue-950/80 font-sans font-bold">MINOR JACKPOT</span>
          <span>50× ({currencyMode === 'gc' ? `${(activeBet * 50).toLocaleString()} GC` : `$${(activeBet * 50).toFixed(2)}`})</span>
        </div>
        <div className="p-2 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 border border-purple-300 shadow-md">
          <span className="text-[9px] block text-purple-950/80 font-sans font-bold">MAJOR JACKPOT</span>
          <span>150× ({currencyMode === 'gc' ? `${(activeBet * 150).toLocaleString()} GC` : `$${(activeBet * 150).toFixed(2)}`})</span>
        </div>
        <div className="p-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 border border-yellow-200 shadow-lg shadow-amber-500/30 animate-pulse">
          <span className="text-[9px] block text-amber-950/80 font-sans font-bold">GRAND (15/15)</span>
          <span>1,000× ({currencyMode === 'gc' ? `${(activeBet * 1000).toLocaleString()} GC` : `$${(activeBet * 1000).toFixed(2)}`})</span>
        </div>
      </div>

      {/* HOLD & WIN IN-PROGRESS BANNER */}
      {isInHoldAndWin && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-orange-600 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-between shadow-xl shadow-red-500/40 animate-pulse">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 fill-current text-zinc-950" />
            <span>🔥 HOLD & WIN RESPINS ACTIVE (AUTO SPINNING)</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Locked Orbs: <strong>{Object.keys(lockedCells).length} / 15</strong></span>
            <span className="px-3 py-1 bg-zinc-950 text-amber-300 rounded-full font-mono text-xs shadow">
              {respinsLeft} RESPINS LEFT
            </span>
          </div>
        </div>
      )}

      {/* MAIN HOLD & WIN SLOT FRAME */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#180808] via-zinc-950 to-[#220a0a] border-4 border-amber-500/50 p-3 sm:p-6 shadow-2xl shadow-amber-950/70 overflow-hidden">
        
        {/* Header Marquee */}
        <div className="flex items-center justify-between pb-3 mb-3 sm:mb-4 border-b border-amber-900/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-400">
              SOLAR INFERNO • HOLD & WIN • 25 PAYLINES
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

        {/* 5 REELS GRID */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3 p-1 sm:p-2 rounded-2xl bg-zinc-950/90 border-2 border-amber-900/60 shadow-inner">
          {grid.map((reelCol, colIdx) => {
            const winRows = winningLines
              .filter(line => {
                const payline = HOLD_WIN_PAYLINES[line.lineIndex];
                return payline[colIdx] !== undefined;
              })
              .map(line => HOLD_WIN_PAYLINES[line.lineIndex][colIdx]);

            // Form locked mapping for this column
            const lockedForCol: Record<number, boolean> = {};
            if (isInHoldAndWin) {
              for (let r = 0; r < 3; r++) {
                if (lockedCells[`${colIdx}-${r}`]) {
                  lockedForCol[r] = true;
                }
              }
            }

            return (
              <ReelColumn
                key={colIdx}
                colIndex={colIdx}
                symbols={reelCol}
                stripSymbols={HOLD_WIN_SYMBOLS}
                isSpinning={spinningReels[colIdx] && !Object.values(lockedForCol).every(Boolean)}
                winningRows={winRows}
                lockedRows={lockedForCol}
                currencyMode={currencyMode}
                activeBet={activeBet}
              />
            );
          })}
        </div>

        {/* CONTROLS BAR */}
        <div className="mt-4 pt-4 border-t border-amber-900/40 space-y-3">
          
          {/* Bet Selector & Feature Buy Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Bet Presets (Min $0.10 cash / 500 GC) */}
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                Wager Per Spin (Min {currencyMode === 'gc' ? '500 GC' : '$0.10'})
              </span>
              <div className="flex items-center gap-1 mt-1 overflow-x-auto no-scrollbar py-0.5">
                {currencyMode === 'gc' ? (
                  GC_BET_PRESETS.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      disabled={isSpinning || isInHoldAndWin}
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
                      disabled={isSpinning || isInHoldAndWin}
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
                disabled={isSpinning || isInHoldAndWin}
                onClick={() => {
                  sound.playChip();
                  setIsBonusBuyOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-orange-500 hover:from-red-500 hover:to-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50 border border-yellow-300/60"
              >
                <Flame className="w-3.5 h-3.5 fill-zinc-950" />
                <span>Buy Hold & Win (120×)</span>
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
                  disabled={isInHoldAndWin}
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
              id="hold-win-spin-btn"
              type="button"
              disabled={isSpinning || isInHoldAndWin || currentAvailableBalance < activeBet}
              onClick={() => executeSpin()}
              className={`flex-1 py-4 rounded-2xl font-black text-sm sm:text-base uppercase tracking-widest shadow-2xl transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
                isInHoldAndWin
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 cursor-wait animate-pulse'
                  : isSpinning
                  ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                  : currentAvailableBalance < activeBet
                  ? 'bg-red-950/60 text-red-400 border border-red-500/40 cursor-not-allowed'
                  : currencyMode === 'gc'
                  ? 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 hover:from-amber-400 hover:to-orange-300 text-zinc-950 shadow-amber-500/30 hover:scale-101'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 shadow-emerald-500/30 hover:scale-101'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>
                {isInHoldAndWin
                  ? `AUTO PLAYING RESPINS (${respinsLeft} LEFT)`
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
                  Solar Inferno: Hold & Win Rules
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
                  Base Payline Multipliers
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {HOLD_WIN_SYMBOLS.map(sym => (
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
                <h4 className="text-xs font-bold uppercase text-amber-400">
                  Hold & Win Respins Bonus Mechanics
                </h4>
                <div className="text-xs text-zinc-300 space-y-1.5 leading-relaxed">
                  <p>• <strong>☀️ 6+ Solar Orbs:</strong> Land 6 or more Sun Orbs anywhere on the reels to trigger the 3-Respins Hold & Win Bonus!</p>
                  <p>• <strong>Lock & Reset:</strong> All triggering orbs lock in place. Each newly landed orb also locks and resets the respin counter back to 3!</p>
                  <p>• <strong>👑 1,000× Grand Jackpot:</strong> Fill all 15 grid positions with locked Sun Orbs to instantly trigger the 1,000× Grand Jackpot!</p>
                  <p>• <strong>Bonus Buy:</strong> Instantly buy the Hold & Win feature for 120× your base bet ($12.00 on $0.10 min bet).</p>
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
        gameId="holdAndWin"
        currencyMode={currencyMode}
        activeBet={activeBet}
        balance={balance}
        cashBalance={cashBalance}
        onConfirmBuy={handleConfirmBonusBuy}
      />

    </div>
  );
};
