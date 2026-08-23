import React, { useState, useEffect } from 'react';
import { 
  GameTab, 
  LootItem, 
  InventoryItem, 
  CasinoStats, 
  UserAccount, 
  DailyWinnerRecord, 
  AllTimePeakRecord,
  ChatMessage,
  PlayerProfileData
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
import { CasinoChat } from './components/CasinoChat';
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { 
  DEFAULT_USER_ACCOUNT, 
  INITIAL_DAILY_WINNERS, 
  INITIAL_ALL_TIME_PEAKS,
  updateAllTimePeaksWithUser,
  getDailyLeaderboard,
  isUserAdmin,
  ADMIN_EMAIL
} from './utils/leaderboard';
import { 
  getCurrentEstDateString, 
  getYesterdayEstDateString, 
  formatEstDateFriendly 
} from './utils/estTime';
import { sound } from './utils/audio';

const STORAGE_KEYS = {
  BALANCE: 'freebiesonly_balance',
  INVENTORY: 'freebiesonly_inventory',
  STATS: 'freebiesonly_stats',
  SOUND: 'freebiesonly_sound',
  ACCOUNT: 'freebiesonly_account',
  ATM_HISTORY: 'freebiesonly_atm_history',
  DAILY_WINNERS: 'freebiesonly_daily_winners',
  ALL_TIME_PEAKS: 'freebiesonly_all_time_peaks',
};

// Helper to get from new key with fallback to legacy key
function getStoredItem(key: string, legacyKey: string): string | null {
  return localStorage.getItem(key) ?? localStorage.getItem(legacyKey);
}

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
    const saved = getStoredItem(STORAGE_KEYS.BALANCE, 'bullshit_casino_balance');
    return saved !== null ? parseInt(saved, 10) : 1000;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = getStoredItem(STORAGE_KEYS.INVENTORY, 'bullshit_casino_inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState<CasinoStats>(() => {
    const saved = getStoredItem(STORAGE_KEYS.STATS, 'bullshit_casino_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  const [userAccount, setUserAccount] = useState<UserAccount>(() => {
    const saved = getStoredItem(STORAGE_KEYS.ACCOUNT, 'bullshit_casino_account');
    return saved ? JSON.parse(saved) : DEFAULT_USER_ACCOUNT;
  });

  const [atmHistory, setAtmHistory] = useState<number[]>(() => {
    const saved = getStoredItem(STORAGE_KEYS.ATM_HISTORY, 'bullshit_casino_atm_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyWinners, setDailyWinners] = useState<DailyWinnerRecord[]>(() => {
    const saved = getStoredItem(STORAGE_KEYS.DAILY_WINNERS, 'bullshit_casino_daily_winners');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_WINNERS;
  });

  const [allTimePeaks, setAllTimePeaks] = useState<AllTimePeakRecord[]>(() => {
    const saved = getStoredItem(STORAGE_KEYS.ALL_TIME_PEAKS, 'bullshit_casino_all_time_peaks');
    return saved ? JSON.parse(saved) : INITIAL_ALL_TIME_PEAKS;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = getStoredItem(STORAGE_KEYS.SOUND, 'bullshit_casino_sound');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [currentTab, setCurrentTab] = useState<GameTab>('home');
  const [isBailoutOpen, setIsBailoutOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [isModeratorOpen, setIsModeratorOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Player profile inspection
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfileData | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Chat external broadcasts
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const isAdmin = isUserAdmin(userAccount);
  const pendingPayoutsCount = dailyWinners.filter(w => w.payoutStatus === 'Pending').length;

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

  // Sign Out Handler
  const handleSignOut = () => {
    // Reset account registration state so the user can switch or sign in with another identity
    setUserAccount(prev => ({
      ...DEFAULT_USER_ACCOUNT,
      username: '',
      contactHandle: '',
      isRegistered: false,
      googleLinked: false,
      googleEmail: undefined,
      googleName: undefined,
      googlePicture: undefined,
      email: undefined,
    }));
    // Reset session balance to starting 1000 chips
    setBalance(1000);
    setAtmHistory([]);
    sound.playChip();
  };

  // Moderator update winner
  const handleUpdateWinner = (winnerId: string, updates: Partial<DailyWinnerRecord>) => {
    setDailyWinners(prev => prev.map(w => w.id === winnerId ? { ...w, ...updates } : w));
  };

  // Inspect Player Profile
  const handleInspectPlayer = (player: PlayerProfileData) => {
    const isMe = player.id === userAccount.id || player.isUser;
    setSelectedPlayer({
      ...player,
      balance: isMe ? balance : player.balance,
      isUser: isMe,
    });
    setIsProfileModalOpen(true);
  };

  // Admin Balance Reset Handler
  const handleAdminResetBalance = (playerId: string, username: string, resetAmount: number, reason?: string) => {
    const isMe = playerId === userAccount.id || (selectedPlayer && selectedPlayer.isUser);

    if (isMe) {
      setBalance(resetAmount);
    }

    if (selectedPlayer && selectedPlayer.id === playerId) {
      setSelectedPlayer(prev => prev ? { ...prev, balance: resetAmount } : null);
    }

    // Broadcast system notice to the live chat
    const adminNotice: ChatMessage = {
      id: 'mod-notice-' + Date.now(),
      senderId: 'sys-admin',
      username: '🛡️ Admin Thomas Joe',
      avatar: '👑',
      vipTier: 'Sovereign Degenerate',
      text: `Reset ${username}'s bankroll to ${resetAmount.toLocaleString()} chips. [Audit: ${reason || 'Administrative bankroll reset'}]`,
      timestamp: Date.now(),
      type: 'mod_action',
      badge: 'ADMIN MOD',
      isAdmin: true,
    };

    setChatMessages(prev => [...prev, adminNotice]);
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
        onToggleChat={() => setIsChatOpen(prev => !prev)}
        onOpenPendingPayouts={() => setIsModeratorOpen(true)}
        inventoryCount={inventory.length}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(prev => !prev)}
        pendingPayoutsCount={pendingPayoutsCount}
        isChatOpen={isChatOpen}
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
            onInspectPlayer={handleInspectPlayer}
            onToggleChat={() => setIsChatOpen(prev => !prev)}
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
            onInspectPlayer={handleInspectPlayer}
          />
        )}
      </main>

      {/* Live Casino Lounge Chat (Drawer / Popup) */}
      <CasinoChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userAccount={userAccount}
        balance={balance}
        onInspectPlayer={handleInspectPlayer}
        externalMessages={chatMessages}
        onSendMessage={(msg) => setChatMessages(prev => [...prev, msg])}
      />

      {/* Player Profile Inspection & Admin Balance Reset Modal */}
      <PlayerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        player={selectedPlayer}
        currentUserAccount={userAccount}
        onResetBalance={handleAdminResetBalance}
      />

      {/* Mandatory Signup Modal if user is not yet registered */}
      <SignupModal
        isOpen={!userAccount.isRegistered || !userAccount.contactHandle}
        onCompleteSignup={handleCompleteSignup}
        initialAccount={userAccount}
      />

      {/* Profile, Google Security & Session Account Panel */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        account={userAccount}
        stats={stats}
        balance={balance}
        inventoryCount={inventory.length}
        onUpdateAccount={setUserAccount}
        onSignOut={handleSignOut}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
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

      {/* Owner & Admin Pending Payouts Portal (Thomas Joe) */}
      {isAdmin && (
        <ModeratorModal
          isOpen={isModeratorOpen}
          onClose={() => setIsModeratorOpen(false)}
          dailyWinners={dailyWinners}
          onUpdateWinner={handleUpdateWinner}
          onInspectPlayer={handleInspectPlayer}
        />
      )}
    </div>
  );
}
