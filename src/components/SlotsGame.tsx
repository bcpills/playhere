import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CasinoStats } from '../types';
import { sound } from '../utils/audio';
import { SlotGameId, BonusSummaryData } from './slots/types';
import { VegasNeonSlots } from './slots/VegasNeonSlots';
import { HoldAndWinSlots } from './slots/HoldAndWinSlots';
import { BonusSummaryModal } from './slots/BonusSummaryModal';
import { 
  Sparkles, 
  Flame, 
  Coins, 
  DollarSign, 
  Volume2, 
  VolumeX, 
  Trophy, 
  Award,
  Crown
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

export const SlotsGame: React.FC<SlotsGameProps> = ({
  balance,
  cashBalance = 0,
  onUpdateBalance,
  onUpdateCashBalance,
  stats,
  onUpdateStats,
  onAddRakeback,
}) => {
  const [selectedGame, setSelectedGame] = useState<SlotGameId>('neon777');
  const [currencyMode, setCurrencyMode] = useState<'gc' | 'cash'>('cash');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sound.enabled);
  const [bonusSummary, setBonusSummary] = useState<BonusSummaryData | null>(null);

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundEnabled(sound.enabled);
  };

  const handleRecordWager = (wagerAmount: number, isCash: boolean) => {
    onUpdateStats(prev => ({
      ...prev,
      totalWagered: isCash ? prev.totalWagered + (wagerAmount * 1000) : prev.totalWagered + wagerAmount,
      totalWageredCash: isCash ? (prev.totalWageredCash || 0) + wagerAmount : (prev.totalWageredCash || 0),
      roundsPlayedSlots: (prev.roundsPlayedSlots || 0) + 1,
    }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 pb-12 select-none">
      
      {/* TOP HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-3xl bg-zinc-950/90 border-2 border-purple-900/40 shadow-xl">
        
        {/* Game Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => {
              sound.playChip();
              setSelectedGame('neon777');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              selectedGame === 'neon777'
                ? 'bg-gradient-to-r from-purple-600 to-amber-500 text-white shadow-lg shadow-purple-900/50'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <span>⭐</span>
            <span>Lucky Neon 777 (Free Spins)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playChip();
              setSelectedGame('holdAndWin');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              selectedGame === 'holdAndWin'
                ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-red-900/50'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <span>🔥</span>
            <span>Solar Inferno (Hold & Win)</span>
          </button>
        </div>

        {/* Currency & Audio Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          
          {/* Currency Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                sound.playChip();
                setCurrencyMode('cash');
              }}
              className={`px-2.5 py-1 rounded-lg font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
                currencyMode === 'cash'
                  ? 'bg-emerald-500 text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>${cashBalance.toFixed(2)}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playChip();
                setCurrencyMode('gc');
              }}
              className={`px-2.5 py-1 rounded-lg font-black uppercase flex items-center gap-1 transition-all cursor-pointer ${
                currencyMode === 'gc'
                  ? 'bg-amber-500 text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{balance.toLocaleString()} GC</span>
            </button>
          </div>

          {/* Audio Button */}
          <button
            type="button"
            onClick={toggleSound}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>
        </div>

      </div>

      {/* ACTIVE SLOT GAME MACHINE */}
      <AnimatePresence mode="wait">
        {selectedGame === 'neon777' ? (
          <motion.div
            key="neon777"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <VegasNeonSlots
              currencyMode={currencyMode}
              balance={balance}
              cashBalance={cashBalance}
              onUpdateBalance={onUpdateBalance}
              onUpdateCashBalance={onUpdateCashBalance}
              onAddRakeback={onAddRakeback}
              onRecordWager={handleRecordWager}
              onShowBonusSummary={setBonusSummary}
            />
          </motion.div>
        ) : (
          <motion.div
            key="holdAndWin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <HoldAndWinSlots
              currencyMode={currencyMode}
              balance={balance}
              cashBalance={cashBalance}
              onUpdateBalance={onUpdateBalance}
              onUpdateCashBalance={onUpdateCashBalance}
              onAddRakeback={onAddRakeback}
              onRecordWager={handleRecordWager}
              onShowBonusSummary={setBonusSummary}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FINAL BONUS SUMMARY MODAL */}
      <BonusSummaryModal
        data={bonusSummary}
        onCollect={() => setBonusSummary(null)}
      />

    </div>
  );
};
export default SlotsGame;
