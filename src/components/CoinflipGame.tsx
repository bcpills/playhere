import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  Trophy, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles, 
  AlertCircle,
  Flame,
  ArrowRight,
  TrendingUp,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { CasinoStats, CurrencyMode } from '../types';
import { sound } from '../utils/audio';
import { formatCompactWager } from '../utils/leaderboard';

interface CoinflipGameProps {
  balance: number;
  onUpdateBalance: (amount: number | ((prev: number) => number)) => void;
  stats: CasinoStats;
  onUpdateStats: (updater: (prev: CasinoStats) => CasinoStats) => void;
  onAddRakeback?: (wager: number, isBlackjack?: boolean, isCash?: boolean) => void;
  username: string;
  avatar: string;
  currencyMode?: CurrencyMode;
  cashBalance?: number;
  onUpdateCashBalance?: (amount: number | ((prev: number) => number)) => void;
  onRecordWager?: (amount: number, isCash: boolean) => void;
}

type CoinSide = 'heads' | 'tails';

const OPPONENT_BOTS = [
  { name: 'GoldRush_Bot', avatar: '💰', sidePreference: 'heads' },
  { name: 'CryptoKnight', avatar: '🛡️', sidePreference: 'tails' },
  { name: 'AceOfSpades', avatar: '♠️', sidePreference: 'heads' },
  { name: 'NeonSamurai', avatar: '⚡', sidePreference: 'tails' },
];

export const CoinflipGame: React.FC<CoinflipGameProps> = ({
  balance,
  onUpdateBalance,
  onUpdateStats,
  onAddRakeback,
  currencyMode = 'gc',
  cashBalance = 0,
  onUpdateCashBalance,
  onRecordWager,
}) => {
  const isCash = currencyMode === 'cash';
  const effectiveBalance = isCash ? cashBalance : balance;

  const [baseWager, setBaseWager] = useState<number>(isCash ? 1 : 50);
  const [selectedSide, setSelectedSide] = useState<CoinSide>('heads');
  const [selectedOpponent, setSelectedOpponent] = useState(OPPONENT_BOTS[0]);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipResult, setFlipResult] = useState<CoinSide | null>(null);
  const [outcomeStatus, setOutcomeStatus] = useState<'win' | 'lose' | null>(null);
  const [flipHistory, setFlipHistory] = useState<{ id: string; result: CoinSide; won: boolean; payout: number; streak: number }[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Consecutive Streak State
  const [streakCount, setStreakCount] = useState<number>(0);
  const [accumulatedPot, setAccumulatedPot] = useState<number>(0);
  const [currentInitialBet, setCurrentInitialBet] = useState<number>(isCash ? 1 : 50);
  const [isStreakMode, setIsStreakMode] = useState<boolean>(false);

  useEffect(() => {
    setBaseWager(isCash ? 1 : 50);
    setCurrentInitialBet(isCash ? 1 : 50);
    setStreakCount(0);
    setAccumulatedPot(0);
    setIsStreakMode(false);
  }, [isCash]);

  const modifyBalance = (delta: number) => {
    if (isCash && onUpdateCashBalance) {
      onUpdateCashBalance(prev => Number((prev + delta).toFixed(2)));
    } else {
      onUpdateBalance(delta);
    }
  };

  const quickBets = isCash ? [0.25, 0.50, 1, 2, 5, 10] : [10, 25, 50, 100, 250, 500];

  // Multiplier per flip step (1.96x compounded)
  const getStreakMultiplier = (streak: number) => {
    if (streak <= 0) return 1.0;
    return Math.round(Math.pow(1.96, streak) * 100) / 100;
  };

  const currentMultiplier = getStreakMultiplier(streakCount);
  const nextMultiplier = getStreakMultiplier(streakCount + 1);

  // Potential payout if next flip is won
  const nextPotValue = isStreakMode 
    ? (isCash ? Number((accumulatedPot * 1.96).toFixed(2)) : Math.floor(accumulatedPot * 1.96))
    : (isCash ? Number((baseWager * 1.96).toFixed(2)) : Math.floor(baseWager * 1.96));

  // Start Flip (Either initial from balance OR consecutive flip with accumulated pot)
  const handleFlip = () => {
    if (isFlipping) return;

    if (!isStreakMode) {
      // First flip in streak: validate & deduct base wager
      if (baseWager <= 0 || isNaN(baseWager)) {
        setErrorMessage('Enter a valid wager.');
        return;
      }
      if (baseWager > effectiveBalance) {
        setErrorMessage('Insufficient balance.');
        sound.playLose();
        return;
      }

      setErrorMessage(null);
      setOutcomeStatus(null);
      setFlipResult(null);

      // Deduct initial wager from balance
      modifyBalance(-baseWager);
      onRecordWager?.(baseWager, isCash);
      setCurrentInitialBet(baseWager);
      
      // rakeback
      if (onAddRakeback) {
        onAddRakeback(baseWager, false, isCash);
      }

      // Update stats: wagered
      onUpdateStats(prev => ({
        ...prev,
        totalWagered: isCash ? prev.totalWagered + (baseWager * 1000) : prev.totalWagered + baseWager,
        roundsPlayedCoinflip: (prev.roundsPlayedCoinflip || 0) + 1,
      }));
    } else {
      // Consecutive flip: Pot is already accumulated, no extra deduction from balance
      setErrorMessage(null);
      setOutcomeStatus(null);
      setFlipResult(null);
    }

    setIsFlipping(true);
    sound.playChip();

    // 1.8 second flip animation
    setTimeout(() => {
      const outcome: CoinSide = Math.random() < 0.5 ? 'heads' : 'tails';
      const userWon = outcome === selectedSide;

      setFlipResult(outcome);
      setIsFlipping(false);

      if (userWon) {
        const newStreak = streakCount + 1;
        const newPot = isStreakMode 
          ? (isCash ? Number((accumulatedPot * 1.96).toFixed(2)) : Math.floor(accumulatedPot * 1.96))
          : (isCash ? Number((baseWager * 1.96).toFixed(2)) : Math.floor(baseWager * 1.96));

        setStreakCount(newStreak);
        setAccumulatedPot(newPot);
        setIsStreakMode(true);
        setOutcomeStatus('win');
        sound.playWin();

        setFlipHistory(prev => [
          { id: Math.random().toString(), result: outcome, won: true, payout: newPot, streak: newStreak },
          ...prev.slice(0, 7)
        ]);
      } else {
        // Lost flip
        setOutcomeStatus('lose');
        sound.playLose();
        
        const lostAmt = isStreakMode ? currentInitialBet : baseWager;
        onUpdateStats(prev => ({
          ...prev,
          totalLost: isCash ? prev.totalLost + (lostAmt * 1000) : prev.totalLost + lostAmt,
          netProfit: isCash ? prev.netProfit - (lostAmt * 1000) : prev.netProfit - lostAmt,
        }));

        setFlipHistory(prev => [
          { id: Math.random().toString(), result: outcome, won: false, payout: 0, streak: 0 },
          ...prev.slice(0, 7)
        ]);

        // Reset streak state
        setStreakCount(0);
        setAccumulatedPot(0);
        setIsStreakMode(false);
      }
    }, 1800);
  };

  // Collect / Cashout accumulated streak winnings
  const handleCollect = () => {
    if (!isStreakMode || accumulatedPot <= 0 || isFlipping) return;

    const winnings = accumulatedPot;
    const finalMult = currentMultiplier;

    sound.playBigWin();
    modifyBalance(winnings);

    onUpdateStats(prev => ({
      ...prev,
      totalWon: isCash ? prev.totalWon + (winnings * 1000) : prev.totalWon + winnings,
      netProfit: isCash ? prev.netProfit + ((winnings - currentInitialBet) * 1000) : prev.netProfit + (winnings - currentInitialBet),
      biggestWin: isCash ? Math.max(prev.biggestWin, winnings * 1000) : Math.max(prev.biggestWin, winnings),
      biggestMultiplier: Math.max(prev.biggestMultiplier, finalMult),
    }));

    // Reset streak mode
    setStreakCount(0);
    setAccumulatedPot(0);
    setIsStreakMode(false);
    setOutcomeStatus(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
      {/* Compact Header Banner */}
      <div className="flex items-center justify-between gap-3 mb-3 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow text-lg shrink-0">
            🪙
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                Coinflip Duels
              </h1>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Ride The Streak (Compounding Mults)
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden xs:block">
              Collect your win or roll consecutive flips to double your multiplier every turn!
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        
        {/* Left: Settings & Betting (5 cols) */}
        <div className="lg:col-span-5 p-3.5 sm:p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-xl space-y-3">
          
          {/* Side Pick */}
          <div>
            <label className="text-[11px] font-bold uppercase text-zinc-400 block mb-1.5">
              Choose Next Coin Side
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isFlipping}
                onClick={() => {
                  setSelectedSide('heads');
                  sound.playClick();
                }}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedSide === 'heads'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span className="text-2xl">👑</span>
                <span className="text-xs font-black uppercase">Heads</span>
              </button>

              <button
                type="button"
                disabled={isFlipping}
                onClick={() => {
                  setSelectedSide('tails');
                  sound.playClick();
                }}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  selectedSide === 'tails'
                    ? 'bg-purple-950/60 border-purple-500 text-purple-300 shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span className="text-2xl">⚡</span>
                <span className="text-xs font-black uppercase">Tails</span>
              </button>
            </div>
          </div>

          {/* Opponent Pick */}
          <div className="pt-2 border-t border-zinc-800/80">
            <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
              Challenger
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {OPPONENT_BOTS.map(bot => (
                <button
                  key={bot.name}
                  type="button"
                  disabled={isFlipping || isStreakMode}
                  onClick={() => setSelectedOpponent(bot)}
                  className={`p-1.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    selectedOpponent.name === bot.name
                      ? 'bg-indigo-950/60 border-indigo-500/60 text-white'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  } ${isStreakMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{bot.avatar}</span>
                    <span className="font-bold truncate text-[11px]">{bot.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stake Input (Only editable when not in an active consecutive streak) */}
          <div className="pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase text-zinc-400 flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-400" />
                <span>{isStreakMode ? 'Streak Active Pot' : 'Initial Wager'}</span>
              </label>
              <span className="text-[10px] font-mono text-zinc-500">
                {isStreakMode 
                  ? `Next Win: +${isCash ? `$${nextPotValue.toFixed(2)}` : `${nextPotValue.toLocaleString()} GC`} (${nextMultiplier}x)`
                  : `Win: +${isCash ? `$${nextPotValue.toFixed(2)}` : `${nextPotValue.toLocaleString()} GC`} (${nextMultiplier}x)`
                }
              </span>
            </div>

            {!isStreakMode ? (
              <>
                <div className="relative mb-1.5">
                  <input
                    type="number"
                    min={isCash ? 0.10 : 1}
                    max={effectiveBalance}
                    step={isCash ? 0.10 : 1}
                    disabled={isFlipping}
                    value={baseWager}
                    onChange={e => setBaseWager(isCash ? Math.max(0.10, parseFloat(e.target.value) || 0) : Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-amber-500 transition-all disabled:opacity-50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">
                    {isCash ? 'USD' : 'GC'}
                  </span>
                </div>

                {/* Quick Bets */}
                <div className="grid grid-cols-6 gap-1 mb-1.5">
                  {quickBets.map(amt => (
                    <button
                      key={amt}
                      type="button"
                      disabled={isFlipping}
                      onClick={() => {
                        setBaseWager(amt);
                        sound.playChip();
                      }}
                      className={`py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${
                        baseWager === amt 
                          ? 'bg-amber-500 text-zinc-950 font-black shadow' 
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {isCash ? `$${amt}` : formatCompactWager(amt)}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    disabled={isFlipping}
                    onClick={() => setBaseWager(isCash ? 0.25 : 10)}
                    className="py-1 rounded-lg text-[9px] font-bold uppercase bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 cursor-pointer"
                  >
                    Min
                  </button>
                  <button
                    type="button"
                    disabled={isFlipping}
                    onClick={() => setBaseWager(prev => isCash ? Number(Math.max(0.10, prev / 2).toFixed(2)) : Math.max(1, Math.floor(prev / 2)))}
                    className="py-1 rounded-lg text-[9px] font-bold uppercase bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 cursor-pointer"
                  >
                    1/2
                  </button>
                  <button
                    type="button"
                    disabled={isFlipping}
                    onClick={() => setBaseWager(prev => isCash ? Number(Math.min(effectiveBalance, prev * 2).toFixed(2)) : Math.min(balance, prev * 2))}
                    className="py-1 rounded-lg text-[9px] font-bold uppercase bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 cursor-pointer"
                  >
                    2X
                  </button>
                  <button
                    type="button"
                    disabled={isFlipping}
                    onClick={() => setBaseWager(effectiveBalance)}
                    className="py-1 rounded-lg text-[9px] font-bold uppercase bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 cursor-pointer"
                  >
                    Max
                  </button>
                </div>
              </>
            ) : (
              /* Active Consecutive Streak Box */
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-bold uppercase text-[10px]">Current Streak:</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-mono font-black text-xs">
                    🔥 {streakCount} Win Streak
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-bold uppercase text-[10px]">Current Pot:</span>
                  <span className="font-mono font-black text-amber-300 text-sm">
                    {isCash ? `$${accumulatedPot.toFixed(2)}` : `${accumulatedPot.toLocaleString()} GC`} ({currentMultiplier}x)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-emerald-400 pt-1 border-t border-amber-500/30">
                  <span>Consecutive Flip Win:</span>
                  <span className="font-mono font-black">+{isCash ? `$${nextPotValue.toFixed(2)}` : `${nextPotValue.toLocaleString()} GC`} ({nextMultiplier}x)</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Flip / Consecutive Ride / Collect */}
          <div className="pt-2 space-y-2">
            {!isStreakMode ? (
              <button
                type="button"
                disabled={isFlipping}
                onClick={handleFlip}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-500 text-zinc-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-950/50 transition-all cursor-pointer active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Coins className="w-4 h-4" />
                <span>{isFlipping ? 'Flipping...' : `Flip Coin (${isCash ? `$${baseWager.toFixed(2)}` : `${baseWager.toLocaleString()} GC`})`}</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {/* 1. COLLECT / CASHOUT */}
                <button
                  type="button"
                  disabled={isFlipping}
                  onClick={handleCollect}
                  className="py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/50 transition-all cursor-pointer active:scale-98 disabled:opacity-50 flex flex-col items-center justify-center"
                >
                  <span className="text-[10px] opacity-80">Take Winnings</span>
                  <span className="text-xs font-mono font-black">Collect +{isCash ? `$${accumulatedPot.toFixed(2)}` : `${accumulatedPot.toLocaleString()} GC`}</span>
                </button>

                {/* 2. RIDE CONSECUTIVE STREAK */}
                <button
                  type="button"
                  disabled={isFlipping}
                  onClick={handleFlip}
                  className="py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-950/50 transition-all cursor-pointer active:scale-98 disabled:opacity-50 flex flex-col items-center justify-center"
                >
                  <span className="text-[10px] opacity-80">Next: {nextMultiplier}x</span>
                  <span className="text-xs font-mono font-black">{isFlipping ? 'Flipping...' : `Flip ${selectedSide === 'heads' ? '👑 H' : '⚡ T'}`}</span>
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
        </div>

        {/* Right: Animated Coinflip Stage & Consecutive Multiplier Ladder (7 cols) */}
        <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-2xl flex flex-col justify-between items-center min-h-[420px]">
          
          {/* Header Status Bar */}
          <div className="w-full flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Streak Status:</span>
              {streakCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                  <Flame className="w-3 h-3 text-orange-400" />
                  {streakCount} in a Row ({currentMultiplier}x Pot)
                </span>
              ) : (
                <span className="text-xs text-zinc-500 font-mono">Standard 50/50 Duel</span>
              )}
            </div>

            <div>
              {outcomeStatus === 'win' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-yellow-400" />
                  Won Round! ({accumulatedPot.toLocaleString()}c Pot)
                </span>
              )}
              {outcomeStatus === 'lose' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  Lost Streak
                </span>
              )}
            </div>
          </div>

          {/* Consecutive Multiplier Escalation Progress Bar */}
          <div className="w-full my-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
              <span className="font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-amber-400" />
                Streak Ladder
              </span>
              <span>Ride consecutive flips to multiply winnings</span>
            </div>
            <div className="grid grid-cols-6 gap-1 text-center font-mono text-[10px]">
              {[1, 2, 3, 4, 5, 6].map(lvl => {
                const mult = getStreakMultiplier(lvl);
                const isActive = streakCount === lvl;
                const isPassed = streakCount > lvl;
                return (
                  <div
                    key={lvl}
                    className={`py-1 rounded-lg border transition-all ${
                      isActive
                        ? 'bg-amber-500 text-zinc-950 font-black border-amber-300 shadow-md scale-105'
                        : isPassed
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-bold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <div>#{lvl}</div>
                    <div className="font-black text-[9px]">{mult}x</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3D Animated Coin Arena */}
          <div className="my-4 flex flex-col items-center justify-center">
            <motion.div
              animate={isFlipping ? {
                rotateY: [0, 1800],
                y: [0, -100, 0],
                scale: [1, 1.2, 1],
              } : {}}
              transition={{
                duration: 1.8,
                ease: 'easeInOut',
              }}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 p-1.5 shadow-xl shadow-yellow-500/20 border-4 border-yellow-200 flex items-center justify-center select-none"
            >
              <div className="w-full h-full rounded-full bg-zinc-950 border-2 border-yellow-400/40 flex flex-col items-center justify-center shadow-inner">
                {isFlipping ? (
                  <Sparkles className="w-10 h-10 text-yellow-300 animate-spin" />
                ) : (flipResult || selectedSide) === 'heads' ? (
                  <>
                    <span className="text-3xl">👑</span>
                    <span className="text-[9px] font-black uppercase text-amber-300 tracking-wider mt-0.5">HEADS</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl">⚡</span>
                    <span className="text-[9px] font-black uppercase text-purple-300 tracking-wider mt-0.5">TAILS</span>
                  </>
                )}
              </div>
            </motion.div>

            <div className="mt-4 flex items-center gap-6 text-xs font-mono">
              <div className="text-center">
                <span className="text-zinc-500 text-[9px] uppercase font-bold block">Your Choice</span>
                <span className={`font-black uppercase text-xs sm:text-sm ${selectedSide === 'heads' ? 'text-amber-300' : 'text-purple-300'}`}>
                  {selectedSide === 'heads' ? '👑 Heads' : '⚡ Tails'}
                </span>
              </div>
              <span className="text-zinc-600 font-bold">VS</span>
              <div className="text-center">
                <span className="text-zinc-500 text-[9px] uppercase font-bold block">{selectedOpponent.name}</span>
                <span className={`font-black uppercase text-xs sm:text-sm ${selectedSide === 'heads' ? 'text-purple-300' : 'text-amber-300'}`}>
                  {selectedSide === 'heads' ? '⚡ Tails' : '👑 Heads'}
                </span>
              </div>
            </div>
          </div>

          {/* History Feed */}
          <div className="w-full pt-3 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
              <span className="font-bold uppercase text-[9px]">Recent Flip History</span>
              <span className="text-[9px] text-zinc-500">Provably Fair (50.00% Odds)</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {flipHistory.length === 0 ? (
                <span className="text-[11px] text-zinc-600 italic">No flips recorded yet.</span>
              ) : (
                flipHistory.map(item => (
                  <div
                    key={item.id}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 ${
                      item.won
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                    }`}
                  >
                    <span>{item.result === 'heads' ? '👑 H' : '⚡ T'}</span>
                    <span className="text-[10px]">{item.won ? `+${item.payout}c` : 'L'}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
