import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Swords, 
  Coins, 
  Trophy, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles, 
  AlertCircle,
  TrendingUp,
  Flame
} from 'lucide-react';
import { CasinoStats } from '../types';
import { sound } from '../utils/audio';
import { formatCompactWager } from '../utils/leaderboard';

interface DiceDuelsGameProps {
  balance: number;
  onUpdateBalance: (amount: number | ((prev: number) => number)) => void;
  stats: CasinoStats;
  onUpdateStats: (updater: (prev: CasinoStats) => CasinoStats) => void;
  onAddRakeback?: (wager: number, isBlackjack?: boolean) => void;
  username: string;
  avatar: string;
}

const AI_CHALLENGERS = [
  { name: 'Vegas_Viper', avatar: '🐍', title: 'High-Roller Shark' },
  { name: 'DiceKing_99', avatar: '👑', title: 'Pit Boss Legend' },
  { name: 'ShadowRoller', avatar: '🥷', title: 'Stealth Bettor' },
  { name: 'CryptoDegen_X', avatar: '🚀', title: 'Moonshot Gambler' },
];

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export const DiceDuelsGame: React.FC<DiceDuelsGameProps> = ({
  balance,
  onUpdateBalance,
  stats,
  onUpdateStats,
  onAddRakeback,
  username,
  avatar,
}) => {
  const [baseWager, setBaseWager] = useState<number>(100);
  const [diceCount, setDiceCount] = useState<2 | 3>(2);
  const [selectedOpponent, setSelectedOpponent] = useState(AI_CHALLENGERS[0]);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [playerRolls, setPlayerRolls] = useState<number[]>([6, 5]);
  const [opponentRolls, setOpponentRolls] = useState<number[]>([3, 4]);
  const [duelResult, setDuelResult] = useState<'win' | 'lose' | 'tie' | null>(null);
  const [duelHistory, setDuelHistory] = useState<{ id: string; won: boolean; payout: number; playerSum: number; oppSum: number; streak: number }[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Consecutive Streak State
  const [streakCount, setStreakCount] = useState<number>(0);
  const [accumulatedPot, setAccumulatedPot] = useState<number>(0);
  const [currentInitialBet, setCurrentInitialBet] = useState<number>(100);
  const [isStreakMode, setIsStreakMode] = useState<boolean>(false);

  const quickBets = [25, 50, 100, 250, 500, 1000];

  const playerTotal = playerRolls.reduce((a, b) => a + b, 0);
  const opponentTotal = opponentRolls.reduce((a, b) => a + b, 0);

  // Multiplier per consecutive win (1.95x compounded)
  const getStreakMultiplier = (streak: number) => {
    if (streak <= 0) return 1.0;
    return Math.round(Math.pow(1.95, streak) * 100) / 100;
  };

  const currentMultiplier = getStreakMultiplier(streakCount);
  const nextMultiplier = getStreakMultiplier(streakCount + 1);

  const nextPotValue = isStreakMode 
    ? Math.floor(accumulatedPot * 1.95) 
    : Math.floor(baseWager * 1.95);

  const handleStartDuel = () => {
    if (isRolling) return;

    if (!isStreakMode) {
      if (baseWager <= 0 || isNaN(baseWager)) {
        setErrorMessage('Enter a valid wager.');
        return;
      }
      if (baseWager > balance) {
        setErrorMessage('Insufficient chip balance.');
        sound.playLose();
        return;
      }

      setErrorMessage(null);
      setDuelResult(null);

      // Deduct initial wager from balance
      onUpdateBalance(-baseWager);
      setCurrentInitialBet(baseWager);
      
      // Add 10% rakeback
      if (onAddRakeback) {
        onAddRakeback(baseWager, false);
      }

      // Update stats: wagered
      onUpdateStats(prev => ({
        ...prev,
        totalWagered: prev.totalWagered + baseWager,
        roundsPlayedDice: (prev.roundsPlayedDice || 0) + 1,
      }));
    } else {
      setErrorMessage(null);
      setDuelResult(null);
    }

    setIsRolling(true);
    sound.playDice();

    // Rapid dice roll simulation
    let tickCount = 0;
    const interval = setInterval(() => {
      setPlayerRolls(Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1));
      setOpponentRolls(Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1));
      tickCount++;

      if (tickCount >= 10) {
        clearInterval(interval);

        const finalPlayer = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
        const finalOpp = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
        
        const pSum = finalPlayer.reduce((a, b) => a + b, 0);
        const oSum = finalOpp.reduce((a, b) => a + b, 0);

        setPlayerRolls(finalPlayer);
        setOpponentRolls(finalOpp);
        setIsRolling(false);

        if (pSum > oSum) {
          // Player won
          const newStreak = streakCount + 1;
          const newPot = isStreakMode ? Math.floor(accumulatedPot * 1.95) : Math.floor(baseWager * 1.95);

          setStreakCount(newStreak);
          setAccumulatedPot(newPot);
          setIsStreakMode(true);
          setDuelResult('win');
          sound.playWin();

          setDuelHistory(prev => [
            { id: Math.random().toString(), won: true, payout: newPot, playerSum: pSum, oppSum: oSum, streak: newStreak },
            ...prev.slice(0, 6)
          ]);
        } else if (pSum < oSum) {
          // Player lost
          setDuelResult('lose');
          sound.playLose();

          onUpdateStats(prev => ({
            ...prev,
            totalLost: prev.totalLost + (isStreakMode ? currentInitialBet : baseWager),
            netProfit: prev.netProfit - (isStreakMode ? currentInitialBet : baseWager),
          }));

          setDuelHistory(prev => [
            { id: Math.random().toString(), won: false, payout: 0, playerSum: pSum, oppSum: oSum, streak: 0 },
            ...prev.slice(0, 6)
          ]);

          // Reset streak
          setStreakCount(0);
          setAccumulatedPot(0);
          setIsStreakMode(false);
        } else {
          // Tie - Re-roll / push pot
          setDuelResult('tie');
          sound.playChip();
        }
      }
    }, 100);
  };

  // Collect / Cashout winnings from streak
  const handleCollect = () => {
    if (!isStreakMode || accumulatedPot <= 0 || isRolling) return;

    const winnings = accumulatedPot;
    const finalMult = currentMultiplier;

    sound.playBigWin();
    onUpdateBalance(winnings);

    onUpdateStats(prev => ({
      ...prev,
      totalWon: prev.totalWon + winnings,
      netProfit: prev.netProfit + (winnings - currentInitialBet),
      biggestWin: Math.max(prev.biggestWin, winnings),
      biggestMultiplier: Math.max(prev.biggestMultiplier, finalMult),
    }));

    // Reset streak state
    setStreakCount(0);
    setAccumulatedPot(0);
    setIsStreakMode(false);
    setDuelResult(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow text-lg shrink-0">
            🎲
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                Dice Duels Arena
              </h1>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Consecutive Streak Multipliers
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden xs:block">
              1v1 High-Stakes Dice Clash. Roll consecutive duels to compound your multiplier!
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
        
        {/* Left: Controls & Match Settings (5 cols) */}
        <div className="lg:col-span-5 p-3.5 sm:p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-xl space-y-3">
          
          {/* Opponent Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase text-zinc-400 block mb-1.5">
              Select Challenger
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {AI_CHALLENGERS.map(opp => (
                <button
                  key={opp.name}
                  type="button"
                  disabled={isRolling || isStreakMode}
                  onClick={() => {
                    setSelectedOpponent(opp);
                    sound.playClick();
                  }}
                  className={`p-2 rounded-xl border flex items-center gap-1.5 text-left text-xs transition-all cursor-pointer ${
                    selectedOpponent.name === opp.name
                      ? 'bg-purple-950/60 border-purple-500/60 text-white shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  } ${isStreakMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span className="text-lg p-0.5 bg-zinc-950 rounded-lg">{opp.avatar}</span>
                  <div className="overflow-hidden">
                    <div className="font-bold text-[11px] truncate">{opp.name}</div>
                    <div className="text-[9px] text-zinc-500 truncate">{opp.title}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dice Count */}
          <div className="pt-2 border-t border-zinc-800/80">
            <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
              Dice Setup
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isRolling}
                onClick={() => setDiceCount(2)}
                className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  diceCount === 2
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                }`}
              >
                2 Dice (2-12)
              </button>
              <button
                type="button"
                disabled={isRolling}
                onClick={() => setDiceCount(3)}
                className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  diceCount === 3
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                }`}
              >
                3 Dice (3-18)
              </button>
            </div>
          </div>

          {/* Wager / Active Streak Pot Input */}
          <div className="pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase text-zinc-400 flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-400" />
                <span>{isStreakMode ? 'Streak Active Pot' : 'Initial Wager'}</span>
              </label>
              <span className="text-[10px] font-mono text-zinc-500">
                {isStreakMode 
                  ? `Next Win: +${nextPotValue.toLocaleString()}c (${nextMultiplier}x)`
                  : `Win: +${nextPotValue.toLocaleString()}c (${nextMultiplier}x)`
                }
              </span>
            </div>

            {!isStreakMode ? (
              <>
                <div className="relative mb-1.5">
                  <input
                    type="number"
                    min={1}
                    max={balance}
                    disabled={isRolling}
                    value={baseWager}
                    onChange={e => setBaseWager(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500">
                    CHIPS
                  </span>
                </div>

                {/* Quick Bets */}
                <div className="grid grid-cols-6 gap-1 mb-1.5">
                  {quickBets.map(amt => (
                    <button
                      key={amt}
                      type="button"
                      disabled={isRolling}
                      onClick={() => {
                        setBaseWager(amt);
                        sound.playChip();
                      }}
                      className={`py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer ${
                        baseWager === amt 
                          ? 'bg-indigo-600 text-white font-black shadow' 
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {formatCompactWager(amt)}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    disabled={isRolling}
                    onClick={() => setBaseWager(25)}
                    className="py-1 rounded-lg text-[9px] font-bold uppercase bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 cursor-pointer"
                  >
                    Min
                  </button>
                  <button
                    type="button"
                    disabled={isRolling}
                    onClick={() => setBaseWager(prev => Math.max(1, Math.floor(prev / 2)))}
                    className="py-1 rounded-lg text-[9px] font-bold uppercase bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 cursor-pointer"
                  >
                    1/2
                  </button>
                  <button
                    type="button"
                    disabled={isRolling}
                    onClick={() => setBaseWager(prev => Math.min(balance, prev * 2))}
                    className="py-1 rounded-lg text-[9px] font-bold uppercase bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 cursor-pointer"
                  >
                    2X
                  </button>
                  <button
                    type="button"
                    disabled={isRolling}
                    onClick={() => setBaseWager(balance)}
                    className="py-1 rounded-lg text-[9px] font-bold uppercase bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 cursor-pointer"
                  >
                    Max
                  </button>
                </div>
              </>
            ) : (
              /* Active Consecutive Streak Box */
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-bold uppercase text-[10px]">Current Streak:</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white font-mono font-black text-xs">
                    🔥 {streakCount} Duel Streak
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-bold uppercase text-[10px]">Current Pot:</span>
                  <span className="font-mono font-black text-amber-300 text-sm">
                    {accumulatedPot.toLocaleString()}c ({currentMultiplier}x)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-emerald-400 pt-1 border-t border-purple-500/30">
                  <span>Consecutive Duel Win:</span>
                  <span className="font-mono font-black">+{nextPotValue.toLocaleString()}c ({nextMultiplier}x)</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            {!isStreakMode ? (
              <button
                type="button"
                disabled={isRolling}
                onClick={handleStartDuel}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-purple-950/50 transition-all cursor-pointer active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4" />
                <span>{isRolling ? 'Rolling Dice...' : `Roll Dice (${baseWager.toLocaleString()}c)`}</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {/* 1. COLLECT */}
                <button
                  type="button"
                  disabled={isRolling}
                  onClick={handleCollect}
                  className="py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/50 transition-all cursor-pointer active:scale-98 disabled:opacity-50 flex flex-col items-center justify-center"
                >
                  <span className="text-[10px] opacity-80">Take Winnings</span>
                  <span className="text-xs font-mono font-black">Collect +{accumulatedPot.toLocaleString()}c</span>
                </button>

                {/* 2. CONSECUTIVE ROLL */}
                <button
                  type="button"
                  disabled={isRolling}
                  onClick={handleStartDuel}
                  className="py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-950/50 transition-all cursor-pointer active:scale-98 disabled:opacity-50 flex flex-col items-center justify-center"
                >
                  <span className="text-[10px] opacity-80">Next: {nextMultiplier}x</span>
                  <span className="text-xs font-mono font-black">{isRolling ? 'Rolling...' : 'Roll Next Duel'}</span>
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

        {/* Right: Duel Battle Arena & Multiplier Ladder (7 cols) */}
        <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-2xl flex flex-col justify-between min-h-[420px]">
          
          {/* Top Status Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Streak Status:</span>
              {streakCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1 animate-pulse">
                  <Flame className="w-3 h-3 text-purple-400" />
                  {streakCount} Duel Streak ({currentMultiplier}x Pot)
                </span>
              ) : (
                <span className="text-xs text-zinc-500 font-mono">1v1 Clash</span>
              )}
            </div>

            <div>
              {duelResult === 'win' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-yellow-400" />
                  Won Duel! ({accumulatedPot.toLocaleString()}c Pot)
                </span>
              )}
              {duelResult === 'lose' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  Lost Duel
                </span>
              )}
              {duelResult === 'tie' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Tie Roll (Pot Preserved)
                </span>
              )}
            </div>
          </div>

          {/* Consecutive Multiplier Escalation Progress Bar */}
          <div className="w-full my-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
              <span className="font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-purple-400" />
                Duel Streak Multiplier Ladder
              </span>
              <span>Consecutive victories compound your pot</span>
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
                        ? 'bg-purple-600 text-white font-black border-purple-400 shadow-md scale-105'
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

          {/* Versus Visual Stage (Compact) */}
          <div className="grid grid-cols-2 gap-3 my-2 items-center">
            
            {/* Player 1: User */}
            <div className={`p-3 rounded-2xl border transition-all text-center ${
              duelResult === 'win'
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md'
                : 'bg-zinc-900/60 border-zinc-800'
            }`}>
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <span className="text-xl p-1 rounded-xl bg-zinc-950 border border-zinc-800">{avatar}</span>
                <div className="text-left">
                  <div className="text-xs font-black text-white truncate max-w-[90px]">{username}</div>
                  <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-600 text-white">YOU</span>
                </div>
              </div>

              {/* Dice Display */}
              <div className="flex items-center justify-center gap-2 my-2">
                {playerRolls.map((num, i) => (
                  <motion.div
                    key={i}
                    animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.15, 1] } : {}}
                    transition={{ repeat: isRolling ? Infinity : 0, duration: 0.2 }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-950 via-purple-900 to-zinc-950 border-2 border-indigo-500/60 flex items-center justify-center text-2xl text-indigo-200 font-bold shadow"
                  >
                    {DICE_FACES[num - 1] || '⚅'}
                  </motion.div>
                ))}
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-zinc-400 block">Total Score</span>
                <span className="text-xl font-black font-mono text-indigo-300">
                  {playerTotal}
                </span>
              </div>
            </div>

            {/* Player 2: Opponent */}
            <div className={`p-3 rounded-2xl border transition-all text-center ${
              duelResult === 'lose'
                ? 'bg-rose-950/40 border-rose-500/60 shadow-md'
                : 'bg-zinc-900/60 border-zinc-800'
            }`}>
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <span className="text-xl p-1 rounded-xl bg-zinc-950 border border-zinc-800">{selectedOpponent.avatar}</span>
                <div className="text-left">
                  <div className="text-xs font-black text-white truncate max-w-[90px]">{selectedOpponent.name}</div>
                  <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">BOT</span>
                </div>
              </div>

              {/* Dice Display */}
              <div className="flex items-center justify-center gap-2 my-2">
                {opponentRolls.map((num, i) => (
                  <motion.div
                    key={i}
                    animate={isRolling ? { rotate: [0, -90, -180, -270, -360], scale: [1, 1.15, 1] } : {}}
                    transition={{ repeat: isRolling ? Infinity : 0, duration: 0.2 }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-rose-950 via-red-900 to-zinc-950 border-2 border-rose-500/60 flex items-center justify-center text-2xl text-rose-200 font-bold shadow"
                  >
                    {DICE_FACES[num - 1] || '⚅'}
                  </motion.div>
                ))}
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-zinc-400 block">Total Score</span>
                <span className="text-xl font-black font-mono text-rose-300">
                  {opponentTotal}
                </span>
              </div>
            </div>

          </div>

          {/* Recent Duels History */}
          <div className="pt-2.5 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span className="font-bold uppercase text-[9px]">Recent Duels</span>
              <span className="text-[9px] text-zinc-500">Provably Fair RNG</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {duelHistory.length === 0 ? (
                <span className="text-[11px] text-zinc-600 italic">No duels played yet.</span>
              ) : (
                duelHistory.map(item => (
                  <div
                    key={item.id}
                    className={`px-2 py-0.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 ${
                      item.won
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                    }`}
                  >
                    <span>{item.playerSum} vs {item.oppSum}</span>
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
