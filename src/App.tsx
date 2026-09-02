import React, { useState, useEffect } from 'react';
import { 
  GameTab, 
  LootItem, 
  CasinoStats, 
  UserAccount, 
  DailyWinnerRecord, 
  AllTimePeakRecord,
  ChatMessage,
  PlayerProfileData,
  PayoutRequest,
  DepositTransaction,
  BalanceAdjustmentLog,
  UserRole,
  AccountStatus,
  CurrencyMode
} from './types';
import { Header } from './components/Header';
import { LobbyHome } from './components/LobbyHome';
import { SlotsGame } from './components/SlotsGame';
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
import { CashierModal } from './components/CashierModal';
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
  isUserModerator,
  getEstimatedWagerForTier
} from './utils/leaderboard';
import { 
  getCurrentEstDateString, 
  getYesterdayEstDateString, 
  formatEstDateFriendly 
} from './utils/estTime';
import { 
  getAdminUserDirectory, 
  updateUserInAdminDirectory 
} from './utils/adminUsers';
import { AdminManagedUser } from './types';
import { sound } from './utils/audio';

const STORAGE_KEYS = {
  BALANCE: 'chipzone_balance',
  CASH_BALANCE: 'chipzone_cash_balance',
  INVENTORY: 'chipzone_inventory',
  STATS: 'chipzone_stats',
  SOUND: 'chipzone_sound',
  ACCOUNT: 'chipzone_account',
  ATM_HISTORY: 'chipzone_atm_history',
  DAILY_WINNERS: 'chipzone_daily_winners',
  ALL_TIME_PEAKS: 'chipzone_all_time_peaks',
  ADMIN_USERS: 'chipzone_admin_users',
  PAYOUT_REQUESTS: 'chipzone_payout_requests',
  DEPOSIT_HISTORY: 'chipzone_deposit_history',
  BALANCE_ADJUSTMENTS: 'chipzone_balance_adjustments',
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
  roundsPlayedSlots: 0,
  roundsPlayedMines: 0,
  roundsPlayedDiceDuels: 0,
  roundsPlayedCoinflip: 0,
  cratesOpened: 0,
  biggestWin: 0,
  biggestMultiplier: 0,
  sideBetWinsBlackjack: 0,
  bailoutCount: 0,
};

const INITIAL_PAYOUT_REQUESTS: PayoutRequest[] = [
  {
    id: 'payout-101',
    userId: 'u2',
    username: 'DiamondHands_Dave',
    avatar: '💎',
    usdAmount: 150,
    chipsAmount: 15000,
    method: 'crypto',
    destination: 'TK8vR4mQW8oJ7kL2pNm5XqY9aZv3uW1e (USDT-TRC20)',
    destinationDetails: {
      cryptoNetwork: 'TRON (TRC20)',
      walletAddress: 'TK8vR4mQW8oJ7kL2pNm5XqY9aZv3uW1e'
    },
    status: 'Pending',
    requestedAt: Date.now() - 3600000 * 2,
    adminNote: '1st place daily wager competition withdrawal request.',
  },
  {
    id: 'payout-102',
    userId: 'u3',
    username: 'ApexPredator99',
    avatar: '🦈',
    usdAmount: 75,
    chipsAmount: 7500,
    method: 'paypal',
    destination: 'apex.predator99@gamingmail.com',
    destinationDetails: {
      tagOrEmail: 'apex.predator99@gamingmail.com'
    },
    status: 'Processing',
    requestedAt: Date.now() - 3600000 * 5,
    adminNote: 'Verified wager competition podium winner. Processing via PayPal batch.',
  },
  {
    id: 'payout-103',
    userId: 'u4',
    username: 'CyberWhale_X',
    avatar: '🐋',
    usdAmount: 300,
    chipsAmount: 30000,
    method: 'bank_wire',
    destination: 'Chase Bank - Acct ending in 4892',
    destinationDetails: {
      bankName: 'JPMorgan Chase',
      accountHolder: 'Cyber Whale Trading LLC',
      routingNumber: '021000021'
    },
    status: 'Paid',
    requestedAt: Date.now() - 3600000 * 24,
    processedAt: Date.now() - 3600000 * 18,
    adminNote: 'Bank wire approved and settled by Admin.',
  }
];

const INITIAL_DEPOSIT_HISTORY: DepositTransaction[] = [
  {
    id: 'dep-101',
    userId: 'usr-admin-thomas',
    username: 'Thomas J',
    usdAmount: 50,
    chipsCredited: 5500,
    method: 'card',
    status: 'Completed',
    timestamp: Date.now() - 86400000,
    transactionRef: 'CC_998124_TX',
    methodDetails: 'Visa Debit ending in *4242'
  },
  {
    id: 'dep-102',
    userId: 'usr-admin-thomas',
    username: 'Thomas J',
    usdAmount: 100,
    chipsCredited: 11500,
    method: 'crypto',
    status: 'Completed',
    timestamp: Date.now() - 43200000,
    transactionRef: 'TX_USDT_84102941',
    methodDetails: 'USDT (TRC20) Instant Confirmation'
  }
];

const INITIAL_BALANCE_ADJUSTMENTS: BalanceAdjustmentLog[] = [
  {
    id: 'adj-101',
    userId: 'u2',
    username: 'DiamondHands_Dave',
    previousBalance: 5000,
    newBalance: 15000,
    amountChanged: 10000,
    reason: 'Daily wager race crown winner chip crediting',
    adjustedBy: 'Thomas Joe (Admin)',
    timestamp: Date.now() - 86400000,
  }
];

export default function App() {
  // Gold Coins Balance State (Starts with 1,000,000 GC sign-up bonus)
  const [balance, setBalance] = useState<number>(() => {
    const saved = getStoredItem(STORAGE_KEYS.BALANCE, 'freebiesonly_balance', 'bullshit_casino_balance');
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      return !isNaN(parsed) && isFinite(parsed) ? Math.max(0, parsed) : 1000000;
    }
    return 1000000;
  });

  // Real Money USD Cash Balance State (Starts with $2.00 sign-up bonus)
  const [cashBalance, setCashBalance] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASH_BALANCE);
    if (saved !== null) {
      const parsed = parseFloat(saved);
      return !isNaN(parsed) && isFinite(parsed) ? Math.max(0, parsed) : 2.00;
    }
    return 2.00;
  });

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

  // Real Money Cashier & Ledger States
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYOUT_REQUESTS);
    return saved ? JSON.parse(saved) : INITIAL_PAYOUT_REQUESTS;
  });

  const [depositHistory, setDepositHistory] = useState<DepositTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEPOSIT_HISTORY);
    return saved ? JSON.parse(saved) : INITIAL_DEPOSIT_HISTORY;
  });

  const [balanceAdjustments, setBalanceAdjustments] = useState<BalanceAdjustmentLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BALANCE_ADJUSTMENTS);
    return saved ? JSON.parse(saved) : INITIAL_BALANCE_ADJUSTMENTS;
  });

  // Navigation & Modals
  const [currentTab, setCurrentTab] = useState<GameTab>('home');
  const [currencyMode, setCurrencyMode] = useState<CurrencyMode>('cash');
  const [isBailoutOpen, setIsBailoutOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [isMilestonesOpen, setIsMilestonesOpen] = useState<boolean>(false);
  const [isCashierOpen, setIsCashierOpen] = useState<boolean>(false);
  const [isModeratorOpen, setIsModeratorOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isPayForAdFreeOpen, setIsPayForAdFreeOpen] = useState<boolean>(false);

  // Admin Managed Users Directory State
  const [adminUsersList, setAdminUsersList] = useState<AdminManagedUser[]>(() => {
    return getAdminUserDirectory(userAccount, balance, stats.totalWagered);
  });

  // Player profile inspection
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfileData | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Chat external broadcasts
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const isStaff = isUserAdmin(userAccount) || isUserModerator(userAccount);
  const pendingPayoutsCount = payoutRequests.filter(w => w.status === 'Pending').length + dailyWinners.filter(w => w.payoutStatus === 'Pending').length;

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
    localStorage.setItem(STORAGE_KEYS.CASH_BALANCE, cashBalance.toString());
  }, [cashBalance]);

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYOUT_REQUESTS, JSON.stringify(payoutRequests));
  }, [payoutRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPOSIT_HISTORY, JSON.stringify(depositHistory));
  }, [depositHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BALANCE_ADJUSTMENTS, JSON.stringify(balanceAdjustments));
  }, [balanceAdjustments]);

  // Keep admin user directory in sync with current user changes
  useEffect(() => {
    setAdminUsersList(getAdminUserDirectory(userAccount, balance, stats.totalWagered));
  }, [userAccount, balance, stats.totalWagered]);

  // Track Peak Balance and check if it reaches Top 20 All-Time
  useEffect(() => {
    if (balance > (userAccount.peakBalanceAllTime || 0)) {
      setUserAccount(prev => ({
        ...prev,
        peakBalanceAllTime: balance,
      }));
      setAllTimePeaks(prevPeaks => updateAllTimePeaksWithUser(userAccount, stats, balance, prevPeaks));
    }
  }, [balance, userAccount, stats]);

  // 12:00 AM EST Daily Wager Competition Reset Lifecycle Engine
  // (NO MORE DAILY BALANCE WIPING - Users keep all their coins & cash!)
  useEffect(() => {
    const checkDailyEstReset = () => {
      const currentEstDate = getCurrentEstDateString();
      const lastActiveDate = userAccount.lastActiveEstDate;

      if (lastActiveDate && lastActiveDate !== currentEstDate) {
        const yesterdayEstDate = getYesterdayEstDateString();
        const alreadyLogged = dailyWinners.some(w => w.dateEst === yesterdayEstDate);
        
        if (!alreadyLogged) {
          // Rank by daily wager volume (Gold Coins)
          const standings = getDailyLeaderboard('volume', userAccount, stats, balance);
          // Admins are already excluded in leaderboard.ts
          const topRanked = standings[0];

          if (topRanked) {
            const newWinnerRecord: DailyWinnerRecord = {
              id: `win-${yesterdayEstDate}`,
              dateEst: yesterdayEstDate,
              formattedDate: formatEstDateFriendly(yesterdayEstDate),
              username: topRanked.username,
              avatar: topRanked.avatar,
              vipTier: topRanked.vipTier,
              winningChips: topRanked.score,
              formattedScore: `${topRanked.score.toLocaleString()} GC Wagered`,
              payoutStatus: 'Pending',
              payoutNote: 'Eligible for instant real cashout in Cashier portal.',
            };

            setDailyWinners(prev => [newWinnerRecord, ...prev]);
          }
        }

        // Daily EST Transition:
        // 1. Keep player's balance intact (no reset to 1000)
        // 2. Reset ATM cooldowns and daily wager trackers for the new tournament day
        setAtmHistory([]);
        setUserAccount(prev => ({
          ...prev,
          lastActiveEstDate: currentEstDate,
          dailyStreak: (prev.dailyStreak || 1) + 1,
          dailyWagerGoldCoins: 0,
          dailyWagerCash: 0,
        }));
      }
    };

    checkDailyEstReset();
    const interval = setInterval(checkDailyEstReset, 15000);
    return () => clearInterval(interval);
  }, [userAccount, stats, balance, dailyWinners]);

  // Balance Update Handler (Gold Coins)
  const handleUpdateBalance = (deltaOrUpdater: number | ((prev: number) => number)) => {
    if (typeof deltaOrUpdater === 'function') {
      setBalance(prev => {
        const calculated = deltaOrUpdater(prev);
        return isNaN(calculated) || !isFinite(calculated) ? 1000000 : Math.max(0, Math.round(calculated));
      });
      return;
    }

    const delta = deltaOrUpdater;
    if (isNaN(delta) || !isFinite(delta)) return;
    setBalance(prev => {
      const safePrev = isNaN(prev) || !isFinite(prev) ? 1000000 : prev;
      const next = Math.max(0, Math.round(safePrev + delta));
      return isNaN(next) ? 1000000 : next;
    });
    setStats(prev => ({
      ...prev,
      netProfit: (isNaN(prev.netProfit) ? 0 : prev.netProfit) + delta,
    }));
  };

  // Cash Balance Update Handler (Real USD)
  const handleUpdateCashBalance = (deltaOrUpdater: number | ((prev: number) => number)) => {
    if (typeof deltaOrUpdater === 'function') {
      setCashBalance(prev => {
        const calculated = deltaOrUpdater(prev);
        const next = isNaN(calculated) || !isFinite(calculated) ? 2.00 : Math.max(0, Math.round(calculated * 100) / 100);
        return next;
      });
      return;
    }

    const delta = deltaOrUpdater;
    if (isNaN(delta) || !isFinite(delta)) return;
    setCashBalance(prev => {
      const safePrev = isNaN(prev) || !isFinite(prev) ? 2.00 : prev;
      const next = Math.max(0, Math.round((safePrev + delta) * 100) / 100);
      return isNaN(next) ? 2.00 : next;
    });
  };

  // Record wager volume for Daily Wager Competition
  const handleRecordWager = (wagerAmount: number, isCash: boolean = false) => {
    if (isNaN(wagerAmount) || wagerAmount <= 0) return;
    if (isCash) {
      setUserAccount(prev => ({
        ...prev,
        dailyWagerCash: (prev.dailyWagerCash || 0) + wagerAmount,
      }));
    } else {
      setUserAccount(prev => ({
        ...prev,
        dailyWagerGoldCoins: (prev.dailyWagerGoldCoins || 0) + wagerAmount,
      }));
    }
  };

  // Bailout Handler (ATM Stimulus)
  const handleClaimBailout = (amount: number) => {
    handleUpdateBalance(amount);
    setAtmHistory(prev => [...prev, Date.now()]);
    setStats(prev => ({
      ...prev,
      bailoutCount: prev.bailoutCount + 1,
    }));
  };

  // Daily Dollar Claim Handler ($1.00 Cash + 100,000 Gold Coins Reloaded at Midnight EST)
  const handleClaimDailyDollar = () => {
    const currentEstDate = getCurrentEstDateString();
    if (userAccount.lastDailyDollarClaimEstDate === currentEstDate) return;

    sound.playProfit();
    handleUpdateCashBalance(1.00);
    handleUpdateBalance(100000);

    setUserAccount(prev => ({
      ...prev,
      lastDailyDollarClaimEstDate: currentEstDate,
      lastDailyClaim: Date.now(),
      cashBalance: (prev.cashBalance || 0) + 1.00,
    }));
  };

  // Rakeback System: 10% on general bets, 2% on Blackjack (Dual Real Cash & GC)
  const handleAddRakeback = (wager: number, isBlackjack?: boolean, isCash?: boolean) => {
    if (isNaN(wager) || wager <= 0) return;
    const rate = isBlackjack ? 0.02 : 0.10;
    if (isCash) {
      const rakebackEarned = Number((wager * rate).toFixed(4));
      setUserAccount(prev => ({
        ...prev,
        unclaimedCashRakeback: Number(((prev.unclaimedCashRakeback || 0) + rakebackEarned).toFixed(4)),
      }));
    } else {
      const rakebackEarned = Math.max(1, Math.round(wager * rate));
      setUserAccount(prev => ({
        ...prev,
        unclaimedRakeback: (isNaN(prev.unclaimedRakeback || 0) ? 0 : (prev.unclaimedRakeback || 0)) + rakebackEarned,
      }));
    }
  };

  const handleClaimRakeback = (mode: 'gc' | 'cash' = 'gc') => {
    if (mode === 'cash') {
      const amount = Number((userAccount.unclaimedCashRakeback || 0).toFixed(2));
      if (amount <= 0) return;
      sound.playProfit();
      handleUpdateCashBalance(amount);
      setUserAccount(prev => ({
        ...prev,
        unclaimedCashRakeback: 0,
        totalCashRakebackClaimed: Number(((prev.totalCashRakebackClaimed || 0) + amount).toFixed(2)),
      }));
    } else {
      const amount = isNaN(userAccount.unclaimedRakeback || 0) ? 0 : (userAccount.unclaimedRakeback || 0);
      if (amount <= 0) return;
      sound.playProfit();
      handleUpdateBalance(amount);
      setUserAccount(prev => ({
        ...prev,
        unclaimedRakeback: 0,
        totalRakebackClaimed: (isNaN(prev.totalRakebackClaimed || 0) ? 0 : (prev.totalRakebackClaimed || 0)) + amount,
      }));
    }
  };

  // Milestone Crates Claim Handler
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

  // Signup Completion Handler (awards $2.00 Cash + 1,000,000 Gold Coins)
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
    setUserAccount(prev => ({
      ...DEFAULT_USER_ACCOUNT,
      username: '',
      isRegistered: false,
      googleLinked: false,
      googleEmail: undefined,
      googleName: undefined,
      googlePicture: undefined,
      email: undefined,
    }));
    setBalance(1000000);
    setCashBalance(2.00);
    setAtmHistory([]);
    sound.playChip();
  };

  // Cashier: Deposit Handler
  const handleAddDeposit = (deposit: DepositTransaction) => {
    setDepositHistory(prev => [deposit, ...prev]);
    handleUpdateBalance(deposit.chipsCredited);

    const chatAlert: ChatMessage = {
      id: 'dep-msg-' + Date.now(),
      senderId: userAccount.id || 'usr-me',
      username: 'SYSTEM CASINO CASHIER',
      avatar: '💵',
      vipTier: 'Sovereign Degenerate',
      text: `🎉 Player ${userAccount.username || 'Gambler'} deposited $${deposit.usdAmount} (${deposit.method.toUpperCase()}) and received +${deposit.chipsCredited.toLocaleString()} Gold Coins!`,
      timestamp: Date.now(),
      type: 'system',
      badge: 'CASHIER',
    };
    setChatMessages(prev => [...prev, chatAlert]);
  };

  // Cashier: Submit Payout Handler
  const handleSubmitPayout = (request: PayoutRequest) => {
    setPayoutRequests(prev => [request, ...prev]);
    // Deduct chips from player bankroll
    handleUpdateBalance(-request.chipsAmount);

    const chatAlert: ChatMessage = {
      id: 'payout-msg-' + Date.now(),
      senderId: userAccount.id || 'usr-me',
      username: 'CASINO PAYOUT AUDIT',
      avatar: '💸',
      vipTier: 'Sovereign Degenerate',
      text: `⚡ Payout request submitted: ${userAccount.username} requested $${request.usdAmount.toLocaleString()} via ${request.method.toUpperCase()}. Awaiting mod approval.`,
      timestamp: Date.now(),
      type: 'system',
      badge: 'PAYOUT',
    };
    setChatMessages(prev => [...prev, chatAlert]);
  };

  // Moderator: Update Payout Status (Approve / Reject / Process)
  const handleUpdatePayoutRequest = (requestId: string, status: 'Pending' | 'Processing' | 'Paid' | 'Rejected', adminNote?: string) => {
    setPayoutRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        // If rejected and request was for current user, refund chips
        if (status === 'Rejected' && req.status !== 'Rejected' && req.userId === userAccount.id) {
          handleUpdateBalance(req.chipsAmount);
        }
        return {
          ...req,
          status,
          adminNote: adminNote ?? req.adminNote,
          processedAt: status === 'Paid' ? Date.now() : req.processedAt,
        };
      }
      return req;
    }));

    if (status === 'Paid') {
      sound.playProfit();
    }
  };

  // Moderator update daily winner
  const handleUpdateDailyWinnerStatus = (winnerId: string, status: 'Pending' | 'Paid' | 'Processing', note?: string) => {
    setDailyWinners(prev => prev.map(w => w.id === winnerId ? { ...w, payoutStatus: status, payoutNote: note || w.payoutNote } : w));
  };

  // Admin / Moderator Balance Adjustment Handler
  const handleAdminAdjustBalance = (userId: string, username: string, deltaAmount: number, reason: string) => {
    const isMe = userId === userAccount.id || (selectedPlayer && selectedPlayer.isUser);
    const targetUser = adminUsersList.find(u => u.id === userId);
    const prevBal = isMe ? balance : (targetUser?.balance ?? 1000000);
    const newBal = Math.max(0, prevBal + deltaAmount);

    if (isMe) {
      setBalance(newBal);
    }

    if (selectedPlayer && selectedPlayer.id === userId) {
      setSelectedPlayer(prev => prev ? { ...prev, balance: newBal } : null);
    }

    handleUpdateUserBalance(userId, newBal);

    // Record adjustment in balance log
    const adjustmentLog: BalanceAdjustmentLog = {
      id: 'adj-' + Date.now(),
      userId,
      username,
      previousBalance: prevBal,
      newBalance: newBal,
      amountChanged: deltaAmount,
      reason,
      adjustedBy: userAccount.username || 'Thomas Joe (Admin)',
      timestamp: Date.now(),
    };
    setBalanceAdjustments(prev => [adjustmentLog, ...prev]);

    const isModRole = userAccount.userRole === 'moderator';
    const actorName = isModRole ? `🛡️ Mod ${userAccount.username || 'Staff'}` : `👑 Admin ${userAccount.username || 'Thomas Joe'}`;

    const adminNotice: ChatMessage = {
      id: 'mod-notice-' + Date.now(),
      senderId: userAccount.id || 'sys-admin',
      username: actorName,
      avatar: isModRole ? '🛡️' : '👑',
      vipTier: 'Sovereign Degenerate',
      text: `Adjusted ${username}'s balance by ${deltaAmount >= 0 ? '+' : ''}${deltaAmount.toLocaleString()} Gold Coins. [Reason: ${reason}]`,
      timestamp: Date.now(),
      type: 'mod_action',
      badge: isModRole ? 'MOD' : 'ADMIN MOD',
      isAdmin: true,
      isModerator: isModRole,
    };
    setChatMessages(prev => [...prev, adminNotice]);
  };

  // Admin User Directory Handlers
  const handleUpdateUserStatus = (userId: string, status: AccountStatus) => {
    setAdminUsersList(updateUserInAdminDirectory(userId, { accountStatus: status }));
    if (userId === userAccount.id) {
      setUserAccount(prev => ({ ...prev, accountStatus: status }));
    }
  };

  const handleUpdateUserTier = (userId: string, isAdFree: boolean) => {
    setAdminUsersList(updateUserInAdminDirectory(userId, { 
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
    setAdminUsersList(updateUserInAdminDirectory(userId, { balance: newBalance }));
    if (userId === userAccount.id) {
      setBalance(newBalance);
    }
  };

  // Switch role helper
  const handleSwitchRole = (role: UserRole) => {
    sound.playChip();
    setUserAccount(prev => ({
      ...prev,
      userRole: role,
      accountStatus: role === 'admin' ? 'admin' : role === 'moderator' ? 'moderator' : 'active',
    }));
  };

  // Inspect Player Profile
  const handleInspectPlayer = (player: PlayerProfileData) => {
    const isMe = player.id === userAccount.id || player.isUser;
    const placementData = getPlayerPlacementData(
      player.username, 
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
      placementHistory: placementData.history,
    });
    setIsProfileModalOpen(true);
  };

  const currentEstDate = getCurrentEstDateString();
  const canClaimDailyDollar = userAccount.lastDailyDollarClaimEstDate !== currentEstDate;

  return (
    <div className="min-h-screen bg-[#090710] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,40,200,0.16),rgba(255,255,255,0))] text-zinc-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Sticky Top Header */}
      <Header
        balance={balance}
        cashBalance={cashBalance}
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
        onOpenCashier={() => setIsCashierOpen(true)}
        onOpenPayForAdFree={() => setIsPayForAdFreeOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(prev => !prev)}
        pendingPayoutsCount={pendingPayoutsCount}
        isChatOpen={isChatOpen}
        onSwitchRole={handleSwitchRole}
      />

      {/* Main Game Stage */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-2.5 sm:p-4 flex flex-col justify-start">
        {currentTab === 'home' && (
          <LobbyHome
            balance={balance}
            cashBalance={cashBalance}
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
            onOpenCashier={() => setIsCashierOpen(true)}
            onOpenPayForAdFree={() => setIsPayForAdFreeOpen(true)}
            onInspectPlayer={handleInspectPlayer}
            onToggleChat={() => setIsChatOpen(prev => !prev)}
          />
        )}

        {currentTab === 'slots' && (
          <SlotsGame
            balance={balance}
            cashBalance={cashBalance}
            onUpdateBalance={handleUpdateBalance}
            onUpdateCashBalance={handleUpdateCashBalance}
            stats={stats}
            onUpdateStats={setStats}
            onAddRakeback={handleAddRakeback}
            onRecordWager={handleRecordWager}
            userAccount={userAccount}
            onOpenCashier={() => setIsCashierOpen(true)}
            onOpenBailout={() => setIsBailoutOpen(true)}
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
            currencyMode={currencyMode}
            cashBalance={cashBalance}
            onUpdateCashBalance={handleUpdateCashBalance}
            onRecordWager={handleRecordWager}
            onToggleCurrencyMode={setCurrencyMode}
          />
        )}

        {currentTab === 'keno' && (
          <KenoGame
            balance={balance}
            onUpdateBalance={handleUpdateBalance}
            onUpdateStats={setStats}
            onAddRakeback={handleAddRakeback}
            currencyMode={currencyMode}
            cashBalance={cashBalance}
            onUpdateCashBalance={handleUpdateCashBalance}
            onRecordWager={handleRecordWager}
            onToggleCurrencyMode={setCurrencyMode}
          />
        )}

        {currentTab === 'unboxer' && (
          <UnboxerGame
            balance={balance}
            userAccount={userAccount}
            onUpdateBalance={handleUpdateBalance}
            onUpdateStats={setStats}
            currencyMode={currencyMode}
            cashBalance={cashBalance}
            onUpdateCashBalance={handleUpdateCashBalance}
            onRecordWager={handleRecordWager}
            onAddRakeback={handleAddRakeback}
            onToggleCurrencyMode={setCurrencyMode}
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

      {/* Live Casino Lounge Chat */}
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

      {/* Real Money Cashier Modal (Deposits, Payout Requests, History) */}
      <CashierModal
        isOpen={isCashierOpen}
        onClose={() => setIsCashierOpen(false)}
        balance={balance}
        onUpdateBalance={handleUpdateBalance}
        cashBalance={cashBalance}
        onUpdateCashBalance={handleUpdateCashBalance}
        userAccount={userAccount}
        depositHistory={depositHistory}
        onAddDeposit={handleAddDeposit}
        payoutRequests={payoutRequests}
        onSubmitPayout={handleSubmitPayout}
      />

      {/* Admin / Moderator Portal (Payout Approvals & Balance Adjustments) */}
      {isStaff && (
        <ModeratorModal
          isOpen={isModeratorOpen}
          onClose={() => setIsModeratorOpen(false)}
          currentUser={userAccount}
          currentBalance={balance}
          totalWagered={stats.totalWagered}
          dailyWinners={dailyWinners}
          onUpdateDailyWinnerStatus={handleUpdateDailyWinnerStatus}
          onAdminAdjustBalance={handleAdminAdjustBalance}
          payoutRequests={payoutRequests}
          onUpdatePayoutRequest={handleUpdatePayoutRequest}
          balanceAdjustments={balanceAdjustments}
          depositHistory={depositHistory}
          onUpdateUserAccount={setUserAccount}
        />
      )}

      {/* Player Profile Inspection Modal */}
      <PlayerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        player={selectedPlayer}
        currentUserAccount={userAccount}
        onResetBalance={(playerId, username, resetAmount, reason) => {
          const delta = resetAmount - (selectedPlayer?.balance || 0);
          handleAdminAdjustBalance(playerId, username, delta, reason || 'Player balance reset');
        }}
      />

      {/* Mandatory Signup Modal if user is not registered */}
      <SignupModal
        isOpen={!userAccount.isRegistered}
        onCompleteSignup={handleCompleteSignup}
        initialAccount={userAccount}
      />

      {/* Account & VIP Profile Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        account={userAccount}
        stats={stats}
        balance={balance}
        cashBalance={cashBalance}
        onUpdateAccount={setUserAccount}
        onSignOut={handleSignOut}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenPayForAdFree={() => setIsPayForAdFreeOpen(true)}
        onOpenCashier={() => setIsCashierOpen(true)}
        onClaimRakeback={handleClaimRakeback}
      />

      {/* ATM Rewards & Stimulus Vault Modal */}
      <BailoutModal
        isOpen={isBailoutOpen}
        onClose={() => setIsBailoutOpen(false)}
        onClaimBailout={handleClaimBailout}
        currentBalance={balance}
        atmHistory={atmHistory}
        isAdFree={userAccount.isAdFree}
        userAccount={userAccount}
        onClaimRakeback={handleClaimRakeback}
        onClaimDailyDollar={handleClaimDailyDollar}
        canClaimDailyDollar={canClaimDailyDollar}
        onOpenPayForAdFree={() => setIsPayForAdFreeOpen(true)}
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
          setBalance(prev => prev + 50000);
        }}
        onUpgrade={() => {
          sound.playProfit();
          setUserAccount(prev => ({
            ...prev,
            isAdFree: true,
            accountType: 'paid',
          }));
          setBalance(prev => prev + 50000);
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
    </div>
  );
}
