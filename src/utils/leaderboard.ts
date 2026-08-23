import { UserAccount, CasinoStats, InventoryItem, LeaderboardCategory, LeaderboardEntry, VIPTier } from '../types';

export const VIP_TIER_THRESHOLDS: { tier: VIPTier; minWager: number; color: string; badgeBg: string; text: string; perk: string }[] = [
  { tier: 'Bronze Degen', minWager: 0, color: '#9ca3af', badgeBg: 'bg-zinc-800 text-zinc-300 border-zinc-700', text: 'text-zinc-400', perk: '+0% Daily Bonus' },
  { tier: 'Silver Grinder', minWager: 1000, color: '#38bdf8', badgeBg: 'bg-sky-950/80 text-sky-300 border-sky-500/40', text: 'text-sky-400', perk: '+15% Daily Bonus' },
  { tier: 'Gold Regular', minWager: 5000, color: '#facc15', badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/40', text: 'text-amber-300', perk: '+30% Daily Bonus' },
  { tier: 'Platinum Shark', minWager: 25000, color: '#a855f7', badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-500/40', text: 'text-purple-300', perk: '+50% Daily Bonus' },
  { tier: 'Diamond High-Roller', minWager: 100000, color: '#06b6d4', badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50', text: 'text-cyan-300', perk: '+75% Daily Bonus' },
  { tier: 'Whale of the Lounge', minWager: 500000, color: '#f43f5e', badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-500/60', text: 'text-rose-300', perk: '+100% Daily Bonus' },
  { tier: 'Sovereign Degenerate', minWager: 2000000, color: '#eab308', badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-300 text-zinc-950 font-black border-yellow-200', text: 'text-amber-300', perk: '+200% Daily Bonus' },
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
  id: 'usr-main-777',
  username: 'Thomas the Highroller',
  avatar: '👑',
  title: 'Lounge Sovereign',
  bio: 'Never doubling down on 12, always hitting on soft 17. Fearless degen.',
  luckyNumber: 7,
  createdAt: Date.now() - 86400000 * 3, // 3 days ago
  lastDailyClaim: 0,
  dailyStreak: 3,
};

// Seeded daily competitors list
interface BaseCompetitor {
  id: string;
  username: string;
  avatar: string;
  vipTier: VIPTier;
  baseProfit: number;
  baseMultiplier: number;
  baseVolume: number;
  baseVault: number;
}

const COMPETITORS: BaseCompetitor[] = [
  { id: 'bot-1', username: 'Vegas_Viper', avatar: '🦈', vipTier: 'Whale of the Lounge', baseProfit: 14200, baseMultiplier: 1000, baseVolume: 85000, baseVault: 78000 },
  { id: 'bot-2', username: 'CardCounter_Dan', avatar: '🃏', vipTier: 'Platinum Shark', baseProfit: 9850, baseMultiplier: 250, baseVolume: 42000, baseVault: 34000 },
  { id: 'bot-3', username: 'CryptoWhale_420', avatar: '🚀', vipTier: 'Diamond High-Roller', baseProfit: 7600, baseMultiplier: 600, baseVolume: 120000, baseVault: 185000 },
  { id: 'bot-4', username: 'LuckyLucy77', avatar: '🦁', vipTier: 'Gold Regular', baseProfit: 4500, baseMultiplier: 1500, baseVolume: 22000, baseVault: 19500 },
  { id: 'bot-5', username: 'MonteCarloMax', avatar: '🎩', vipTier: 'Platinum Shark', baseProfit: 3200, baseMultiplier: 80, baseVolume: 31000, baseVault: 45000 },
  { id: 'bot-6', username: 'Degen_Ape_007', avatar: '🦍', vipTier: 'Diamond High-Roller', baseProfit: 2100, baseMultiplier: 200, baseVolume: 65000, baseVault: 52000 },
  { id: 'bot-7', username: 'HighStakesHannah', avatar: '💎', vipTier: 'Silver Grinder', baseProfit: 1450, baseMultiplier: 120, baseVolume: 14000, baseVault: 8500 },
  { id: 'bot-8', username: 'RedSevenRider', avatar: '🎰', vipTier: 'Gold Regular', baseProfit: 800, baseMultiplier: 45, baseVolume: 9500, baseVault: 12000 },
  { id: 'bot-9', username: 'PitBossSlayer', avatar: '🐺', vipTier: 'Silver Grinder', baseProfit: 350, baseMultiplier: 30, baseVolume: 6800, baseVault: 4200 },
  { id: 'bot-10', username: 'SlotSmasher99', avatar: '⚡', vipTier: 'Bronze Degen', baseProfit: -450, baseMultiplier: 15, baseVolume: 3200, baseVault: 1500 },
];

/**
 * Calculates current time until daily UTC midnight reset
 */
export function getTimeUntilDailyReset(): { hours: number; minutes: number; seconds: number; formatted: string } {
  const now = new Date();
  const nextReset = new Date(now);
  nextReset.setUTCHours(24, 0, 0, 0);
  
  const diffMs = Math.max(0, nextReset.getTime() - now.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  return {
    hours,
    minutes,
    seconds,
    formatted: `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`,
  };
}

/**
 * Generates dynamic sorted leaderboard ranking for the chosen category
 */
export function getDailyLeaderboard(
  category: LeaderboardCategory,
  userAccount: UserAccount,
  stats: CasinoStats,
  inventory: InventoryItem[]
): LeaderboardEntry[] {
  const userVIPTier = getVIPTier(stats.totalWagered);
  const userVaultVal = inventory.reduce((sum, item) => sum + item.item.value, 0);

  // User Score for Category
  let userScore = 0;
  let userFormattedScore = '0';

  if (category === 'profit') {
    userScore = stats.netProfit;
    userFormattedScore = userScore >= 0 ? `+${userScore.toLocaleString()}` : `${userScore.toLocaleString()}`;
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
    username: userAccount.username,
    avatar: userAccount.avatar,
    vipTier: userVIPTier,
    score: userScore,
    formattedScore: userFormattedScore,
    badge: 'YOU',
    isUser: true,
  };

  // Build competitors entries
  const competitorsEntries: LeaderboardEntry[] = COMPETITORS.map(comp => {
    let score = 0;
    let formattedScore = '';

    if (category === 'profit') {
      score = comp.baseProfit;
      formattedScore = score >= 0 ? `+${score.toLocaleString()}` : `${score.toLocaleString()}`;
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
 * Calculates daily claim reward based on VIP Tier & Streak
 */
export function calculateDailyBonus(account: UserAccount, stats: CasinoStats): { amount: number; tierBonus: number; streakBonus: number } {
  const vipTier = getVIPTier(stats.totalWagered);
  const tierInfo = getVIPTierInfo(vipTier);
  
  const baseReward = 300;
  const streakBonus = Math.min(account.dailyStreak * 75, 450); // up to 450 chips
  
  let tierMultiplier = 0;
  if (vipTier === 'Silver Grinder') tierMultiplier = 0.15;
  if (vipTier === 'Gold Regular') tierMultiplier = 0.30;
  if (vipTier === 'Platinum Shark') tierMultiplier = 0.50;
  if (vipTier === 'Diamond High-Roller') tierMultiplier = 0.75;
  if (vipTier === 'Whale of the Lounge') tierMultiplier = 1.00;
  if (vipTier === 'Sovereign Degenerate') tierMultiplier = 2.00;

  const tierBonus = Math.round(baseReward * tierMultiplier);
  const amount = baseReward + streakBonus + tierBonus;

  return { amount, tierBonus, streakBonus };
}
