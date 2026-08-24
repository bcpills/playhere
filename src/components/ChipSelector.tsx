import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import { Edit3, Check, Sparkles, ChevronRight } from 'lucide-react';

interface ChipSelectorProps {
  // Mode A: Simple Stepper (Keno, etc.)
  currentBet?: number;
  onBetChange?: (newBet: number) => void;
  maxBet?: number;
  disabled?: boolean;
  minBet?: number;

  // Mode B: Interactive Chip Rack (Blackjack, etc.)
  selectedChip?: number;
  onSelectChip?: (chipVal: number) => void;
  onClearBets?: () => void;
  onDoubleBets?: () => void;
  onHalfBets?: () => void;
  onMaxBet?: () => void;
  balance?: number;
  currentBetTotal?: number;
  onCustomBetSubmit?: (customAmount: number) => void;
}

export const CHIP_VALUES = [
  { value: 1, label: '1', color: 'bg-zinc-800 border-zinc-500 text-zinc-200' },
  { value: 5, label: '5', color: 'bg-red-800 border-red-500 text-white' },
  { value: 10, label: '10', color: 'bg-blue-800 border-blue-500 text-white' },
  { value: 25, label: '25', color: 'bg-emerald-800 border-emerald-500 text-white' },
  { value: 50, label: '50', color: 'bg-purple-800 border-purple-500 text-white' },
  { value: 100, label: '100', color: 'bg-amber-600 border-amber-400 text-black font-black' },
  { value: 500, label: '500', color: 'bg-rose-900 border-rose-400 text-rose-100 shadow-rose-900/40 font-black' },
  { value: 1000, label: '1K', color: 'bg-indigo-950 border-indigo-400 text-indigo-200 shadow-indigo-900/40 font-black' },
  { value: 5000, label: '5K', color: 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-cyan-900/40 font-black' },
  { value: 25000, label: '25K', color: 'bg-gradient-to-tr from-amber-700 to-yellow-500 border-yellow-200 text-zinc-950 font-black shadow-amber-500/30' },
  { value: 100000, label: '100K', color: 'bg-gradient-to-tr from-purple-800 via-pink-700 to-amber-400 border-amber-300 text-white font-black shadow-purple-900/50' },
];

export const ChipSelector: React.FC<ChipSelectorProps> = ({
  currentBet,
  onBetChange,
  maxBet = 1000000,
  disabled = false,
  minBet = 1,
  selectedChip = 10,
  onSelectChip,
  onClearBets,
  onDoubleBets,
  onHalfBets,
  onMaxBet,
  balance = 500,
  currentBetTotal = 0,
  onCustomBetSubmit,
}) => {
  const [typedBetInput, setTypedBetInput] = useState<string>('');
  const [isTypingBet, setIsTypingBet] = useState<boolean>(false);

  useEffect(() => {
    if (currentBet !== undefined) {
      setTypedBetInput(currentBet.toString());
    }
  }, [currentBet]);

  // Mode A: Direct Wager Modifier (e.g. Keno)
  if (onBetChange !== undefined && currentBet !== undefined) {
    const handleAdd = (val: number) => {
      if (disabled) return;
      sound.playChip();
      onBetChange(Math.min(maxBet, currentBet + val));
    };

    const handleClear = () => {
      if (disabled) return;
      sound.playChip();
      onBetChange(0);
      setTypedBetInput('0');
    };

    const handleDouble = () => {
      if (disabled) return;
      sound.playChip();
      const doubled = currentBet === 0 ? Math.min(maxBet, 10) : Math.min(maxBet, currentBet * 2);
      onBetChange(doubled);
      setTypedBetInput(doubled.toString());
    };

    const handleHalf = () => {
      if (disabled || currentBet <= 0) return;
      sound.playChip();
      const halved = Math.max(minBet, Math.floor(currentBet / 2));
      onBetChange(halved);
      setTypedBetInput(halved.toString());
    };

    const handleMax = () => {
      if (disabled || maxBet <= 0) return;
      sound.playChip();
      onBetChange(maxBet);
      setTypedBetInput(maxBet.toString());
    };

    const handleApplyTypedWager = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const parsed = parseInt(typedBetInput.replace(/,/g, ''), 10);
      if (!isNaN(parsed) && parsed >= 0) {
        const clamped = Math.min(maxBet, Math.max(0, parsed));
        sound.playChip();
        onBetChange(clamped);
        setTypedBetInput(clamped.toString());
      } else {
        setTypedBetInput(currentBet.toString());
      }
      setIsTypingBet(false);
    };

    return (
      <div className="w-full flex flex-col gap-2 p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800 shadow-xl">
        {/* Top Controls: Bet Display / Direct Input & Modifiers */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] font-bold uppercase text-zinc-400 shrink-0">Wager:</span>
            
            {/* Interactive Type-In Bet Box */}
            <form onSubmit={handleApplyTypedWager} className="relative flex items-center flex-1 sm:flex-initial">
              <input
                type="number"
                min={0}
                max={maxBet}
                disabled={disabled}
                value={isTypingBet ? typedBetInput : currentBet.toLocaleString()}
                onFocus={() => {
                  setIsTypingBet(true);
                  setTypedBetInput(currentBet.toString());
                }}
                onChange={(e) => setTypedBetInput(e.target.value)}
                onBlur={handleApplyTypedWager}
                placeholder="Type bet..."
                className="w-28 sm:w-32 px-2.5 py-1 rounded-xl bg-zinc-900 border border-purple-500/50 focus:border-amber-400 font-mono font-black text-amber-300 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <span className="absolute right-2 text-[9px] text-zinc-500 font-sans pointer-events-none uppercase font-bold">
                CHIPS
              </span>
            </form>

            <span className="text-[10px] text-zinc-500 hidden md:inline">
              (Click to type exact bet)
            </span>
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={disabled || currentBet === 0}
              onClick={handleClear}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 disabled:opacity-40 cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={disabled || currentBet <= 0}
              onClick={handleHalf}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 disabled:opacity-40 cursor-pointer"
            >
              ½
            </button>
            <button
              type="button"
              disabled={disabled || currentBet >= maxBet}
              onClick={handleDouble}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 disabled:opacity-40 cursor-pointer"
            >
              2×
            </button>
            <button
              type="button"
              disabled={disabled || maxBet <= 0}
              onClick={handleMax}
              className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 disabled:opacity-40 cursor-pointer"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Scrollable Chip Denominations (Supports Micro to Whale Bets) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {CHIP_VALUES.map((chip) => {
            const canAfford = currentBet + chip.value <= maxBet;
            return (
              <button
                key={chip.value}
                type="button"
                disabled={disabled || !canAfford}
                onClick={() => handleAdd(chip.value)}
                className={`min-w-[44px] sm:min-w-[48px] h-10 sm:h-11 rounded-xl border-2 flex flex-col items-center justify-center font-black text-xs shadow-md transition-all shrink-0 active:scale-90 ${
                  chip.color
                } ${!canAfford ? 'opacity-30 cursor-not-allowed' : 'hover:-translate-y-0.5 cursor-pointer'}`}
              >
                <span className="leading-none">+{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Mode B: Blackjack Spot-Bettor Chip Rack with Custom Type-In Bet
  const handleCustomTypeBet = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(typedBetInput.replace(/,/g, ''), 10);
    if (!isNaN(val) && val > 0) {
      sound.playChip();
      if (onSelectChip) onSelectChip(val);
      if (onCustomBetSubmit) onCustomBetSubmit(val);
      setIsTypingBet(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2.5 p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-zinc-400">Total Bet:</span>
          <div className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-700 font-mono font-black text-amber-300 text-sm">
            {currentBetTotal.toLocaleString()} <span className="text-[9px] text-zinc-500 font-sans">CHIPS</span>
          </div>

          {/* Quick Custom Type Button */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsTypingBet(!isTypingBet)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                isTypingBet
                  ? 'bg-purple-600 text-white border-purple-400'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Type Bet</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
          {onClearBets && (
            <button
              type="button"
              disabled={disabled || currentBetTotal === 0}
              onClick={() => {
                sound.playChip();
                onClearBets();
              }}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 disabled:opacity-40 cursor-pointer"
            >
              Clear
            </button>
          )}
          {onHalfBets && (
            <button
              type="button"
              disabled={disabled || currentBetTotal === 0}
              onClick={() => {
                sound.playChip();
                onHalfBets();
              }}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 disabled:opacity-40 cursor-pointer"
            >
              ½
            </button>
          )}
          {onDoubleBets && (
            <button
              type="button"
              disabled={disabled || currentBetTotal === 0 || balance < currentBetTotal * 2}
              onClick={() => {
                sound.playChip();
                onDoubleBets();
              }}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 disabled:opacity-40 cursor-pointer"
            >
              2×
            </button>
          )}
          {onMaxBet && (
            <button
              type="button"
              disabled={disabled || balance <= 0}
              onClick={() => {
                sound.playChip();
                onMaxBet();
              }}
              className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 disabled:opacity-40 cursor-pointer"
            >
              MAX
            </button>
          )}
        </div>
      </div>

      {/* Expanded Custom Bet Type-In Row */}
      {isTypingBet && (
        <form onSubmit={handleCustomTypeBet} className="p-2 rounded-xl bg-purple-950/30 border border-purple-500/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <span className="text-[11px] font-bold text-purple-300 shrink-0">Custom Amount:</span>
          <input
            type="number"
            min={1}
            max={balance}
            value={typedBetInput}
            onChange={(e) => setTypedBetInput(e.target.value)}
            placeholder="e.g. 250, 7500..."
            className="flex-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-purple-500/60 font-mono font-black text-amber-300 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow-md cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Set Active Chip</span>
          </button>
        </form>
      )}

      {/* Chip Rack with higher denominations */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1">
        {CHIP_VALUES.map((chip) => {
          const isSelected = selectedChip === chip.value;
          const canAfford = balance >= chip.value;

          return (
            <button
              key={chip.value}
              type="button"
              disabled={disabled || !canAfford}
              onClick={() => {
                sound.playChip();
                if (onSelectChip) onSelectChip(chip.value);
              }}
              className={`min-w-[48px] sm:min-w-[54px] h-11 sm:h-12 rounded-xl sm:rounded-2xl border-2 flex flex-col items-center justify-center font-black text-xs transition-all shrink-0 active:scale-95 shadow-md ${
                chip.color
              } ${
                isSelected
                  ? 'ring-4 ring-amber-400 scale-105 shadow-amber-500/40 z-10'
                  : canAfford
                  ? 'hover:-translate-y-0.5 opacity-90 cursor-pointer'
                  : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <span className="leading-none">{chip.label}</span>
              {isSelected && (
                <span className="text-[7px] uppercase tracking-tighter text-amber-300 leading-none mt-0.5 font-bold">
                  ACTIVE
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
