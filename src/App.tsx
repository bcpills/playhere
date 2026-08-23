import React, { useState, useEffect } from 'react';
import { GameTab, LootItem, InventoryItem, CasinoStats, UserAccount } from './types';
import { Header } from './components/Header';
import { LobbyHome } from './components/LobbyHome';
import { BlackjackGame } from './components/BlackjackGame';
import { KenoGame } from './components/KenoGame';
import { UnboxerGame } from './components/UnboxerGame';
import { TrophyVault } from './components/TrophyVault';
import { DailyLeaderboard } from './components/DailyLeaderboard';
import { AccountModal } from './components/AccountModal';
import { BailoutModal } from './components/BailoutModal';
import { StatsModal } from './components/StatsModal';
import { RulesModal } from './components/RulesModal';
import { DEFAULT_USER_ACCOUNT } from './utils/leaderboard';
import { sound } from './utils/audio';

const STORAGE_KEYS = {
  BALANCE: 'bullshit_casino_balance',
  INVENTORY: 'bullshit_casino_inventory',
  STATS: 'bullshit_casino_stats',
  SOUND: 'bullshit_casino_sound',
  ACCOUNT: 'bullshit_casino_account',
  ATM_HISTORY: 'bullshit_casino_atm_history',
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
  // State Initialization from LocalStorage or 1000 Default
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BALANCE);
    return saved !== null ? parseInt(saved, 10) : 1000;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState<CasinoStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATS);
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  const [userAccount, setUserAccount] = useState<UserAccount>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNT);
    return saved ? JSON.parse(saved) : DEFAULT_USER_ACCOUNT;
  });

  const [atmHistory, setAtmHistory] = useState<number[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATM_HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [currentTab, setCurrentTab] = useState<GameTab>('home');
  const [isBailoutOpen, setIsBailoutOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNT, JSON.stringify(userAccount));
  }, [userAccount]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATM_HISTORY, JSON.stringify(atmHistory));
  }, [atmHistory]);

  // Balance Update Handler
  const handleUpdateBalance = (delta: number) => {
    setBalance(prev => Math.max(0, prev + delta));
    setStats(prev => ({
      ...prev,
      netProfit: prev.netProfit + delta,
    }));
  };

  const handleResetBankroll = (newAmount = 1000) => {
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
    sound.playChip();
    setInventory(prev => prev.filter(i => i.instanceId !== instanceId));
    handleUpdateBalance(value);
  };

  const handleSellAll = () => {
    const totalVal = inventory.reduce((sum, i) => sum + i.item.value, 0);
    if (totalVal > 0) {
      sound.playProfit();
      handleUpdateBalance(totalVal);
      setInventory([]);
    }
  };

  // Bailout Handler
  const handleClaimBailout = (amount: number) => {
    handleUpdateBalance(amount);
    setAtmHistory(prev => [...prev, Date.now()]);
    setStats(prev => ({
      ...prev,
      bailoutCount: prev.bailoutCount + 1,
    }));
  };

  // Daily Bonus Handler
  const handleClaimDailyBonus = (amount: number) => {
    handleUpdateBalance(amount);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Sticky Top Header */}
      <Header
        balance={balance}
        netProfit={stats.netProfit}
        currentTab={currentTab}
        userAccount={userAccount}
        onTabChange={setCurrentTab}
        onOpenBailout={() => setIsBailoutOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        inventoryCount={inventory.length}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(prev => !prev)}
      />

      {/* Main Game Stage */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-2.5 sm:p-4 flex flex-col justify-start">
        {currentTab === 'home' && (
          <LobbyHome
            balance={balance}
            netProfit={stats.netProfit}
            stats={stats}
            inventory={inventory}
            userAccount={userAccount}
            onNavigate={setCurrentTab}
            onOpenBailout={() => setIsBailoutOpen(true)}
            onOpenStats={() => setIsStatsOpen(true)}
            onOpenRules={() => setIsRulesOpen(true)}
            onOpenAccount={() => setIsAccountOpen(true)}
          />
        )}

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

        {currentTab === 'leaderboard' && (
          <DailyLeaderboard
            userAccount={userAccount}
            stats={stats}
            inventory={inventory}
            balance={balance}
            onOpenAccount={() => setIsAccountOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        account={userAccount}
        stats={stats}
        balance={balance}
        onUpdateAccount={setUserAccount}
        onClaimDailyBonus={handleClaimDailyBonus}
        onResetBankroll={handleResetBankroll}
      />

      <BailoutModal
        isOpen={isBailoutOpen}
        onClose={() => setIsBailoutOpen(false)}
        onClaimBailout={handleClaimBailout}
        currentBalance={balance}
        atmHistory={atmHistory}
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

