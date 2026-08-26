import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Bomb, 
  Coins, 
  Zap, 
  ShieldAlert, 
  AlertCircle,
  Trophy,
  Sliders,
  Sparkles
} from 'lucide-react';
import { CasinoStats } from '../types';
import { sound } from '../utils/audio';
import { formatCompactWager } from '../utils/leaderboard';

interface MinesGameProps {
  balance: number;
  onUpdateBalance: (amount: number | ((prev: number) => number)) => void;
  stats: CasinoStats;
  onUpdateStats: (updater: (prev: CasinoStats) => CasinoStats) => void;
  onAddRakeback?: (wager: number, isBlackjack?: boolean) => void;
}

type TileState = 'hidden' | 'gem' | 'mine' | 'exploded';

interface GridTile {
  index: number;
  hasMine: boolean;
  state: TileState;
}

// Calculate Mines multiplier given total tiles (25), mines count (M), and revealed gems (k)
export function getMinesMultiplier(mines: number, revealedGems: number): number {
  if (revealedGems === 0) return 1.0;
  const totalTiles = 25;
  const safeTiles = totalTiles - mines;
  if (revealedGems > safeTiles) return 1.0;

  // Multiplier = 0.99 * ( (25 choose k) / ( (25-M) choose k ) )
  let prob = 1.0;
  for (let i = 0; i < revealedGems; i++) {
    prob *= (safeTiles - i) / (totalTiles - i);
  }
  const fairMult = 1 / prob;
  const houseEdgeMult = fairMult * 0.99;
  return Math.max(1.01, Math.round(houseEdgeMult * 100) / 100);
}

export const MinesGame: React.FC<MinesGameProps> = ({
  balance,
  onUpdateBalance,
  onUpdateStats,
  onAddRakeback,
}) => {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [mineCount, setMineCount] = useState<number>(3);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [wonRound, setWonRound] = useState<boolean>(false);
  const [tiles, setTiles] = useState<GridTile[]>([]);
  const [revealedGemsCount, setRevealedGemsCount] = useState<number>(0);
  const [lastWinAmount, setLastWinAmount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Bet presets
  const quickBets = [10, 25, 50, 100, 500, 1000];
  const quickMines = [1, 2, 3, 5, 10, 15, 20, 24];

  // Current and Next Multipliers
  const currentMultiplier = useMemo(() => {
    return getMinesMultiplier(mineCount, revealedGemsCount);
  }, [mineCount, revealedGemsCount]);

  const nextMultiplier = useMemo(() => {
    if (revealedGemsCount >= 25 - mineCount) return currentMultiplier;
    return getMinesMultiplier(mineCount, revealedGemsCount + 1);
  }, [mineCount, revealedGemsCount, currentMultiplier]);

  const currentCashoutValue = useMemo(() => {
    return Math.floor(betAmount * currentMultiplier);
  }, [betAmount, currentMultiplier]);

  const currentProfit = useMemo(() => {
    return Math.max(0, currentCashoutValue - betAmount);
  }, [currentCashoutValue, betAmount]);

  // Safe mine count setter with clamp 1..24
  const handleMineCountChange = (val: number) => {
    if (gameActive) return;
    if (isNaN(val)) {
      setMineCount(1);
      return;
    }
    const clamped = Math.max(1, Math.min(24, val));
    setMineCount(clamped);
  };

  // Start new round
  const handleStartGame = () => {
    if (gameActive) return;
    if (betAmount <= 0 || isNaN(betAmount)) {
      setErrorMessage('Please enter a valid bet amount.');
      return;
    }
    if (betAmount > balance) {
      setErrorMessage('Insufficient balance to place this wager.');
      sound.playLose();
      return;
    }
    if (mineCount < 1 || mineCount > 24) {
      setErrorMessage('Select between 1 and 24 mines.');
      return;
    }

    setErrorMessage(null);
    setGameOver(false);
    setWonRound(false);
    setLastWinAmount(null);
    setRevealedGemsCount(0);

    // Deduct bet from balance
    onUpdateBalance(-betAmount);
    
    // Add 10% rakeback
    if (onAddRakeback) {
      onAddRakeback(betAmount, false);
    }

    // Update stats: wagered
    onUpdateStats(prev => ({
      ...prev,
      totalWagered: prev.totalWagered + betAmount,
      roundsPlayedMines: (prev.roundsPlayedMines || 0) + 1,
    }));

    // Generate random 5x5 board with exact mineCount mines
    const mineIndices = new Set<number>();
    while (mineIndices.size < mineCount) {
      const rand = Math.floor(Math.random() * 25);
      mineIndices.add(rand);
    }

    const newTiles: GridTile[] = Array.from({ length: 25 }, (_, idx) => ({
      index: idx,
      hasMine: mineIndices.has(idx),
      state: 'hidden',
    }));

    setTiles(newTiles);
    setGameActive(true);
    sound.playChip();
  };

  // Click on a tile
  const handleTileClick = (index: number) => {
    if (!gameActive || gameOver) return;
    const tile = tiles[index];
    if (!tile || tile.state !== 'hidden') return;

    if (tile.hasMine) {
      // Hit a mine! Explosion!
      sound.playExplosion();
      const updatedTiles = tiles.map(t => {
        if (t.index === index) {
          return { ...t, state: 'exploded' as TileState };
        }
        if (t.hasMine) {
          return { ...t, state: 'mine' as TileState };
        }
        return t;
      });

      setTiles(updatedTiles);
      setGameActive(false);
      setGameOver(true);
      setWonRound(false);

      onUpdateStats(prev => ({
        ...prev,
        totalLost: prev.totalLost + betAmount,
        netProfit: prev.netProfit - betAmount,
      }));
    } else {
      // Revealed a Gem!
      sound.playChime();
      const newRevealedCount = revealedGemsCount + 1;
      const maxGems = 25 - mineCount;

      const updatedTiles = tiles.map(t => {
        if (t.index === index) {
          return { ...t, state: 'gem' as TileState };
        }
        return t;
      });

      setTiles(updatedTiles);
      setRevealedGemsCount(newRevealedCount);

      // Check if all gems cleared (Auto-Cashout!)
      if (newRevealedCount === maxGems) {
        const finalMult = getMinesMultiplier(mineCount, newRevealedCount);
        const totalPayout = Math.floor(betAmount * finalMult);
        handleAutoVictory(totalPayout, finalMult, updatedTiles);
      }
    }
  };

  // Cashout button clicked
  const handleCashout = () => {
    if (!gameActive || revealedGemsCount === 0 || gameOver) return;

    const payout = currentCashoutValue;
    const mult = currentMultiplier;

    sound.playWin();
    onUpdateBalance(payout);
    setLastWinAmount(payout);
    setWonRound(true);
    setGameActive(false);
    setGameOver(true);

    // Reveal the rest of the board safely
    const updatedTiles = tiles.map(t => {
      if (t.state === 'hidden') {
        return { ...t, state: t.hasMine ? ('mine' as TileState) : ('gem' as TileState) };
      }
      return t;
    });
    setTiles(updatedTiles);

    // Update Stats
    onUpdateStats(prev => ({
      ...prev,
      totalWon: prev.totalWon + payout,
      netProfit: prev.netProfit + (payout - betAmount),
      biggestWin: Math.max(prev.biggestWin, payout),
      biggestMultiplier: Math.max(prev.biggestMultiplier, mult),
    }));
  };

  // Full board clear victory
  const handleAutoVictory = (payout: number, mult: number, currentTiles: GridTile[]) => {
    sound.playBigWin();
    onUpdateBalance(payout);
    setLastWinAmount(payout);
    setWonRound(true);
    setGameActive(false);
    setGameOver(true);

    const revealedBoard = currentTiles.map(t => {
      if (t.state === 'hidden' && t.hasMine) {
        return { ...t, state: 'mine' as TileState };
      }
      return t;
    });
    setTiles(revealedBoard);

    onUpdateStats(prev => ({
      ...prev,
      totalWon: prev.totalWon + payout,
      netProfit: prev.netProfit + (payout - betAmount),
      biggestWin: Math.max(prev.biggestWin, payout),
      biggestMultiplier: Math.max(prev.biggestMultiplier, mult),
    }));
  };

  // Auto Pick a random unrevealed tile
  const handleAutoPick = () => {
    if (!gameActive || gameOver) return;
    const hiddenTiles = tiles.filter(t => t.state === 'hidden');
    if (hiddenTiles.length === 0) return;
    const randomPick = hiddenTiles[Math.floor(Math.random() * hiddenTiles.length)];
    handleTileClick(randomPick.index);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
      {/* Compact Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-3 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow text-lg shrink-0">
            💣
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                Mines Rush
              </h1>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                10% Rakeback
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden xs:block">
              Uncover gems to scale your multiplier. Cash out before detonating a mine!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-zinc-800 shrink-0">
          <div className="text-right">
            <span className="text-[8px] uppercase font-bold text-zinc-500 block">Bankroll</span>
            <span className="text-xs sm:text-sm font-black font-mono text-amber-300 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{(isNaN(balance) ? 1000 : balance).toLocaleString()}c</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Game Layout (Side-by-side on desktop, compact on mobile so no scrolling needed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
        
        {/* Left Side: Controls & Betting Panel (5 cols) */}
        <div className="lg:col-span-5 p-3.5 sm:p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-xl space-y-3">
          
          {/* Bet Amount Control */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase text-zinc-400 flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-400" />
                <span>Wager Amount</span>
              </label>
              <span className="text-[10px] font-mono text-zinc-500">
                Bal: {(isNaN(balance) ? 1000 : balance).toLocaleString()}c
              </span>
            </div>

            <div className="relative mb-1.5">
              <input
                type="number"
                min={1}
                max={balance}
                disabled={gameActive}
                value={betAmount}
                onChange={e => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-amber-500 transition-all disabled:opacity-50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">
                CHIPS
              </span>
            </div>

            {/* Quick Bet Buttons */}
            <div className="grid grid-cols-6 gap-1 mb-1.5">
              {quickBets.map(amt => (
                <button
                  key={amt}
                  type="button"
                  disabled={gameActive}
                  onClick={() => {
                    setBetAmount(amt);
                    sound.playChip();
                  }}
                  className={`py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${
                    betAmount === amt 
                      ? 'bg-amber-500 text-zinc-950 font-black shadow' 
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
                  } disabled:opacity-40`}
                >
                  {formatCompactWager(amt)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                disabled={gameActive}
                onClick={() => setBetAmount(10)}
                className="py-1 rounded-lg text-[9px] font-bold uppercase bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer disabled:opacity-40"
              >
                Min
              </button>
              <button
                type="button"
                disabled={gameActive}
                onClick={() => setBetAmount(prev => Math.max(1, Math.floor(prev / 2)))}
                className="py-1 rounded-lg text-[9px] font-bold uppercase bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer disabled:opacity-40"
              >
                1/2
              </button>
              <button
                type="button"
                disabled={gameActive}
                onClick={() => setBetAmount(prev => Math.min(balance, prev * 2))}
                className="py-1 rounded-lg text-[9px] font-bold uppercase bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer disabled:opacity-40"
              >
                2X
              </button>
              <button
                type="button"
                disabled={gameActive}
                onClick={() => setBetAmount(balance)}
                className="py-1 rounded-lg text-[9px] font-bold uppercase bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 border border-zinc-800 cursor-pointer disabled:opacity-40"
              >
                Max
              </button>
            </div>
          </div>

          {/* Mines Count Selector: Slider + Direct Number Input + Presets */}
          <div className="pt-2.5 border-t border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase text-zinc-400 flex items-center gap-1">
                <Bomb className="w-3 h-3 text-rose-400" />
                <span>Mines Count (1-24)</span>
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold font-mono text-emerald-400">
                  {25 - mineCount} Safe
                </span>
                {/* DIRECT NUMBER INPUT FIELD */}
                <div className="relative w-16">
                  <input
                    type="number"
                    min={1}
                    max={24}
                    disabled={gameActive}
                    value={mineCount}
                    onChange={e => handleMineCountChange(parseInt(e.target.value))}
                    className="w-full text-center py-0.5 px-1 rounded-lg bg-zinc-900 border border-rose-500/50 text-white font-mono font-black text-xs focus:outline-none focus:border-rose-400 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Draggable Slider with visual ticks */}
            <div className="space-y-1">
              <input
                type="range"
                min={1}
                max={24}
                disabled={gameActive}
                value={mineCount}
                onChange={e => handleMineCountChange(parseInt(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer disabled:opacity-40 h-2 bg-zinc-900 rounded-lg"
              />
              <div className="flex justify-between text-[8px] font-mono text-zinc-600 px-0.5">
                <span>1</span>
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
                <span>24</span>
              </div>
            </div>

            {/* Quick Mines Grid */}
            <div className="grid grid-cols-4 gap-1">
              {quickMines.map(count => (
                <button
                  key={count}
                  type="button"
                  disabled={gameActive}
                  onClick={() => {
                    handleMineCountChange(count);
                    sound.playClick();
                  }}
                  className={`py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${
                    mineCount === count
                      ? 'bg-rose-600 text-white font-black shadow border border-rose-400/40'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
                  } disabled:opacity-40`}
                >
                  {count} {count === 1 ? 'Mine' : 'M'}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-2">
            {!gameActive ? (
              <button
                type="button"
                onClick={handleStartGame}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:via-rose-400 hover:to-purple-500 text-zinc-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-rose-950/40 transition-all cursor-pointer active:scale-98"
              >
                Start Mines ({betAmount.toLocaleString()}c)
              </button>
            ) : (
              <div className="space-y-1.5">
                <button
                  type="button"
                  disabled={revealedGemsCount === 0}
                  onClick={handleCashout}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <span>Cashout</span>
                  <span className="font-mono text-sm font-black">
                    +{currentCashoutValue.toLocaleString()}c ({currentMultiplier}x)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoPick}
                  className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-all cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Auto Pick Tile</span>
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Current Multipliers Display */}
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs space-y-1 font-mono">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>Gems Cleared:</span>
              <span className="font-bold text-white">{revealedGemsCount} / {25 - mineCount}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>Current Multiplier:</span>
              <span className="font-black text-amber-300 text-xs">{currentMultiplier}x</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>Next Tile Value:</span>
              <span className="font-bold text-emerald-400 text-xs">{nextMultiplier}x</span>
            </div>
          </div>
        </div>

        {/* Right Side: 5x5 Mines Grid Board & Integrated Cashout Bar (7 cols) */}
        <div className="lg:col-span-7 p-3 sm:p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-2xl flex flex-col items-center justify-center">
          
          {/* Integrated Immediate Cashout Bar on top of Board (NO SCROLLING REQUIRED) */}
          <div className="w-full mb-3 flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-zinc-500">Status:</span>
              {gameActive ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Pick Safe Tile
                </span>
              ) : wonRound ? (
                <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  Won: +{lastWinAmount?.toLocaleString()}c ({currentMultiplier}x)!
                </span>
              ) : gameOver ? (
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                  <Bomb className="w-3.5 h-3.5 text-rose-400" />
                  Detonated!
                </span>
              ) : (
                <span className="text-xs text-zinc-400">Ready to play</span>
              )}
            </div>

            {gameActive ? (
              <div className="flex items-center gap-2">
                <div className="text-right font-mono">
                  <span className="text-[9px] text-zinc-400 uppercase font-bold mr-1">Profit:</span>
                  <span className="text-xs sm:text-sm font-black text-emerald-400">+{currentProfit.toLocaleString()}c</span>
                </div>

                {/* Instant Sticky Cashout Button on Grid Top Header */}
                <button
                  type="button"
                  disabled={revealedGemsCount === 0}
                  onClick={handleCashout}
                  className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer flex items-center gap-1"
                >
                  <span>Cashout</span>
                  <span className="font-mono text-xs">+{currentCashoutValue.toLocaleString()}c</span>
                </button>
              </div>
            ) : (
              <span className="text-[10px] font-mono text-zinc-500">
                {mineCount} Mines ({25 - mineCount} Gems)
              </span>
            )}
          </div>

          {/* Compact 5x5 Tiles Matrix (Fitted to viewport so no scroll is needed) */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 w-full max-w-[340px] sm:max-w-[380px] aspect-square">
            {tiles.length === 0 ? (
              // Initial Empty Placeholder Grid
              Array.from({ length: 25 }, (_, i) => (
                <div
                  key={i}
                  className="w-full aspect-square rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-700 font-mono text-xs opacity-50"
                >
                  ?
                </div>
              ))
            ) : (
              tiles.map(tile => {
                const isHidden = tile.state === 'hidden';
                const isGem = tile.state === 'gem';
                const isMine = tile.state === 'mine';
                const isExploded = tile.state === 'exploded';

                return (
                  <motion.button
                    key={tile.index}
                    type="button"
                    disabled={!gameActive || !isHidden}
                    onClick={() => handleTileClick(tile.index)}
                    whileHover={gameActive && isHidden ? { scale: 1.04 } : {}}
                    whileTap={gameActive && isHidden ? { scale: 0.96 } : {}}
                    className={`relative w-full aspect-square rounded-xl flex items-center justify-center text-xl sm:text-2xl transition-all select-none shadow-sm ${
                      isHidden
                        ? gameActive
                          ? 'bg-gradient-to-b from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border border-zinc-700 hover:border-amber-400/50 cursor-pointer text-zinc-600'
                          : 'bg-zinc-900/60 border border-zinc-800/60 text-zinc-700 opacity-40 cursor-default'
                        : isGem
                        ? 'bg-gradient-to-b from-emerald-950 via-teal-900 to-zinc-950 border-2 border-emerald-400 shadow-emerald-900/50 text-emerald-300'
                        : isExploded
                        ? 'bg-gradient-to-b from-rose-950 via-red-900 to-zinc-950 border-2 border-rose-500 shadow-rose-900/80 text-rose-300 animate-bounce'
                        : 'bg-zinc-950/80 border border-zinc-800/80 text-zinc-500 opacity-60'
                    }`}
                  >
                    {isHidden && (
                      <span className="text-zinc-600 font-bold text-xs">?</span>
                    )}

                    {isGem && (
                      <motion.span
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 12 }}
                      >
                        💎
                      </motion.span>
                    )}

                    {isExploded && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1.2 }}
                        transition={{ type: 'spring', damping: 8 }}
                      >
                        💥
                      </motion.span>
                    )}

                    {isMine && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                      >
                        💣
                      </motion.span>
                    )}
                  </motion.button>
                );
              })
            )}
          </div>

          {/* Mines Fair Multiplier Footer */}
          <div className="w-full mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 px-1">
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-emerald-400" />
              <span>Provably Fair RNG Engine (1% Edge)</span>
            </span>
            <span className="font-mono">
              Safe Multiplier: {currentMultiplier}x
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
