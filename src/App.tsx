import React, { useState, useEffect } from 'react';
import { GameTab, LootItem, InventoryItem, CasinoStats } from './types';
import { Header } from './components/Header';
import { BlackjackGame } from './components/BlackjackGame';
import { KenoGame } from './components/KenoGame';
import { UnboxerGame } from './components/UnboxerGame';
import { TrophyVault } from './components/TrophyVault';
import { BailoutModal } from './components/BailoutModal';
import { StatsModal } from './components/StatsModal';
import { RulesModal } from './components/RulesModal';
import { sound } from './utils/audio';

const STORAGE_KEYS = {
  BALANCE: 'bullshit_casino_balance',
  INVENTORY: 'bullshit_casino_inventory',
  STATS: 'bullshit_casino_stats',
  SOUND: 'bullshit_casino_sound',
};

const INITIAL_STATS: CasinoStats = {
  totalWagered: 0,
  totalWon: 0,
  totalLost: 0,
  netProfit: 0,
  handsPlayedBlackjack: 0,
  roundsPlayedKeno: 0,
  cratesOpened: 0,
  biggestWin: 0,
  biggestMultiplier: 0,
  sideBetWinsBlackjack: 0,
  bailoutCount: 0,
};

export default function App() {
  // State Initialization from LocalStorage or 500 Default
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BALANCE);
    return saved !== null ? parseInt(saved, 10) : 500;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState<CasinoStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATS);
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [currentTab, setCurrentTab] = useState<GameTab>('blackjack');
  const [isBailoutOpen, setIsBailoutOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);

  // Sync sound engine
  useEffect(() => {
    sound.enabled = soundEnabled;
    localStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // Persist State to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BALANCE, balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }, [stats]);

  // Balance Update Handler
  const handleUpdateBalance = (delta: number) => {
    setBalance(prev => Math.max(0, prev + delta));
    setStats(prev => ({
      ...prev,
      netProfit: prev.netProfit + delta,
    }));
  };

  const handleResetBankroll = (newAmount = 500) => {
    setBalance(newAmount);
  };

  // Inventory Handlers
  const handleAddToInventory = (item: LootItem, crateId: string) => {
    const newInvItem: InventoryItem = {
      instanceId: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      item,
      obtainedAt: Date.now(),
      crateId,
    };
    setInventory(prev => [newInvItem, ...prev]);
  };

  const handleSellItem = (instanceId: string, value: number) => {
    setInventory(prev => prev.filter(i => i.instanceId !== instanceId));
    handleUpdateBalance(value);
  };

  const handleSellAll = () => {
    const totalVal = inventory.reduce((sum, i) => sum + i.item.value, 0);
    if (totalVal > 0) {
      handleUpdateBalance(totalVal);
      setInventory([]);
    }
  };

  // Bailout Handler
  const handleClaimBailout = (amount: number) => {
    handleUpdateBalance(amount);
    setStats(prev => ({
      ...prev,
      bailoutCount: prev.bailoutCount + 1,
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Fixed / Sticky Header */}
      <Header
        balance={balance}
        netProfit={stats.netProfit}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenBailout={() => setIsBailoutOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        inventoryCount={inventory.length}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(prev => !prev)}
      />

      {/* Main Game Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-start">
        {currentTab === 'blackjack' && (
          <BlackjackGame
            balance={balance}
            onUpdateBalance={handleUpdateBalance}
            onUpdateStats={setStats}
          />
        )}

        {currentTab === 'keno' && (
          <KenoGame
            balance={balance}
            onUpdateBalance={handleUpdateBalance}
            onUpdateStats={setStats}
          />
        )}

        {currentTab === 'unboxer' && (
          <UnboxerGame
            balance={balance}
            onUpdateBalance={handleUpdateBalance}
            onAddToInventory={handleAddToInventory}
            onUpdateStats={setStats}
          />
        )}

        {currentTab === 'inventory' && (
          <TrophyVault
            inventory={inventory}
            onSellItem={handleSellItem}
            onSellAll={handleSellAll}
            onUpdateBalance={handleUpdateBalance}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950/60 py-3 sm:py-4 px-4 sm:px-6 text-center text-[11px] sm:text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>The Bullshit Casino © 2026 • Provably Absurd Virtual Chips Only</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRulesOpen(true)}
              className="hover:text-zinc-300 transition-colors underline"
            >
              Paytables & Rules
            </button>
            <button
              onClick={() => setIsBailoutOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              ATM of Shame Refill
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BailoutModal
        isOpen={isBailoutOpen}
        onClose={() => setIsBailoutOpen(false)}
        onClaimBailout={handleClaimBailout}
        currentBalance={balance}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        currentBalance={balance}
        onResetBankroll={handleResetBankroll}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </div>
  );
}
