import { 
  UserAccount, 
  CasinoStats, 
  InventoryItem, 
  LeaderboardCategory, 
  LeaderboardEntry, 
  VIPTier, 
  DailyWinnerRecord, 
  AllTimePeakRecord,
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

export function getEstimatedWagerForTier(tier: VIPTier): number {
  switch (tier) {
    case 'Sovereign Degenerate': return 2500000;
    case 'Whale of the Lounge': return 750000;
    case 'Diamond High-Roller': return 185000;
    case 'Platinum Shark': return 45000;
    case 'Gold Regular': return 12500;
    case 'Silver Grinder': return 2290;
    case 'Bronze Degen':
    default:
      return 650;
  }
}

export function formatCompactWager(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val) || !isFinite(val)) return '0';
  if (val < 0) return `-${formatCompactWager(Math.abs(val))}`;
  if (val < 1000) return Math.round(val).toLocaleString();

  const units = [
    { value: 1e33, symbol: 'Dc' },
    { value: 1e30, symbol: 'No' },
    { value: 1e27, symbol: 'Oc' },
    { value: 1e24, symbol: 'Sp' },
    { value: 1e21, symbol: 'Sx' },
    { value: 1e18, symbol: 'Q' },
    { value: 1e15, symbol: 'Qa' },
    { value: 1e12, symbol: 'T' },
    { value: 1e9,  symbol: 'B' },
    { value: 1e6,  symbol: 'M' },
    { value: 1e3,  symbol: 'k' },
  ];

  for (const unit of units) {
    if (val >= unit.value) {
      const num = val / unit.value;
      const rounded = Math.round(num * 100) / 100;
      const str = rounded.toFixed(2).replace(/\.?0+$/, '');
      return `${str}${unit.symbol}`;
    }
  }

  return val.toLocaleString();
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
  bio: 'Daily chip runner & high stakes gambler. Looking for the jackpot.',
  luckyNumber: 7,
  createdAt: Date.now(),
  userRole: 'admin', // Default to admin for full control
  isRegistered: false,
  dailyStreak: 1,
  lastDailyClaim: 0,
  lastActiveEstDate: getCurrentEstDateString(),
  peakBalanceAllTime: 1000000,
  cashBalance: 2.00, // $2 Sign Up Bonus
};

export const INITIAL_FAKE_PLAYERS: FakePlayer[] = [
  {
    id: 'fakeplayer1',
    username: 'HighRoller_Ace',
    avatar: '🎲',
    vipTier: 'Gold Regular',
    balance: 1450000,
    baseMultiplier: 120,
    baseVolume: 3250000,
    baseVault: 150000,
  },
  {
    id: 'fakeplayer2',
    username: 'Vegas_Predator',
    avatar: '🦈',
    vipTier: 'Platinum Shark',
    balance: 2850000,
    baseMultiplier: 340,
    baseVolume: 6890000,
    baseVault: 410000,
  },
  {
    id: 'fakeplayer3',
    username: 'LuckySlots_777',
    avatar: '🎰',
    vipTier: 'Silver Grinder',
    balance: 980000,
    baseMultiplier: 88,
    baseVolume: 1780000,
    baseVault: 95000,
  },
  {
    id: 'fakeplayer4',
    username: 'DiamondQueen',
    avatar: '💎',
    vipTier: 'Diamond High-Roller',
    balance: 4200000,
    baseMultiplier: 500,
    baseVolume: 12500000,
    baseVault: 850000,
  },
];

const FAKE_PLAYERS_STORAGE_KEY = 'freebiesonly_fake_players';

export function loadStoredFakePlayers(): FakePlayer[] {
  try {
    const raw = localStorage.getItem(FAKE_PLAYERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
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

export const INITIAL_ALL_TIME_PEAKS: AllTimePeakRecord[] = [
  { id: 'peak-1', rank: 1, username: 'DiamondQueen', avatar: '💎', vipTier: 'Diamond High-Roller', peakChips: 5200000, formattedScore: '5.20M', dateAchieved: '2026-08-28' },
  { id: 'peak-2', rank: 2, username: 'Vegas_Predator', avatar: '🦈', vipTier: 'Platinum Shark', peakChips: 3450000, formattedScore: '3.45M', dateAchieved: '2026-08-25' },
  { id: 'peak-3', rank: 3, username: 'HighRoller_Ace', avatar: '🎲', vipTier: 'Gold Regular', peakChips: 1980000, formattedScore: '1.98M', dateAchieved: '2026-08-20' },
  { id: 'peak-4', rank: 4, username: 'LuckySlots_777', avatar: '🎰', vipTier: 'Silver Grinder', peakChips: 1250000, formattedScore: '1.25M', dateAchieved: '2026-08-18' },
];

export const ADMIN_EMAIL = 'thomasjoe55@gmail.com';

export function isUserAdmin(account?: UserAccount | null): boolean {
  if (!account) return true;
  if (account.userRole === 'admin' || account.accountStatus === 'moderator' || account.userRole === 'moderator') return true;
  const email = (account.email || account.googleEmail || '').toLowerCase().trim();
  if (email === ADMIN_EMAIL.toLowerCase()) return true;
  // Default to true for dev / preview unless strictly set to player
  return account.userRole !== 'player';
}

export function isUserModerator(account?: UserAccount | null): boolean {
  if (!account) return true;
  return account.userRole === 'moderator' || account.userRole === 'admin' || account.accountStatus === 'moderator';
}

export const INITIAL_DAILY_WINNERS: DailyWinnerRecord[] = [
  {
    id: 'win-2026-08-22',
    dateEst: getYesterdayEstDateString(),
    formattedDate: formatEstDateFriendly(getYesterdayEstDateString()),
    username: 'Vegas_Predator',
    avatar: '🦈',
    vipTier: 'Platinum Shark',
    winningChips: 2850000,
    formattedScore: '2,850,000 GC',
    payoutStatus: 'Pending',
    payoutNote: 'Daily Wager Competition Champion payout pending review.',
  },
  {
    id: 'win-2026-08-21',
    dateEst: '2026-08-21',
    formattedDate: 'Aug 21, 2026',
    username: 'DiamondQueen',
    avatar: '💎',
    vipTier: 'Diamond High-Roller',
    winningChips: 4200000,
    formattedScore: '4,200,000 GC',
    payoutStatus: 'Paid',
    payoutNote: 'Instant Crypto Payout Sent (TxID: 0x8f2c...49e1).',
    paidAt: Date.now() - 86400000,
  },
];

export function getYesterdayWinner(dailyWinners: DailyWinnerRecord[]): DailyWinnerRecord {
  const yesterdayEst = getYesterdayEstDateString();
  const found = dailyWinners.find(w => w.dateEst === yesterdayEst);
  return found || dailyWinners[0] || INITIAL_DAILY_WINNERS[0];
}

export function getDailyLeaderboard(
  category: LeaderboardCategory,
  userAccount: UserAccount,
  stats: CasinoStats,
  currentBalance: number,
  customFakePlayers?: FakePlayer[]
): LeaderboardEntry[] {
  const userVIPTier = getVIPTier(stats.totalWagered);
  const rawList = Array.isArray(customFakePlayers) ? customFakePlayers : loadStoredFakePlayers();
  const fakePlayersList = Array.isArray(rawList) ? rawList : INITIAL_FAKE_PLAYERS;
  const isAdmin = isUserAdmin(userAccount);

  let userScore = 0;
  let userFormattedScore = '0';

  const dailyWager = stats.dailyWagerGoldCoins ?? stats.totalWagered;

  if (category === 'profit') {
    userScore = Math.max(0, currentBalance);
    userFormattedScore = `${formatCompactWager(userScore)} GC`;
  } else if (category === 'multiplier') {
    userScore = stats.biggestMultiplier;
    userFormattedScore = `${userScore.toLocaleString()}x`;
  } else if (category === 'volume') {
    userScore = dailyWager;
    userFormattedScore = `${formatCompactWager(userScore)} GC`;
  }

  const userEntry: LeaderboardEntry = {
    id: userAccount.id,
    rank: 1,
    username: userAccount.username || 'Anonymous Gambler',
    avatar: userAccount.avatar,
    vipTier: userVIPTier,
    score: userScore,
    formattedScore: userFormattedScore,
    badge: 'YOU',
    isUser: true,
  };

  const fakeEntries: LeaderboardEntry[] = fakePlayersList.map(fake => {
    let score = 0;
    let formattedScore = '0';

    if (category === 'profit') {
      score = fake.balance;
      formattedScore = `${formatCompactWager(score)} GC`;
    } else if (category === 'multiplier') {
      score = fake.baseMultiplier;
      formattedScore = `${score}x`;
    } else if (category === 'volume') {
      score = fake.baseVolume;
      formattedScore = `${formatCompactWager(score)} GC`;
    }

    return {
      id: fake.id,
      rank: 2,
      username: fake.username,
      avatar: fake.avatar,
      vipTier: fake.vipTier,
      score,
      formattedScore,
      isUser: false,
    };
  });

  // Exclude admin accounts from taking spots on public leaderboards
  const entries = isAdmin ? [...fakeEntries] : [userEntry, ...fakeEntries];
  const sorted = entries.sort((a, b) => b.score - a.score);
  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

export function updateAllTimePeaksWithUser(
  userAccount: UserAccount,
  stats: CasinoStats,
  currentBalance: number,
  existingPeaks: AllTimePeakRecord[]
): AllTimePeakRecord[] {
  const userVIPTier = getVIPTier(stats.totalWagered);
  const userPeak = Math.max(userAccount.peakBalanceAllTime || 0, currentBalance);

  const peaksCopy = [...existingPeaks];
  const userIdx = peaksCopy.findIndex(p => p.isUser || p.username === userAccount.username);

  const userRecord: AllTimePeakRecord = {
    id: userAccount.id || 'user-peak',
    rank: 1,
    username: userAccount.username || 'Anonymous Gambler',
    avatar: userAccount.avatar,
    vipTier: userVIPTier,
    peakChips: userPeak,
    formattedScore: formatCompactWager(userPeak),
    dateAchieved: getCurrentEstDateString(),
    isUser: true,
  };

  if (userIdx >= 0) {
    peaksCopy[userIdx] = userRecord;
  } else {
    peaksCopy.push(userRecord);
  }

  peaksCopy.sort((a, b) => b.peakChips - a.peakChips);
  return peaksCopy.slice(0, 20).map((p, idx) => ({
    ...p,
    rank: idx + 1,
    formattedScore: formatCompactWager(p.peakChips),
  }));
}

export function getPlayerPlacementData(
  playerUsername: string,
  dailyWinners: DailyWinnerRecord[],
  allTimePeaks: AllTimePeakRecord[]
): { currentPlacement: number; highestEverPlacement: number; history: PlayerPlacementRecord[] } {
  let highestEver = 999;
  const history: PlayerPlacementRecord[] = [];

  dailyWinners.forEach((w) => {
    if (w.username.toLowerCase() === playerUsername.toLowerCase()) {
      highestEver = Math.min(highestEver, 1);
      history.push({
        id: w.id,
        dateEst: w.dateEst,
        formattedDate: w.formattedDate,
        rank: 1,
        category: 'Daily Tournament Winner',
        chips: w.winningChips,
        formattedScore: w.formattedScore,
        badge: '🏆 Champion',
        payoutStatus: w.payoutStatus === 'Paid' ? 'Paid' : 'Pending',
      });
    }
  });

  allTimePeaks.forEach((p) => {
    if (p.username.toLowerCase() === playerUsername.toLowerCase()) {
      highestEver = Math.min(highestEver, p.rank);
    }
  });

  return {
    currentPlacement: 1,
    highestEverPlacement: highestEver === 999 ? 1 : highestEver,
    history,
  };
}
