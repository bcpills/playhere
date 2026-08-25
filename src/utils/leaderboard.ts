import { 
  UserAccount, 
  CasinoStats, 
  InventoryItem, 
  LeaderboardCategory, 
  LeaderboardEntry, 
  VIPTier, 
  DailyWinnerRecord, 
  AllTimePeakRecord,
  ContactPlatform,
  FakePlayer,
  PlayerPlacementRecord
} from '../types';
import { 
  getCurrentEstDateString, 
  getYesterdayEstDateString, 
  formatEstDateFriendly 
} from './estTime';

export const VIP_TIER_THRESHOLDS: { tier: VIPTier; minWager: number; color: string; badgeBg: string; text: string; perk: string }[] = [
  { tier: 'Bronze Degen', minWager: 0, color: '#9ca3af', badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700', text: 'text-zinc-400', perk: '+0% VIP Payout' },
  { tier: 'Silver Grinder', minWager: 1000, color: '#38bdf8', badgeBg: 'bg-sky-950/80 text-sky-300 border-sky-500/40', text: 'text-sky-400', perk: '+15% VIP Payout' },
  { tier: 'Gold Regular', minWager: 5000, color: '#facc15', badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/40', text: 'text-amber-300', perk: '+30% VIP Payout' },
  { tier: 'Platinum Shark', minWager: 25000, color: '#a855f7', badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-500/40', text: 'text-purple-300', perk: '+50% VIP Payout' },
  { tier: 'Diamond High-Roller', minWager: 100000, color: '#06b6d4', badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50', text: 'text-cyan-300', perk: '+75% VIP Payout' },
  { tier: 'Whale of the Lounge', minWager: 500000, color: '#f43f5e', badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-500/60', text: 'text-rose-300', perk: '+100% VIP Payout' },
  { tier: 'Sovereign Degenerate', minWager: 2000000, color: '#eab308', badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-300 text-zinc-950 font-black border-yellow-200', text: 'text-amber-300', perk: '+200% VIP Payout' },
];

export function getVIPTier(totalWagered: number): VIPTier {
  for (let i = VIP_TIER_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalWagered >= VIP_TIER_THRESHOLDS[i].minWager) {
      return VIP_TIER_THRESHOLDS[i].tier;
    }
  }
  return 'Bronze Degen';
}

export function getVIPTierInfo(tier: VIPTier) {
  return VIP_TIER_THRESHOLDS.find(t => t.tier === tier) || VIP_TIER_THRESHOLDS[0];
}

export const AVATAR_OPTIONS = [
  '👑', '💎', '🎲', '🃏', '🦈', '🐺', '🦁', '🎩', 
  '🏴‍☠️', '🚀', '🍾', '🦍', '⚡', '🕶️', '🎰', '💩'
];

export const DEFAULT_USER_ACCOUNT: UserAccount = {
  id: 'usr-' + Math.random().toString(36).substring(2, 9),
  username: '',
  avatar: '👑',
  title: 'Casino High-Roller',
  bio: 'Daily 1000 chip runner. Looking for that 12:00 AM EST grand jackpot.',
  luckyNumber: 7,
  createdAt: Date.now(),
  contactPlatform: 'discord',
  contactHandle: '',
  isRegistered: false,
  dailyStreak: 1,
  lastDailyClaim: 0,
  lastActiveEstDate: getCurrentEstDateString(),
  peakBalanceAllTime: 1000,
};

// ONLY 3 fake players allowed: fakeplayer1, fakeplayer2, fakeplayer3.
// None of them are placed above 500 balance unless manually adjusted by admin.
export const INITIAL_FAKE_PLAYERS: FakePlayer[] = [
  {
    id: 'fakeplayer1',
    username: 'fakeplayer1',
    avatar: '🎲',
    contactPlatform: 'discord',
    contactHandle: 'fakeplayer1#0001',
    vipTier: 'Bronze Degen',
    balance: 320,
    baseMultiplier: 12,
    baseVolume: 650,
    baseVault: 150,
  },
  {
    id: 'fakeplayer2',
    username: 'fakeplayer2',
    avatar: '🦈',
    contactPlatform: 'telegram',
    contactHandle: '@fakeplayer2',
    vipTier: 'Bronze Degen',
    balance: 450,
    baseMultiplier: 24,
    baseVolume: 890,
    baseVault: 210,
  },
  {
    id: 'fakeplayer3',
    username: 'fakeplayer3',
    avatar: '🎰',
    contactPlatform: 'discord',
    contactHandle: 'fakeplayer3#0003',
    vipTier: 'Bronze Degen',
    balance: 180,
    baseMultiplier: 8,
    baseVolume: 380,
    baseVault: 80,
  },
];

const FAKE_PLAYERS_STORAGE_KEY = 'freebiesonly_fake_players';

export function loadStoredFakePlayers(): FakePlayer[] {
  try {
    const raw = localStorage.getItem(FAKE_PLAYERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure only fakeplayer1, fakeplayer2, fakeplayer3 exist
        const validIds = new Set(['fakeplayer1', 'fakeplayer2', 'fakeplayer3']);
        const filtered = parsed.filter(p => validIds.has(p.id));
        if (filtered.length === 3) return filtered;
      }
    }
  } catch (e) {
    console.error('Error loading fake players:', e);
  }
  return INITIAL_FAKE_PLAYERS;
}

export function saveStoredFakePlayers(players: FakePlayer[]): void {
  try {
    localStorage.setItem(FAKE_PLAYERS_STORAGE_KEY, JSON.stringify(players));
  } catch (e) {
    console.error('Error saving fake players:', e);
  }
}

/**
 * Top All-Time Chip Peak Records (Hall of Fame)
 */
export const INITIAL_ALL_TIME_PEAKS: AllTimePeakRecord[] = [
  { id: 'peak-1', rank: 1, username: 'fakeplayer2', avatar: '🦈', contactPlatform: 'telegram', contactHandle: '@fakeplayer2', vipTier: 'Bronze Degen', peakChips: 490, formattedScore: '490', dateAchieved: '2026-08-20' },
  { id: 'peak-2', rank: 2, username: 'fakeplayer1', avatar: '🎲', contactPlatform: 'discord', contactHandle: 'fakeplayer1#0001', vipTier: 'Bronze Degen', peakChips: 420, formattedScore: '420', dateAchieved: '2026-08-19' },
  { id: 'peak-3', rank: 3, username: 'fakeplayer3', avatar: '🎰', contactPlatform: 'discord', contactHandle: 'fakeplayer3#0003', vipTier: 'Bronze Degen', peakChips: 350, formattedScore: '350', dateAchieved: '2026-08-18' },
];

/**
 * Thomasjoe55@gmail.com and any user set with 'moderator' status have full Administrator/Moderator access & rights.
 */
export const ADMIN_EMAIL = 'thomasjoe55@gmail.com';

export function isUserAdmin(account?: UserAccount | null): boolean {
  if (!account) return false;
  // Moderators have the exact same rights and access as admin
  if (account.accountStatus === 'moderator') return true;
  const email = (account.email || account.googleEmail || '').toLowerCase().trim();
  return email === ADMIN_EMAIL.toLowerCase();
}

export function isUserModerator(account?: UserAccount | null): boolean {
  if (!account) return false;
  return account.accountStatus === 'moderator';
}

/**
 * Historical crowned daily winners archive
 */
export const INITIAL_DAILY_WINNERS: DailyWinnerRecord[] = [
  {
    id: 'win-2026-08-22',
    dateEst: getYesterdayEstDateString(),
    formattedDate: formatEstDateFriendly(getYesterdayEstDateString()),
    username: 'fakeplayer2',
    avatar: '🦈',
    vipTier: 'Bronze Degen',
    contactPlatform: 'telegram',
    contactHandle: '@fakeplayer2',
    winningChips: 450,
    formattedScore: '450 Chips',
    payoutStatus: 'Pending',
    payoutNote: 'Awaiting wallet address confirmation on Telegram.',
  },
  {
    id: 'win-2026-08-21',
    dateEst: '2026-08-21',
    formattedDate: 'Aug 21, 2026',
    username: 'fakeplayer1',
    avatar: '🎲',
    vipTier: 'Bronze Degen',
    contactPlatform: 'discord',
    contactHandle: 'fakeplayer1#0001',
    winningChips: 390,
    formattedScore: '390 Chips',
    payoutStatus: 'Paid',
    payoutNote: 'Claim ticket paid out via Discord.',
    paidAt: Date.now() - 86400000,
  },
];

/**
 * Gets "Yesterday's Winner" record
 */
export function getYesterdayWinner(dailyWinners: DailyWinnerRecord[]): DailyWinnerRecord {
  const yesterdayEst = getYesterdayEstDateString();
  const found = dailyWinners.find(w => w.dateEst === yesterdayEst);
  return found || dailyWinners[0] || INITIAL_DAILY_WINNERS[0];
}

/**
 * Generates dynamic sorted leaderboard ranking for the chosen category today
 */
export function getDailyLeaderboard(
  category: LeaderboardCategory,
  userAccount: UserAccount,
  stats: CasinoStats,
  currentBalance: number,
  customFakePlayers?: FakePlayer[]
): LeaderboardEntry[] {
  const userVIPTier = getVIPTier(stats.totalWagered);
  const fakePlayersList = customFakePlayers || loadStoredFakePlayers();

  // User Score for Category
  let userScore = 0;
  let userFormattedScore = '0';

  if (category === 'profit') {
    userScore = Math.max(0, currentBalance);
    userFormattedScore = `${userScore.toLocaleString()} Chips`;
  } else if (category === 'multiplier') {
    userScore = stats.biggestMultiplier;
    userFormattedScore = `${userScore.toLocaleString()}x`;
  } else if (category === 'volume') {
    userScore = stats.totalWagered;
    userFormattedScore = `${userScore.toLocaleString()} Chips`;
  }

  const userEntry: LeaderboardEntry = {
    id: userAccount.id,
    rank: 1,
    username: userAccount.username || 'Anonymous Gambler',
    avatar: userAccount.avatar,
    vipTier: userVIPTier,
    score: userScore,
    formattedScore: userFormattedScore,
    contactPlatform: userAccount.contactPlatform,
    contactHandle: userAccount.contactHandle,
    badge: 'YOU',
    isUser: true,
  };

  // Build fake players entries (only fakeplayer1, fakeplayer2, fakeplayer3)
  const competitorsEntries: LeaderboardEntry[] = fakePlayersList.map(comp => {
    let score = 0;
    let formattedScore = '';

    if (category === 'profit') {
      score = comp.balance;
      formattedScore = `${score.toLocaleString()} Chips`;
    } else if (category === 'multiplier') {
      score = comp.baseMultiplier;
      formattedScore = `${score.toLocaleString()}x`;
    } else if (category === 'volume') {
      score = comp.baseVolume;
      formattedScore = `${score.toLocaleString()} Chips`;
    }

    return {
      id: comp.id,
      rank: 1,
      username: comp.username,
      avatar: comp.avatar,
      vipTier: comp.vipTier,
      contactPlatform: comp.contactPlatform,
      contactHandle: comp.contactHandle,
      score,
      formattedScore,
      isUser: false,
    };
  });

  // Combine and sort descending by score
  const allEntries = [...competitorsEntries, userEntry].sort((a, b) => b.score - a.score);

  // Assign ranks
  return allEntries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

/**
 * Checks if user's current chip balance or peak qualifies for the All-Time Top 20 Chip Heights
 */
export function updateAllTimePeaksWithUser(
  currentPeaks: AllTimePeakRecord[],
  userAccount: UserAccount,
  stats: CasinoStats,
  currentBalance: number
): AllTimePeakRecord[] {
  const userPeak = Math.max(userAccount.peakBalanceAllTime || 0, currentBalance);
  const userVIPTier = getVIPTier(stats.totalWagered);
  const dateToday = getCurrentEstDateString();

  // Filter out any existing user record to avoid duplicate
  const nonUserPeaks = currentPeaks.filter(p => p.id !== userAccount.id);

  // Build candidate user record
  const userCandidate: AllTimePeakRecord = {
    id: userAccount.id,
    rank: 1,
    username: userAccount.username || 'You',
    avatar: userAccount.avatar,
    contactPlatform: userAccount.contactPlatform,
    contactHandle: userAccount.contactHandle,
    vipTier: userVIPTier,
    peakChips: userPeak,
    formattedScore: userPeak.toLocaleString(),
    dateAchieved: dateToday,
    isUser: true,
  };

  const combined = [...nonUserPeaks, userCandidate].sort((a, b) => b.peakChips - a.peakChips);
  
  return combined.slice(0, 20).map((record, index) => ({
    ...record,
    rank: index + 1,
  }));
}

/**
 * Returns pre-seeded placement histories for known competitors, ensuring realistic competitive timelines
 */
export const KNOWN_COMPETITOR_HISTORIES: Record<string, PlayerPlacementRecord[]> = {
  fakeplayer2: [
    {
      id: 'pl-fp2-1',
      dateEst: getYesterdayEstDateString(),
      formattedDate: formatEstDateFriendly(getYesterdayEstDateString()),
      rank: 1,
      category: 'Daily Tournament Winner',
      chips: 450,
      badge: '🏆 Daily Champion',
      payoutStatus: 'Pending',
    },
    {
      id: 'pl-fp2-2',
      dateEst: '2026-08-20',
      formattedDate: 'Aug 20, 2026',
      rank: 1,
      category: 'All-Time Peak Height',
      chips: 490,
      badge: '⭐ Peak Height #1',
    },
    {
      id: 'pl-fp2-3',
      dateEst: '2026-08-18',
      formattedDate: 'Aug 18, 2026',
      rank: 2,
      category: 'Daily Tournament',
      chips: 320,
      badge: '🥈 Runner-Up',
      payoutStatus: 'None',
    },
    {
      id: 'pl-fp2-4',
      dateEst: '2026-08-15',
      formattedDate: 'Aug 15, 2026',
      rank: 3,
      category: 'Daily Tournament',
      chips: 280,
      badge: '🥉 Podium 3rd',
      payoutStatus: 'None',
    },
  ],
  fakeplayer1: [
    {
      id: 'pl-fp1-1',
      dateEst: '2026-08-21',
      formattedDate: 'Aug 21, 2026',
      rank: 1,
      category: 'Daily Tournament Winner',
      chips: 390,
      badge: '🏆 Daily Champion',
      payoutStatus: 'Paid',
    },
    {
      id: 'pl-fp1-2',
      dateEst: '2026-08-19',
      formattedDate: 'Aug 19, 2026',
      rank: 2,
      category: 'All-Time Peak Height',
      chips: 420,
      badge: '⭐ Peak Height #2',
    },
    {
      id: 'pl-fp1-3',
      dateEst: '2026-08-17',
      formattedDate: 'Aug 17, 2026',
      rank: 2,
      category: 'Daily Tournament',
      chips: 290,
      badge: '🥈 Runner-Up',
      payoutStatus: 'None',
    },
  ],
  fakeplayer3: [
    {
      id: 'pl-fp3-1',
      dateEst: '2026-08-21',
      formattedDate: 'Aug 21, 2026',
      rank: 3,
      category: 'Daily Tournament',
      chips: 240,
      badge: '🥉 Podium 3rd',
      payoutStatus: 'None',
    },
    {
      id: 'pl-fp3-2',
      dateEst: '2026-08-18',
      formattedDate: 'Aug 18, 2026',
      rank: 3,
      category: 'All-Time Peak Height',
      chips: 350,
      badge: '⭐ Peak Height #3',
    },
    {
      id: 'pl-fp3-3',
      dateEst: '2026-08-16',
      formattedDate: 'Aug 16, 2026',
      rank: 4,
      category: 'Daily Tournament',
      chips: 180,
      badge: '🎖️ Top 4',
      payoutStatus: 'None',
    },
  ],
};

/**
 * Calculates current placement, all-time highest placement, and placement history for any player
 */
export function getPlayerPlacementData(
  playerId: string,
  username: string,
  currentLeaderboard: LeaderboardEntry[],
  dailyWinners: DailyWinnerRecord[],
  allTimePeaks: AllTimePeakRecord[],
  customSavedHistory: PlayerPlacementRecord[] = []
): {
  currentPlacement: number;
  highestEverPlacement: number;
  placementHistory: PlayerPlacementRecord[];
} {
  const normUser = (username || '').toLowerCase().trim();
  
  // 1. Calculate Current Placement (from active daily profit leaderboard)
  let currentRank = 4;
  const currentEntry = currentLeaderboard.find(
    e => e.id === playerId || (e.username && e.username.toLowerCase() === normUser)
  );
  if (currentEntry) {
    currentRank = currentEntry.rank;
  }

  // 2. Gather history records
  let history: PlayerPlacementRecord[] = [];

  // Add competitor seeded history if exists
  if (KNOWN_COMPETITOR_HISTORIES[playerId] || KNOWN_COMPETITOR_HISTORIES[normUser]) {
    history = [...(KNOWN_COMPETITOR_HISTORIES[playerId] || KNOWN_COMPETITOR_HISTORIES[normUser])];
  } else if (customSavedHistory.length > 0) {
    history = [...customSavedHistory];
  }

  // Add recorded daily wins if not already included
  dailyWinners.forEach(win => {
    const isThisPlayer = win.id === playerId || win.username.toLowerCase() === normUser || (currentEntry?.isUser && win.isUser);
    if (isThisPlayer) {
      const alreadyHas = history.some(h => h.dateEst === win.dateEst && h.rank === 1);
      if (!alreadyHas) {
        history.unshift({
          id: `win-${win.id}`,
          dateEst: win.dateEst,
          formattedDate: win.formattedDate,
          rank: 1,
          category: 'Daily Tournament Winner',
          chips: win.winningChips,
          badge: '🏆 Daily Champion',
          payoutStatus: win.payoutStatus,
        });
      }
    }
  });

  // Add current peak height record from allTimePeaks
  allTimePeaks.forEach(peak => {
    const isThisPlayer = peak.id === playerId || peak.username.toLowerCase() === normUser || (currentEntry?.isUser && peak.isUser);
    if (isThisPlayer) {
      const alreadyHas = history.some(h => h.category === 'All-Time Peak Height' && h.rank === peak.rank);
      if (!alreadyHas) {
        history.push({
          id: `peak-${peak.id}`,
          dateEst: peak.dateAchieved || getCurrentEstDateString(),
          formattedDate: peak.dateAchieved ? formatEstDateFriendly(peak.dateAchieved) : 'Today',
          rank: peak.rank,
          category: 'All-Time Peak Height',
          chips: peak.peakChips,
          badge: `⭐ Peak Rank #${peak.rank}`,
        });
      }
    }
  });

  // If user/player has no historical logs yet, initialize with current active tournament
  if (history.length === 0) {
    history.push({
      id: `live-current-${Date.now()}`,
      dateEst: getCurrentEstDateString(),
      formattedDate: `${formatEstDateFriendly(getCurrentEstDateString())} (Live)`,
      rank: currentRank,
      category: 'Daily Tournament (Active)',
      chips: currentEntry ? currentEntry.score : 1000,
      badge: currentRank === 1 ? '👑 Current #1 Seed' : `Rank #${currentRank}`,
      payoutStatus: 'Pending',
    });
  }

  // Sort history chronologically descending or rank priority
  history.sort((a, b) => (b.dateEst || '').localeCompare(a.dateEst || ''));

  // 3. Determine Highest Ever Placement (1 is best, then 2, then 3...)
  const allRanks = [currentRank, ...history.map(h => h.rank)].filter(r => typeof r === 'number' && r > 0);
  const highestEverPlacement = allRanks.length > 0 ? Math.min(...allRanks) : currentRank;

  return {
    currentPlacement: currentRank,
    highestEverPlacement,
    placementHistory: history,
  };
}
