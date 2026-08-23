import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RotateCcw, Zap, Play, Square, Trophy, Info, Award } from 'lucide-react';
import { KenoDifficulty, CasinoStats } from '../types';
import { 
  TOTAL_KENO_NUMBERS, 
  KENO_DRAW_COUNT, 
  MAX_KENO_PICKS, 
  KENO_PAYTABLES, 
  getKenoMultiplier, 
  drawKenoNumbers 
} from '../utils/keno';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { ChipSelector } from './ChipSelector';

interface KenoGameProps {
  balance: number;
  onUpdateBalance: (delta: number) => void;
  onUpdateStats: React.Dispatch<React.SetStateAction<CasinoStats>>;
}

export const KenoGame: React.FC<KenoGameProps> = ({
  balance,
  onUpdateBalance,
  onUpdateStats,
}) => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [activeDrawing, setActiveDrawing] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<KenoDifficulty>('classic');
  const [wager, setWager] = useState<number>(10);
  const [gameSpeed, setGameSpeed] = useState<'normal' | 'fast' | 'instant'>('fast');
  const [lastWin, setLastWin] = useState<{ amount: number; multiplier: number; hits: number } | null>(null);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const autoPlayRef = useRef<boolean>(false);
  autoPlayRef.current = autoPlay;

  const currentHits = selectedNumbers.filter(n => drawnNumbers.includes(n)).length;
  const currentMultiplier = getKenoMultiplier(selectedNumbers.length, currentHits, difficulty);

  // Toggle number pick
  const handleToggleNumber = (num: number) => {
    if (activeDrawing) return;
    sound.playChip();

    setSelectedNumbers(prev => {
      if (prev.includes(num)) {
        return prev.filter(n => n !== num);
      }
      if (prev.length >= MAX_KENO_PICKS) {
        return prev;
      }
      return [...prev, num].sort((a, b) => a - b);
    });
  };

  // Quick Pick Generator
  const handleQuickPick = (count: number) => {
    if (activeDrawing) return;
    sound.playChip();
    const pool = Array.from({ length: TOTAL_KENO_NUMBERS }, (_, i) => i + 1);
    const picks: number[] = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picks.push(pool[idx]);
      pool.splice(idx, 1);
    }
    setSelectedNumbers(picks.sort((a, b) => a - b));
  };

  const handleClearPicks = () => {
    if (activeDrawing) return;
    sound.playChip();
    setSelectedNumbers([]);
    setDrawnNumbers([]);
    setLastWin(null);
  };

  // Run Draw Sequence
  const handleStartDraw = async () => {
    if (activeDrawing) return;
    if (selectedNumbers.length === 0) return;
    if (wager > balance || wager <= 0) return;

    // Deduct bet
    onUpdateBalance(-wager);
    onUpdateStats(prev => ({
      ...prev,
      totalWagered: prev.totalWagered + wager,
      roundsPlayedKeno: prev.roundsPlayedKeno + 1,
    }));

    setActiveDrawing(true);
    setDrawnNumbers([]);
    setLastWin(null);

    const fullDrawn = drawKenoNumbers();

    if (gameSpeed === 'instant') {
      sound.playDeal();
      setDrawnNumbers(fullDrawn);
      finishRound(fullDrawn);
      return;
    }

    const intervalMs = gameSpeed === 'fast' ? 75 : 175;
    const progressiveDrawn: number[] = [];

    for (let i = 0; i < fullDrawn.length; i++) {
      await new Promise(r => setTimeout(r, intervalMs));
      const nextNum = fullDrawn[i];
      progressiveDrawn.push(nextNum);
      setDrawnNumbers([...progressiveDrawn]);

      if (selectedNumbers.includes(nextNum)) {
        sound.playKenoHit();
      } else {
        sound.playKenoPop(i);
      }
    }

    finishRound(fullDrawn);
  };

  const finishRound = (allDrawn: number[]) => {
    const hits = selectedNumbers.filter(n => allDrawn.includes(n)).length;
    const mult = getKenoMultiplier(selectedNumbers.length, hits, difficulty);
    const winAmount = Math.round(wager * mult);

    setLastWin({ amount: winAmount, multiplier: mult, hits });
    setActiveDrawing(false);

    if (winAmount > 0) {
      onUpdateBalance(winAmount);
      onUpdateStats(prev => ({
        ...prev,
        totalWon: prev.totalWon + winAmount,
        biggestWin: Math.max(prev.biggestWin, winAmount),
        biggestMultiplier: Math.max(prev.biggestMultiplier, mult),
      }));

      if (mult >= 20) {
        sound.playWin(true);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } else if (winAmount > wager) {
        sound.playProfit();
      } else {
        sound.playWin(false);
      }
    } else {
      sound.playLoss();
    }

    // Autoplay trigger
    if (autoPlayRef.current) {
      setTimeout(() => {
        if (autoPlayRef.current && balance >= wager) {
          handleStartDraw();
        } else {
          setAutoPlay(false);
        }
      }, 700);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Header Info & Mode Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-inner shrink-0">
            🎱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-zinc-100">
                40-Ball Keno Lounge
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ~95% RTP
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Pick 1-10 numbers. Machine draws 10 balls.
            </p>
          </div>
        </div>

        {/* Volatility Modes */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
          {(['safe', 'classic', 'degen'] as const).map((mode) => (
            <button
              key={mode}
              id={`keno-mode-${mode}`}
              disabled={activeDrawing}
              onClick={() => {
                sound.playChip();
                setDifficulty(mode);
              }}
              className={`px-2 py-1.5 rounded-xl text-[11px] font-black uppercase transition-all text-center ${
                difficulty === mode
                  ? mode === 'safe'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : mode === 'classic'
                    ? 'bg-amber-500 text-zinc-950 shadow-md'
                    : 'bg-rose-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="leading-tight">{mode === 'safe' ? 'Safe' : mode === 'classic' ? 'Classic' : 'Degen'}</div>
              <div className="text-[8px] opacity-70 font-mono">
                {mode === 'safe' ? 'Low Risk' : mode === 'classic' ? 'Balanced' : 'High Max'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid & Paytable Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* The 40-Number Keno Board (5x8 Grid on mobile / clean touch) */}
        <div className="lg:col-span-2 p-3.5 sm:p-5 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl space-y-3">
          {/* Board Actions & Status */}
          <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase text-zinc-400">Picks:</span>
              <span className="px-2 py-0.5 rounded-lg bg-zinc-900 font-mono font-black text-amber-300 text-xs border border-zinc-700">
                {selectedNumbers.length} / {MAX_KENO_PICKS}
              </span>
              {selectedNumbers.length > 0 && drawnNumbers.length > 0 && (
                <span className="text-xs font-bold text-emerald-400 ml-1">
                  ({currentHits} Hits)
                </span>
              )}
            </div>

            {/* Quick Pick Toolbar */}
            <div className="flex items-center gap-1">
              {[3, 5, 10].map(count => (
                <button
                  key={count}
                  disabled={activeDrawing}
                  onClick={() => handleQuickPick(count)}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 disabled:opacity-40"
                >
                  Pick {count}
                </button>
              ))}
              <button
                disabled={activeDrawing || selectedNumbers.length === 0}
                onClick={handleClearPicks}
                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 text-rose-400 border border-zinc-800 disabled:opacity-40"
              >
                Clear
              </button>
            </div>
          </div>

          {/* 40 Numbers Grid (8 cols x 5 rows) */}
          <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
            {Array.from({ length: TOTAL_KENO_NUMBERS }, (_, i) => i + 1).map((num) => {
              const isSelected = selectedNumbers.includes(num);
              const isDrawn = drawnNumbers.includes(num);
              const isHit = isSelected && isDrawn;

              let btnStyle = 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:border-zinc-600';
              if (isHit) {
                btnStyle = 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-zinc-950 font-black border-yellow-200 shadow-lg shadow-amber-500/40 scale-105 z-10 animate-bounce';
              } else if (isDrawn) {
                btnStyle = 'bg-purple-900/60 text-purple-200 border-purple-500/50 shadow-inner';
              } else if (isSelected) {
                btnStyle = 'bg-emerald-600 text-white font-black border-emerald-400 shadow-md shadow-emerald-600/30';
              }

              return (
                <button
                  key={num}
                  id={`keno-ball-${num}`}
                  disabled={activeDrawing}
                  onClick={() => handleToggleNumber(num)}
                  className={`h-11 sm:h-13 rounded-xl sm:rounded-2xl border flex flex-col items-center justify-center transition-all transform active:scale-90 font-mono text-sm sm:text-base font-bold select-none ${btnStyle}`}
                >
                  <span>{num}</span>
                  {isHit && <span className="text-[8px] uppercase tracking-tighter leading-none">HIT!</span>}
                </button>
              );
            })}
          </div>

          {/* Drawn Numbers Track */}
          <div className="pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-400 mb-1.5">
              <span>Drawn Balls ({drawnNumbers.length}/{KENO_DRAW_COUNT}):</span>
              {lastWin && lastWin.amount > 0 && (
                <span className="text-emerald-400 font-black">
                  Won +{lastWin.amount.toLocaleString()} Chips ({lastWin.multiplier}x)
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 min-h-[36px]">
              {drawnNumbers.length === 0 ? (
                <span className="text-xs text-zinc-600 italic">Press "Start Draw" to spin the 10-ball hopper</span>
              ) : (
                drawnNumbers.map((num, idx) => {
                  const wasHit = selectedNumbers.includes(num);
                  return (
                    <div
                      key={idx}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black font-mono shrink-0 shadow-md animate-fade-in ${
                        wasHit
                          ? 'bg-amber-400 text-zinc-950 ring-2 ring-amber-300'
                          : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                      }`}
                    >
                      {num}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Paytable & Live Draw Controls */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Dynamic Paytable Display */}
          <div className="p-3.5 sm:p-4 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-xl space-y-2 flex-1">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase text-zinc-200">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Paytable ({selectedNumbers.length || '0'} Picks)</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">95% RTP</span>
            </div>

            {selectedNumbers.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500">
                Select 1 to 10 numbers on the board to preview payout odds and multiplier ladder.
              </div>
            ) : (
              <div className="space-y-1 text-xs">
                {Array.from({ length: selectedNumbers.length + 1 }, (_, i) => selectedNumbers.length - i).map((hitCount) => {
                  const mult = getKenoMultiplier(selectedNumbers.length, hitCount, difficulty);
                  const isCurrentHitLevel = drawnNumbers.length > 0 && currentHits === hitCount;
                  const winForBet = Math.round(wager * mult);

                  return (
                    <div
                      key={hitCount}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-xl transition-all ${
                        isCurrentHitLevel && mult > 0
                          ? 'bg-amber-500 text-zinc-950 font-black shadow-md'
                          : mult > 0
                          ? 'bg-zinc-900/80 text-zinc-200'
                          : 'bg-zinc-900/30 text-zinc-600'
                      }`}
                    >
                      <span className="font-mono">
                        {hitCount} / {selectedNumbers.length} Hits
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className={mult > 0 ? 'text-amber-300 font-bold' : 'text-zinc-600'}>
                          {mult > 0 ? `${mult}x` : '—'}
                        </span>
                        <span className="text-[10px] opacity-80">
                          ({winForBet.toLocaleString()})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Speed & Autoplay Bar */}
          <div className="p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold uppercase text-zinc-500 mr-1">Speed:</span>
              {(['normal', 'fast', 'instant'] as const).map(spd => (
                <button
                  key={spd}
                  onClick={() => setGameSpeed(spd)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                    gameSpeed === spd
                      ? 'bg-amber-500 text-zinc-950'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {spd}
                </button>
              ))}
            </div>

            <button
              onClick={() => setAutoPlay(prev => !prev)}
              className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase flex items-center gap-1 ${
                autoPlay
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {autoPlay ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{autoPlay ? 'Stop Auto' : 'Autoplay'}</span>
            </button>
          </div>

          {/* Wager Chip Selector */}
          <ChipSelector
            currentBet={wager}
            onBetChange={setWager}
            maxBet={balance}
            disabled={activeDrawing}
            minBet={1}
          />

          {/* Draw Execution Button */}
          <button
            id="start-keno-draw-btn"
            disabled={activeDrawing || selectedNumbers.length === 0 || wager > balance || wager <= 0}
            onClick={handleStartDraw}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 transition-all transform active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-zinc-950" />
            <span>
              {activeDrawing
                ? 'Hopper Drawing Balls...'
                : selectedNumbers.length === 0
                ? 'Pick at Least 1 Number'
                : `Draw 10 Balls (${wager.toLocaleString()} Chips)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
