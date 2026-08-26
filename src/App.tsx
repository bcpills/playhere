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
import { MinesGame } from './components/MinesGame';
import { DiceDuelsGame } from './components/DiceDuelsGame';
import { CoinflipGame } from './components/CoinflipGame';
import { MilestoneCratesModal } from './components/MilestoneCratesModal';
import { DailyLeaderboard } from './components/DailyLeaderboard';
import { AccountModal } from './components/AccountModal';
import { BailoutModal } from './components/BailoutModal';
import { StatsModal } from './components/StatsModal';
import { RulesModal } from './components/RulesModal';
import { SignupModal } from './components/SignupModal';
import { ModeratorModal } from './components/ModeratorModal';
import { CasinoChat } from './components/CasinoChat';
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { PayForAdFreeModal } from './components/PayForAdFreeModal';
import { MilestoneCrateDef } from './utils/milestones';
import { 
  DEFAULT_USER_ACCOUNT, 
  INITIAL_DAILY_WINNERS, 
  INITIAL_ALL_TIME_PEAKS,
  updateAllTimePeaksWithUser,
  getDailyLeaderboard,
  getPlayerPlacementData,
  isUserAdmin,
  ADMIN_EMAIL,
  getEstimatedWagerForTier
} from './utils/leaderboard';
import { 
  getCurrentEstDateString, 
  getYesterdayEstDateString, 
  formatEstDateFriendly 
} from './utils/estTime';
import { 
  getAdminUserDirectory, 
  updateUserInAdminDirectory, 
  INITIAL_ADMIN_USERS 
} from './utils/adminUsers';
import { AdminManagedUser, AccountStatus } from './types';
import { sound } from './utils/audio';

const STORAGE_KEYS = {
  BALANCE: 'chipzone_balance',
  INVENTORY: 'chipzone_inventory',
  STATS: 'chipzone_stats',
  SOUND: 'chipzone_sound',
  ACCOUNT: 'chipzone_account',
  ATM_HISTORY: 'chipzone_atm_history',
  DAILY_WINNERS: 'chipzone_daily_winners',
  ALL_TIME_PEAKS: 'chipzone_all_time_peaks',
  ADMIN_USERS: 'chipzone_admin_users',
};

// Helper to get from new key with fallback to legacy keys
function getStoredItem(key: string, legacyKey1: string, legacyKey2?: string): string | null {
  return localStorage.getItem(key) ?? localStorage.getItem(legacyKey1) ?? (legacyKey2 ? localStorage.getItem(legacyKey2) : null);
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
    const saved = getStoredItem(STORAGE_KEYS.BALANCE, 'freebiesonly_balance', 'bullshit_casino_balance');
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      return !isNaN(parsed) && isFinite(parsed) ? Math.max(0, parsed) : 1000;
    }
    return 1000;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const [stats, setStats] = useState<CasinoStats>(() => {
    const saved = getStoredItem(STORAGE_KEYS.STATS, 'freebiesonly_stats', 'bullshit_casino_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  const [userAccount, setUserAccount] = useState<UserAccount>(() => {
    const saved = getStoredItem(STORAGE_KEYS.ACCOUNT, 'freebiesonly_account', 'bullshit_casino_account');
    return saved ? JSON.parse(saved) : DEFAULT_USER_ACCOUNT;
  });

  const [atmHistory, setAtmHistory] = useState<number[]>(() => {
    const saved = getStoredItem(STORAGE_KEYS.ATM_HISTORY, 'freebiesonly_atm_history', 'bullshit_casino_atm_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyWinners, setDailyWinners] = useState<DailyWinnerRecord[]>(() => {
    const saved = getStoredItem(STORAGE_KEYS.DAILY_WINNERS, 'freebiesonly_daily_winners', 'bullshit_casino_daily_winners');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_WINNERS;
  });

  const [allTimePeaks, setAllTimePeaks] = useState<AllTimePeakRecord[]>(() => {
    const saved = getStoredItem(STORAGE_KEYS.ALL_TIME_PEAKS, 'freebiesonly_all_time_peaks', 'bullshit_casino_all_time_peaks');
    return saved ? JSON.parse(saved) : INITIAL_ALL_TIME_PEAKS;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = getStoredItem(STORAGE_KEYS.SOUND, 'freebiesonly_sound', 'bullshit_casino_sound');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [currentTab, setCurrentTab] = useState<GameTab>('home');
  const [isBailoutOpen, setIsBailoutOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [isMilestonesOpen, setIsMilestonesOpen] = useState<boolean>(false);
  const [isModeratorOpen, setIsModeratorOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isPayForAdFreeOpen, setIsPayForAdFreeOpen] = useState<boolean>(false);

  // Admin Managed Users Directory State
  const [adminUsersList, setAdminUsersList] = useState<AdminManagedUser[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AdminManagedUser[];
        return getAdminUserDirectory(userAccount, balance, stats.totalWagered, userAccount.peakBalanceAllTime || balance, parsed);
      } catch (e) {
        console.error('Failed to parse admin users', e);
      }
    }
    return getAdminUserDirectory(userAccount, balance, stats.totalWagered, userAccount.peakBalanceAllTime || balance);
  });

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(adminUsersList));
  }, [adminUsersList]);

  // Keep admin user directory in sync with current user changes
  useEffect(() => {
    setAdminUsersList(prev => getAdminUserDirectory(userAccount, balance, stats.totalWagered, userAccount.peakBalanceAllTime || balance, prev));
  }, [userAccount, balance, stats.totalWagered]);

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
          const standings = getDailyLeaderboard('profit', userAccount, stats, balance);
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
    if (isNaN(delta) || !isFinite(delta)) return;
    setBalance(prev => {
      const safePrev = isNaN(prev) || !isFinite(prev) ? 1000 : prev;
      const next = Math.max(0, Math.round(safePrev + delta));
      return isNaN(next) ? 1000 : next;
    });
    setStats(prev => ({
      ...prev,
      netProfit: (isNaN(prev.netProfit) ? 0 : prev.netProfit) + delta,
    }));
  };

  // Inventory Handlers (Items Auto-Sell directly into chips)
  const handleAddToInventory = (item: LootItem, _crateId: string) => {
    if (item && item.value > 0) {
      handleUpdateBalance(item.value);
    }
  };

  const handleSellItem = (_instanceId: string, value: number) => {
    sound.playChip();
    handleUpdateBalance(value);
  };

  const handleSellAll = () => {
    setInventory([]);
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

  // Rakeback System: 10% on general bets, 2% on Blackjack
  const handleAddRakeback = (wager: number, isBlackjack?: boolean) => {
    if (isNaN(wager) || wager <= 0) return;
    const rate = isBlackjack ? 0.02 : 0.10;
    const rakebackEarned = Math.max(1, Math.round(wager * rate));
    setUserAccount(prev => ({
      ...prev,
      unclaimedRakeback: (isNaN(prev.unclaimedRakeback || 0) ? 0 : (prev.unclaimedRakeback || 0)) + rakebackEarned,
    }));
  };

  const handleClaimRakeback = () => {
    const amount = isNaN(userAccount.unclaimedRakeback || 0) ? 0 : (userAccount.unclaimedRakeback || 0);
    if (amount <= 0) return;
    sound.playProfit();
    handleUpdateBalance(amount);
    setUserAccount(prev => ({
      ...prev,
      unclaimedRakeback: 0,
      totalRakebackClaimed: (isNaN(prev.totalRakebackClaimed || 0) ? 0 : (prev.totalRakebackClaimed || 0)) + amount,
    }));
  };

  // Milestone Crates Claim Handler: Auto-Sell reward item for chips immediately!
  const handleClaimMilestone = (milestone: MilestoneCrateDef) => {
    sound.playBigWin();
    const itemBonus = milestone.rewardItem?.value || 0;
    const totalBonus = (milestone.bonusChips || 0) + itemBonus;
    if (totalBonus > 0) {
      handleUpdateBalance(totalBonus);
    }
    setUserAccount(prev => ({
      ...prev,
      claimedMilestoneCrates: [...(prev.claimedMilestoneCrates || []), milestone.id],
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

  // Admin User Directory Handlers
  const handleUpdateUserStatus = (userId: string, status: AccountStatus) => {
    setAdminUsersList(prev => updateUserInAdminDirectory(prev, userId, { accountStatus: status }));
    if (userId === userAccount.id) {
      setUserAccount(prev => ({ ...prev, accountStatus: status }));
    }
  };

  const handleUpdateUserTier = (userId: string, isAdFree: boolean) => {
    setAdminUsersList(prev => updateUserInAdminDirectory(prev, userId, { 
      isAdFree, 
      accountType: isAdFree ? 'paid' : 'free' 
    }));
    if (userId === userAccount.id) {
      setUserAccount(prev => ({ 
        ...prev, 
        isAdFree, 
        accountType: isAdFree ? 'paid' : 'free' 
      }));
    }
  };

  const handleUpdateUserBalance = (userId: string, newBalance: number) => {
    setAdminUsersList(prev => updateUserInAdminDirectory(prev, userId, { balance: newBalance }));
    if (userId === userAccount.id) {
      setBalance(newBalance);
    }
  };

  // Inspect Player Profile
  const handleInspectPlayer = (player: PlayerProfileData) => {
    const isMe = player.id === userAccount.id || player.isUser;
    const currentLeaderboard = getDailyLeaderboard('profit', userAccount, stats, balance);
    const placementData = getPlayerPlacementData(
      player.id, 
      player.username, 
      currentLeaderboard, 
      dailyWinners, 
      allTimePeaks
    );

    const foundAdminUser = adminUsersList.find(u => u.id === player.id || u.username === player.username);
    const resolvedWager = isMe 
      ? stats.totalWagered 
      : (player.totalWagered ?? foundAdminUser?.totalWagered ?? getEstimatedWagerForTier(player.vipTier));

    setSelectedPlayer({
      ...player,
      balance: isMe ? balance : player.balance,
      totalWagered: resolvedWager,
      peakBalance: isMe ? Math.max(userAccount.peakBalanceAllTime || 0, balance) : (player.peakBalance ?? foundAdminUser?.peakBalance ?? player.balance),
      isUser: isMe,
      currentPlacement: placementData.currentPlacement,
      highestEverPlacement: placementData.highestEverPlacement,
      placementHistory: placementData.placementHistory,
    });
    setIsProfileModalOpen(true);
  };

  // Admin / Moderator Balance Reset Handler
  const handleAdminResetBalance = (playerId: string, username: string, resetAmount: number, reason?: string) => {
    const isMe = playerId === userAccount.id || (selectedPlayer && selectedPlayer.isUser);

    if (isMe) {
      setBalance(resetAmount);
    }

    if (selectedPlayer && selectedPlayer.id === playerId) {
      setSelectedPlayer(prev => prev ? { ...prev, balance: resetAmount } : null);
    }

    handleUpdateUserBalance(playerId, resetAmount);

    const isModRole = userAccount.accountStatus === 'moderator';
    const actorName = isModRole ? `🛡️ Mod ${userAccount.username || 'Staff'}` : `👑 Admin ${userAccount.username || 'Thomas Joe'}`;

    // Broadcast system notice to the live chat
    const adminNotice: ChatMessage = {
      id: 'mod-notice-' + Date.now(),
      senderId: userAccount.id || 'sys-admin',
      username: actorName,
      avatar: isModRole ? '🛡️' : '👑',
      vipTier: 'Sovereign Degenerate',
      text: `Reset ${username}'s bankroll to ${resetAmount.toLocaleString()} chips. [Audit: ${reason || 'Administrative bankroll reset'}]`,
      timestamp: Date.now(),
      type: 'mod_action',
      badge: isModRole ? 'MOD' : 'ADMIN MOD',
      isAdmin: true,
      isModerator: isModRole,
    };

    setChatMessages(prev => [...prev, adminNotice]);
  };

  return (
    <div className="min-h-screen bg-[#090710] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,40,200,0.16),rgba(255,255,255,0))] text-zinc-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Sticky Top Header */}
      <Header
        balance={balance}
        netProfit={stats.netProfit}
        totalWagered={stats.totalWagered}
        currentTab={currentTab}
        userAccount={userAccount}
        onTabChange={setCurrentTab}
        onOpenBailout={() => setIsBailoutOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenMilestones={() => setIsMilestonesOpen(true)}
        onClaimRakeback={handleClaimRakeback}
        onToggleChat={() => setIsChatOpen(prev => !prev)}
        onOpenPendingPayouts={() => setIsModeratorOpen(true)}
        onOpenPayForAdFree={() => setIsPayForAdFreeOpen(true)}
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
            userAccount={userAccount}
            dailyWinners={dailyWinners}
            onNavigate={setCurrentTab}
            onOpenBailout={() => setIsBailoutOpen(true)}
            onOpenStats={() => setIsStatsOpen(true)}
            onOpenRules={() => setIsRulesOpen(true)}
            onOpenAccount={() => setIsAccountOpen(true)}
            onOpenMilestones={() => setIsMilestonesOpen(true)}
            onClaimRakeback={handleClaimRakeback}
            onOpenModeratorLog={() => setIsModeratorOpen(true)}
            onOpenPayForAdFree={() => setIsPayForAdFreeOpen(true)}
            onInspectPlayer={handleInspectPlayer}
            onToggleChat={() => setIsChatOpen(prev => !prev)}
          />
        )}

        {currentTab === 'mines' && (
          <MinesGame
            balance={balance}
            onUpdateBalance={handleUpdateBalance}
            stats={stats}
            onUpdateStats={setStats}
            onAddRakeback={handleAddRakeback}
          />
        )}

        {currentTab === 'dice-duels' && (
          <DiceDuelsGame
            balance={balance}
            onUpdateBalance={handleUpdateBalance}
            stats={stats}
            onUpdateStats={setStats}
            onAddRakeback={handleAddRakeback}
            username={userAccount.username || 'Gambler'}
            avatar={userAccount.avatar || '🎲'}
          />
        )}

        {currentTab === 'coinflip' && (
          <CoinflipGame
            balance={balance}
            onUpdateBalance={handleUpdateBalance}
            stats={stats}
            onUpdateStats={setStats}
            onAddRakeback={handleAddRakeback}
            username={userAccount.username || 'Gambler'}
            avatar={userAccount.avatar || '🪙'}
          />
        )}

        {currentTab === 'blackjack' && (
          <BlackjackGame
            balance={balance}
            onUpdateBalance={handleUpdateBalance}
            onUpdateStats={setStats}
            onAddRakeback={handleAddRakeback}
          />
        )}

        {currentTab === 'keno' && (
          <KenoGame
            balance={balance}
            onUpdateBalance={handleUpdateBalance}
            onUpdateStats={setStats}
            onAddRakeback={handleAddRakeback}
          />
        )}

        {currentTab === 'unboxer' && (
          <UnboxerGame
            balance={balance}
            userAccount={userAccount}
            onUpdateBalance={handleUpdateBalance}
            onUpdateStats={setStats}
          />
        )}

        {currentTab === 'leaderboard' && (
          <DailyLeaderboard
            userAccount={userAccount}
            stats={stats}
            balance={balance}
            dailyWinners={dailyWinners}
            allTimePeaks={allTimePeaks}
            onOpenAccount={() => setIsAccountOpen(true)}
            onOpenModeratorLog={() => setIsModeratorOpen(true)}
            onOpenPayForAdFree={() => setIsPayForAdFreeOpen(true)}
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
        onUpdateBalance={handleUpdateBalance}
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
        onUpdateAccount={setUserAccount}
        onSignOut={handleSignOut}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenPayForAdFree={() => setIsPayForAdFreeOpen(true)}
      />

      {/* ATM of Shame Modal */}
      <BailoutModal
        isOpen={isBailoutOpen}
        onClose={() => setIsBailoutOpen(false)}
        onClaimBailout={handleClaimBailout}
        currentBalance={balance}
        atmHistory={atmHistory}
        isAdFree={userAccount.isAdFree}
        userAccount={userAccount}
      />

      {/* Pay for Ad-Free VIP Modal */}
      <PayForAdFreeModal
        isOpen={isPayForAdFreeOpen}
        onClose={() => setIsPayForAdFreeOpen(false)}
        userAccount={userAccount}
        isCurrentlyAdFree={!!userAccount.isAdFree}
        onUpgradeToAdFree={() => {
          sound.playProfit();
          setUserAccount(prev => ({
            ...prev,
            isAdFree: true,
            accountType: 'paid',
          }));
          setBalance(prev => prev + 500);
        }}
        onUpgrade={() => {
          sound.playProfit();
          setUserAccount(prev => ({
            ...prev,
            isAdFree: true,
            accountType: 'paid',
          }));
          setBalance(prev => prev + 500);
        }}
        onDowngrade={() => {
          sound.playChip();
          setUserAccount(prev => ({
            ...prev,
            isAdFree: false,
            accountType: 'free',
          }));
        }}
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

      {/* Leveling Milestone Crates Modal */}
      <MilestoneCratesModal
        isOpen={isMilestonesOpen}
        onClose={() => setIsMilestonesOpen(false)}
        userAccount={userAccount}
        totalWagered={stats.totalWagered}
        onClaimMilestone={handleClaimMilestone}
      />

      {/* Owner & Admin Pending Payouts Portal (Thomas Joe) */}
      {isAdmin && (
        <ModeratorModal
          isOpen={isModeratorOpen}
          onClose={() => setIsModeratorOpen(false)}
          dailyWinners={dailyWinners}
          onUpdateWinner={handleUpdateWinner}
          onInspectPlayer={handleInspectPlayer}
          usersList={adminUsersList}
          onUpdateUserStatus={handleUpdateUserStatus}
          onUpdateUserTier={handleUpdateUserTier}
          onUpdateUserBalance={handleUpdateUserBalance}
          allChatMessages={chatMessages}
        />
      )}
    </div>
  );
}
