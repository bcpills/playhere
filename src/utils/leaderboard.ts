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
  FakePlayer
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
 * Only Thomasjoe55@gmail.com has Administrator access
 */
export const ADMIN_EMAIL = 'thomasjoe55@gmail.com';

export function isUserAdmin(account?: UserAccount | null): boolean {
  if (!account) return false;
  const email = (account.email || account.googleEmail || '').toLowerCase().trim();
  return email === ADMIN_EMAIL.toLowerCase();
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
  inventory: InventoryItem[],
  currentBalance: number,
  customFakePlayers?: FakePlayer[]
): LeaderboardEntry[] {
  const userVIPTier = getVIPTier(stats.totalWagered);
  const userVaultVal = inventory.reduce((sum, item) => sum + item.item.value, 0);
  const fakePlayersList = customFakePlayers || loadStoredFakePlayers();

  // User Score for Category
  let userScore = 0;
  let userFormattedScore = '0';

  if (category === 'profit') {
    userScore = Math.max(0, currentBalance + userVaultVal);
    userFormattedScore = `${userScore.toLocaleString()} Chips`;
  } else if (category === 'multiplier') {
    userScore = stats.biggestMultiplier;
    userFormattedScore = `${userScore.toLocaleString()}x`;
  } else if (category === 'volume') {
    userScore = stats.totalWagered;
    userFormattedScore = `${userScore.toLocaleString()} Chips`;
  } else if (category === 'vault') {
    userScore = userVaultVal;
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
    } else if (category === 'vault') {
      score = comp.baseVault;
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
