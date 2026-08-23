export type GameTab = 'home' | 'blackjack' | 'keno' | 'unboxer' | 'inventory' | 'leaderboard';

export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number;
  isAce: boolean;
  hidden?: boolean;
}

export type BlackjackStage = 
  | 'betting'
  | 'dealing'
  | 'player-turn'
  | 'dealer-turn'
  | 'game-over';

export interface BlackjackSideBets {
  twentyOnePlusThree: number;
  perfectPairs: number;
  luckyLadies: number;
}

export interface SideBetResults {
  twentyOnePlusThree?: { name: string; multiplier: number; win: number };
  perfectPairs?: { name: string; multiplier: number; win: number };
  luckyLadies?: { name: string; multiplier: number; win: number };
}

export interface HandResult {
  outcome: 'win' | 'lose' | 'push' | 'blackjack' | 'bust' | 'surrender';
  payout: number;
  message: string;
}

export interface PlayerHand {
  id: string;
  cards: Card[];
  bet: number;
  status: 'active' | 'stood' | 'busted' | 'blackjack' | 'doubled' | 'surrendered';
  result?: HandResult;
}

export type KenoDifficulty = 'safe' | 'classic' | 'degen';

export type KenoPaytable = Record<number, Record<number, number>>;

export interface KenoPayoutTier {
  hits: number;
  multiplier: number;
}

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'classified' | 'covert' | 'mythic' | 'exotic';

export interface LootItem {
  id: string;
  name: string;
  description: string;
  rarity: ItemRarity;
  value: number; // chip resale / instant cash value
  icon: string;
  color: string;
  bgGradient: string;
  dropWeight: number;
  lore: string;
}

export interface LootCrate {
  id: string;
  name: string;
  tagline: string;
  cost: number;
  icon: string;
  accentColor: string;
  glowColor: string;
  items: LootItem[];
}

export interface InventoryItem {
  instanceId: string;
  item: LootItem;
  obtainedAt: number;
  crateId: string;
}

export interface CasinoStats {
  totalWagered: number;
  totalWon: number;
  totalLost: number;
  netProfit: number;
  handsPlayedBlackjack: number;
  roundsPlayedKeno: number;
  cratesOpened: number;
  biggestWin: number;
  biggestMultiplier: number;
  sideBetWinsBlackjack: number;
  bailoutCount: number;
}

export type VIPTier = 
  | 'Bronze Degen' 
  | 'Silver Grinder' 
  | 'Gold Regular' 
  | 'Platinum Shark' 
  | 'Diamond High-Roller' 
  | 'Whale of the Lounge' 
  | 'Sovereign Degenerate';

export type ContactPlatform = 'discord' | 'telegram';

export interface UserAccount {
  id: string;
  username: string;
  avatar: string;
  title: string;
  bio: string;
  luckyNumber: number;
  createdAt: number;
  contactPlatform: ContactPlatform;
  contactHandle: string;
  isRegistered: boolean;
  dailyStreak: number;
  lastDailyClaim: number;
  lastActiveEstDate: string; // YYYY-MM-DD in EST
  peakBalanceAllTime: number; // Highest chip count reached
  authMethod?: 'google' | 'email' | 'guest';
  email?: string;
  googleLinked?: boolean;
  googleEmail?: string;
  googleName?: string;
  googlePicture?: string;
}

export type LeaderboardCategory = 'profit' | 'multiplier' | 'volume' | 'vault';

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  vipTier: VIPTier;
  score: number;
  formattedScore: string;
  contactPlatform?: ContactPlatform;
  contactHandle?: string;
  badge?: string;
  isUser?: boolean;
}

export interface DailyWinnerRecord {
  id: string;
  dateEst: string; // YYYY-MM-DD
  formattedDate: string;
  username: string;
  avatar: string;
  vipTier: VIPTier;
  contactPlatform: ContactPlatform;
  contactHandle: string;
  winningChips: number;
  formattedScore: string;
  payoutStatus: 'Pending' | 'Paid' | 'Processing';
  payoutNote?: string;
  paidAt?: number;
  isUser?: boolean;
}

export interface AllTimePeakRecord {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  contactPlatform: ContactPlatform;
  contactHandle: string;
  vipTier: VIPTier;
  peakChips: number;
  formattedScore: string;
  dateAchieved: string;
  isUser?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  username: string;
  avatar: string;
  vipTier: VIPTier;
  text: string;
  timestamp: number;
  badge?: string;
  type?: 'chat' | 'system' | 'jackpot' | 'mod_action';
  contactPlatform?: ContactPlatform;
  contactHandle?: string;
  balance?: number;
  isUser?: boolean;
  isAdmin?: boolean;
}

export interface PlayerProfileData {
  id: string;
  username: string;
  avatar: string;
  vipTier: VIPTier;
  contactPlatform?: ContactPlatform;
  contactHandle?: string;
  balance: number;
  peakBalance?: number;
  bio?: string;
  luckyNumber?: number;
  totalWagered?: number;
  cratesOpened?: number;
  isUser?: boolean;
  isAdmin?: boolean;
  email?: string;
}
