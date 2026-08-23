import { 
  UserAccount, 
  CasinoStats, 
  InventoryItem, 
  LeaderboardCategory, 
  LeaderboardEntry, 
  VIPTier, 
  DailyWinnerRecord, 
  AllTimePeakRecord,
  ContactPlatform 
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

// Seeded competitors for the live daily tournament
interface BaseCompetitor {
  id: string;
  username: string;
  avatar: string;
  contactPlatform: ContactPlatform;
  contactHandle: string;
  vipTier: VIPTier;
  baseProfit: number;
  baseMultiplier: number;
  baseVolume: number;
  baseVault: number;
}

const COMPETITORS: BaseCompetitor[] = [
  { id: 'bot-1', username: 'Vegas_Viper', avatar: '🦈', contactPlatform: 'telegram', contactHandle: '@vegasviper_vip', vipTier: 'Whale of the Lounge', baseProfit: 14200, baseMultiplier: 1000, baseVolume: 85000, baseVault: 78000 },
  { id: 'bot-2', username: 'CardCounter_Dan', avatar: '🃏', contactPlatform: 'discord', contactHandle: 'CardCounter#8821', vipTier: 'Platinum Shark', baseProfit: 9850, baseMultiplier: 250, baseVolume: 42000, baseVault: 34000 },
  { id: 'bot-3', username: 'CryptoWhale_420', avatar: '🚀', contactPlatform: 'telegram', contactHandle: '@cryptowhale420', vipTier: 'Diamond High-Roller', baseProfit: 7600, baseMultiplier: 600, baseVolume: 120000, baseVault: 185000 },
  { id: 'bot-4', username: 'LuckyLucy77', avatar: '🦁', contactPlatform: 'discord', contactHandle: 'LuckyLucy#7777', vipTier: 'Gold Regular', baseProfit: 4500, baseMultiplier: 1500, baseVolume: 22000, baseVault: 19500 },
  { id: 'bot-5', username: 'MonteCarloMax', avatar: '🎩', contactPlatform: 'telegram', contactHandle: '@montecarlo_max', vipTier: 'Platinum Shark', baseProfit: 3200, baseMultiplier: 80, baseVolume: 31000, baseVault: 45000 },
  { id: 'bot-6', username: 'Degen_Ape_007', avatar: '🦍', contactPlatform: 'discord', contactHandle: 'Ape007#0007', vipTier: 'Diamond High-Roller', baseProfit: 2100, baseMultiplier: 200, baseVolume: 65000, baseVault: 52000 },
  { id: 'bot-7', username: 'HighStakesHannah', avatar: '💎', contactPlatform: 'telegram', contactHandle: '@hannah_stakes', vipTier: 'Silver Grinder', baseProfit: 1450, baseMultiplier: 120, baseVolume: 14000, baseVault: 8500 },
  { id: 'bot-8', username: 'RedSevenRider', avatar: '🎰', contactPlatform: 'discord', contactHandle: 'RedSeven#4499', vipTier: 'Gold Regular', baseProfit: 800, baseMultiplier: 45, baseVolume: 9500, baseVault: 12000 },
  { id: 'bot-9', username: 'PitBossSlayer', avatar: '🐺', contactPlatform: 'telegram', contactHandle: '@pitboss_slayer', vipTier: 'Silver Grinder', baseProfit: 350, baseMultiplier: 30, baseVolume: 6800, baseVault: 4200 },
  { id: 'bot-10', username: 'SlotSmasher99', avatar: '⚡', contactPlatform: 'discord', contactHandle: 'SlotSmasher#9912', vipTier: 'Bronze Degen', baseProfit: -450, baseMultiplier: 15, baseVolume: 3200, baseVault: 1500 },
];

/**
 * Top 20 All-Time Chip Peak Records (Hall of Fame)
 */
export const INITIAL_ALL_TIME_PEAKS: AllTimePeakRecord[] = [
  { id: 'peak-1', rank: 1, username: 'Satoshi_Rolls', avatar: '👑', contactPlatform: 'telegram', contactHandle: '@satoshi_rolls', vipTier: 'Sovereign Degenerate', peakChips: 458900, formattedScore: '458,900', dateAchieved: '2026-07-14' },
  { id: 'peak-2', rank: 2, username: 'WhaleKing_NY', avatar: '🦈', contactPlatform: 'discord', contactHandle: 'WhaleKing#0001', vipTier: 'Whale of the Lounge', peakChips: 321450, formattedScore: '321,450', dateAchieved: '2026-08-02' },
  { id: 'peak-3', rank: 3, username: 'ApexPredator_77', avatar: '🦁', contactPlatform: 'telegram', contactHandle: '@apex_degen77', vipTier: 'Whale of the Lounge', peakChips: 289100, formattedScore: '289,100', dateAchieved: '2026-07-29' },
  { id: 'peak-4', rank: 4, username: 'DiamondHands_Bro', avatar: '💎', contactPlatform: 'discord', contactHandle: 'DiamondBro#4420', vipTier: 'Diamond High-Roller', peakChips: 215000, formattedScore: '215,000', dateAchieved: '2026-08-11' },
  { id: 'peak-5', rank: 5, username: 'BlackjackGod', avatar: '🃏', contactPlatform: 'telegram', contactHandle: '@blackjack_god', vipTier: 'Diamond High-Roller', peakChips: 198400, formattedScore: '198,400', dateAchieved: '2026-08-15' },
  { id: 'peak-6', rank: 6, username: 'KenoLegend_Alex', avatar: '🎲', contactPlatform: 'discord', contactHandle: 'AlexKeno#1337', vipTier: 'Platinum Shark', peakChips: 174200, formattedScore: '174,200', dateAchieved: '2026-08-05' },
  { id: 'peak-7', rank: 7, username: 'Vegas_Viper', avatar: '🦈', contactPlatform: 'telegram', contactHandle: '@vegasviper_vip', vipTier: 'Whale of the Lounge', peakChips: 156300, formattedScore: '156,300', dateAchieved: '2026-08-19' },
  { id: 'peak-8', rank: 8, username: 'CrateKingPin', avatar: '🍾', contactPlatform: 'discord', contactHandle: 'KingPin#9021', vipTier: 'Platinum Shark', peakChips: 142800, formattedScore: '142,800', dateAchieved: '2026-07-30' },
  { id: 'peak-9', rank: 9, username: 'RocketRider_X', avatar: '🚀', contactPlatform: 'telegram', contactHandle: '@rocketrider_x', vipTier: 'Platinum Shark', peakChips: 129500, formattedScore: '129,500', dateAchieved: '2026-08-08' },
  { id: 'peak-10', rank: 10, username: 'HighRollin_Mia', avatar: '👑', contactPlatform: 'discord', contactHandle: 'MiaStakes#5512', vipTier: 'Platinum Shark', peakChips: 118400, formattedScore: '118,400', dateAchieved: '2026-08-12' },
  { id: 'peak-11', rank: 11, username: 'CasinoCrusher_01', avatar: '⚡', contactPlatform: 'telegram', contactHandle: '@casinocrusher', vipTier: 'Gold Regular', peakChips: 98700, formattedScore: '98,700', dateAchieved: '2026-08-01' },
  { id: 'peak-12', rank: 12, username: 'SilkRoadGambler', avatar: '🏴‍☠️', contactPlatform: 'discord', contactHandle: 'SilkGambler#3030', vipTier: 'Gold Regular', peakChips: 88500, formattedScore: '88,500', dateAchieved: '2026-08-14' },
  { id: 'peak-13', rank: 13, username: 'TwentyOneMaster', avatar: '🎩', contactPlatform: 'telegram', contactHandle: '@twentyone_master', vipTier: 'Gold Regular', peakChips: 79200, formattedScore: '79,200', dateAchieved: '2026-07-22' },
  { id: 'peak-14', rank: 14, username: 'Degen_Ape_007', avatar: '🦍', contactPlatform: 'discord', contactHandle: 'Ape007#0007', vipTier: 'Gold Regular', peakChips: 74600, formattedScore: '74,600', dateAchieved: '2026-08-17' },
  { id: 'peak-15', rank: 15, username: 'PitBossBuster', avatar: '🐺', contactPlatform: 'telegram', contactHandle: '@pitbossbuster', vipTier: 'Gold Regular', peakChips: 68300, formattedScore: '68,300', dateAchieved: '2026-08-10' },
  { id: 'peak-16', rank: 16, username: 'LuckyLucy77', avatar: '🦁', contactPlatform: 'discord', contactHandle: 'LuckyLucy#7777', vipTier: 'Gold Regular', peakChips: 63100, formattedScore: '63,100', dateAchieved: '2026-08-04' },
  { id: 'peak-17', rank: 17, username: 'CardCounter_Dan', avatar: '🃏', contactPlatform: 'discord', contactHandle: 'CardCounter#8821', vipTier: 'Silver Grinder', peakChips: 58900, formattedScore: '58,900', dateAchieved: '2026-08-18' },
  { id: 'peak-18', rank: 18, username: 'CryptoWhale_420', avatar: '🚀', contactPlatform: 'telegram', contactHandle: '@cryptowhale420', vipTier: 'Silver Grinder', peakChips: 54200, formattedScore: '54,200', dateAchieved: '2026-08-16' },
  { id: 'peak-19', rank: 19, username: 'ShadesOfLuck', avatar: '🕶️', contactPlatform: 'telegram', contactHandle: '@shadesofluck', vipTier: 'Silver Grinder', peakChips: 49800, formattedScore: '49,800', dateAchieved: '2026-08-20' },
  { id: 'peak-20', rank: 20, username: 'GoldenPoopBaron', avatar: '💩', contactPlatform: 'discord', contactHandle: 'PoopBaron#9999', vipTier: 'Silver Grinder', peakChips: 46200, formattedScore: '46,200', dateAchieved: '2026-08-21' },
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
    username: 'ApexPredator_77',
    avatar: '🦁',
    vipTier: 'Whale of the Lounge',
    contactPlatform: 'telegram',
    contactHandle: '@apex_degen77',
    winningChips: 48900,
    formattedScore: '48,900 Chips',
    payoutStatus: 'Pending',
    payoutNote: 'Awaiting wallet address confirmation on Telegram.',
  },
  {
    id: 'win-2026-08-21',
    dateEst: '2026-08-21',
    formattedDate: 'Aug 21, 2026',
    username: 'LuckyLucy77',
    avatar: '🦁',
    vipTier: 'Gold Regular',
    contactPlatform: 'discord',
    contactHandle: 'LuckyLucy#7777',
    winningChips: 37400,
    formattedScore: '37,400 Chips',
    payoutStatus: 'Pending',
    payoutNote: 'Claim ticket opened in Discord. Payout in progress.',
  },
  {
    id: 'win-2026-08-20',
    dateEst: '2026-08-20',
    formattedDate: 'Aug 20, 2026',
    username: 'Vegas_Viper',
    avatar: '🦈',
    vipTier: 'Whale of the Lounge',
    contactPlatform: 'telegram',
    contactHandle: '@vegasviper_vip',
    winningChips: 34850,
    formattedScore: '34,850 Chips',
    payoutStatus: 'Paid',
    payoutNote: 'Manual payout transferred via Telegram wallet. Tx: #TX-88214',
    paidAt: Date.now() - 3600000 * 28,
  },
  {
    id: 'win-2026-08-19',
    dateEst: '2026-08-19',
    formattedDate: 'Aug 19, 2026',
    username: 'CardCounter_Dan',
    avatar: '🃏',
    vipTier: 'Platinum Shark',
    contactPlatform: 'discord',
    contactHandle: 'CardCounter#8821',
    winningChips: 28400,
    formattedScore: '28,400 Chips',
    payoutStatus: 'Paid',
    payoutNote: 'Claimed via Discord mod ticket. Payout confirmed.',
    paidAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'win-2026-08-18',
    dateEst: '2026-08-18',
    formattedDate: 'Aug 18, 2026',
    username: 'CryptoWhale_420',
    avatar: '🚀',
    vipTier: 'Diamond High-Roller',
    contactPlatform: 'telegram',
    contactHandle: '@cryptowhale420',
    winningChips: 41200,
    formattedScore: '41,200 Chips',
    payoutStatus: 'Paid',
    payoutNote: 'Paid manually by server owner.',
    paidAt: Date.now() - 86400000 * 3,
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
  currentBalance: number
): LeaderboardEntry[] {
  const userVIPTier = getVIPTier(stats.totalWagered);
  const userVaultVal = inventory.reduce((sum, item) => sum + item.item.value, 0);

  // User Score for Category
  let userScore = 0;
  let userFormattedScore = '0';

  if (category === 'profit') {
    // Current day net chips (Balance + Inventory - 1000 starting bankroll)
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

  // Build competitors entries
  const competitorsEntries: LeaderboardEntry[] = COMPETITORS.map(comp => {
    let score = 0;
    let formattedScore = '';

    if (category === 'profit') {
      score = comp.baseProfit;
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
  
  // Return top 20 sliced
  return combined.slice(0, 20).map((record, index) => ({
    ...record,
    rank: index + 1,
  }));
}
