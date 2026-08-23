import React from 'react';
import { sound } from '../utils/audio';

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
}

const CHIP_VALUES = [
  { value: 1, label: '1', color: 'bg-zinc-800 border-zinc-500 text-zinc-200' },
  { value: 5, label: '5', color: 'bg-red-800 border-red-500 text-white' },
  { value: 10, label: '10', color: 'bg-blue-800 border-blue-500 text-white' },
  { value: 25, label: '25', color: 'bg-emerald-800 border-emerald-500 text-white' },
  { value: 50, label: '50', color: 'bg-purple-800 border-purple-500 text-white' },
  { value: 100, label: '100', color: 'bg-amber-600 border-amber-400 text-black font-black' },
];

export const ChipSelector: React.FC<ChipSelectorProps> = ({
  currentBet,
  onBetChange,
  maxBet = 10000,
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
}) => {
  // Mode A: Direct Wager Modifier
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
    };

    const handleDouble = () => {
      if (disabled) return;
      sound.playChip();
      onBetChange(currentBet === 0 ? Math.min(maxBet, 10) : Math.min(maxBet, currentBet * 2));
    };

    const handleHalf = () => {
      if (disabled || currentBet <= 0) return;
      sound.playChip();
      onBetChange(Math.max(minBet, Math.floor(currentBet / 2)));
    };

    const handleMax = () => {
      if (disabled || maxBet <= 0) return;
      sound.playChip();
      onBetChange(maxBet);
    };

    return (
      <div className="w-full flex flex-col gap-2 p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-zinc-400">Wager:</span>
            <div className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-700 font-mono font-black text-amber-300 text-sm">
              {currentBet.toLocaleString()} <span className="text-[9px] text-zinc-500 font-sans">CHIPS</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={disabled || currentBet === 0}
              onClick={handleClear}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 disabled:opacity-40"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={disabled || currentBet <= 0}
              onClick={handleHalf}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 disabled:opacity-40"
            >
              ½
            </button>
            <button
              type="button"
              disabled={disabled || currentBet >= maxBet}
              onClick={handleDouble}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 disabled:opacity-40"
            >
              2×
            </button>
            <button
              type="button"
              disabled={disabled || maxBet <= 0}
              onClick={handleMax}
              className="px-2 py-1 rounded-lg text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 disabled:opacity-40"
            >
              MAX
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-0.5">
          {CHIP_VALUES.map((chip) => {
            const canAfford = currentBet + chip.value <= maxBet;
            return (
              <button
                key={chip.value}
                type="button"
                disabled={disabled || !canAfford}
                onClick={() => handleAdd(chip.value)}
                className={`flex-1 min-w-[42px] h-10 sm:h-11 rounded-xl border-2 flex items-center justify-center font-bold text-xs shadow-md transition-all active:scale-90 ${
                  chip.color
                } ${!canAfford ? 'opacity-30 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
              >
                +{chip.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Mode B: Blackjack Spot-Bettor Chip Rack
  return (
    <div className="w-full flex flex-col gap-2.5 p-3 rounded-2xl bg-zinc-950/90 border border-zinc-800 shadow-xl">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase text-zinc-400">Total Bet:</span>
          <div className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-700 font-mono font-black text-amber-300 text-sm">
            {currentBetTotal.toLocaleString()} <span className="text-[9px] text-zinc-500 font-sans">CHIPS</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onClearBets && (
            <button
              type="button"
              disabled={disabled || currentBetTotal === 0}
              onClick={() => {
                sound.playChip();
                onClearBets();
              }}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 disabled:opacity-40"
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
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 disabled:opacity-40"
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
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 disabled:opacity-40"
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
              className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 disabled:opacity-40"
            >
              MAX
            </button>
          )}
        </div>
      </div>

      {/* Chip Rack */}
      <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
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
              className={`flex-1 min-w-[44px] sm:min-w-[50px] h-10 sm:h-12 rounded-xl sm:rounded-2xl border-2 flex flex-col items-center justify-center font-black text-xs transition-all active:scale-95 shadow-md ${
                chip.color
              } ${
                isSelected
                  ? 'ring-4 ring-amber-400 scale-105 shadow-amber-500/30 z-10'
                  : canAfford
                  ? 'hover:-translate-y-0.5 opacity-90'
                  : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <span className="leading-none">{chip.label}</span>
              {isSelected && (
                <span className="text-[8px] uppercase tracking-tighter text-amber-300 leading-none mt-0.5 font-bold">
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
