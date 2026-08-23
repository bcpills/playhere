import React, { useState, useEffect } from 'react';
import { 
  GameTab, 
  LootItem, 
  InventoryItem, 
  CasinoStats, 
  UserAccount, 
  DailyWinnerRecord, 
  AllTimePeakRecord 
} from './types';
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
import { SignupModal } from './components/SignupModal';
import { ModeratorModal } from './components/ModeratorModal';
import { 
  DEFAULT_USER_ACCOUNT, 
  INITIAL_DAILY_WINNERS, 
  INITIAL_ALL_TIME_PEAKS,
  updateAllTimePeaksWithUser,
  getDailyLeaderboard
} from './utils/leaderboard';
import { 
  getCurrentEstDateString, 
  getYesterdayEstDateString, 
  formatEstDateFriendly 
} from './utils/estTime';
import { sound } from './utils/audio';

const STORAGE_KEYS = {
  BALANCE: 'bullshit_casino_balance',
  INVENTORY: 'bullshit_casino_inventory',
  STATS: 'bullshit_casino_stats',
  SOUND: 'bullshit_casino_sound',
  ACCOUNT: 'bullshit_casino_account',
  ATM_HISTORY: 'bullshit_casino_atm_history',
  DAILY_WINNERS: 'bullshit_casino_daily_winners',
  ALL_TIME_PEAKS: 'bullshit_casino_all_time_peaks',
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

  const [dailyWinners, setDailyWinners] = useState<DailyWinnerRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_WINNERS);
    return saved ? JSON.parse(saved) : INITIAL_DAILY_WINNERS;
  });

  const [allTimePeaks, setAllTimePeaks] = useState<AllTimePeakRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALL_TIME_PEAKS);
    return saved ? JSON.parse(saved) : INITIAL_ALL_TIME_PEAKS;
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
  const [isModeratorOpen, setIsModeratorOpen] = useState<boolean>(false);

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DAILY_WINNERS, JSON.stringify(dailyWinners));
  }, [dailyWinners]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALL_TIME_PEAKS, JSON.stringify(allTimePeaks));
  }, [allTimePeaks]);

  // Track Peak Balance and check if it reaches Top 20 All-Time
  useEffect(() => {
    if (balance > (userAccount.peakBalanceAllTime || 0)) {
      setUserAccount(prev => ({
        ...prev,
        peakBalanceAllTime: balance,
      }));
      // Check for Hall of Fame qualification
      setAllTimePeaks(prevPeaks => updateAllTimePeaksWithUser(prevPeaks, userAccount, stats, balance));
    }
  }, [balance, userAccount, stats]);

  // 12:00 AM EST Daily Reset Lifecycle Engine
  useEffect(() => {
    const checkDailyEstReset = () => {
      const currentEstDate = getCurrentEstDateString();
      const lastActiveDate = userAccount.lastActiveEstDate;

      // If date has rolled over past 12:00 AM EST
      if (lastActiveDate && lastActiveDate !== currentEstDate) {
        const yesterdayEstDate = getYesterdayEstDateString();
        
        // Check if yesterday's winner was logged
        const alreadyLogged = dailyWinners.some(w => w.dateEst === yesterdayEstDate);
        if (!alreadyLogged) {
          // Determine yesterday's top player from yesterday's daily leaderboard
          const standings = getDailyLeaderboard('profit', userAccount, stats, inventory, balance);
          const topRanked = standings[0];

          if (topRanked) {
            const newWinnerRecord: DailyWinnerRecord = {
              id: `win-${yesterdayEstDate}`,
              dateEst: yesterdayEstDate,
              formattedDate: formatEstDateFriendly(yesterdayEstDate),
              username: topRanked.username,
              avatar: topRanked.avatar,
              vipTier: topRanked.vipTier,
              contactPlatform: topRanked.contactPlatform || 'discord',
              contactHandle: topRanked.contactHandle || (topRanked.isUser ? userAccount.contactHandle : '@champion'),
              winningChips: topRanked.score,
              formattedScore: `${topRanked.score.toLocaleString()} Chips`,
              payoutStatus: 'Pending',
              payoutNote: 'Awaiting manual contact by casino moderator.',
            };

            setDailyWinners(prev => [newWinnerRecord, ...prev]);
          }
        }

        // Daily Reset: Refill bankroll to 1,000 Starting Chips, reset ATM history for the day
        setBalance(1000);
        setAtmHistory([]);
        setUserAccount(prev => ({
          ...prev,
          lastActiveEstDate: currentEstDate,
          dailyStreak: (prev.dailyStreak || 1) + 1,
        }));
      }
    };

    checkDailyEstReset();
    const interval = setInterval(checkDailyEstReset, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, [userAccount, stats, inventory, balance, dailyWinners]);

  // Balance Update Handler
  const handleUpdateBalance = (delta: number) => {
    setBalance(prev => Math.max(0, prev + delta));
    setStats(prev => ({
      ...prev,
      netProfit: prev.netProfit + delta,
    }));
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

  // Bailout Handler (100 chips, 5 pulls/day, 10-min cooldown)
  const handleClaimBailout = (amount: number) => {
    handleUpdateBalance(amount);
    setAtmHistory(prev => [...prev, Date.now()]);
    setStats(prev => ({
      ...prev,
      bailoutCount: prev.bailoutCount + 1,
    }));
  };

  // Signup Completion Handler
  const handleCompleteSignup = (signupData: Partial<UserAccount>) => {
    setUserAccount(prev => ({
      ...prev,
      ...signupData,
      isRegistered: true,
      lastActiveEstDate: getCurrentEstDateString(),
    }));
  };

  // Moderator update winner
  const handleUpdateWinner = (winnerId: string, updates: Partial<DailyWinnerRecord>) => {
    setDailyWinners(prev => prev.map(w => w.id === winnerId ? { ...w, ...updates } : w));
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
            dailyWinners={dailyWinners}
            onNavigate={setCurrentTab}
            onOpenBailout={() => setIsBailoutOpen(true)}
            onOpenStats={() => setIsStatsOpen(true)}
            onOpenRules={() => setIsRulesOpen(true)}
            onOpenAccount={() => setIsAccountOpen(true)}
            onOpenModeratorLog={() => setIsModeratorOpen(true)}
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
            dailyWinners={dailyWinners}
            allTimePeaks={allTimePeaks}
            onOpenAccount={() => setIsAccountOpen(true)}
            onOpenModeratorLog={() => setIsModeratorOpen(true)}
          />
        )}
      </main>

      {/* Mandatory Signup Modal if user is not yet registered */}
      <SignupModal
        isOpen={!userAccount.isRegistered || !userAccount.contactHandle}
        onCompleteSignup={handleCompleteSignup}
        initialAccount={userAccount}
      />

      {/* Profile & Settings Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        account={userAccount}
        stats={stats}
        balance={balance}
        onUpdateAccount={setUserAccount}
      />

      {/* ATM of Shame Modal */}
      <BailoutModal
        isOpen={isBailoutOpen}
        onClose={() => setIsBailoutOpen(false)}
        onClaimBailout={handleClaimBailout}
        currentBalance={balance}
        atmHistory={atmHistory}
      />

      {/* Career Dossier Modal */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        currentBalance={balance}
      />

      {/* Rules & Guidelines Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* Owner & Moderator Payout Log Portal */}
      <ModeratorModal
        isOpen={isModeratorOpen}
        onClose={() => setIsModeratorOpen(false)}
        dailyWinners={dailyWinners}
        onUpdateWinner={handleUpdateWinner}
      />
    </div>
  );
}
